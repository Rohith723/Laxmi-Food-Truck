import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Navbar } from '../../shared/navbar/navbar';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models';

@Component({
  selector: 'app-confirmation',
  imports: [RouterLink, MatButtonModule, MatIconModule, Navbar],
  template: `
    <div class="page-wrapper">
      <app-navbar></app-navbar>
      <div class="confirmation-page app-container">
        @if (order()) {
          <div class="success-card food-card">
            <div class="check-circle">✓</div>
            <h1>Order Placed! 🎉</h1>
            <p class="subtitle">Your order is confirmed. See you at the truck!</p>

            <div class="order-id-badge">
              Order ID: <strong>ORD-{{ shortId(order()!.id) }}</strong>
            </div>

            <div class="order-details">
              <div class="detail-row">
                <span class="label"><mat-icon>person</mat-icon> Customer</span>
                <span>{{ order()!.customer_name }}</span>
              </div>
              <div class="detail-row">
                <span class="label"><mat-icon>phone</mat-icon> Phone</span>
                <span>{{ order()!.customer_phone }}</span>
              </div>
              <div class="detail-row">
                <span class="label"><mat-icon>calendar_today</mat-icon> Date</span>
                <span>{{ order()!.pickup_date }}</span>
              </div>
              <div class="detail-row">
                <span class="label"><mat-icon>schedule</mat-icon> Time</span>
                <span>{{ order()!.pickup_time }}</span>
              </div>
              <div class="detail-row">
                <span class="label"><mat-icon>payments</mat-icon> Payment</span>
                <span class="pay-badge">Pay at Pickup</span>
              </div>
            </div>

            @if (order()!.order_items && order()!.order_items!.length > 0) {
              <div class="items-section">
                <h3>Your Order</h3>
                @for (item of order()!.order_items!; track item.id) {
                  <div class="order-item-row">
                    <span>{{ item.menu_items?.name }} × {{ item.quantity }}</span>
                    <span>₹{{ item.unit_price * item.quantity }}</span>
                  </div>
                }
                <div class="total-row">
                  <strong>Total</strong>
                  <strong>₹{{ order()!.total_amount }}</strong>
                </div>
              </div>
            }

            <div class="whatsapp-section">
              <p>WhatsApp notification sent. If it didn't open, click below:</p>
              <button mat-raised-button class="whatsapp-btn" (click)="sendWhatsApp()">
                📱 Send WhatsApp Message
              </button>
            </div>

            <div class="action-btns">
              <a mat-raised-button routerLink="/menu" class="new-order-btn">Order Again</a>
              <a mat-button routerLink="/home" color="primary">Back to Home</a>
            </div>
          </div>
        } @else {
          <div class="loading-container"><p>Loading order details...</p></div>
        }
      </div>
    </div>
  `,
  styles: [`
    .confirmation-page { padding: 40px 0 60px; max-width: 600px; margin: 0 auto; }
    .success-card { padding: 40px 32px; text-align: center; }
    .check-circle { width: 80px; height: 80px; background: linear-gradient(135deg, #4caf50, #2e7d32); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin: 0 auto 24px; animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
    h1 { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 800; margin-bottom: 8px; }
    .subtitle { color: var(--text-secondary); margin-bottom: 24px; }
    .order-id-badge { background: linear-gradient(135deg, #fff3e0, #ffe0cc); border: 2px solid var(--primary); color: var(--primary); padding: 10px 24px; border-radius: 50px; font-size: 1rem; display: inline-block; margin-bottom: 32px; strong { font-size: 1.15rem; } }
    .order-details { background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px; text-align: left; }
    .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee; &:last-child { border-bottom: none; } .label { display: flex; align-items: center; gap: 8px; color: var(--text-secondary); font-size: 0.9rem; mat-icon { font-size: 18px; width: 18px; height: 18px; } } }
    .pay-badge { background: #e8f5e9; color: var(--success); padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; }
    .items-section { background: #f8f9fa; border-radius: 16px; padding: 20px; margin-bottom: 24px; text-align: left; h3 { font-size: 1rem; font-weight: 700; margin-bottom: 16px; } }
    .order-item-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 0.9rem; color: var(--text-secondary); border-bottom: 1px solid #eee; }
    .total-row { display: flex; justify-content: space-between; padding-top: 12px; font-size: 1rem; strong:last-child { color: var(--primary); } }
    .whatsapp-section { background: #e8f5e9; border-radius: 16px; padding: 16px 20px; margin-bottom: 24px; p { color: #2e7d32; font-size: 0.875rem; margin-bottom: 12px; } }
    .whatsapp-btn { background: #25d366 !important; color: white !important; font-weight: 600 !important; width: 100% !important; }
    .action-btns { display: flex; flex-direction: column; gap: 12px; }
    .new-order-btn { background: var(--primary) !important; color: white !important; font-weight: 600 !important; }
  `]
})
export class Confirmation implements OnInit {
  order = signal<Order | null>(null);

  constructor(private route: ActivatedRoute, private orderService: OrderService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.orderService.getOrderById(id).subscribe({ next: o => this.order.set(o), error: () => {} });
  }

  shortId(id?: string): string { return id ? id.slice(-6).toUpperCase() : '------'; }
  sendWhatsApp() { if (this.order()) this.orderService.openWhatsApp(this.order()!); }
}