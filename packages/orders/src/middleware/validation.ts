import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Validation schemas
export const createOrderSchema = z.object({
  body: z.object({
    userId: z.string().min(1, 'User ID is required'),
    items: z.array(z.object({
      productId: z.string().min(1, 'Product ID is required'),
      quantity: z.number().int().positive('Quantity must be positive')
    })).min(1, 'At least one item is required'),
    shipping: z.object({
      address: z.string().min(1, 'Address is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      zipCode: z.string().min(1, 'Zip code is required'),
      country: z.string().optional().default('BR')
    })
  })
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Order ID is required')
  }),
  body: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'])
  })
});

export const getOrdersSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => val ? parseInt(val) : 1),
    limit: z.string().optional().transform((val) => val ? parseInt(val) : 10),
    status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']).optional(),
    userId: z.string().optional()
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

  if (error.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
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
