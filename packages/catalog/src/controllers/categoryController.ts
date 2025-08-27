import { Request, Response } from 'express';
import { CategoryRepository } from '../repository';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryQuerySchema,
  ErrorResponse,
  PaginatedResponse,
  CategoryData
} from '../utils';

export class CategoryController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { name } = createCategorySchema.parse(req.body);

      // Check if slug already exists
      const existingSlug = await CategoryRepository.findBySlug(
        name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      );

      if (existingSlug) {
        const error: ErrorResponse = {
          error: 'conflict',
          message: 'Category with this name already exists',
        };
        res.status(409).json(error);
        return;
      }

      const category = await CategoryRepository.create(name);

      res.status(201).json({
        id: category.id,
        name: category.name,
        slug: category.slug,
        createdAt: category.createdAt,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const err: ErrorResponse = {
          error: 'validation_error',
          message: 'Invalid request body',
        };
        res.status(400).json(err);
      } else {
        console.error('Error creating category:', error);
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
      const { page, limit, q } = categoryQuerySchema.parse(req.query);
      const skip = (page - 1) * limit;

      const { items, total } = await CategoryRepository.findMany({
        skip,
        take: limit,
        search: q,
      });

      const response: PaginatedResponse<CategoryData> = {
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
        console.error('Error fetching categories:', error);
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
      const category = await CategoryRepository.findById(id);

      if (!category) {
        const error: ErrorResponse = {
          error: 'not_found',
          message: 'Category not found',
        };
        res.status(404).json(error);
        return;
      }

      res.json(category);
    } catch (error) {
      console.error('Error fetching category:', error);
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
      const { name } = updateCategorySchema.parse(req.body);

      if (!name) {
        const error: ErrorResponse = {
          error: 'validation_error',
          message: 'Name is required for update',
        };
        res.status(400).json(error);
        return;
      }

      // Check if category exists
      const existingCategory = await CategoryRepository.findById(id);
      if (!existingCategory) {
        const error: ErrorResponse = {
          error: 'not_found',
          message: 'Category not found',
        };
        res.status(404).json(error);
        return;
      }

      // Check if new slug conflicts with existing category (excluding current one)
      const newSlug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      const conflictingCategory = await CategoryRepository.findBySlug(newSlug);
      if (conflictingCategory && conflictingCategory.id !== id) {
        const error: ErrorResponse = {
          error: 'conflict',
          message: 'Category with this name already exists',
        };
        res.status(409).json(error);
        return;
      }

      const category = await CategoryRepository.update(id, name);

      res.json({
        id: category.id,
        name: category.name,
        slug: category.slug,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const err: ErrorResponse = {
          error: 'validation_error',
          message: 'Invalid request body',
        };
        res.status(400).json(err);
      } else {
        console.error('Error updating category:', error);
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

      // Check if category exists
      const category = await CategoryRepository.findById(id);
      if (!category) {
        const error: ErrorResponse = {
          error: 'not_found',
          message: 'Category not found',
        };
        res.status(404).json(error);
        return;
      }

      // Check if category has products
      const hasProducts = await CategoryRepository.hasProducts(id);
      if (hasProducts) {
        const error: ErrorResponse = {
          error: 'conflict',
          message: 'Cannot delete category with associated products',
        };
        res.status(409).json(error);
        return;
      }

      await CategoryRepository.delete(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting category:', error);
      const err: ErrorResponse = {
        error: 'internal_error',
        message: 'Internal server error',
      };
      res.status(500).json(err);
    }
  }
}
