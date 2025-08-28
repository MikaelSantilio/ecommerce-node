# Payments Service

This is the payments microservice for the e-commerce platform. It handles payment processing by integrating with a payment simulator.

## Features

- Create payment intents
- Handle payment webhooks
- Store payment records in PostgreSQL using Prisma
- Integrate with payment simulator for testing

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up the database:
   ```bash
   npm run db:push
   ```

3. Generate Prisma client:
   ```bash
   npm run db:generate
   ```

4. Copy `.env.example` to `.env` and configure:
   - `DATABASE_URL`: PostgreSQL connection string
   - `PAYMENT_SIMULATOR_URL`: URL of the payment simulator service
   - `ORDERS_SERVICE_URL`: URL of the orders service

## Running

- Development: `npm run dev`
- Production: `npm run build && npm start`

## API Endpoints

- `POST /payments`: Create a payment intent
- `POST /webhooks/simulator`: Handle payment simulator webhooks
- `GET /health`: Health check

## Docker

Build and run with Docker:

```bash
docker build -f Dockerfile.dev -t payments-dev .
docker run -p 3005:3005 payments-dev
```
