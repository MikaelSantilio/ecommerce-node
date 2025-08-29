import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { TemplateService } from '../services/template.service';
import { INotificationTemplate } from '../models/notification.model';

export class NotificationController {
  private notificationService: NotificationService;
  private templateService: TemplateService;

  constructor() {
    this.notificationService = new NotificationService();
    this.templateService = new TemplateService();
  }

  // Create a single notification
  createNotification = async (req: Request, res: Response) => {
    try {
      const notificationData = req.body;
      const notification = await this.notificationService.createNotification(notificationData);

      res.status(201).json({
        success: true,
        data: notification
      });
    } catch (error: any) {
      console.error('Error creating notification:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create notification',
        details: error.message
      });
    }
  };

  // Create bulk notifications
  createBulkNotifications = async (req: Request, res: Response) => {
    try {
      const { notifications } = req.body;
      const createdNotifications = await this.notificationService.createBulkNotifications(notifications);

      res.status(201).json({
        success: true,
        data: createdNotifications,
        count: createdNotifications.length
      });
    } catch (error: any) {
      console.error('Error creating bulk notifications:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create bulk notifications',
        details: error.message
      });
    }
  };

  // Get notifications with pagination and filtering
  getNotifications = async (req: Request, res: Response) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        type,
        channel,
        userId
      } = req.query;

      const filters: any = {};
      if (status) filters.status = status;
      if (type) filters.type = type;
      if (channel) filters.channel = channel;
      if (userId) filters.userId = userId;

      const result = await this.notificationService.getNotifications(
        filters,
        Number(page),
        Number(limit)
      );

      res.json({
        success: true,
        data: result.notifications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: result.total,
          pages: Math.ceil(result.total / Number(limit))
        }
      });
    } catch (error: any) {
      console.error('Error getting notifications:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get notifications',
        details: error.message
      });
    }
  };

  // Get notification by ID
  getNotificationById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const notification = await this.notificationService.getNotificationById(id);

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'Notification not found'
        });
      }

      res.json({
        success: true,
        data: notification
      });
    } catch (error: any) {
      console.error('Error getting notification:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get notification',
        details: error.message
      });
    }
  };

  // Update notification status
  updateNotificationStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, error } = req.body;

      const notification = await this.notificationService.updateNotificationStatus(id, status, error);

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'Notification not found'
        });
      }

      res.json({
        success: true,
        data: notification
      });
    } catch (error: any) {
      console.error('Error updating notification status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update notification status',
        details: error.message
      });
    }
  };

  // Cancel notification
  cancelNotification = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const notification = await this.notificationService.cancelNotification(id);

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'Notification not found'
        });
      }

      res.json({
        success: true,
        data: notification
      });
    } catch (error: any) {
      console.error('Error canceling notification:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cancel notification',
        details: error.message
      });
    }
  };

  // Get notification statistics
  getNotificationStats = async (req: Request, res: Response) => {
    try {
      const stats = await this.notificationService.getNotificationStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('Error getting notification stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get notification stats',
        details: error.message
      });
    }
  };

  // Create notification template
  createTemplate = async (req: Request, res: Response) => {
    try {
      const templateData = req.body;
      const template = await this.templateService.createTemplate(templateData);

      res.status(201).json({
        success: true,
        data: template
      });
    } catch (error: any) {
      console.error('Error creating template:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create template',
        details: error.message
      });
    }
  };

  // Get all templates
  getTemplates = async (req: Request, res: Response) => {
    try {
      const templates = await this.templateService.getAllTemplates();

      res.json({
        success: true,
        data: templates
      });
    } catch (error: any) {
      console.error('Error getting templates:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get templates',
        details: error.message
      });
    }
  };

  // Get template by ID
  getTemplateById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const template = await this.templateService.getTemplateById(id);

      if (!template) {
        return res.status(404).json({
          success: false,
          error: 'Template not found'
        });
      }

      res.json({
        success: true,
        data: template
      });
    } catch (error: any) {
      console.error('Error getting template:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get template',
        details: error.message
      });
    }
  };

  // Update template
  updateTemplate = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const template = await this.templateService.updateTemplate(id, updateData);

      if (!template) {
        return res.status(404).json({
          success: false,
          error: 'Template not found'
        });
      }

      res.json({
        success: true,
        data: template
      });
    } catch (error: any) {
      console.error('Error updating template:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update template',
        details: error.message
      });
    }
  };

  // Delete template
  deleteTemplate = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await this.templateService.deleteTemplate(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Template not found'
        });
      }

      res.json({
        success: true,
        message: 'Template deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting template:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete template',
        details: error.message
      });
    }
  };

  // Send test notification
  sendTestNotification = async (req: Request, res: Response) => {
    try {
      const { email, phone, type = 'welcome', channel = 'email' } = req.body;

      if (!email && !phone) {
        return res.status(400).json({
          success: false,
          error: 'Either email or phone must be provided'
        });
      }

      const testData = {
        userId: 'test-user',
        type,
        channel,
        recipient: {
          email,
          phone,
          name: 'Test User'
        },
        data: {
          firstName: 'Test',
          lastName: 'User',
          orderId: 'TEST-123',
          orderTotal: '$99.99'
        }
      };

      const notification = await this.notificationService.createNotification(testData);

      res.json({
        success: true,
        message: 'Test notification sent successfully',
        data: notification
      });
    } catch (error: any) {
      console.error('Error sending test notification:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send test notification',
        details: error.message
      });
    }
  };
}
