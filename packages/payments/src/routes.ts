// filepath: packages/payments/src/routes.ts
import { Router } from 'express';
import { PaymentController } from './controllers/paymentController';

const router = Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));
router.post('/payments', PaymentController.createPayment);
router.post('/webhooks/simulator', PaymentController.handleWebhook);

export default router;
