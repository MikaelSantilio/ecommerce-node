import { Router } from 'express';
import { OrderController } from '../controllers/orderController';
import { validateRequest, createOrderSchema, updateOrderStatusSchema, getOrdersSchema } from '../middleware/validation';

const router = Router();

// Create order
router.post('/', validateRequest(createOrderSchema), OrderController.createOrder);

// Get order by ID
router.get('/:id', OrderController.getOrderById);

// Get orders by user ID
router.get('/user/:userId', validateRequest(getOrdersSchema), OrderController.getUserOrders);

// Update order status
router.patch('/:id/status', validateRequest(updateOrderStatusSchema), OrderController.updateOrderStatus);

// Cancel order
router.post('/:id/cancel', OrderController.cancelOrder);

// Process payment for order
router.post('/:id/payment', OrderController.processPayment);

// Get all orders (admin endpoint)
router.get('/', validateRequest(getOrdersSchema), OrderController.getAllOrders);

export default router;
