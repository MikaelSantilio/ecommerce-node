export const SERVICES = {
  auth: {
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    timeout: 5000,
    retries: 3
  },
  catalog: {
    url: process.env.CATALOG_SERVICE_URL || 'http://localhost:3002',
    timeout: 5000,
    retries: 3
  },
  cart: {
    url: process.env.CART_SERVICE_URL || 'http://localhost:3003',
    timeout: 5000,
    retries: 3
  },
  orders: {
    url: process.env.ORDERS_SERVICE_URL || 'http://localhost:3004',
    timeout: 5000,
    retries: 3
  },
  payments: {
    url: process.env.PAYMENTS_SERVICE_URL || 'http://localhost:3005',
    timeout: 5000,
    retries: 3
  },
  notifications: {
    url: process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3006',
    timeout: 5000,
    retries: 3
  }
} as const;

export type ServiceName = keyof typeof SERVICES;
