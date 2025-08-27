import { Router } from 'express';
import { CartController } from './controllers/CartController';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Cart routes
router.get('/cart/:userId', CartController.getCart);
router.post('/cart/:userId/items', CartController.addItem);
router.patch('/cart/:userId/items/:itemId', CartController.updateItem);
router.delete('/cart/:userId/items/:itemId', CartController.removeItem);
router.delete('/cart/:userId', CartController.clearCart);
router.get('/cart/:userId/count', CartController.getItemCount);

export default router;
