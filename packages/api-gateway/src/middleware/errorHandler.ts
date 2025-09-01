import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = req.headers['x-request-id'] as string;
  
  logger.error('Unhandled error in API Gateway', {
    requestId,
    error: error.message,
    stack: error.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Não expor detalhes internos em produção
  const isDevelopment = process.env.NODE_ENV !== 'production';

  res.status(500).json({
    error: 'internal_server_error',
    message: 'An unexpected error occurred',
    requestId,
    ...(isDevelopment && {
      details: error.message,
      stack: error.stack
    })
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  logger.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(404).json({
    error: 'not_found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    suggestion: 'Check the API documentation for available endpoints'
  });
};
