import { Router } from 'express';
import { CategoryController } from './controllers/categoryController';
import { ProductController } from './controllers/productController';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Category routes
router.post('/catalog/categories', CategoryController.create);
router.get('/catalog/categories', CategoryController.getAll);
router.get('/catalog/categories/:id', CategoryController.getById);
router.patch('/catalog/categories/:id', CategoryController.update);
router.delete('/catalog/categories/:id', CategoryController.delete);

// Product routes
router.post('/catalog/products', ProductController.create);
router.get('/catalog/products', ProductController.getAll);
router.get('/catalog/products/:id', ProductController.getById);
router.patch('/catalog/products/:id', ProductController.update);
router.delete('/catalog/products/:id', ProductController.delete);

export default router;
