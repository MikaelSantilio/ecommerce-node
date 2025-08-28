import express, { Application } from 'express';
import bodyParser from 'body-parser';
import { setApiRoutes } from './routes/api';

const app: Application = express();
const PORT = process.env.PORT || 3006;

app.use(bodyParser.json());

setApiRoutes(app);

app.listen(PORT, () => {
    console.log(`Payment Simulator running on port ${PORT}`);
});