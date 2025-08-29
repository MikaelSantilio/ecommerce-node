import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import {
  validateRequest,
  createNotificationSchema,
  createBulkNotificationSchema,
  getNotificationsSchema,
  updateNotificationStatusSchema,
  createTemplateSchema,
  rateLimitMiddleware
} from '../middleware/validation';

const router = Router();
const notificationController = new NotificationController();

// Rate limiting para todas as rotas
router.use(rateLimitMiddleware(100, 15 * 60 * 1000)); // 100 requests por 15 minutos

// Rotas de notificações
router.post(
  '/',
  validateRequest(createNotificationSchema),
  notificationController.createNotification.bind(notificationController)
);

router.post(
  '/bulk',
  validateRequest(createBulkNotificationSchema),
  notificationController.createBulkNotifications.bind(notificationController)
);

router.get(
  '/',
  validateRequest(getNotificationsSchema),
  notificationController.getNotifications.bind(notificationController)
);

router.get(
  '/:id',
  notificationController.getNotificationById.bind(notificationController)
);

router.patch(
  '/:id/status',
  validateRequest(updateNotificationStatusSchema),
  notificationController.updateNotificationStatus.bind(notificationController)
);

router.delete(
  '/:id',
  notificationController.cancelNotification.bind(notificationController)
);

// Rota de estatísticas
router.get(
  '/stats/overview',
  notificationController.getNotificationStats.bind(notificationController)
);

// Rotas de templates
router.post(
  '/templates',
  validateRequest(createTemplateSchema),
  notificationController.createTemplate.bind(notificationController)
);

router.get(
  '/templates',
  notificationController.getTemplates.bind(notificationController)
);

router.get(
  '/templates/:id',
  notificationController.getTemplateById.bind(notificationController)
);

router.put(
  '/templates/:id',
  validateRequest(createTemplateSchema),
  notificationController.updateTemplate.bind(notificationController)
);

router.delete(
  '/templates/:id',
  notificationController.deleteTemplate.bind(notificationController)
);

// Rota de teste
router.post(
  '/test',
  notificationController.sendTestNotification.bind(notificationController)
);

export default router;
