import mongoose, { Schema, Document } from 'mongoose';
import {
  NotificationData,
  NotificationTemplate,
  NotificationType,
  NotificationChannel,
  NotificationStatus,
  NotificationPriority
} from '../types';

export interface INotification extends Document, Omit<NotificationData, '_id'> {
  _id: mongoose.Types.ObjectId;
}

export interface INotificationTemplate extends Document, Omit<NotificationTemplate, '_id'> {
  _id: mongoose.Types.ObjectId;
}

const NotificationSchema = new Schema<INotification>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: Object.values(NotificationType),
    required: true
  },
  channel: {
    type: String,
    enum: Object.values(NotificationChannel),
    required: true
  },
  status: {
    type: String,
    enum: Object.values(NotificationStatus),
    default: NotificationStatus.PENDING
  },
  priority: {
    type: String,
    enum: Object.values(NotificationPriority),
    default: NotificationPriority.MEDIUM
  },
  template: {
    type: String,
    required: true
  },
  data: {
    type: Schema.Types.Mixed,
    default: {}
  },
  recipient: {
    email: String,
    phone: String,
    name: {
      type: String,
      required: true
    }
  },
  scheduledAt: Date,
  sentAt: Date,
  deliveredAt: Date,
  error: String,
  retryCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'notifications'
});

// Indexes
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ status: 1, priority: -1 });
NotificationSchema.index({ type: 1, channel: 1 });
NotificationSchema.index({ scheduledAt: 1 }, { sparse: true });

const NotificationTemplateSchema = new Schema<INotificationTemplate>({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: Object.values(NotificationType),
    required: true
  },
  channel: {
    type: String,
    enum: Object.values(NotificationChannel),
    required: true
  },
  subject: String, // Para emails
  content: {
    type: String,
    required: true
  },
  variables: [{
    type: String,
    required: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'notification_templates'
});

// Indexes
NotificationTemplateSchema.index({ type: 1, channel: 1 });
// Remover o índice duplicado do name pois já está definido como unique: true

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
export const NotificationTemplateModel = mongoose.model<INotificationTemplate>('NotificationTemplate', NotificationTemplateSchema);
