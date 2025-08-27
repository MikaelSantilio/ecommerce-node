import { Request, Response } from 'express';
import { CartService } from '../services/CartService';
import {
  addItemSchema,
  updateItemSchema,
  userIdSchema,
  ErrorResponse,
  SuccessResponse,
  CartData
} from '../utils';

export class CartController {
  static async getCart(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        const error: ErrorResponse = {
          error: 'validation_error',
          message: 'User ID is required',
        };
        res.status(400).json(error);
        return;
      }

      const cart = await CartService.getCart(userId);

      if (!cart) {
        const error: ErrorResponse = {
          error: 'not_found',
          message: 'Cart not found',
        };
        res.status(404).json(error);
        return;
      }

      const response: SuccessResponse<CartData> = {
        success: true,
        data: cart,
      };

      res.json(response);
    } catch (error) {
      console.error('Error fetching cart:', error);
      const err: ErrorResponse = {
        error: 'internal_error',
        message: 'Internal server error',
      };
      res.status(500).json(err);
    }
  }

  static async addItem(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { productId, quantity, unitPrice } = addItemSchema.parse(req.body);

      if (!userId) {
        const error: ErrorResponse = {
          error: 'validation_error',
          message: 'User ID is required',
        };
        res.status(400).json(error);
        return;
      }

      await CartService.addItem(userId, productId, quantity, unitPrice);

      const cart = await CartService.getCart(userId);

      const response: SuccessResponse<CartData> = {
        success: true,
        data: cart!,
      };

      res.status(201).json(response);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const err: ErrorResponse = {
          error: 'validation_error',
          message: 'Invalid request body',
        };
        res.status(400).json(err);
      } else {
        console.error('Error adding item to cart:', error);
        const err: ErrorResponse = {
          error: 'internal_error',
          message: 'Internal server error',
        };
        res.status(500).json(err);
      }
    }
  }

  static async updateItem(req: Request, res: Response): Promise<void> {
    try {
      const { userId, itemId } = req.params;
      const { quantity } = updateItemSchema.parse(req.body);

      if (!userId || !itemId) {
        const error: ErrorResponse = {
          error: 'validation_error',
          message: 'User ID and Item ID are required',
        };
        res.status(400).json(error);
        return;
      }

      const cart = await CartService.updateItemQuantity(userId, itemId, quantity);

      if (!cart) {
        const error: ErrorResponse = {
          error: 'not_found',
          message: 'Cart or item not found',
        };
        res.status(404).json(error);
        return;
      }

      const cartData = await CartService.getCart(userId);

      const response: SuccessResponse<CartData> = {
        success: true,
        data: cartData!,
      };

      res.json(response);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const err: ErrorResponse = {
          error: 'validation_error',
          message: 'Invalid request body',
        };
        res.status(400).json(err);
      } else {
        console.error('Error updating cart item:', error);
        const err: ErrorResponse = {
          error: 'internal_error',
          message: 'Internal server error',
        };
        res.status(500).json(err);
      }
    }
  }

  static async removeItem(req: Request, res: Response): Promise<void> {
    try {
      const { userId, itemId } = req.params;

      if (!userId || !itemId) {
        const error: ErrorResponse = {
          error: 'validation_error',
          message: 'User ID and Item ID are required',
        };
        res.status(400).json(error);
        return;
      }

      const cart = await CartService.removeItem(userId, itemId);

      if (!cart) {
        const error: ErrorResponse = {
          error: 'not_found',
          message: 'Cart or item not found',
        };
        res.status(404).json(error);
        return;
      }

      const cartData = await CartService.getCart(userId);

      const response: SuccessResponse<CartData> = {
        success: true,
        data: cartData!,
      };

      res.json(response);
    } catch (error) {
      console.error('Error removing cart item:', error);
      const err: ErrorResponse = {
        error: 'internal_error',
        message: 'Internal server error',
      };
      res.status(500).json(err);
    }
  }

  static async clearCart(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        const error: ErrorResponse = {
          error: 'validation_error',
          message: 'User ID is required',
        };
        res.status(400).json(error);
        return;
      }

      const cart = await CartService.clearCart(userId);

      if (!cart) {
        const error: ErrorResponse = {
          error: 'not_found',
          message: 'Cart not found',
        };
        res.status(404).json(error);
        return;
      }

      const cartData = await CartService.getCart(userId);

      const response: SuccessResponse<CartData> = {
        success: true,
        data: cartData!,
      };

      res.json(response);
    } catch (error) {
      console.error('Error clearing cart:', error);
      const err: ErrorResponse = {
        error: 'internal_error',
        message: 'Internal server error',
      };
      res.status(500).json(err);
    }
  }

  static async getItemCount(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        const error: ErrorResponse = {
          error: 'validation_error',
          message: 'User ID is required',
        };
        res.status(400).json(error);
        return;
      }

      const count = await CartService.getItemCount(userId);

      res.json({ count });
    } catch (error) {
      console.error('Error getting item count:', error);
      const err: ErrorResponse = {
        error: 'internal_error',
        message: 'Internal server error',
      };
      res.status(500).json(err);
    }
  }
}
