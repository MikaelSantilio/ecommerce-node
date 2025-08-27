import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './src/database';
import routes from './src/routes';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3003;
const serviceName = 'cart';

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ service: serviceName, message: 'hello' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'not_found', message: 'Endpoint not found' });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'internal_error', message: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(port, () => {
  console.log(`Service ${serviceName} listening on port ${port}`);
});
