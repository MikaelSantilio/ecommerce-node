// filepath: packages/payments/src/utils.ts
import { z } from 'zod';

export const createPaymentSchema = z.object({
  orderId: z.string().uuid(),
  amount: z.number().min(0.01),
  currency: z.string().length(3).default('BRL'),
  paymentMethod: z.string().min(1),
});

export interface PaymentData {
  id: string;
  orderId: string;
  amount: number | any; // Allow Decimal from Prisma
  currency: string;
  status: string;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ErrorResponse {
  error: string;
  message: string;
}
