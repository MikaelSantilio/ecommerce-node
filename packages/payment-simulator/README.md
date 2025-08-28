# Payment Simulator

## Overview
The Payment Simulator is a mock payment processing application designed to simulate payment transactions. It provides a simple API for processing payments and retrieving transaction statuses.

## Features
- Simulate payment processing
- Retrieve payment status
- Mock transaction management

## Project Structure
```
payment-simulator
├── src
│   ├── app.ts                # Entry point of the application
│   ├── controllers
│   │   └── payment.ts        # Handles payment processing and status retrieval
│   ├── models
│   │   └── transaction.ts     # Represents a payment transaction
│   ├── routes
│   │   └── api.ts            # Sets up API routes
│   └── utils
│       └── simulator.ts       # Provides mock implementations for payment processing
├── package.json               # npm configuration file
├── tsconfig.json              # TypeScript configuration file
└── README.md                  # Project documentation
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd payment-simulator
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage
To start the application, run:
```
npm start
```

The application will run on port 3006 by default.

## API Endpoints
- **POST /api/payments/process**: Process a payment.
  - Body: `{ amount: number, currency: string }`
  - Response: `{ message: string, transactionId: string, amount: number, currency: string, status: string }`
- **GET /api/payments/status/:id**: Retrieve the status of a payment by transaction ID.
  - Response: `{ message: string, transactionId: string, status: string, amount: number, currency: string }`

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.