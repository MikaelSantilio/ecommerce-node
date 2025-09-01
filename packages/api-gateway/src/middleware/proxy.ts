import { Request, Response, NextFunction } from 'express';
import axios, { AxiosError } from 'axios';
import { SERVICES, ServiceName } from '../config/services';
import { generateInternalToken, generateGatewaySignature } from '../config/security';
import { logger } from '../utils/logger';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name?: string;
  };
}

export const createProxyMiddleware = (serviceName: ServiceName) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const service = SERVICES[serviceName];
      
      // Remove o prefixo /api/{serviceName} da URL
      const targetPath = req.originalUrl.replace(`/api/${serviceName}`, '') || '/';
      const targetUrl = `${service.url}${targetPath}`;

      logger.info(`Proxying request to ${serviceName}`, {
        method: req.method,
        originalUrl: req.originalUrl,
        targetUrl,
        userId: req.user?.id,
        hasUser: !!req.user
      });

      // Gerar token interno seguro se usuário autenticado
      const internalToken = req.user ? generateInternalToken(req.user) : null;
      
      // Gerar assinatura do gateway para verificação de origem
      const timestamp = Date.now();
      const gatewaySignature = generateGatewaySignature(req.method, req.originalUrl, timestamp);

      // Preparar headers seguros para encaminhar
      const forwardHeaders = { ...req.headers };
      
      // ❌ Remover headers inseguros que poderiam ser falsificados
      delete forwardHeaders.host;
      delete forwardHeaders['x-user-id'];
      delete forwardHeaders['x-user-email']; 
      delete forwardHeaders['x-user-role'];
      delete forwardHeaders['x-internal-token'];
      delete forwardHeaders['x-gateway-signature'];
      delete forwardHeaders['x-gateway-timestamp'];
      
      // ✅ Adicionar headers seguros do gateway
      if (internalToken) {
        forwardHeaders['x-internal-token'] = internalToken;
      }
      forwardHeaders['x-gateway-signature'] = gatewaySignature;
      forwardHeaders['x-gateway-timestamp'] = timestamp.toString();
      forwardHeaders['x-gateway-service'] = serviceName;
      forwardHeaders['x-request-id'] = req.headers['x-request-id'] || generateRequestId();

      const startTime = Date.now();

      const proxyResponse = await axios({
        method: req.method as any,
        url: targetUrl,
        data: req.body,
        params: req.query,
        headers: forwardHeaders,
        timeout: service.timeout,
        validateStatus: () => true // Aceitar qualquer status code
      });

      const responseTime = Date.now() - startTime;

      logger.info(`Proxy response from ${serviceName}`, {
        method: req.method,
        targetUrl,
        status: proxyResponse.status,
        responseTime: `${responseTime}ms`,
        userId: req.user?.id,
        requestId: forwardHeaders['x-request-id']
      });

      // Encaminhar headers de resposta (exceto alguns específicos)
      const responseHeaders = { ...proxyResponse.headers };
      delete responseHeaders['content-encoding'];
      delete responseHeaders['content-length'];
      delete responseHeaders['transfer-encoding'];
      delete responseHeaders['x-internal-token']; // Não vazar token interno

      Object.keys(responseHeaders).forEach(key => {
        res.setHeader(key, responseHeaders[key]);
      });

      res.status(proxyResponse.status).json(proxyResponse.data);

    } catch (error: any) {
      const responseTime = Date.now();
      
      logger.error(`Proxy error for ${serviceName}`, {
        error: error.message,
        method: req.method,
        originalUrl: req.originalUrl,
        userId: req.user?.id,
        serviceUrl: SERVICES[serviceName].url,
        stack: error.stack
      });

      if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({
          error: 'service_unavailable',
          message: `${serviceName} service is unavailable`,
          service: serviceName,
          requestId: req.headers['x-request-id']
        });
      }

      if (error.code === 'ETIMEDOUT') {
        return res.status(504).json({
          error: 'gateway_timeout',
          message: `${serviceName} service timeout`,
          service: serviceName,
          requestId: req.headers['x-request-id']
        });
      }

      if (error.response) {
        // O serviço respondeu com um erro
        logger.warn(`Service ${serviceName} returned error`, {
          status: error.response.status,
          data: error.response.data,
          userId: req.user?.id
        });
        return res.status(error.response.status).json(error.response.data);
      }

      // Erro desconhecido
      res.status(500).json({
        error: 'internal_server_error',
        message: 'An unexpected error occurred while processing the request',
        service: serviceName,
        requestId: req.headers['x-request-id']
      });
    }
  };
};

// Middleware para adicionar informações do gateway nas respostas
export const addGatewayHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Gateway', 'ecommerce-api-gateway');
  res.setHeader('X-Gateway-Version', '1.0.0');
  res.setHeader('X-Request-ID', req.headers['x-request-id'] || generateRequestId());
  next();
};

// Função para gerar ID único de requisição
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
