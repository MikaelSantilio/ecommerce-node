import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem extends Document {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  unitPrice: number;
  addedAt: Date;
}

export interface ICart extends Document {
  userId: string;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  productId: { type: Schema.Types.ObjectId, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  addedAt: { type: Date, default: Date.now }
});

const CartSchema = new Schema<ICart>({
  userId: { type: String, required: true },
  items: [CartItemSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware para atualizar updatedAt
CartSchema.pre('save', function(next: any) {
  this.updatedAt = new Date();
  next();
});

export const Cart = mongoose.model<ICart>('Cart', CartSchema);
