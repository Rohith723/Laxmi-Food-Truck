import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BusinessService } from '../../services/business.service';

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule, MatButtonModule, MatIconModule, MatInputModule,
    MatFormFieldModule, MatSnackBarModule, MatProgressSpinnerModule],
  template: `
    <div class="settings-page">
      <div class="page-header">
        <h1>Store Settings</h1>
        <p>Control your store status and operating hours.</p>
      </div>

      @if (loading()) {
        <div class="loading-container"><mat-spinner></mat-spinner></div>
      } @else {
        <div class="settings-card">
          <div class="card-header">
            <div class="card-icon" [class.open]="storeOpen()">
              <mat-icon>{{ storeOpen() ? 'store' : 'store_mall_directory' }}</mat-icon>
            </div>
            <div>
              <h2>Store Status</h2>
              <p>Control whether customers can place orders.</p>
            </div>
          </div>

          <div class="store-status-display" [class.open]="storeOpen()" [class.closed]="!storeOpen()">
            <div class="status-indicator">
              <span class="status-dot"></span>
              <span class="status-text">{{ storeOpen() ? 'Store is OPEN' : 'Store is CLOSED' }}</span>
            </div>
            <p class="status-sub">
              {{ storeOpen() ? 'Customers can browse and place orders.' : 'Ordering is disabled.' }}
            </p>
          </div>

          <button mat-raised-button
            [class.open-btn]="!storeOpen()"
            [class.close-btn]="storeOpen()"
            (click)="toggleStore()"
            [disabled]="toggling()">
            @if (toggling()) { <mat-spinner diameter="18"></mat-spinner> }
            @else { <mat-icon>{{ storeOpen() ? 'lock' : 'lock_open' }}</mat-icon> }
            {{ storeOpen() ? 'Close Store' : 'Open Store' }}
          </button>
        </div>

        <div class="settings-card">
          <div class="card-header">
            <div class="card-icon time"><mat-icon>schedule</mat-icon></div>
            <div>
              <h2>Operating Hours</h2>
              <p>Set your daily opening and closing times.</p>
            </div>
          </div>

          <form [formGroup]="hoursForm" (ngSubmit)="saveHours()">
            <div class="hours-grid">
              <mat-form-field appearance="outline">
                <mat-label>Opening Time</mat-label>
                <input matInput formControlName="opening_time" type="time">
                <mat-icon matPrefix>wb_sunny</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Closing Time</mat-label>
                <input matInput formControlName="closing_time" type="time">
                <mat-icon matPrefix>nights_stay</mat-icon>
              </mat-form-field>
            </div>
            <div class="hours-preview">
              <mat-icon>info_outline</mat-icon>
              <span>Hours: <strong>{{ formatTime(hoursForm.get('opening_time')?.value) }}</strong>
              to <strong>{{ formatTime(hoursForm.get('closing_time')?.value) }}</strong></span>
            </div>
            <button mat-raised-button type="submit" class="save-btn" [disabled]="savingHours()">
              @if (savingHours()) { <mat-spinner diameter="18"></mat-spinner> }
              <mat-icon>save</mat-icon> Save Hours
            </button>
          </form>
        </div>

        <div class="info-card">
          <mat-icon>lightbulb_outline</mat-icon>
          <div>
            <h3>Tips</h3>
            <ul>
              <li>Close the store to temporarily disable new orders.</li>
              <li>Customers see "Store Closed" notice when closed.</li>
              <li>Update hours to match your truck schedule.</li>
            </ul>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .settings-page { max-width: 700px; }
    .page-header { margin-bottom: 28px; h1 { font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 800; margin-bottom: 4px; } p { color: var(--text-secondary); } }
    .settings-card { background: white; border-radius: 20px; padding: 28px; margin-bottom: 20px; box-shadow: 0 2px 16px rgba(0,0,0,0.06); }
    .card-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; h2 { font-size: 1.1rem; font-weight: 700; margin-bottom: 2px; } p { color: var(--text-secondary); font-size: 0.875rem; } }
    .card-icon { width: 52px; height: 52px; border-radius: 14px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; flex-shrink: 0; mat-icon { font-size: 26px; color: var(--text-secondary); } &.open { background: #e8f5e9; mat-icon { color: #2e7d32; } } &.time { background: #e3f2fd; mat-icon { color: #1565c0; } } }
    .store-status-display { border-radius: 14px; padding: 20px 24px; margin-bottom: 20px; &.open { background: #e8f5e9; border: 2px solid #a5d6a7; } &.closed { background: #fce4ec; border: 2px solid #f48fb1; } }
    .status-indicator { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .status-dot { width: 12px; height: 12px; border-radius: 50%; .open & { background: #4caf50; animation: pulse 2s infinite; } .closed & { background: #e91e63; } }
    @keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(76,175,80,0.4); } 50% { box-shadow: 0 0 0 6px rgba(76,175,80,0); } }
    .status-text { font-size: 1.1rem; font-weight: 700; .open & { color: #2e7d32; } .closed & { color: #c62828; } }
    .status-sub { color: var(--text-secondary); font-size: 0.875rem; }
    .open-btn { background: #4caf50 !important; color: white !important; font-weight: 600 !important; display: flex !important; align-items: center !important; gap: 8px !important; }
    .close-btn { background: #e91e63 !important; color: white !important; font-weight: 600 !important; display: flex !important; align-items: center !important; gap: 8px !important; }
    .hours-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; mat-form-field { width: 100%; } }
    .hours-preview { display: flex; align-items: center; gap: 8px; background: #e3f2fd; color: #1565c0; padding: 12px 16px; border-radius: 10px; font-size: 0.875rem; margin-bottom: 20px; mat-icon { font-size: 18px; } }
    .save-btn { background: var(--primary) !important; color: white !important; font-weight: 600 !important; display: flex !important; align-items: center !important; gap: 8px !important; }
    .info-card { background: #fffde7; border: 1px solid #ffe082; border-radius: 16px; padding: 20px 24px; display: flex; gap: 16px; mat-icon { color: #f57f17; flex-shrink: 0; margin-top: 2px; } h3 { font-size: 0.9rem; font-weight: 700; margin-bottom: 8px; color: #f57f17; } ul { list-style: none; li { font-size: 0.875rem; color: var(--text-secondary); padding: 4px 0; &::before { content: '• '; color: #f57f17; } } } }
    @media (max-width: 600px) { .hours-grid { grid-template-columns: 1fr; } }
  `]
})
export class Settings implements OnInit {
  loading = signal(true);
  storeOpen = signal(false);
  toggling = signal(false);
  savingHours = signal(false);
  hoursForm: FormGroup;

  constructor(private fb: FormBuilder, private businessService: BusinessService, private snackBar: MatSnackBar) {
    this.hoursForm = this.fb.group({
      opening_time: ['19:00', Validators.required],
      closing_time: ['23:00', Validators.required],
    });
  }

  ngOnInit() {
    this.businessService.getSettings().subscribe({
      next: s => {
        this.storeOpen.set(s.shop_open);
        this.hoursForm.patchValue({ opening_time: s.opening_time, closing_time: s.closing_time });
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  toggleStore() {
    this.toggling.set(true);
    this.businessService.updateSettings({ shop_open: !this.storeOpen() }).subscribe({
      next: s => { this.storeOpen.set(s.shop_open); this.toggling.set(false); this.snackBar.open(`Store ${s.shop_open ? 'opened' : 'closed'}!`, '✕', { duration: 2000, panelClass: 'success-snack' }); },
      error: e => { this.toggling.set(false); this.snackBar.open('Error: ' + e.message, '✕', { duration: 3000, panelClass: 'error-snack' }); }
    });
  }

  saveHours() {
    if (this.hoursForm.invalid) return;
    this.savingHours.set(true);
    this.businessService.updateSettings(this.hoursForm.value).subscribe({
      next: () => { this.savingHours.set(false); this.snackBar.open('Hours updated!', '✕', { duration: 2000, panelClass: 'success-snack' }); },
      error: e => { this.savingHours.set(false); this.snackBar.open('Error: ' + e.message, '✕', { duration: 3000, panelClass: 'error-snack' }); }
    });
  }

  formatTime(time: string): string {
    if (!time) return '--';
    const [h, m] = time.split(':').map(Number);
    const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${hour12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  }
}