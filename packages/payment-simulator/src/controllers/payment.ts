import { Request, Response } from 'express';
import Transaction from '../models/transaction';
import { simulatePayment, simulateTransaction } from '../utils/simulator';

class PaymentController {
    async processPayment(req: Request, res: Response) {
        try {
            const { amount, currency } = req.body;
            const result = await simulatePayment(amount, currency);
            if (result.success && result.transactionId) {
                const transaction = Transaction.createTransaction(result.transactionId, amount, currency);
                transaction.updateStatus('completed');
                res.status(200).json({
                    message: 'Payment processed successfully',
                    transactionId: result.transactionId,
                    amount,
                    currency,
                    status: 'success'
                });
            } else {
                res.status(400).json({
                    message: 'Payment failed',
                    error: result.error
                });
            }
        } catch (error) {
            res.status(500).json({
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getPaymentStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const transaction = await simulateTransaction(id);
            res.status(200).json({
                message: 'Payment status retrieved successfully',
                transactionId: id,
                status: transaction.status,
                amount: transaction.amount,
                currency: transaction.currency
            });
        } catch (error) {
            res.status(500).json({
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}

export default PaymentController;