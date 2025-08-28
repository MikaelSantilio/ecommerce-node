import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import orderRoutes from './src/routes/orderRoutes';
import { errorHandler } from './src/middleware/validation';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3004;
const serviceName = 'orders';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: serviceName,
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/orders', orderRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: serviceName,
    message: 'Orders service is running',
    version: '1.0.0'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 ${serviceName} service listening on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`📋 API docs: http://localhost:${port}/api/orders`);
});
