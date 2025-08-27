import { Cart, ICart, ICartItem } from '../models/Cart';
import { CartData, CartItemData } from '../utils';
import mongoose from 'mongoose';

export class CartService {
  static async getOrCreateCart(userId: string): Promise<ICart> {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: []
      });
      await cart.save();
    }

    return cart;
  }

  static async getCart(userId: string): Promise<CartData | null> {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return null;
    }

    const items: CartItemData[] = cart.items.map((item: any) => ({
      id: item._id.toString(),
      productId: item.productId.toString(),
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      addedAt: item.addedAt
    }));

    const total = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    return {
      id: cart._id.toString(),
      userId: cart.userId.toString(),
      items,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
      total
    };
  }

  static async addItem(userId: string, productId: string, quantity: number, unitPrice: number): Promise<ICart> {
    const cart = await this.getOrCreateCart(userId);

    // Check if item already exists
    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.productId.toString() === productId
    );

    if (existingItemIndex >= 0) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        productId: mongoose.Types.ObjectId.isValid(productId) ? new mongoose.Types.ObjectId(productId) : productId,
        quantity,
        unitPrice,
        addedAt: new Date()
      } as ICartItem);
    }

    return await cart.save();
  }

  static async updateItemQuantity(userId: string, itemId: string, quantity: number): Promise<ICart | null> {
    const cart = await Cart.findOneAndUpdate(
      { userId, 'items._id': itemId },
      { $set: { 'items.$.quantity': quantity } },
      { new: true }
    );

    return cart;
  }

  static async removeItem(userId: string, itemId: string): Promise<ICart | null> {
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { _id: itemId } } },
      { new: true }
    );

    return cart;
  }

  static async clearCart(userId: string): Promise<ICart | null> {
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [] } },
      { new: true }
    );

    return cart;
  }

  static async deleteCart(userId: string): Promise<boolean> {
    const result = await Cart.findOneAndDelete({ userId });
    return !!result;
  }

  static async getItemCount(userId: string): Promise<number> {
    const cart = await Cart.findOne({ userId });
    if (!cart) return 0;

    return cart.items.reduce((total: number, item: any) => total + item.quantity, 0);
  }
}
