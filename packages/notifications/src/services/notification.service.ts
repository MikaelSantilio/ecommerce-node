import { Notification, NotificationTemplateModel } from '../models/notification.model';
import { TemplateService } from './template.service';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import {
  NotificationData,
  NotificationTemplate,
  CreateNotificationRequest,
  NotificationChannel,
  NotificationStatus,
  NotificationPriority,
  OrderEventData,
  PaymentEventData
} from '../types';

export class NotificationService {
  /**
   * Cria uma nova notificação
   */
  static async createNotification(data: CreateNotificationRequest): Promise<NotificationData> {
    try {
      // Validar dados
      this.validateNotificationData(data);

      // Criar template name baseado no tipo
      const templateName = data.type.toLowerCase().replace(/_/g, '_');

      const notification = new Notification({
        userId: data.userId,
        type: data.type,
        channel: data.channel,
        priority: data.priority || NotificationPriority.MEDIUM,
        template: templateName,
        data: data.data || {},
        recipient: data.recipient,
        scheduledAt: data.scheduledAt,
        status: NotificationStatus.PENDING
      });

      const savedNotification = await notification.save();

      // Se não for agendado, processar imediatamente
      if (!data.scheduledAt) {
        await this.processNotification(savedNotification._id.toString());
      }

      return NotificationService.formatNotificationResponse(savedNotification);
    } catch (error: any) {
      console.error('❌ Failed to create notification:', error);
      throw new Error(`Failed to create notification: ${error.message}`);
    }
  }

  /**
   * Processa uma notificação
   */
  static async processNotification(notificationId: string): Promise<void> {
    try {
      const notification = await Notification.findById(notificationId);
      if (!notification) {
        throw new Error('Notification not found');
      }

      // Atualizar status para PROCESSING
      await Notification.findByIdAndUpdate(notificationId, {
        status: NotificationStatus.PROCESSING
      });

      // Renderizar template
      const content = await this.renderNotificationContent(notification);

      // Enviar baseado no canal
      let result;
      if (notification.channel === NotificationChannel.EMAIL) {
        result = await this.sendEmailNotification(notification, content);
      } else if (notification.channel === NotificationChannel.SMS) {
        result = await this.sendSmsNotification(notification, content);
      }

      // Atualizar status para SENT
      await Notification.findByIdAndUpdate(notificationId, {
        status: NotificationStatus.SENT,
        sentAt: new Date()
      });

      console.log(`✅ Notification ${notificationId} sent successfully`);
    } catch (error: any) {
      console.error(`❌ Failed to process notification ${notificationId}:`, error);

      // Atualizar status para FAILED
      await Notification.findByIdAndUpdate(notificationId, {
        status: NotificationStatus.FAILED,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Renderiza o conteúdo da notificação usando template
   */
  private static async renderNotificationContent(notification: any): Promise<string> {
    try {
      return TemplateService.renderTemplate(
        notification.channel,
        notification.template,
        {
          user: notification.recipient,
          ...notification.data
        }
      );
    } catch (error: any) {
      console.error('❌ Failed to render template:', error);
      throw new Error(`Template rendering failed: ${error.message}`);
    }
  }

  /**
   * Envia notificação por email
   */
  private static async sendEmailNotification(notification: any, htmlContent: string): Promise<any> {
    if (!notification.recipient.email) {
      throw new Error('Email recipient not provided');
    }

    if (!EmailService.isValidEmail(notification.recipient.email)) {
      throw new Error('Invalid email address');
    }

    // Obter assunto do template ou usar padrão
    const subject = await this.getEmailSubject(notification);

    return await EmailService.sendEmail({
      notificationId: notification._id.toString(),
      to: notification.recipient.email,
      subject,
      html: htmlContent,
      priority: notification.priority
    });
  }

  /**
   * Envia notificação por SMS
   */
  private static async sendSmsNotification(notification: any, messageContent: string): Promise<any> {
    if (!notification.recipient.phone) {
      throw new Error('Phone recipient not provided');
    }

    const formattedPhone = SmsService.formatPhoneNumber(notification.recipient.phone);

    if (!SmsService.isValidPhoneNumber(formattedPhone)) {
      throw new Error('Invalid phone number');
    }

    return await SmsService.sendSms({
      notificationId: notification._id.toString(),
      to: formattedPhone,
      message: messageContent,
      priority: notification.priority
    });
  }

  /**
   * Obtém assunto do email baseado no tipo
   */
  private static async getEmailSubject(notification: any): Promise<string> {
    const subjectMap: Record<string, string> = {
      order_confirmed: 'Pedido Confirmado - E-commerce',
      order_shipped: 'Pedido Enviado - E-commerce',
      order_delivered: 'Pedido Entregue - E-commerce',
      payment_success: 'Pagamento Aprovado - E-commerce',
      payment_failed: 'Pagamento Rejeitado - E-commerce',
      order_cancelled: 'Pedido Cancelado - E-commerce',
      welcome: 'Bem-vindo ao E-commerce',
      password_reset: 'Redefinição de Senha - E-commerce'
    };

    return subjectMap[notification.type] || 'Notificação - E-commerce';
  }

  /**
   * Cria notificações para eventos de pedido
   */
  static async createOrderNotifications(eventData: OrderEventData): Promise<void> {
    try {
      const notifications = [
        {
          userId: eventData.userId,
          type: 'order_confirmed' as any,
          channel: NotificationChannel.EMAIL,
          recipient: eventData.recipient,
          data: {
            order: {
              id: eventData.orderId,
              total: eventData.total,
              createdAt: new Date(),
              items: eventData.items,
              shipping: eventData.shipping
            },
            trackingUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${eventData.orderId}`
          }
        },
        {
          userId: eventData.userId,
          type: 'order_confirmed' as any,
          channel: NotificationChannel.SMS,
          recipient: eventData.recipient,
          data: {
            order: {
              id: eventData.orderId,
              total: eventData.total
            },
            trackingUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${eventData.orderId}`
          }
        }
      ];

      for (const notification of notifications) {
        await this.createNotification(notification);
      }

      console.log(`✅ Created notifications for order ${eventData.orderId}`);
    } catch (error: any) {
      console.error('❌ Failed to create order notifications:', error);
      throw error;
    }
  }

  /**
   * Valida dados da notificação
   */
  private static validateNotificationData(data: CreateNotificationRequest): void {
    if (!data.userId) {
      throw new Error('User ID is required');
    }

    if (!data.recipient.name) {
      throw new Error('Recipient name is required');
    }

    if (data.channel === NotificationChannel.EMAIL && !data.recipient.email) {
      throw new Error('Email is required for email notifications');
    }

    if (data.channel === NotificationChannel.SMS && !data.recipient.phone) {
      throw new Error('Phone is required for SMS notifications');
    }
  }

  /**
   * Cria uma nova notificação (método de instância)
   */
  async createNotification(data: CreateNotificationRequest): Promise<NotificationData> {
    return NotificationService.createNotification(data);
  }

  /**
   * Cria notificações em lote (método de instância)
   */
  async createBulkNotifications(notifications: CreateNotificationRequest[]): Promise<NotificationData[]> {
    const results: NotificationData[] = [];

    for (const notification of notifications) {
      try {
        const result = await this.createNotification(notification);
        results.push(result);
      } catch (error) {
        console.error('Error creating notification:', error);
        // Continue processing other notifications
      }
    }

    return results;
  }

  /**
   * Busca notificações com paginação e filtros (método de instância)
   */
  async getNotifications(
    filters: any = {},
    page: number = 1,
    limit: number = 10
  ): Promise<{ notifications: NotificationData[]; total: number }> {
    try {
      const skip = (page - 1) * limit;

      const query: any = {};
      if (filters.status) query.status = filters.status;
      if (filters.type) query.type = filters.type;
      if (filters.channel) query.channel = filters.channel;
      if (filters.userId) query.userId = filters.userId;

      const [notifications, total] = await Promise.all([
        Notification.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Notification.countDocuments(query)
      ]);

      const formattedNotifications = notifications.map(NotificationService.formatNotificationResponse);

      return {
        notifications: formattedNotifications,
        total
      };
    } catch (error: any) {
      console.error('Error getting notifications:', error);
      throw new Error(`Failed to get notifications: ${error.message}`);
    }
  }

  /**
   * Busca notificação por ID (método de instância)
   */
  async getNotificationById(id: string): Promise<NotificationData | null> {
    try {
      const notification = await Notification.findById(id).lean();
      return notification ? NotificationService.formatNotificationResponse(notification) : null;
    } catch (error: any) {
      console.error('Error getting notification by ID:', error);
      throw new Error(`Failed to get notification: ${error.message}`);
    }
  }

  /**
   * Atualiza status da notificação (método de instância)
   */
  async updateNotificationStatus(
    id: string,
    status: NotificationStatus,
    error?: string
  ): Promise<NotificationData | null> {
    try {
      const updateData: any = { status };
      if (error) updateData.error = error;

      if (status === NotificationStatus.SENT) {
        updateData.sentAt = new Date();
      } else if (status === NotificationStatus.DELIVERED) {
        updateData.deliveredAt = new Date();
      }

      const notification = await Notification.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      ).lean();

      return notification ? NotificationService.formatNotificationResponse(notification) : null;
    } catch (error: any) {
      console.error('Error updating notification status:', error);
      throw new Error(`Failed to update notification status: ${error.message}`);
    }
  }

  /**
   * Cancela uma notificação (método de instância)
   */
  async cancelNotification(id: string): Promise<NotificationData | null> {
    try {
      const notification = await Notification.findByIdAndUpdate(
        id,
        {
          status: NotificationStatus.CANCELLED,
          cancelledAt: new Date()
        },
        { new: true }
      ).lean();

      return notification ? NotificationService.formatNotificationResponse(notification) : null;
    } catch (error: any) {
      console.error('Error canceling notification:', error);
      throw new Error(`Failed to cancel notification: ${error.message}`);
    }
  }

  /**
   * Obtém estatísticas das notificações (método de instância)
   */
  async getNotificationStats(): Promise<any> {
    try {
      const stats = await Notification.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            processing: { $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] } },
            sent: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
            delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
            failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
            cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
          }
        }
      ]);

      const result = stats[0] || {
        total: 0,
        pending: 0,
        processing: 0,
        sent: 0,
        delivered: 0,
        failed: 0,
        cancelled: 0
      };

      // Estatísticas por canal
      const channelStats = await Notification.aggregate([
        {
          $group: {
            _id: '$channel',
            count: { $sum: 1 }
          }
        }
      ]);

      // Estatísticas por tipo
      const typeStats = await Notification.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        }
      ]);

      return {
        overview: result,
        byChannel: channelStats.reduce((acc: any, stat: any) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        byType: typeStats.reduce((acc: any, stat: any) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {})
      };
    } catch (error: any) {
      console.error('Error getting notification stats:', error);
      throw new Error(`Failed to get notification stats: ${error.message}`);
    }
  }

  /**
   * Formata notificação para resposta (método de instância)
   */
  formatNotification(notification: any): NotificationData {
    return {
      _id: notification._id,
      userId: notification.userId,
      type: notification.type,
      channel: notification.channel,
      status: notification.status,
      priority: notification.priority,
      template: notification.template,
      data: notification.data,
      recipient: notification.recipient,
      scheduledAt: notification.scheduledAt,
      sentAt: notification.sentAt,
      deliveredAt: notification.deliveredAt,
      error: notification.error,
      retryCount: notification.retryCount,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt
    };
  }

  /**
   * Formata notificação para resposta (método estático público)
   */
  static formatNotificationResponse(notification: any): NotificationData {
    return {
      _id: notification._id,
      userId: notification.userId,
      type: notification.type,
      channel: notification.channel,
      status: notification.status,
      priority: notification.priority,
      template: notification.template,
      data: notification.data,
      recipient: notification.recipient,
      scheduledAt: notification.scheduledAt,
      sentAt: notification.sentAt,
      deliveredAt: notification.deliveredAt,
      error: notification.error,
      retryCount: notification.retryCount,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt
    };
  }
}
