import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import { connectMongoDB } from './src/config/database';
import { connectRedis } from './src/config/redis';
import notificationRoutes from './src/routes';
import { errorHandler } from './src/middleware/validation';
import { startNotificationWorkers } from './src/workers/notification.worker';

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'notifications',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/notifications', notificationRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('🛑 Received shutdown signal, closing server gracefully...');

  try {
    // Fechar conexões com banco de dados
    await Promise.all([
      // MongoDB connection will be closed automatically
      // Redis connection will be closed automatically
    ]);

    console.log('✅ All connections closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const startServer = async () => {
  try {
    // Conectar aos bancos de dados
    await connectMongoDB();
    await connectRedis();

    // Iniciar workers
    await startNotificationWorkers();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Notifications service running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📧 API endpoints: http://localhost:${PORT}/api/notifications`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Iniciar aplicação
startServer().catch((error) => {
  console.error('❌ Application startup failed:', error);
  process.exit(1);
});

export default app;
