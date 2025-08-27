import express from 'express';
import cors from 'cors';
import authRoutes from './src/routes';

const app = express();
const port = 3001;
const serviceName = 'auth';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ service: serviceName, message: 'Auth service is running' });
});

app.listen(port, () => {
  console.log(`Service ${serviceName} listening on port ${port}`);
});
