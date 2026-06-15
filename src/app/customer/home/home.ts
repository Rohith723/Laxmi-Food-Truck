import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Navbar } from '../../shared/navbar/navbar';
import { MenuService } from '../../services/menu.service';
import { BusinessService } from '../../services/business.service';
import { MenuItem, BusinessSettings } from '../../models';

@Component({
  selector: 'app-home',
  imports: [RouterLink, MatButtonModule, MatIconModule, Navbar],
  template: `
    <div class="page-wrapper">
      <app-navbar></app-navbar>

      <section class="hero">
        <div class="hero-content app-container">
          <div class="hero-badge glass">🔥 Now Taking Pre-Orders</div>
          <h1 class="hero-title">
            Street Food<br>
            <span class="highlight">Reinvented</span>
          </h1>
          <p class="hero-sub">
            Handcrafted burgers, loaded fries & more.<br>
            Order ahead, skip the wait — pickup 7 PM–11 PM.
          </p>
          <div class="hero-actions">
            <a mat-raised-button routerLink="/menu" class="btn-order">
              <mat-icon>restaurant_menu</mat-icon>
              Browse Menu
            </a>
            <div class="hours-badge glass">
              <mat-icon>access_time</mat-icon>
              <span>Open Daily 7:00 PM – 11:00 PM</span>
            </div>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-art">
            <div class="orb orb-1"></div>
            <div class="orb orb-2"></div>
            <div class="truck-emoji">🚚</div>
            <span class="float-item f1">🍔</span>
            <span class="float-item f2">🌮</span>
            <span class="float-item f3">🍟</span>
            <span class="float-item f4">🥤</span>
          </div>
        
        </div>
      </section>

      @if (settings() && !settings()!.shop_open) {
        <div class="closed-banner glass">
          <mat-icon>store</mat-icon>
          <span>Store is currently closed. We'll be open at {{ settings()!.opening_time }}!</span>
        </div>
      }

      <section class="stats-bar app-container">
        <div class="stats-glass glass-card">
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-icon">⭐</span>
              <div><strong>4.9 Rating</strong><small>From happy customers</small></div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">⚡</span>
              <div><strong>15-Min Pickup</strong><small>Quick & fresh every time</small></div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">💰</span>
              <div><strong>Pay at Pickup</strong><small>Cash / UPI accepted</small></div>
            </div>
          </div>
        </div>
      </section>

      <section class="featured-section app-container">
        <div class="section-header">
          <h2>Featured Items</h2>
          <a mat-button routerLink="/menu" color="primary">See all →</a>
        </div>

        @if (loading()) {
          <div class="skeleton-grid">
            @for (i of [1,2,3]; track i) { <div class="skeleton-card"></div> }
          </div>
        } @else {
          <div class="items-grid">
            @for (item of featuredItems(); track item.id) {
              <div class="food-card featured-card">
                <div class="card-image">
                  @if (item.image_url) {
                    <img [src]="item.image_url" [alt]="item.name" loading="lazy">
                  } @else {
                    <div class="image-placeholder">🍽️</div>
                  }
                  @if (!item.is_available) {
                    <div class="unavailable-overlay">Unavailable</div>
                  }
                </div>
                <div class="card-body">
                  <h3>{{ item.name }}</h3>
                  <p>{{ item.description }}</p>
                  <div class="card-footer">
                    <span class="price">₹{{ item.price }}</span>
                    <a mat-raised-button routerLink="/menu" class="order-now-btn">Order Now</a>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </section>

      <section class="cta-section app-container">
        <div class="cta-card">
          <div class="cta-glow"></div>
          <div class="cta-content">
            <h2>Ready to Order? 🎉</h2>
            <p>Pre-order your meal and pick it up hot & fresh from our truck!</p>
            <a mat-raised-button routerLink="/menu" class="cta-btn">
              Start Your Order <mat-icon>arrow_forward</mat-icon>
            </a>
          </div>
        </div>
      </section>

      <footer class="footer">
        <div class="app-container">
          <p>🚚 Laxmi Food Truck · Daily 7 PM – 11 PM</p>
          <p class="footer-sub">Pre-order online · Pay at pickup</p>
          <a routerLink="/auth/login" class="admin-link">Admin</a>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .hero {
      padding: 90px 0 70px;
      display: flex;
      align-items: center;
      min-height: 540px;
      position: relative;
    }
    .hero-content { flex: 1; z-index: 2; }
    .hero-badge {
      display: inline-block;
      padding: 8px 18px;
      border-radius: var(--radius-full);
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 24px;
      color: var(--primary-dark);
      box-shadow: var(--shadow-sm);
    }
    .hero-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2.6rem, 6vw, 4.2rem);
      font-weight: 900;
      line-height: 1.12;
      margin-bottom: 18px;
      letter-spacing: -0.01em;

      .highlight {
        background: var(--gradient-primary);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }
    .hero-sub { font-size: 1.15rem; color: var(--text-secondary); margin-bottom: 36px; line-height: 1.75; }
    .hero-actions { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
    .btn-order {
      background: var(--gradient-primary) !important;
      color: white !important;
      padding: 14px 32px !important;
      font-size: 1rem !important;
      font-weight: 700 !important;
      border-radius: var(--radius-full) !important;
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      box-shadow: var(--shadow-glow) !important;
      transition: transform 0.25s ease !important;
      &:hover { transform: translateY(-3px); }
    }
    .hours-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-secondary);
      font-size: 0.95rem;
      font-weight: 500;
      padding: 10px 18px;
      border-radius: var(--radius-full);
      box-shadow: var(--shadow-sm);
      mat-icon { font-size: 18px; color: var(--primary); }
    }

    // Hero art / orbs
    .hero-art {
      position: absolute;
      right: 6%;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(40px);
      opacity: 0.5;
    }
    .orb-1 { width: 220px; height: 220px; background: radial-gradient(circle, var(--primary-light), transparent 70%); top: -60px; left: -60px; }
    .orb-2 { width: 160px; height: 160px; background: radial-gradient(circle, var(--accent), transparent 70%); bottom: -40px; right: -40px; }

    .truck-emoji {
      font-size: 130px;
      filter: drop-shadow(0 20px 40px rgba(255,107,53,0.25));
      animation: truckBounce 3s ease-in-out infinite;
      position: relative;
      z-index: 1;
    }
    @keyframes truckBounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-14px); }
    }
    .floating-items { position: absolute; }
    .float-item {
      position: absolute;
      font-size: 34px;
      animation: floatItem 4s ease-in-out infinite;
      filter: drop-shadow(0 8px 16px rgba(0,0,0,0.08));
    }
    .f1 { top: -70px; left: -50px; animation-delay: 0s; }
    .f2 { top: -40px; right: -70px; animation-delay: 1s; }
    .f3 { bottom: -60px; left: -40px; animation-delay: 2s; }
    .f4 { bottom: -30px; right: -60px; animation-delay: 0.5s; }
    @keyframes floatItem {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-12px) rotate(6deg); }
    }

    .closed-banner {
      max-width: 800px;
      margin: 0 auto 24px;
      border-radius: var(--radius-full);
      padding: 14px 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      font-weight: 600;
      color: var(--primary-dark);
      box-shadow: var(--shadow-sm);
    }

    // Stats glass bar
    .stats-bar { margin-bottom: 56px; }
    .stats-glass { padding: 28px 24px; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .stat-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 4px 16px;
      border-right: 1px solid var(--border);
      &:last-child { border-right: none; }
      .stat-icon { font-size: 30px; }
      strong { display: block; font-weight: 700; font-size: 1rem; }
      small { color: var(--text-secondary); font-size: 0.825rem; }
    }

    // Featured
    .featured-section { padding-bottom: 64px; }
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 32px;
      h2 { font-family: 'Playfair Display', serif; font-size: 1.9rem; font-weight: 800; }
    }
    .items-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 28px; }
    .featured-card {
      display: flex;
      flex-direction: column;
      .card-image {
        height: 200px;
        position: relative;
        overflow: hidden;
        img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
      }
      &:hover .card-image img { transform: scale(1.08); }
      .image-placeholder {
        width: 100%; height: 100%;
        background: linear-gradient(135deg, #fff3e0, #ffe0cc);
        display: flex; align-items: center; justify-content: center;
        font-size: 60px;
      }
      .unavailable-overlay {
        position: absolute; inset: 0;
        background: rgba(26,22,37,0.55);
        backdrop-filter: blur(2px);
        color: white;
        display: flex; align-items: center; justify-content: center;
        font-weight: 700;
      }
      .card-body { padding: 22px; flex: 1; display: flex; flex-direction: column; }
      h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 8px; }
      p { color: var(--text-secondary); font-size: 0.875rem; line-height: 1.5; flex: 1; margin-bottom: 18px; }
      .card-footer { display: flex; align-items: center; justify-content: space-between; }
      .price { font-size: 1.25rem; font-weight: 800; background: var(--gradient-primary); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
    }
    .order-now-btn {
      background: var(--gradient-primary) !important;
      color: white !important;
      font-weight: 600 !important;
      border-radius: var(--radius-full) !important;
      box-shadow: var(--shadow-sm) !important;
    }

    // CTA
    .cta-section { padding-bottom: 56px; }
    .cta-card {
      position: relative;
      background: var(--gradient-dark);
      border-radius: var(--radius-lg);
      padding: 56px 48px;
      text-align: center;
      color: white;
      overflow: hidden;
      box-shadow: var(--shadow-lg);
    }
    .cta-glow {
      position: absolute;
      width: 380px; height: 380px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,107,53,0.35), transparent 70%);
      top: -150px; right: -100px;
      filter: blur(20px);
    }
    .cta-content {
      position: relative; z-index: 1;
      h2 { font-family: 'Playfair Display', serif; font-size: 2.1rem; font-weight: 800; margin-bottom: 12px; }
      p { font-size: 1.1rem; opacity: 0.85; margin-bottom: 32px; }
    }
    .cta-btn {
      background: var(--gradient-primary) !important;
      color: white !important;
      font-weight: 700 !important;
      padding: 14px 36px !important;
      border-radius: var(--radius-full) !important;
      display: inline-flex !important;
      align-items: center !important;
      gap: 8px !important;
      box-shadow: 0 12px 32px rgba(255,107,53,0.4) !important;
    }

    // Footer
    .footer {
      background: var(--gradient-dark);
      color: rgba(255,255,255,0.75);
      padding: 28px 0;
      text-align: center;
      p { margin-bottom: 4px; }
      .footer-sub { opacity: 0.55; font-size: 0.85rem; }
      .admin-link { color: rgba(255,255,255,0.25); font-size: 0.75rem; text-decoration: none; margin-top: 8px; display: inline-block; &:hover { color: rgba(255,255,255,0.5); } }
    }

    // Skeleton
    .skeleton-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 28px; }
    .skeleton-card {
      height: 340px;
      background: linear-gradient(90deg, rgba(255,255,255,0.5) 25%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.5) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: var(--radius);
    }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    @media (max-width: 768px) {
      .hero { padding: 56px 0 40px; min-height: auto; }
      .hero-art { display: none; }
      .stats-grid { grid-template-columns: 1fr; }
      .stat-item { border-right: none; border-bottom: 1px solid var(--border); padding: 12px 16px; &:last-child { border-bottom: none; } }
      .cta-card { padding: 40px 24px; }
    }
  `]
})
export class Home implements OnInit {
  featuredItems = signal<MenuItem[]>([]);
  settings = signal<BusinessSettings | null>(null);
  loading = signal(true);

  constructor(private menuService: MenuService, private businessService: BusinessService) {}

  ngOnInit() {
    this.menuService.getAvailableMenuItems().subscribe({
      next: items => { this.featuredItems.set(items.slice(0, 3)); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
    this.businessService.getSettings().subscribe({
      next: s => this.settings.set(s),
      error: () => {}
    });
  }
}