import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { SERVICES } from '../config/services';
import { ServiceHealth } from '../types';
import { logger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Adicionar request ID aos headers
  req.headers['x-request-id'] = requestId as string;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('Request processed', {
      requestId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      contentLength: res.get('content-length')
    });
  });
  
  next();
};

export const healthCheckMiddleware = async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    logger.info('Starting health check for all services');
    
    // Verificar saúde dos serviços
    const serviceChecks = await Promise.allSettled([
      checkServiceHealth('auth', SERVICES.auth.url),
      checkServiceHealth('catalog', SERVICES.catalog.url),
      checkServiceHealth('cart', SERVICES.cart.url),
      checkServiceHealth('orders', SERVICES.orders.url),
      checkServiceHealth('payments', SERVICES.payments.url),
      checkServiceHealth('notifications', SERVICES.notifications.url)
    ]);

    const services: Record<string, ServiceHealth> = {};
    let allServicesUp = true;

    serviceChecks.forEach((result, index) => {
      const serviceNames = ['auth', 'catalog', 'cart', 'orders', 'payments', 'notifications'];
      const serviceName = serviceNames[index];
      
      if (result.status === 'fulfilled') {
        services[serviceName] = result.value;
      } else {
        services[serviceName] = {
          service: serviceName,
          status: 'down',
          timestamp: new Date().toISOString(),
          responseTime: undefined
        };
        allServicesUp = false;
      }
      
      if (services[serviceName].status === 'down') {
        allServicesUp = false;
      }
    });

    const totalTime = Date.now() - startTime;

    const health = {
      status: allServicesUp ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      gateway: {
        version: '1.0.0',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version
      },
      services,
      responseTime: `${totalTime}ms`
    };

    logger.info('Health check completed', {
      status: health.status,
      totalTime: `${totalTime}ms`,
      servicesUp: Object.values(services).filter(s => s.status === 'up').length,
      servicesTotal: Object.keys(services).length
    });

    const statusCode = allServicesUp ? 200 : 503;
    res.status(statusCode).json(health);

  } catch (error) {
    logger.error('Health check failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

async function checkServiceHealth(serviceName: string, serviceUrl: string): Promise<ServiceHealth> {
  const start = Date.now();
  
  try {
    const response = await axios.get(`${serviceUrl}/health`, {
      timeout: 5000,
      validateStatus: () => true // Aceita qualquer status
    });
    
    const responseTime = Date.now() - start;
    
    return {
      service: serviceName,
      status: response.status === 200 ? 'up' : 'down',
      timestamp: new Date().toISOString(),
      responseTime
    };
  } catch (error) {
    const responseTime = Date.now() - start;
    
    logger.warn(`Service ${serviceName} health check failed`, {
      serviceUrl,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: `${responseTime}ms`
    });
    
    return {
      service: serviceName,
      status: 'down',
      timestamp: new Date().toISOString(),
      responseTime
    };
  }
}
