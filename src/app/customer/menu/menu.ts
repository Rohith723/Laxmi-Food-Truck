import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Navbar } from '../../shared/navbar/navbar';
import { MenuService } from '../../services/menu.service';
import { CartService } from '../../services/cart.service';
import { BusinessService } from '../../services/business.service';
import { MenuItem } from '../../models';

@Component({
  selector: 'app-menu',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatSnackBarModule, Navbar],
  template: `
    <div class="page-wrapper">
      <app-navbar></app-navbar>
      <div class="menu-page">
        <div class="menu-header app-container">
          <h1>Our Menu 🍽️</h1>
          <p>Freshly prepared to order. Pre-order and pick up between 7 PM – 11 PM.</p>
        </div>

        @if (!storeOpen()) {
          <div class="closed-notice app-container">
            <mat-icon>store</mat-icon>
            <div>
              <strong>Store is Currently Closed</strong>
              <p>Ordering is temporarily disabled. Check back later!</p>
            </div>
          </div>
        }

        @if (loading()) {
          <div class="app-container">
            <div class="skeleton-grid">
              @for (i of [1,2,3,4,5,6]; track i) { <div class="skeleton-card"></div> }
            </div>
          </div>
        } @else {
          <div class="menu-grid app-container">
            @for (item of menuItems(); track item.id) {
              <div class="food-card menu-card" [class.unavailable-card]="!item.is_available">
                <div class="card-image">
                  @if (item.image_url) {
                    <img [src]="item.image_url" [alt]="item.name" loading="lazy">
                  } @else {
                    <div class="image-placeholder">🍽️</div>
                  }
                  @if (!item.is_available) {
                    <div class="unavail-badge">Unavailable</div>
                  }
                </div>
                <div class="card-body">
                  <div class="card-top">
                    <h3>{{ item.name }}</h3>
                    <span class="price">₹{{ item.price }}</span>
                  </div>
                  <p class="description">{{ item.description }}</p>
                  <div class="card-actions">
                    @if (getItemQty(item.id) > 0) {
                      <div class="qty-control">
                        <button mat-icon-button (click)="decreaseQty(item)" class="qty-btn">
                          <mat-icon>remove</mat-icon>
                        </button>
                        <span class="qty-display">{{ getItemQty(item.id) }}</span>
                        <button mat-icon-button (click)="addToCart(item)" class="qty-btn">
                          <mat-icon>add</mat-icon>
                        </button>
                      </div>
                    } @else {
                      <button mat-raised-button
                        [disabled]="!item.is_available || !storeOpen()"
                        (click)="addToCart(item)"
                        class="add-btn"
                        [class.disabled-btn]="!item.is_available">
                        @if (!item.is_available) { Currently Unavailable }
                        @else { <mat-icon>add_shopping_cart</mat-icon> Add to Cart }
                      </button>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        }

        @if (cartCount() > 0) {
          <div class="cart-fab-bar">
            <div class="cart-bar-content app-container">
              <span>{{ cartCount() }} item(s) · ₹{{ cartTotal() }}</span>
              <a mat-raised-button routerLink="/cart" class="view-cart-btn">
                View Cart <mat-icon>arrow_forward</mat-icon>
              </a>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .menu-page { padding-bottom: 100px; }
    .menu-header { padding: 40px 0 24px; h1 { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 800; margin-bottom: 8px; } p { color: var(--text-secondary); } }
    .closed-notice {
      display: flex; align-items: center; gap: 16px;
      background: #fff3e0; border: 1px solid #ffe0b2; border-radius: 12px;
      padding: 16px 20px; margin-bottom: 24px; color: var(--primary);
      mat-icon { font-size: 32px; width: 32px; height: 32px; }
      strong { display: block; font-size: 1rem; }
      p { margin: 4px 0 0; font-size: 0.875rem; }
    }
    .menu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; padding-bottom: 24px; }
    .menu-card { display: flex; flex-direction: column; &.unavailable-card { opacity: 0.7; } }
    .card-image {
      height: 200px; position: relative; overflow: hidden; border-radius: 16px 16px 0 0;
      img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
    }
    .image-placeholder { width: 100%; height: 100%; background: linear-gradient(135deg, #fff3e0, #ffe0cc); display: flex; align-items: center; justify-content: center; font-size: 64px; }
    .unavail-badge { position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.7); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .card-body { padding: 20px; flex: 1; display: flex; flex-direction: column; }
    .card-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 8px; gap: 12px; h3 { font-weight: 700; font-size: 1.05rem; flex: 1; } }
    .price { font-size: 1.15rem; font-weight: 800; color: var(--primary); white-space: nowrap; }
    .description { color: var(--text-secondary); font-size: 0.875rem; line-height: 1.5; flex: 1; margin-bottom: 16px; }
    .add-btn { width: 100%; background: var(--primary) !important; color: white !important; display: flex !important; align-items: center !important; gap: 8px !important; justify-content: center !important; &.disabled-btn { background: #e0e0e0 !important; color: #9e9e9e !important; } }
    .qty-control { display: flex; align-items: center; justify-content: space-between; background: #fff3e0; border-radius: 50px; padding: 4px; border: 2px solid var(--primary); }
    .qty-btn { color: var(--primary) !important; width: 36px !important; height: 36px !important; }
    .qty-display { font-size: 1.1rem; font-weight: 700; color: var(--primary); min-width: 32px; text-align: center; }
    .cart-fab-bar { position: fixed; bottom: 0; left: 0; right: 0; z-index: 50; background: var(--primary); color: white; padding: 12px 0; box-shadow: 0 -4px 20px rgba(0,0,0,0.15); }
    .cart-bar-content { display: flex; align-items: center; justify-content: space-between; font-weight: 600; }
    .view-cart-btn { background: white !important; color: var(--primary) !important; font-weight: 700 !important; display: flex !important; align-items: center !important; gap: 4px !important; }
    .skeleton-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
    .skeleton-card { height: 360px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: var(--radius); }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    @media (max-width: 600px) { .menu-grid { grid-template-columns: 1fr; } }
  `]
})
export class Menu implements OnInit {
  menuItems = signal<MenuItem[]>([]);
  loading = signal(true);
  storeOpen = signal(true);
  cartCount = computed(() => this.cart.itemCount());
  cartTotal = computed(() => this.cart.total());

  constructor(private menuService: MenuService, private cart: CartService,
    private business: BusinessService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.menuService.getMenuItems().subscribe({
      next: items => { this.menuItems.set(items); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
    this.business.getSettings().subscribe({ next: s => this.storeOpen.set(s.shop_open), error: () => {} });
  }

  getItemQty(itemId: string): number {
    return this.cart.items().find(i => i.menuItem.id === itemId)?.quantity || 0;
  }

  addToCart(item: MenuItem) {
    this.cart.addItem(item);
    this.snackBar.open(`${item.name} added!`, '✕', { duration: 2000, panelClass: 'success-snack', horizontalPosition: 'center', verticalPosition: 'top' });
  }

  decreaseQty(item: MenuItem) {
    this.cart.updateQuantity(item.id, this.getItemQty(item.id) - 1);
  }
}