import { Router } from 'express';
import { createProxyMiddleware } from '../middleware/proxy';
import { authenticateToken, requireRole, optionalAuth } from '../middleware/auth';
import { apiRateLimit, authRateLimit, publicReadRateLimit } from '../middleware/rateLimiter';

const router = Router();

// ==========================================
// AUTH ROUTES (Públicas)
// ==========================================
router.use('/api/auth', authRateLimit, createProxyMiddleware('auth'));

// ==========================================
// CATALOG ROUTES (Híbridas)
// ==========================================

// Rotas públicas de leitura (produtos e categorias)
router.get('/api/catalog/products*', publicReadRateLimit, optionalAuth, createProxyMiddleware('catalog'));
router.get('/api/catalog/categories*', publicReadRateLimit, optionalAuth, createProxyMiddleware('catalog'));

// Rotas administrativas (requer autenticação e role admin)
router.use('/api/catalog/admin*', authenticateToken, requireRole(['admin']), apiRateLimit, createProxyMiddleware('catalog'));

// Outras rotas de catálogo (criação, edição, exclusão - requer admin)
router.post('/api/catalog/*', authenticateToken, requireRole(['admin']), apiRateLimit, createProxyMiddleware('catalog'));
router.put('/api/catalog/*', authenticateToken, requireRole(['admin']), apiRateLimit, createProxyMiddleware('catalog'));
router.patch('/api/catalog/*', authenticateToken, requireRole(['admin']), apiRateLimit, createProxyMiddleware('catalog'));
router.delete('/api/catalog/*', authenticateToken, requireRole(['admin']), apiRateLimit, createProxyMiddleware('catalog'));

// ==========================================
// CART ROUTES (Requer autenticação)
// ==========================================
router.use('/api/cart', authenticateToken, apiRateLimit, createProxyMiddleware('cart'));

// ==========================================
// ORDERS ROUTES (Requer autenticação)
// ==========================================
router.use('/api/orders', authenticateToken, apiRateLimit, createProxyMiddleware('orders'));

// ==========================================
// PAYMENTS ROUTES (Requer autenticação)
// ==========================================
router.use('/api/payments', authenticateToken, apiRateLimit, createProxyMiddleware('payments'));

// ==========================================
// NOTIFICATIONS ROUTES (Admin apenas)
// ==========================================
router.use('/api/notifications', authenticateToken, requireRole(['admin']), apiRateLimit, createProxyMiddleware('notifications'));

// ==========================================
// ROTAS DE FALLBACK
// ==========================================

// Rota para capturar requests não mapeados
router.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'not_found',
    message: `API endpoint ${req.originalUrl} not found`,
    availableServices: ['auth', 'catalog', 'cart', 'orders', 'payments', 'notifications']
  });
});

export default router;
