import { z } from 'zod';

// Generate slug from name (kebab-case)
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Validation schemas
export const createCategorySchema = z.object({
  name: z.string().min(1).max(255).transform(val => val.trim()),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(255).transform(val => val.trim()).optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(1).max(255).transform(val => val.trim()),
  description: z.string().optional(),
  price: z.number().min(0).max(999999999.99),
  currency: z.string().length(3).default('BRL').transform(val => val.toUpperCase()),
  stock: z.number().int().min(0).default(0),
  categoryId: z.string().uuid(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).max(255).transform(val => val.trim()).optional(),
  description: z.string().optional(),
  price: z.number().min(0).max(999999999.99).optional(),
  currency: z.string().length(3).transform(val => val.toUpperCase()).optional(),
  stock: z.number().int().min(0).optional(),
  categoryId: z.string().uuid().optional(),
});

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const categoryQuerySchema = paginationSchema.extend({
  q: z.string().optional(),
});

export const productQuerySchema = paginationSchema.extend({
  q: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
});

// Types
export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  stock: number;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  category?: CategoryData;
}

// Error response type
export interface ErrorResponse {
  error: string;
  message: string;
}

// Paginated response type
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}
