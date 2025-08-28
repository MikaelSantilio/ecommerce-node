export function simulatePayment(amount: number, currency: string): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    return new Promise((resolve) => {
        setTimeout(() => {
            const isSuccess = Math.random() > 0.2; // 80% chance of success
            if (isSuccess) {
                resolve({ success: true, transactionId: generateTransactionId() });
            } else {
                resolve({ success: false, error: 'Payment simulation failed' });
            }
        }, 1000);
    });
}

export function simulateTransaction(transactionId: string): Promise<{ id: string; amount: number; currency: string; status: string }> {
    return new Promise((resolve) => {
        setTimeout(() => {
            const mockTransaction = {
                id: transactionId,
                amount: Math.floor(Math.random() * 1000) + 1, // Random amount between 1 and 1000
                currency: 'USD',
                status: Math.random() > 0.5 ? 'completed' : 'pending' // Random status
            };
            resolve(mockTransaction);
        }, 1000);
    });
}

function generateTransactionId(): string {
    return 'txn_' + Math.random().toString(36).substr(2, 9);
}