import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Configurações que devem ser as mesmas do API Gateway
const INTERNAL_JWT_SECRET = process.env.INTERNAL_JWT_SECRET;
const GATEWAY_SECRET = process.env.GATEWAY_SECRET;

if (!INTERNAL_JWT_SECRET) {
  throw new Error('INTERNAL_JWT_SECRET environment variable is required');
}

if (!GATEWAY_SECRET) {
  throw new Error('GATEWAY_SECRET environment variable is required');
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
}

export interface InternalRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Lista de IPs permitidos para acessar microserviços diretamente
 * Deve ser configurado para incluir apenas o Gateway
 */
const ALLOWED_GATEWAY_IPS = process.env.ALLOWED_GATEWAY_IPS?.split(',') || [
  '127.0.0.1',
  '::1',
  'localhost',
  '172.18.0.0/16', // Docker default network
  '10.0.0.0/8'     // Kubernetes default network
];

/**
 * Middleware para validar token JWT interno do API Gateway
 * Este middleware deve ser usado em TODAS as rotas dos microserviços
 */
export const validateInternalToken = (req: InternalRequest, res: Response, next: NextFunction) => {
  try {
    // 1. Verificar se a requisição vem do Gateway (IP whitelist)
    const clientIP = getClientIP(req);
    
    if (!isAllowedGatewayIP(clientIP)) {
      console.warn(`⚠️  Blocked direct access from IP: ${clientIP}`);
      return res.status(403).json({
        error: 'access_denied',
        message: 'Direct access to microservices is not allowed'
      });
    }

    // 2. Verificar assinatura do gateway
    const gatewaySignature = req.headers['x-gateway-signature'] as string;
    const gatewayTimestamp = req.headers['x-gateway-timestamp'] as string;
    
    if (!gatewaySignature || !gatewayTimestamp) {
      return res.status(401).json({
        error: 'missing_gateway_signature',
        message: 'Gateway signature required'
      });
    }

    const timestamp = parseInt(gatewayTimestamp);
    if (!verifyGatewaySignature(gatewaySignature, req.method, req.originalUrl, timestamp)) {
      return res.status(401).json({
        error: 'invalid_gateway_signature',
        message: 'Invalid gateway signature'
      });
    }

    // 3. Verificar token interno (se presente - para rotas autenticadas)
    const internalToken = req.headers['x-internal-token'] as string;
    
    if (internalToken) {
      try {
        const decoded = jwt.verify(internalToken, INTERNAL_JWT_SECRET) as any;
        
        // Verificar issuer e audience
        if (decoded.iss !== 'ecommerce-api-gateway' || decoded.aud !== 'ecommerce-microservices') {
          throw new Error('Invalid token claims');
        }

        req.user = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role
        };

        console.log(`✅ Authenticated user: ${req.user.email} (${req.user.role})`);
      } catch (error) {
        return res.status(401).json({
          error: 'invalid_internal_token',
          message: 'Invalid internal authentication token'
        });
      }
    }

    next();
  } catch (error) {
    console.error('Internal token validation error:', error);
    return res.status(500).json({
      error: 'internal_error',
      message: 'Failed to validate internal authentication'
    });
  }
};

/**
 * Middleware para rotas que REQUEREM autenticação
 */
export const requireAuth = (req: InternalRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'authentication_required',
      message: 'This endpoint requires authentication'
    });
  }
  next();
};

/**
 * Middleware para rotas que requerem roles específicos
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: InternalRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'authentication_required',
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'insufficient_permissions',
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Middleware para rotas públicas (token opcional)
 * Se houver token válido, adiciona o usuário ao request
 */
export const optionalAuth = (req: InternalRequest, res: Response, next: NextFunction) => {
  try {
    // Verificar IP mesmo para rotas públicas
    const clientIP = getClientIP(req);
    if (!isAllowedGatewayIP(clientIP)) {
      return res.status(403).json({
        error: 'access_denied',
        message: 'Direct access to microservices is not allowed'
      });
    }

    // Verificar assinatura do gateway
    const gatewaySignature = req.headers['x-gateway-signature'] as string;
    const gatewayTimestamp = req.headers['x-gateway-timestamp'] as string;
    
    if (!gatewaySignature || !gatewayTimestamp) {
      return res.status(401).json({
        error: 'missing_gateway_signature',
        message: 'Gateway signature required'
      });
    }

    const timestamp = parseInt(gatewayTimestamp);
    if (!verifyGatewaySignature(gatewaySignature, req.method, req.originalUrl, timestamp)) {
      return res.status(401).json({
        error: 'invalid_gateway_signature',
        message: 'Invalid gateway signature'
      });
    }

    // Token é opcional - se existir, validar
    const internalToken = req.headers['x-internal-token'] as string;
    if (internalToken) {
      try {
        const decoded = jwt.verify(internalToken, INTERNAL_JWT_SECRET) as any;
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role
        };
      } catch (error) {
        // Token inválido, mas continua como usuário não autenticado
        console.warn('Invalid optional token:', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth validation error:', error);
    return res.status(500).json({
      error: 'internal_error',
      message: 'Failed to validate request'
    });
  }
};

/**
 * Obtém o IP real do cliente
 */
function getClientIP(req: Request): string {
  return (
    req.headers['x-forwarded-for'] as string ||
    req.headers['x-real-ip'] as string ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    'unknown'
  ).split(',')[0].trim().replace(/^::ffff:/, '');
}

/**
 * Verifica se um IP está na lista de IPs permitidos
 */
function isAllowedGatewayIP(ip: string): boolean {
  return ALLOWED_GATEWAY_IPS.some(allowedIP => {
    if (allowedIP.includes('/')) {
      // CIDR notation
      return isIPInCIDR(ip, allowedIP);
    }
    return ip === allowedIP || allowedIP === 'localhost';
  });
}

/**
 * Verifica a assinatura do Gateway
 */
function verifyGatewaySignature(
  signature: string,
  method: string,
  url: string,
  timestamp: number
): boolean {
  try {
    // Verificar se o timestamp não é muito antigo (5 minutos)
    const maxAge = 5 * 60 * 1000; // 5 minutos
    if (Date.now() - timestamp > maxAge) {
      console.warn('Gateway signature timestamp too old');
      return false;
    }

    const payload = `${method}:${url}:${timestamp}`;
    const expectedSignature = crypto
      .createHmac('sha256', GATEWAY_SECRET)
      .update(payload)
      .digest('hex');

    // Comparação segura contra timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('Error verifying gateway signature:', error);
    return false;
  }
}

/**
 * Verifica se um IP está em uma faixa CIDR
 */
function isIPInCIDR(ip: string, cidr: string): boolean {
  try {
    const [network, prefixLength] = cidr.split('/');
    const ipNum = ipToNumber(ip);
    const networkNum = ipToNumber(network);
    const mask = (-1 << (32 - parseInt(prefixLength))) >>> 0;
    
    return (ipNum & mask) === (networkNum & mask);
  } catch {
    return false;
  }
}

/**
 * Converte IP para número
 */
function ipToNumber(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
}
