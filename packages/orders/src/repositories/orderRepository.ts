import prisma from '../database';
import {
  OrderData,
  OrderItemData,
  ShippingInfoData,
  PaymentInfoData,
  OrderStatus,
  PaymentMethod,
  PaymentStatus
} from '../types';

export class OrderRepository {
  static async create(data: {
    userId: string;
    total: number;
    currency: string;
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
    shipping: {
      address: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  }): Promise<OrderData> {
    const order = await prisma.order.create({
      data: {
        userId: data.userId,
        total: data.total,
        currency: data.currency,
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        },
        shipping: {
          create: data.shipping
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        shipping: true,
        payment: true
      }
    });

    return this.convertOrder(order);
  }

  static async findById(id: string): Promise<OrderData | null> {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        },
        shipping: true,
        payment: true
      }
    });

    if (!order) return null;

    return this.convertOrder(order);
  }

  static async findByUserId(userId: string, options: {
    skip: number;
    take: number;
    status?: OrderStatus;
  }): Promise<{ items: OrderData[]; total: number }> {
    const { skip, take, status } = options;

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: true
            }
          },
          shipping: true,
          payment: true
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    return {
      items: orders.map((order: any) => this.convertOrder(order)),
      total
    };
  }

  static async updateStatus(id: string, status: OrderStatus): Promise<OrderData> {
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            product: true
          }
        },
        shipping: true,
        payment: true
      }
    });

    return this.convertOrder(order);
  }

  static async addPaymentInfo(orderId: string, paymentData: {
    paymentId: string;
    method: PaymentMethod;
    status: PaymentStatus;
    amount: number;
    currency: string;
  }): Promise<OrderData> {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        payment: {
          create: paymentData
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        shipping: true,
        payment: true
      }
    });

    return this.convertOrder(order);
  }

  static async updatePaymentStatus(orderId: string, status: PaymentStatus): Promise<OrderData> {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        payment: {
          update: {
            status
          }
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        shipping: true,
        payment: true
      }
    });

    return this.convertOrder(order);
  }

  private static convertOrder(order: any): OrderData {
    return {
      ...order,
      total: Number(order.total),
      items: order.items.map((item: any) => ({
        ...item,
        price: Number(item.price)
      })),
      shipping: order.shipping ? {
        ...order.shipping,
        country: order.shipping.country || 'BR'
      } : undefined,
      payment: order.payment ? {
        ...order.payment,
        amount: Number(order.payment.amount)
      } : undefined
    };
  }
}
