// filepath: packages/payments/src/controllers/paymentController.ts
import { Request, Response } from 'express';
import { PaymentService } from '../services/PaymentService';
import { createPaymentSchema, ErrorResponse } from '../utils';

export class PaymentController {
  static async createPayment(req: Request, res: Response): Promise<void> {
    try {
      const { orderId, amount, currency, paymentMethod } = createPaymentSchema.parse(req.body);
      const paymentIntent = await PaymentService.createPaymentIntent(orderId, amount, currency);
      res.status(201).json({ clientSecret: paymentIntent.clientSecret });
    } catch (error) {
      res.status(500).json({ error: 'internal_error', message: 'Payment creation failed' } as ErrorResponse);
    }
  }

  static async handleWebhook(req: Request, res: Response): Promise<void> {
    // For simulation, we can have a simple webhook handler
    // In a real scenario, this would be for payment simulator callbacks
    const { transactionId, status } = req.body;
    try {
      if (status === 'success') {
        await PaymentService.confirmPayment(transactionId);
      }
      res.json({ received: true });
    } catch (error) {
      res.status(400).json({ error: 'webhook_error', message: 'Invalid webhook' } as ErrorResponse);
    }
  }
}
