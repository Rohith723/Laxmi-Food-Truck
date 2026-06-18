import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule, MatButtonModule, MatIconModule,
    MatInputModule, MatFormFieldModule, MatProgressSpinnerModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-header">
          <div class="logo-icon">🚚</div>
          <h1>Admin Login</h1>
          <p>Saidulu Snacks Kitchen Management Portal</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="login()">
          <mat-form-field appearance="outline" class="form-field-full">
            <mat-label>Email Address</mat-label>
            <input matInput formControlName="email" type="email">
            <mat-icon matPrefix>email</mat-icon>
            @if (loginForm.get('email')?.errors?.['required'] && loginForm.get('email')?.touched) {
              <mat-error>Email is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field-full">
            <mat-label>Password</mat-label>
            <input matInput formControlName="password" [type]="showPassword() ? 'text' : 'password'">
            <mat-icon matPrefix>lock</mat-icon>
            <button mat-icon-button matSuffix type="button" (click)="showPassword.set(!showPassword())">
              <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </mat-form-field>

          @if (error()) {
            <div class="error-alert">
              <mat-icon>error_outline</mat-icon>
              {{ error() }}
            </div>
          }

          <button mat-raised-button type="submit" class="login-btn" [disabled]="loading() || loginForm.invalid">
            @if (loading()) {
              <mat-spinner diameter="20"></mat-spinner>
              Signing in...
            } @else {
              <mat-icon>login</mat-icon>
              Sign In
            }
          </button>
        </form>

        <div class="back-link">
          <a routerLink="/home">← Back to Website</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #fff8f5 0%, #ffe8d6 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .login-card {
      background: white;
      border-radius: 24px;
      padding: 40px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 20px 60px rgba(230, 81, 0, 0.15);
    }
    .login-header {
      text-align: center;
      margin-bottom: 32px;
      .logo-icon { font-size: 56px; margin-bottom: 16px; display: block; animation: bounce 2s ease-in-out infinite; }
      h1 { font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 800; margin-bottom: 4px; }
      p { color: var(--text-secondary); font-size: 0.9rem; }
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    .error-alert {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #fce4ec;
      color: #c62828;
      padding: 12px 16px;
      border-radius: 10px;
      margin-bottom: 16px;
      font-size: 0.9rem;
      mat-icon { font-size: 18px; }
    }
    .login-btn {
      width: 100%;
      background: var(--primary) !important;
      color: white !important;
      font-weight: 700 !important;
      font-size: 1rem !important;
      height: 48px !important;
      margin-top: 8px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 8px !important;
    }
    .back-link {
      text-align: center;
      margin-top: 20px;
      a { color: var(--text-secondary); text-decoration: none; font-size: 0.875rem; }
      a:hover { color: var(--primary); }
    }
  `]
})
export class Login {
  loginForm: FormGroup;
  loading = signal(false);
  error = signal('');
  showPassword = signal(false);

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
    if (this.auth.isLoggedIn()) this.router.navigate(['/admin']);
  }

  async login() {
    if (this.loginForm.invalid) return;
    this.loading.set(true);
    this.error.set('');
    try {
      await this.auth.signIn(this.loginForm.value.email, this.loginForm.value.password);
      this.router.navigate(['/admin']);
    } catch (err: any) {
      this.error.set(err.message || 'Invalid credentials.');
    } finally {
      this.loading.set(false);
    }
  }
}