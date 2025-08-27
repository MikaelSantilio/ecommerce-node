import { Request, Response } from 'express';
import { ProductRepository } from '../repository';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  ErrorResponse,
  PaginatedResponse,
  ProductData
} from '../utils';

export class ProductController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createProductSchema.parse(req.body);

      // Check if category exists
      const categoryExists = await ProductRepository.categoryExists(validatedData.categoryId);
      if (!categoryExists) {
        const error: ErrorResponse = {
          error: 'not_found',
          message: 'Category not found',
        };
        res.status(404).json(error);
        return;
      }

      // Check if slug already exists
      const slug = validatedData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      const existingProduct = await ProductRepository.findBySlug(slug);
      if (existingProduct) {
        const error: ErrorResponse = {
          error: 'conflict',
          message: 'Product with this name already exists',
        };
        res.status(409).json(error);
        return;
      }

      const product = await ProductRepository.create(validatedData);

      res.status(201).json({
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        currency: product.currency,
        stock: product.stock,
        categoryId: product.categoryId,
        createdAt: product.createdAt,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const err: ErrorResponse = {
          error: 'validation_error',
          message: 'Invalid request body',
        };
        res.status(400).json(err);
      } else {
        console.error('Error creating product:', error);
        const err: ErrorResponse = {
          error: 'internal_error',
          message: 'Internal server error',
        };
        res.status(500).json(err);
      }
    }
  }

  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, q, categoryId, minPrice, maxPrice } = productQuerySchema.parse(req.query);
      const skip = (page - 1) * limit;

      const { items, total } = await ProductRepository.findMany({
        skip,
        take: limit,
        search: q,
        categoryId,
        minPrice,
        maxPrice,
      });

      const response: PaginatedResponse<ProductData> = {
        items,
        page,
        limit,
        total,
      };

      res.json(response);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const err: ErrorResponse = {
          error: 'validation_error',
          message: 'Invalid query parameters',
        };
        res.status(400).json(err);
      } else {
        console.error('Error fetching products:', error);
        const err: ErrorResponse = {
          error: 'internal_error',
          message: 'Internal server error',
        };
        res.status(500).json(err);
      }
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await ProductRepository.findById(id);

      if (!product) {
        const error: ErrorResponse = {
          error: 'not_found',
          message: 'Product not found',
        };
        res.status(404).json(error);
        return;
      }

      res.json(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      const err: ErrorResponse = {
        error: 'internal_error',
        message: 'Internal server error',
      };
      res.status(500).json(err);
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateProductSchema.parse(req.body);

      // Check if product exists
      const existingProduct = await ProductRepository.findById(id);
      if (!existingProduct) {
        const error: ErrorResponse = {
          error: 'not_found',
          message: 'Product not found',
        };
        res.status(404).json(error);
        return;
      }

      // Check if category exists if categoryId is being updated
      if (validatedData.categoryId) {
        const categoryExists = await ProductRepository.categoryExists(validatedData.categoryId);
        if (!categoryExists) {
          const error: ErrorResponse = {
            error: 'not_found',
            message: 'Category not found',
          };
          res.status(404).json(error);
          return;
        }
      }

      // Check for slug conflict if name is being updated
      if (validatedData.name) {
        const newSlug = validatedData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        const conflictingProduct = await ProductRepository.findBySlug(newSlug);
        if (conflictingProduct && conflictingProduct.id !== id) {
          const error: ErrorResponse = {
            error: 'conflict',
            message: 'Product with this name already exists',
          };
          res.status(409).json(error);
          return;
        }
      }

      const product = await ProductRepository.update(id, validatedData);

      res.json(product);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const err: ErrorResponse = {
          error: 'validation_error',
          message: 'Invalid request body',
        };
        res.status(400).json(err);
      } else {
        console.error('Error updating product:', error);
        const err: ErrorResponse = {
          error: 'internal_error',
          message: 'Internal server error',
        };
        res.status(500).json(err);
      }
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Check if product exists
      const product = await ProductRepository.findById(id);
      if (!product) {
        const error: ErrorResponse = {
          error: 'not_found',
          message: 'Product not found',
        };
        res.status(404).json(error);
        return;
      }

      await ProductRepository.delete(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting product:', error);
      const err: ErrorResponse = {
        error: 'internal_error',
        message: 'Internal server error',
      };
      res.status(500).json(err);
    }
  }
}
