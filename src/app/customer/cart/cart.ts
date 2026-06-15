import { Component, computed } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Navbar } from '../../shared/navbar/navbar';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, MatButtonModule, MatIconModule, Navbar],
  template: `
    <div class="page-wrapper">
      <app-navbar></app-navbar>
      <div class="cart-page app-container">
        <h1 class="page-title">Your Cart 🛒</h1>

        @if (items().length === 0) {
          <div class="empty-cart">
            <div class="empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some delicious items from our menu!</p>
            <a mat-raised-button routerLink="/menu" class="btn-primary">Browse Menu</a>
          </div>
        } @else {
          <div class="cart-layout">
            <div class="cart-items">
              @for (item of items(); track item.menuItem.id) {
                <div class="cart-item-card food-card">
                  <div class="item-image">
                    @if (item.menuItem.image_url) {
                      <img [src]="item.menuItem.image_url" [alt]="item.menuItem.name">
                    } @else {
                      <div class="img-placeholder">🍽️</div>
                    }
                  </div>
                  <div class="item-details">
                    <h3>{{ item.menuItem.name }}</h3>
                    <p class="unit-price">₹{{ item.menuItem.price }} each</p>
                  </div>
                  <div class="item-controls">
                    <div class="qty-control">
                      <button mat-icon-button (click)="decreaseQty(item)" class="qty-btn">
                        <mat-icon>{{ item.quantity === 1 ? 'delete_outline' : 'remove' }}</mat-icon>
                      </button>
                      <span class="qty-display">{{ item.quantity }}</span>
                      <button mat-icon-button (click)="increaseQty(item)" class="qty-btn">
                        <mat-icon>add</mat-icon>
                      </button>
                    </div>
                    <span class="item-total">₹{{ item.menuItem.price * item.quantity }}</span>
                  </div>
                </div>
              }
            </div>

            <div class="order-summary food-card">
              <h2>Order Summary</h2>
              <div class="summary-rows">
                @for (item of items(); track item.menuItem.id) {
                  <div class="summary-row">
                    <span>{{ item.menuItem.name }} × {{ item.quantity }}</span>
                    <span>₹{{ item.menuItem.price * item.quantity }}</span>
                  </div>
                }
              </div>
              <div class="summary-divider"></div>
              <div class="summary-total">
                <strong>Total</strong>
                <strong>₹{{ total() }}</strong>
              </div>
              <div class="payment-note">
                <mat-icon>payments</mat-icon>
                <span>Pay at Pickup (Cash / UPI)</span>
              </div>
              <button mat-raised-button class="checkout-btn" (click)="goToCheckout()">
                Proceed to Checkout <mat-icon>arrow_forward</mat-icon>
              </button>
              <button mat-button color="warn" (click)="clearCart()" class="clear-btn">Clear Cart</button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .cart-page { padding: 40px 0 60px; }
    .page-title { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 800; margin-bottom: 32px; }
    .empty-cart { text-align: center; padding: 80px 20px; .empty-icon { font-size: 80px; margin-bottom: 16px; } h2 { font-size: 1.5rem; margin-bottom: 8px; } p { color: var(--text-secondary); margin-bottom: 24px; } }
    .cart-layout { display: grid; grid-template-columns: 1fr 380px; gap: 32px; align-items: start; }
    .cart-items { display: flex; flex-direction: column; gap: 16px; }
    .cart-item-card { display: flex; align-items: center; gap: 16px; padding: 16px; }
    .item-image { width: 80px; height: 80px; border-radius: 12px; overflow: hidden; flex-shrink: 0; img { width: 100%; height: 100%; object-fit: cover; } }
    .img-placeholder { width: 100%; height: 100%; background: linear-gradient(135deg, #fff3e0, #ffe0cc); display: flex; align-items: center; justify-content: center; font-size: 32px; }
    .item-details { flex: 1; h3 { font-weight: 700; font-size: 1rem; margin-bottom: 4px; } .unit-price { color: var(--text-secondary); font-size: 0.875rem; } }
    .item-controls { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
    .qty-control { display: flex; align-items: center; gap: 4px; background: #fff3e0; border-radius: 50px; padding: 2px; border: 2px solid var(--primary); }
    .qty-btn { color: var(--primary) !important; width: 32px !important; height: 32px !important; }
    .qty-display { font-size: 1rem; font-weight: 700; color: var(--primary); min-width: 28px; text-align: center; }
    .item-total { font-weight: 800; color: var(--primary); font-size: 1.1rem; }
    .order-summary { padding: 24px; position: sticky; top: 80px; h2 { font-size: 1.25rem; font-weight: 700; margin-bottom: 20px; } }
    .summary-rows { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
    .summary-row { display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--text-secondary); }
    .summary-divider { height: 1px; background: var(--border); margin: 16px 0; }
    .summary-total { display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: 700; margin-bottom: 16px; strong:last-child { color: var(--primary); } }
    .payment-note { display: flex; align-items: center; gap: 8px; background: #e8f5e9; color: var(--success); padding: 10px 14px; border-radius: 10px; font-size: 0.875rem; font-weight: 500; margin-bottom: 16px; mat-icon { font-size: 18px; } }
    .checkout-btn { width: 100%; background: var(--primary) !important; color: white !important; font-weight: 700 !important; height: 48px !important; margin-bottom: 8px !important; display: flex !important; align-items: center !important; justify-content: center !important; gap: 8px !important; }
    .clear-btn { width: 100%; font-size: 0.875rem !important; }
    @media (max-width: 900px) { .cart-layout { grid-template-columns: 1fr; } .order-summary { position: static; order: -1; } }
  `]
})
export class Cart {
  items = computed(() => this.cart.items());
  total = computed(() => this.cart.total());

  constructor(private cart: CartService, private router: Router) {}

  increaseQty(item: CartItem) { this.cart.updateQuantity(item.menuItem.id, item.quantity + 1); }
  decreaseQty(item: CartItem) { this.cart.updateQuantity(item.menuItem.id, item.quantity - 1); }
  clearCart() { this.cart.clearCart(); }
  goToCheckout() { this.router.navigate(['/checkout']); }
}