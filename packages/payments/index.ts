import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './src/routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());
app.use(express.raw({ type: 'application/json' })); // For webhooks
app.use('/', routes);

app.listen(port, () => {
  console.log(`Payments service listening on port ${port}`);
});
