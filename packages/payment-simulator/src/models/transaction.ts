class Transaction {
    id: string;
    amount: number;
    currency: string;
    status: string;

    constructor(id: string, amount: number, currency: string, status: string) {
        this.id = id;
        this.amount = amount;
        this.currency = currency;
        this.status = status;
    }

    static createTransaction(id: string, amount: number, currency: string): Transaction {
        return new Transaction(id, amount, currency, 'pending');
    }

    updateStatus(newStatus: string): void {
        this.status = newStatus;
    }
}

export default Transaction;