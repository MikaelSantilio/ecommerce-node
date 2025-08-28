import { Request, Response } from 'express';
import { OrderService } from '../services/orderService';
import { OrderStatus } from '../types';

export class OrderController {
  static async createOrder(req: Request, res: Response) {
    try {
      const order = await OrderService.createOrder(req.body);

      res.status(201).json({
        success: true,
        data: order
      });
    } catch (error: any) {
      console.error('Error creating order:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create order'
      });
    }
  }

  static async getOrderById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const order = await OrderService.getOrderById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      res.json({
        success: true,
        data: order
      });
    } catch (error: any) {
      console.error('Error getting order:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get order'
      });
    }
  }

  static async getUserOrders(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10, status } = req.query;

      const result = await OrderService.getOrdersByUserId(
        userId,
        Number(page),
        Number(limit),
        status as OrderStatus
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Error getting user orders:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get orders'
      });
    }
  }

  static async updateOrderStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const order = await OrderService.updateOrderStatus(id, status);

      res.json({
        success: true,
        data: order
      });
    } catch (error: any) {
      console.error('Error updating order status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update order status'
      });
    }
  }

  static async cancelOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const order = await OrderService.cancelOrder(id);

      res.json({
        success: true,
        data: order
      });
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cancel order'
      });
    }
  }

  static async processPayment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const paymentData = req.body;

      const order = await OrderService.processPayment(id, paymentData);

      res.json({
        success: true,
        data: order
      });
    } catch (error: any) {
      console.error('Error processing payment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process payment'
      });
    }
  }

  static async getAllOrders(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, status, userId } = req.query;

      const result = await OrderService.getAllOrders(
        Number(page),
        Number(limit),
        status as OrderStatus,
        userId as string
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Error getting all orders:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get orders'
      });
    }
  }
}
