import { Injectable, signal, computed } from '@angular/core';
import { CartItem, MenuItem } from '../models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartItems = signal<CartItem[]>([]);

  items = computed(() => this.cartItems());
  itemCount = computed(() => this.cartItems().reduce((sum, i) => sum + i.quantity, 0));
  total = computed(() => this.cartItems().reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0));

  addItem(menuItem: MenuItem): void {
    const items = this.cartItems();
    const existing = items.find(i => i.menuItem.id === menuItem.id);
    if (existing) {
      this.cartItems.set(items.map(i =>
        i.menuItem.id === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      this.cartItems.set([...items, { menuItem, quantity: 1 }]);
    }
  }

  removeItem(menuItemId: string): void {
    this.cartItems.set(this.cartItems().filter(i => i.menuItem.id !== menuItemId));
  }

  updateQuantity(menuItemId: string, quantity: number): void {
    if (quantity <= 0) { this.removeItem(menuItemId); return; }
    this.cartItems.set(this.cartItems().map(i =>
      i.menuItem.id === menuItemId ? { ...i, quantity } : i
    ));
  }

  clearCart(): void {
    this.cartItems.set([]);
  }
}