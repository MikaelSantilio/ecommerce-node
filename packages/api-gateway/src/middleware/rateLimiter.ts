import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger';

// Rate limiter para endpoints de autenticação (mais restritivo)
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 tentativas por IP
  message: {
    error: 'too_many_requests',
    message: 'Too many authentication attempts, please try again later',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded for auth endpoint', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path
    });
    
    res.status(429).json({
      error: 'too_many_requests',
      message: 'Too many authentication attempts, please try again later',
      retryAfter: '15 minutes'
    });
  }
});

// Rate limiter para API geral
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: {
    error: 'too_many_requests',
    message: 'Too many requests, please try again later',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded for API endpoint', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path
    });
    
    res.status(429).json({
      error: 'too_many_requests',
      message: 'Too many requests, please try again later',
      retryAfter: '15 minutes'
    });
  }
});

// Rate limiter mais permissivo para endpoints públicos de leitura
export const publicReadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // máximo 200 requests por IP
  message: {
    error: 'too_many_requests',
    message: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Pular rate limiting para requests autenticados (assumindo que são usuários legítimos)
    return !!req.headers.authorization;
  }
});
