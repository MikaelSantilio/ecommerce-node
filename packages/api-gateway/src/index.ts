import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import routes from './routes';
import { requestLogger, healthCheckMiddleware } from './middleware/monitoring';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { addGatewayHeaders } from './middleware/proxy';
import { logger } from './utils/logger';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const serviceName = 'api-gateway';

// ==========================================
// MIDDLEWARES DE SEGURANÇA
// ==========================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID']
}));

// ==========================================
// MIDDLEWARES GERAIS
// ==========================================
app.use(compression());
app.use(express.json({ 
  limit: process.env.JSON_LIMIT || '10mb'
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: process.env.URL_ENCODED_LIMIT || '10mb'
}));

// Trust proxy para obter IP real se atrás de load balancer
app.set('trust proxy', true);

// Middlewares customizados
app.use(addGatewayHeaders);
app.use(requestLogger);

// ==========================================
// ROTAS PRINCIPAIS
// ==========================================

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    service: serviceName,
    message: 'E-commerce API Gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    documentation: '/api/docs',
    health: '/health'
  });
});

// Rota de health check
app.get('/health', healthCheckMiddleware);

// Rota de informações da API
app.get('/api', (req, res) => {
  res.json({
    name: 'E-commerce API Gateway',
    version: '1.0.0',
    description: 'Gateway para microserviços de e-commerce',
    services: {
      auth: 'Authentication and user management',
      catalog: 'Product and category management',
      cart: 'Shopping cart operations',
      orders: 'Order processing and management',
      payments: 'Payment processing',
      notifications: 'Email and SMS notifications'
    },
    endpoints: {
      auth: '/api/auth/*',
      catalog: '/api/catalog/*',
      cart: '/api/cart/*',
      orders: '/api/orders/*',
      payments: '/api/payments/*',
      notifications: '/api/notifications/*'
    }
  });
});

// Rotas da API
app.use(routes);

// ==========================================
// TRATAMENTO DE ERROS
// ==========================================
app.use(notFoundHandler);
app.use(errorHandler);

// ==========================================
// INICIALIZAÇÃO DO SERVIDOR
// ==========================================
const server = app.listen(port, () => {
  logger.info(`🚀 API Gateway started successfully`, {
    service: serviceName,
    port,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    timestamp: new Date().toISOString()
  });
  
  console.log(`🚀 ${serviceName} listening on port ${port}`);
  console.log(`📋 Health check: http://localhost:${port}/health`);
  console.log(`📖 API info: http://localhost:${port}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

export default app;
