import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { SERVICES } from '../config/services';
import { User } from '../types';
import { logger } from '../utils/logger';

interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    logger.warn('Authentication failed: No token provided', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path
    });
    
    return res.status(401).json({
      error: 'access_denied',
      message: 'Token required'
    });
  }

  try {
    // Validar token com o auth service (Opção 1: Validação Remota)
    logger.info('Validating token with auth service', { 
      tokenPrefix: token.substring(0, 10) + '...' 
    });

    const response = await axios.post(
      `${SERVICES.auth.url}/api/auth/validate`,
      { token },
      {
        timeout: SERVICES.auth.timeout,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data || !response.data.user) {
      throw new Error('Invalid response from auth service');
    }

    const user: User = {
      id: response.data.user.id,
      email: response.data.user.email,
      role: response.data.user.role,
      name: response.data.user.name
    };

    req.user = user;

    logger.info('Token validated successfully', {
      userId: user.id,
      email: user.email,
      role: user.role
    });

    next();
  } catch (error: any) {
    logger.error('Authentication failed', {
      error: error.message,
      tokenPrefix: token.substring(0, 10) + '...',
      authServiceUrl: SERVICES.auth.url
    });

    if (error.response?.status === 401) {
      return res.status(401).json({
        error: 'invalid_token',
        message: 'Invalid or expired token'
      });
    }

    // Se o auth service estiver indisponível
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({
        error: 'service_unavailable',
        message: 'Authentication service is temporarily unavailable'
      });
    }

    return res.status(401).json({
      error: 'authentication_failed',
      message: 'Failed to authenticate token'
    });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'unauthorized',
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Authorization failed: Insufficient permissions', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        path: req.path
      });

      return res.status(403).json({
        error: 'insufficient_permissions',
        message: 'Insufficient permissions to access this resource'
      });
    }

    logger.info('Authorization successful', {
      userId: req.user.id,
      role: req.user.role,
      path: req.path
    });

    next();
  };
};

// Middleware opcional para endpoints que podem ser acessados com ou sem autenticação
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return next(); // Continua sem user
  }

  try {
    const response = await axios.post(
      `${SERVICES.auth.url}/api/auth/validate`,
      { token },
      { timeout: SERVICES.auth.timeout }
    );

    if (response.data?.user) {
      req.user = response.data.user;
    }
  } catch (error) {
    // Ignora erros de autenticação para auth opcional
    logger.debug('Optional authentication failed, continuing without user', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  next();
};
