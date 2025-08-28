// filepath: packages/payments/src/repository.ts
import prisma from './database';
import { PaymentData } from './utils';

export class PaymentRepository {
  static async create(data: {
    orderId: string;
    amount: number;
    currency: string;
    paymentMethod: string;
  }): Promise<PaymentData> {
    return await prisma.payment.create({ data });
  }

  static async findById(id: string): Promise<PaymentData | null> {
    return await prisma.payment.findUnique({ where: { id } });
  }

  static async updateStatus(id: string, status: string): Promise<PaymentData> {
    return await prisma.payment.update({
      where: { id },
      data: { status },
    });
  }
}
