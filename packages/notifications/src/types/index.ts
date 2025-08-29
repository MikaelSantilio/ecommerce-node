import { ObjectId } from 'mongoose';

export interface NotificationData {
  _id?: ObjectId;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  priority: NotificationPriority;
  template: string;
  data: Record<string, any>;
  recipient: {
    email?: string;
    phone?: string;
    name: string;
  };
  scheduledAt?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  error?: string;
  retryCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NotificationTemplate {
  _id?: ObjectId;
  name: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject?: string; // Para email
  content: string; // Template Handlebars
  variables: string[]; // Variáveis necessárias
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum NotificationType {
  ORDER_CONFIRMED = 'order_confirmed',
  ORDER_SHIPPED = 'order_shipped',
  ORDER_DELIVERED = 'order_delivered',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  ORDER_CANCELLED = 'order_cancelled',
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password_reset'
}

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms'
}

export enum NotificationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

// Request/Response types
export interface CreateNotificationRequest {
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  recipient: {
    email?: string;
    phone?: string;
    name: string;
  };
  data?: Record<string, any>;
  scheduledAt?: Date;
  priority?: NotificationPriority;
}

export interface CreateBulkNotificationRequest {
  notifications: CreateNotificationRequest[];
}

export interface UpdateNotificationStatusRequest {
  status: NotificationStatus;
  error?: string;
}

export interface CreateTemplateRequest {
  name: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject?: string;
  content: string;
  variables: string[];
}

export interface NotificationResponse {
  success: boolean;
  data?: NotificationData;
  error?: string;
}

export interface NotificationsListResponse {
  success: boolean;
  data?: {
    items: NotificationData[];
    total: number;
    page: number;
    limit: number;
  };
  error?: string;
}

export interface TemplateResponse {
  success: boolean;
  data?: NotificationTemplate;
  error?: string;
}

export interface TemplatesListResponse {
  success: boolean;
  data?: {
    items: NotificationTemplate[];
    total: number;
  };
  error?: string;
}

// Queue job types
export interface EmailJobData {
  notificationId: string;
  to: string;
  subject: string;
  html: string;
  priority: NotificationPriority;
}

export interface SmsJobData {
  notificationId: string;
  to: string;
  message: string;
  priority: NotificationPriority;
}

// Event types
export interface OrderEventData {
  orderId: string;
  userId: string;
  total: number;
  currency: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    product: {
      name: string;
      slug: string;
    };
  }>;
  shipping?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  recipient: {
    email?: string;
    phone?: string;
    name: string;
  };
}

export interface PaymentEventData {
  orderId: string;
  userId: string;
  amount: number;
  method: string;
  status: string;
  recipient: {
    email?: string;
    phone?: string;
    name: string;
  };
}
