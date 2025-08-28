import { Router, Application } from 'express';
import PaymentController from '../controllers/payment';

const router = Router();
const paymentController = new PaymentController();

export function setApiRoutes(app: Application) {
    app.use('/api/payments', router);
    router.post('/process', paymentController.processPayment.bind(paymentController));
    router.get('/status/:id', paymentController.getPaymentStatus.bind(paymentController));
}