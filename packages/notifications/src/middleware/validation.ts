import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Validation schemas
export const createNotificationSchema = z.object({
  body: z.object({
    userId: z.string().min(1, 'User ID is required'),
    type: z.enum([
      'order_confirmed',
      'order_shipped',
      'order_delivered',
      'payment_success',
      'payment_failed',
      'order_cancelled',
      'welcome',
      'password_reset'
    ]),
    channel: z.enum(['email', 'sms']),
    recipient: z.object({
      email: z.string().email().optional(),
      phone: z.string().optional(),
      name: z.string().min(1, 'Recipient name is required')
    }).refine(
      (data: any) => data.email || data.phone,
      'Either email or phone must be provided'
    ),
    data: z.record(z.any()).optional(),
    scheduledAt: z.string().datetime().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional()
  })
});

export const createBulkNotificationSchema = z.object({
  body: z.object({
    notifications: z.array(z.object({
      userId: z.string().min(1, 'User ID is required'),
      type: z.enum([
        'order_confirmed',
        'order_shipped',
        'order_delivered',
        'payment_success',
        'payment_failed',
        'order_cancelled',
        'welcome',
        'password_reset'
      ]),
      channel: z.enum(['email', 'sms']),
      recipient: z.object({
        email: z.string().email().optional(),
        phone: z.string().optional(),
        name: z.string().min(1, 'Recipient name is required')
      }).refine(
        (data: any) => data.email || data.phone,
        'Either email or phone must be provided'
      ),
      data: z.record(z.any()).optional(),
      scheduledAt: z.string().datetime().optional(),
      priority: z.enum(['low', 'medium', 'high']).optional()
    })).min(1, 'At least one notification is required')
  })
});

export const getNotificationsSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val: string | undefined) => val ? parseInt(val) : 1),
    limit: z.string().optional().transform((val: string | undefined) => val ? parseInt(val) : 10),
    status: z.enum(['pending', 'processing', 'sent', 'delivered', 'failed', 'cancelled']).optional(),
    type: z.enum([
      'order_confirmed',
      'order_shipped',
      'order_delivered',
      'payment_success',
      'payment_failed',
      'order_cancelled',
      'welcome',
      'password_reset'
    ]).optional(),
    channel: z.enum(['email', 'sms']).optional(),
    userId: z.string().optional()
  }),
  params: z.object({
    userId: z.string().optional()
  })
});

export const updateNotificationStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Notification ID is required')
  }),
  body: z.object({
    status: z.enum(['pending', 'processing', 'sent', 'delivered', 'failed', 'cancelled']),
    error: z.string().optional()
  })
});

export const createTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Template name is required'),
    type: z.enum([
      'order_confirmed',
      'order_shipped',
      'order_delivered',
      'payment_success',
      'payment_failed',
      'order_cancelled',
      'welcome',
      'password_reset'
    ]),
    channel: z.enum(['email', 'sms']),
    subject: z.string().optional(),
    content: z.string().min(1, 'Template content is required'),
    variables: z.array(z.string()).min(1, 'At least one variable is required')
  })
});

// Validation middleware
export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    }
  };
};

// Rate limiting middleware
export const rateLimitMiddleware = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    // Limpar requests antigos
    for (const [key, data] of requests.entries()) {
      if (data.resetTime < windowStart) {
        requests.delete(key);
      }
    }

    // Verificar limite
    const clientData = requests.get(clientId);
    if (clientData && clientData.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      });
    }

    // Atualizar contador
    if (clientData) {
      clientData.count++;
    } else {
      requests.set(clientId, {
        count: 1,
        resetTime: now + windowMs
      });
    }

    next();
  };
};

// Error handling middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.message
    });
  }

  if (error.name === 'MongoError' || error.name === 'MongooseError') {
    return res.status(500).json({
      success: false,
      error: 'Database error',
      details: error.message
    });
  }

  return res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
};
