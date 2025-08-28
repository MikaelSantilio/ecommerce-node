export interface OrderData {
  id: string;
  userId: string;
  status: OrderStatus;
  total: number;
  currency: string;
  items: OrderItemData[];
  shipping?: ShippingInfoData;
  payment?: PaymentInfoData;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItemData {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product: ProductData;
}

export interface ProductData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  currency: string;
  stock: number;
  categoryId: string;
}

export interface ShippingInfoData {
  id: string;
  orderId: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  trackingCode?: string;
}

export interface PaymentInfoData {
  id: string;
  orderId: string;
  paymentId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  processedAt?: Date;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PIX = 'PIX',
  BANK_TRANSFER = 'BANK_TRANSFER',
  PAYPAL = 'PAYPAL'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED'
}

// Request/Response types
export interface CreateOrderRequest {
  userId: string;
  items: CreateOrderItemRequest[];
  shipping: CreateShippingRequest;
}

export interface CreateOrderItemRequest {
  productId: string;
  quantity: number;
}

export interface CreateShippingRequest {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface OrderResponse {
  success: boolean;
  data?: OrderData;
  error?: string;
}

export interface OrdersListResponse {
  success: boolean;
  data?: {
    items: OrderData[];
    total: number;
    page: number;
    limit: number;
  };
  error?: string;
}

// Service integration types
export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface CartData {
  userId: string;
  items: CartItem[];
  total: number;
}

export interface PaymentData {
  id: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
}
