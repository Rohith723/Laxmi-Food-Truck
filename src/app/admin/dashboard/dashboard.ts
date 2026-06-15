import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="dashboard">
      <div class="page-header">
        <div>
          <h1>Dashboard</h1>
          <p class="date-label">{{ todayLabel }}</p>
        </div>
        <a mat-raised-button routerLink="/admin/orders" class="view-orders-btn">
          <mat-icon>receipt_long</mat-icon> View All Orders
        </a>
      </div>

      <div class="stats-grid">
        @for (stat of statCards(); track stat.label) {
          <div class="stat-card" [style.border-color]="stat.color">
            <div class="stat-icon" [style.background]="stat.bg" [style.color]="stat.color">
              <mat-icon>{{ stat.icon }}</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stat.value }}</span>
              <span class="stat-label">{{ stat.label }}</span>
            </div>
          </div>
        }
      </div>

      <div class="recent-orders-section">
        <div class="section-header">
          <h2>Today's Orders</h2>
          <a mat-button routerLink="/admin/orders" color="primary">See all</a>
        </div>

        @if (loading()) {
          <div class="loading-placeholder">
            @for (i of [1,2,3]; track i) { <div class="skeleton-row"></div> }
          </div>
        } @else if (orders().length === 0) {
          <div class="empty-orders">
            <mat-icon>receipt_long</mat-icon>
            <p>No orders today yet!</p>
          </div>
        } @else {
          <div class="orders-table">
            <div class="table-header">
              <span>Order ID</span><span>Customer</span>
              <span class="hide-mobile">Time</span><span>Amount</span><span>Status</span>
            </div>
            @for (order of orders(); track order.id) {
              <div class="table-row" routerLink="/admin/orders">
                <span class="order-id">ORD-{{ shortId(order.id) }}</span>
                <span><strong>{{ order.customer_name }}</strong></span>
                <span class="hide-mobile">{{ order.pickup_time }}</span>
                <span class="amount">₹{{ order.total_amount }}</span>
                <span><span class="status-chip {{ order.order_status }}">{{ order.order_status }}</span></span>
              </div>
            }
          </div>
        }
      </div>

      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <a mat-raised-button routerLink="/admin/menu" class="action-card">
            <mat-icon>add_circle</mat-icon><span>Add Menu Item</span>
          </a>
          <a mat-raised-button routerLink="/admin/pickup-slots" class="action-card">
            <mat-icon>schedule</mat-icon><span>Manage Slots</span>
          </a>
          <a mat-raised-button routerLink="/admin/settings" class="action-card">
            <mat-icon>store</mat-icon><span>Store Settings</span>
          </a>
          <a mat-raised-button routerLink="/menu" class="action-card preview">
            <mat-icon>open_in_new</mat-icon><span>Preview Menu</span>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1100px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; h1 { font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 800; margin-bottom: 4px; } .date-label { color: var(--text-secondary); font-size: 0.9rem; } }
    .view-orders-btn { background: var(--primary) !important; color: white !important; display: flex !important; align-items: center !important; gap: 8px !important; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .stat-card { background: white; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); border-left: 4px solid; }
    .stat-icon { width: 52px; height: 52px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; mat-icon { font-size: 24px; } }
    .stat-info { display: flex; flex-direction: column; }
    .stat-value { font-size: 2rem; font-weight: 800; line-height: 1; }
    .stat-label { color: var(--text-secondary); font-size: 0.8rem; margin-top: 4px; }
    .recent-orders-section { background: white; border-radius: 16px; padding: 24px; margin-bottom: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; h2 { font-size: 1.1rem; font-weight: 700; } }
    .orders-table { border-radius: 12px; overflow: hidden; border: 1px solid #f0f0f0; }
    .table-header { display: grid; grid-template-columns: 1fr 2fr 1fr 1fr 1fr; background: #f8f9fa; padding: 12px 16px; font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; }
    .table-row { display: grid; grid-template-columns: 1fr 2fr 1fr 1fr 1fr; padding: 14px 16px; border-top: 1px solid #f0f0f0; align-items: center; cursor: pointer; &:hover { background: #fafafa; } }
    .order-id { font-family: monospace; font-weight: 600; color: var(--primary); }
    .amount { font-weight: 700; }
    .empty-orders { text-align: center; padding: 40px; color: var(--text-secondary); mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 12px; display: block; opacity: 0.4; } }
    .loading-placeholder { display: flex; flex-direction: column; gap: 12px; }
    .skeleton-row { height: 52px; background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .quick-actions { h2 { font-size: 1.1rem; font-weight: 700; margin-bottom: 16px; } }
    .actions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
    .action-card { background: white !important; color: var(--text-primary) !important; border: 2px solid #e0e0e0 !important; padding: 20px !important; height: auto !important; display: flex !important; flex-direction: column !important; align-items: center !important; gap: 10px !important; border-radius: 16px !important; font-size: 0.875rem !important; font-weight: 600 !important; text-decoration: none !important; mat-icon { font-size: 28px; width: 28px; height: 28px; color: var(--primary); } &:hover { border-color: var(--primary) !important; background: #fff8f5 !important; } &.preview mat-icon { color: #1565c0; } }
    @media (max-width: 768px) { .hide-mobile { display: none !important; } .table-header, .table-row { grid-template-columns: 1fr 1fr 1fr 1fr; } }
  `]
})
export class Dashboard implements OnInit {
  orders = signal<Order[]>([]);
  loading = signal(true);
  statCards = signal<any[]>([]);
  todayLabel = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.orderService.getTodayOrders().subscribe({
      next: orders => {
        this.orders.set(orders);
        this.statCards.set([
          { label: 'Total Today', value: orders.length, icon: 'receipt_long', color: '#e65100', bg: '#fff3e0' },
          { label: 'Pending', value: orders.filter(o => o.order_status === 'pending').length, icon: 'hourglass_empty', color: '#f57f17', bg: '#fffde7' },
          { label: 'Preparing', value: orders.filter(o => o.order_status === 'preparing').length, icon: 'outdoor_grill', color: '#1565c0', bg: '#e3f2fd' },
          { label: 'Ready', value: orders.filter(o => o.order_status === 'ready').length, icon: 'check_circle', color: '#2e7d32', bg: '#e8f5e9' },
          { label: 'Completed', value: orders.filter(o => o.order_status === 'completed').length, icon: 'done_all', color: '#6a1b9a', bg: '#f3e5f5' },
          { label: 'Revenue (₹)', value: orders.filter(o => o.order_status === 'completed').reduce((s, o) => s + o.total_amount, 0), icon: 'currency_rupee', color: '#00695c', bg: '#e0f2f1' },
        ]);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  shortId(id?: string): string { return id ? id.slice(-6).toUpperCase() : '------'; }
}