import express from 'express';

const app = express();
const port = 3002;
const serviceName = 'catalog';

app.get('/', (req, res) => {
  res.json({ service: serviceName, message: 'hello' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Service ${serviceName} listening on port ${port}`);
});
