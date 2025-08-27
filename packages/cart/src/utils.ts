import { z } from 'zod';

// Generate unique ID for cart items
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Validation schemas
export const addItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
  unitPrice: z.number().min(0),
});

export const updateItemSchema = z.object({
  quantity: z.number().int().min(1),
});

export const userIdSchema = z.object({
  userId: z.string().min(1),
});

// Types
export interface CartItemData {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  addedAt: Date;
}

export interface CartData {
  id: string;
  userId: string;
  items: CartItemData[];
  createdAt: Date;
  updatedAt: Date;
  total: number;
}

// Error response type
export interface ErrorResponse {
  error: string;
  message: string;
}

// Success response type
export interface SuccessResponse<T> {
  success: true;
  data: T;
}
