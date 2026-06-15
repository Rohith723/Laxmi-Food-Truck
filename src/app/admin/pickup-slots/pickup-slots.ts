import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BusinessService } from '../../services/business.service';
import { PickupSlot } from '../../models';

@Component({
  selector: 'app-pickup-slots',
  imports: [ReactiveFormsModule, MatButtonModule, MatIconModule, MatInputModule,
    MatFormFieldModule, MatSnackBarModule, MatProgressSpinnerModule, MatTooltipModule],
  template: `
    <div class="slots-page">
      <div class="page-header">
        <div>
          <h1>Pickup Slots</h1>
          <p>Configure available time slots and order limits.</p>
        </div>
        <button mat-raised-button class="add-btn" (click)="showAdd.set(true)">
          <mat-icon>add</mat-icon> Add Slot
        </button>
      </div>

      @if (showAdd()) {
        <div class="add-form-card glass-card">
          <div class="form-header">
            <h2>Add New Time Slot</h2>
            <button mat-icon-button (click)="showAdd.set(false)"><mat-icon>close</mat-icon></button>
          </div>
          <form [formGroup]="slotForm" (ngSubmit)="addSlot()">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Slot Time (e.g. 7:00 PM)</mat-label>
                <input matInput formControlName="slot_time" placeholder="7:00 PM">
                <mat-icon matPrefix>schedule</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Max Orders</mat-label>
                <input matInput formControlName="max_orders" type="number" placeholder="10">
                <mat-icon matPrefix>people</mat-icon>
              </mat-form-field>
              <button mat-raised-button type="submit" class="add-slot-btn" [disabled]="slotForm.invalid || saving()">
                @if (saving()) { <mat-spinner diameter="18"></mat-spinner> } Add Slot
              </button>
            </div>
          </form>
        </div>
      }

      <div class="generate-card">
        <div class="generate-glow"></div>
        <div class="generate-header">
          <mat-icon>auto_fix_high</mat-icon>
          <div>
            <h3>Quick Generate</h3>
            <p>Auto-generate 15-minute slots from 7 PM to 11 PM.</p>
          </div>
        </div>
        <button mat-raised-button class="generate-btn" (click)="generateSlots()" [disabled]="generating()">
          @if (generating()) { <mat-spinner diameter="18"></mat-spinner> }
          <mat-icon>auto_mode</mat-icon> Generate Default Slots
        </button>
      </div>

      @if (loading()) {
        <div class="loading-container"><mat-spinner></mat-spinner></div>
      } @else if (slots().length === 0) {
        <div class="empty-state glass-card">
          <mat-icon>schedule</mat-icon>
          <h3>No pickup slots configured</h3>
          <p>Add slots manually or use Quick Generate.</p>
        </div>
      } @else {
        <div class="slots-grid">
          @for (slot of slots(); track slot.id) {
            <div class="slot-card glass-card" [class.inactive]="!slot.is_active">
              <div class="slot-time"><mat-icon>schedule</mat-icon><span>{{ slot.slot_time }}</span></div>
              <div class="slot-info">
                <div class="slot-capacity"><mat-icon>group</mat-icon><span>Max {{ slot.max_orders }}</span></div>
                <span class="slot-status" [class.active]="slot.is_active">
                  {{ slot.is_active ? 'Active' : 'Blocked' }}
                </span>
              </div>
              <div class="slot-actions">
                <button mat-icon-button (click)="toggleSlot(slot)"
                  [matTooltip]="slot.is_active ? 'Block slot' : 'Activate slot'">
                  <mat-icon>{{ slot.is_active ? 'block' : 'check_circle' }}</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteSlot(slot)" matTooltip="Delete permanently">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .slots-page { max-width: 900px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;
      h1 { font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 800; margin-bottom: 4px; }
      p { color: var(--text-secondary); }
    }
    .add-btn {
      background: var(--gradient-primary) !important; color: white !important;
      display: flex !important; align-items: center !important; gap: 6px !important;
      border-radius: var(--radius-full) !important; box-shadow: var(--shadow-glow) !important;
    }

    .add-form-card { padding: 24px; margin-bottom: 20px; }
    .form-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; h2 { font-size: 1.05rem; font-weight: 700; } }
    .form-row { display: flex; gap: 16px; align-items: flex-start; flex-wrap: wrap; mat-form-field { flex: 1; min-width: 160px; } }
    .add-slot-btn {
      background: var(--gradient-primary) !important; color: white !important; font-weight: 600 !important;
      display: flex !important; align-items: center !important; gap: 6px !important;
      margin-top: 4px !important; border-radius: var(--radius-full) !important; box-shadow: var(--shadow-sm) !important;
    }

    .generate-card {
      position: relative; overflow: hidden;
      background: var(--gradient-dark); color: white;
      border-radius: var(--radius); padding: 24px 28px; margin-bottom: 24px;
      display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;
      box-shadow: var(--shadow-md);
    }
    .generate-glow {
      position: absolute; width: 260px; height: 260px; border-radius: 50%;
      background: radial-gradient(circle, rgba(255,107,53,0.3), transparent 70%);
      top: -100px; right: -60px; filter: blur(20px);
    }
    .generate-header { position: relative; z-index: 1; display: flex; align-items: center; gap: 14px;
      mat-icon { color: var(--accent); font-size: 28px; width: 28px; height: 28px; }
      h3 { font-size: 1rem; font-weight: 700; margin-bottom: 2px; }
      p { color: rgba(255,255,255,0.65); font-size: 0.875rem; }
    }
    .generate-btn {
      position: relative; z-index: 1;
      background: var(--gradient-primary) !important; color: white !important; font-weight: 700 !important;
      display: flex !important; align-items: center !important; gap: 8px !important;
      border-radius: var(--radius-full) !important; box-shadow: 0 8px 24px rgba(255,107,53,0.4) !important;
    }

    .slots-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 14px; }
    .slot-card {
      padding: 18px 20px; display: flex; flex-direction: column; gap: 12px;
      &.inactive { opacity: 0.55; border-style: dashed; }
    }
    .slot-time { display: flex; align-items: center; gap: 8px; font-size: 1.15rem; font-weight: 800;
      background: var(--gradient-primary); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
      mat-icon { font-size: 20px; -webkit-text-fill-color: var(--primary); }
    }
    .slot-info { display: flex; align-items: center; justify-content: space-between; }
    .slot-capacity { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: var(--text-secondary); mat-icon { font-size: 16px; } }
    .slot-status { font-size: 0.75rem; font-weight: 700; padding: 4px 12px; border-radius: var(--radius-full); background: #fce4ec; color: #c62828;
      &.active { background: var(--success-bg); color: var(--success); }
    }
    .slot-actions { display: flex; justify-content: flex-end; gap: 4px; }

    .empty-state { text-align: center; padding: 60px; color: var(--text-secondary);
      mat-icon { font-size: 56px; width: 56px; height: 56px; opacity: 0.3; margin-bottom: 16px; display: block; }
      h3 { font-size: 1.1rem; margin-bottom: 8px; }
    }
  `]
})
export class PickupSlots implements OnInit {
  slots = signal<PickupSlot[]>([]);
  loading = signal(true);
  showAdd = signal(false);
  saving = signal(false);
  generating = signal(false);
  slotForm: FormGroup;

  constructor(private fb: FormBuilder, private businessService: BusinessService, private snackBar: MatSnackBar) {
    this.slotForm = this.fb.group({
      slot_time: ['', Validators.required],
      max_orders: [10, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit() { this.loadSlots(); }

  loadSlots() {
    this.businessService.getAllPickupSlots().subscribe({
      next: s => { this.slots.set(s); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  addSlot() {
    if (this.slotForm.invalid) return;
    this.saving.set(true);
    this.businessService.addPickupSlot({ ...this.slotForm.value, is_active: true }).subscribe({
      next: () => {
        this.snackBar.open('Slot added!', '✕', { duration: 2000, panelClass: 'success-snack' });
        this.slotForm.reset({ max_orders: 10 });
        this.showAdd.set(false);
        this.saving.set(false);
        this.loadSlots();
      },
      error: e => { this.saving.set(false); this.snackBar.open('Error: ' + e.message, '✕', { duration: 3000, panelClass: 'error-snack' }); }
    });
  }

  async generateSlots() {
    if (!confirm('Generate default 15-minute slots from 7 PM to 10:45 PM?')) return;
    this.generating.set(true);
    const slots = [];
    for (let h = 19; h < 23; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hour12 = h > 12 ? h - 12 : h;
        slots.push({ slot_time: `${hour12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`, max_orders: 10, is_active: true });
      }
    }
    try {
      for (const slot of slots) {
        await new Promise<void>((res, rej) =>
          this.businessService.addPickupSlot(slot).subscribe({ next: () => res(), error: rej })
        );
      }
      this.snackBar.open('Slots generated!', '✕', { duration: 3000, panelClass: 'success-snack' });
      this.loadSlots();
    } catch (e: any) {
      this.snackBar.open('Error: ' + e.message, '✕', { duration: 3000, panelClass: 'error-snack' });
    } finally {
      this.generating.set(false);
    }
  }

  toggleSlot(slot: PickupSlot) {
    this.businessService.updatePickupSlot(slot.id!, { is_active: !slot.is_active }).subscribe({
      next: () => { this.loadSlots(); this.snackBar.open('Updated!', '✕', { duration: 2000, panelClass: 'success-snack' }); },
      error: e => this.snackBar.open('Error: ' + e.message, '✕', { duration: 3000, panelClass: 'error-snack' })
    });
  }

  deleteSlot(slot: PickupSlot) {
    if (!confirm(`Delete slot at ${slot.slot_time}?`)) return;
    this.businessService.deletePickupSlot(slot.id!).subscribe({
      next: () => { this.loadSlots(); this.snackBar.open('Deleted.', '✕', { duration: 2000 }); },
      error: e => this.snackBar.open('Error: ' + e.message, '✕', { duration: 3000, panelClass: 'error-snack' })
    });
  }
}