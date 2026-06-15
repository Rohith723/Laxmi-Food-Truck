import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MenuService } from '../../services/menu.service';
import { MenuItem } from '../../models';

@Component({
  selector: 'app-menu-management',
  imports: [ReactiveFormsModule, MatButtonModule, MatIconModule, MatInputModule,
    MatFormFieldModule, MatSnackBarModule, MatProgressSpinnerModule,
    MatSlideToggleModule, MatTooltipModule],
  template: `
    <div class="menu-mgmt">
      <div class="page-header">
        <div>
          <h1>Menu Management</h1>
          <p>Add, edit, and manage your food items.</p>
        </div>
        <button mat-raised-button class="add-btn" (click)="openForm()">
          <mat-icon>add</mat-icon> Add Item
        </button>
      </div>

      @if (showForm()) {
        <div class="form-card">
          <div class="form-header">
            <h2>{{ editingItem() ? 'Edit Item' : 'Add New Item' }}</h2>
            <button mat-icon-button (click)="closeForm()"><mat-icon>close</mat-icon></button>
          </div>
          <form [formGroup]="itemForm" (ngSubmit)="saveItem()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Item Name</mat-label>
                <input matInput formControlName="name" placeholder="e.g. Chicken Burger">
                @if (itemForm.get('name')?.errors?.['required'] && itemForm.get('name')?.touched) {
                  <mat-error>Name is required</mat-error>
                }
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Price (₹)</mat-label>
                <input matInput formControlName="price" type="number" placeholder="150">
                <mat-icon matPrefix>currency_rupee</mat-icon>
                @if (itemForm.get('price')?.errors && itemForm.get('price')?.touched) {
                  <mat-error>Valid price required</mat-error>
                }
              </mat-form-field>
            </div>
            <mat-form-field appearance="outline" class="form-field-full">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3" placeholder="Describe the item..."></textarea>
            </mat-form-field>

            <div class="image-upload-area" (click)="fileInput.click()">
              @if (imagePreview()) {
                <img [src]="imagePreview()!" alt="Preview" class="image-preview">
                <div class="image-overlay"><mat-icon>edit</mat-icon> Change Image</div>
              } @else {
                <mat-icon class="upload-icon">cloud_upload</mat-icon>
                <p>Click to upload food image</p>
                <small>JPG, PNG, WebP (max 5MB)</small>
              }
            </div>
            <input #fileInput type="file" accept="image/*" (change)="onFileSelect($event)" style="display:none">

            @if (uploadingImage()) {
              <div class="upload-progress">
                <mat-spinner diameter="20"></mat-spinner> <span>Uploading image...</span>
              </div>
            }

            <div class="form-toggle">
              <mat-slide-toggle formControlName="is_available" color="primary">
                {{ itemForm.get('is_available')?.value ? 'Available' : 'Unavailable' }}
              </mat-slide-toggle>
            </div>

            <div class="form-actions">
              <button mat-button type="button" (click)="closeForm()">Cancel</button>
              <button mat-raised-button type="submit" class="save-btn"
                [disabled]="saving() || itemForm.invalid || uploadingImage()">
                @if (saving()) { <mat-spinner diameter="18"></mat-spinner> }
                {{ editingItem() ? 'Update Item' : 'Add Item' }}
              </button>
            </div>
          </form>
        </div>
      }

      @if (loading()) {
        <div class="loading-container"><mat-spinner></mat-spinner></div>
      } @else if (menuItems().length === 0) {
        <div class="empty-state">
          <mat-icon>restaurant_menu</mat-icon>
          <h3>No menu items yet</h3>
          <p>Add your first food item to get started!</p>
        </div>
      } @else {
        <div class="menu-grid">
          @for (item of menuItems(); track item.id) {
            <div class="item-card" [class.unavailable]="!item.is_available">
              <div class="item-image">
                @if (item.image_url) {
                  <img [src]="item.image_url" [alt]="item.name">
                } @else {
                  <div class="img-placeholder">🍽️</div>
                }
                <div class="availability-badge" [class.avail]="item.is_available">
                  {{ item.is_available ? 'Available' : 'Unavailable' }}
                </div>
              </div>
              <div class="item-info">
                <h3>{{ item.name }}</h3>
                <p>{{ item.description }}</p>
                <div class="item-footer">
                  <span class="price">₹{{ item.price }}</span>
                  <div class="item-actions">
                    <button mat-icon-button color="primary" (click)="editItem(item)" matTooltip="Edit">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button (click)="toggleAvailability(item)"
                      [matTooltip]="item.is_available ? 'Mark Unavailable' : 'Mark Available'">
                      <mat-icon>{{ item.is_available ? 'visibility_off' : 'visibility' }}</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="deleteItem(item)" matTooltip="Delete">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .menu-mgmt { max-width: 1100px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; h1 { font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 800; margin-bottom: 4px; } p { color: var(--text-secondary); } }
    .add-btn { background: var(--primary) !important; color: white !important; display: flex !important; align-items: center !important; gap: 6px !important; }
    .form-card { background: white; border-radius: 16px; padding: 24px; margin-bottom: 28px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 2px solid var(--border); }
    .form-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; h2 { font-size: 1.1rem; font-weight: 700; } }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; mat-form-field { width: 100%; } }
    .image-upload-area { border: 2px dashed #ddd; border-radius: 12px; padding: 24px; text-align: center; cursor: pointer; position: relative; overflow: hidden; min-height: 140px; display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 16px; &:hover { border-color: var(--primary); } .upload-icon { font-size: 40px; width: 40px; height: 40px; color: #ccc; margin-bottom: 8px; } p { color: var(--text-secondary); margin-bottom: 4px; } small { color: #bbb; font-size: 0.8rem; } }
    .image-preview { width: 100%; height: 140px; object-fit: cover; border-radius: 8px; }
    .image-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; opacity: 0; transition: opacity 0.2s; font-weight: 600; }
    .image-upload-area:hover .image-overlay { opacity: 1; }
    .upload-progress { display: flex; align-items: center; gap: 10px; color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 16px; }
    .form-toggle { margin-bottom: 20px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; }
    .save-btn { background: var(--primary) !important; color: white !important; font-weight: 600 !important; display: flex !important; align-items: center !important; gap: 8px !important; }
    .menu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .item-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06); &:hover { transform: translateY(-2px); } &.unavailable { opacity: 0.7; } }
    .item-image { height: 180px; position: relative; overflow: hidden; img { width: 100%; height: 100%; object-fit: cover; } }
    .img-placeholder { width: 100%; height: 100%; background: linear-gradient(135deg, #fff3e0, #ffe0cc); display: flex; align-items: center; justify-content: center; font-size: 56px; }
    .availability-badge { position: absolute; top: 10px; right: 10px; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; background: #fce4ec; color: #c62828; &.avail { background: #e8f5e9; color: #2e7d32; } }
    .item-info { padding: 16px; h3 { font-size: 1rem; font-weight: 700; margin-bottom: 4px; } p { color: var(--text-secondary); font-size: 0.85rem; line-height: 1.4; margin-bottom: 12px; } }
    .item-footer { display: flex; align-items: center; justify-content: space-between; .price { font-size: 1.1rem; font-weight: 800; color: var(--primary); } }
    .item-actions { display: flex; }
    .empty-state { text-align: center; padding: 60px; color: var(--text-secondary); mat-icon { font-size: 56px; width: 56px; height: 56px; opacity: 0.3; margin-bottom: 16px; display: block; } h3 { font-size: 1.2rem; margin-bottom: 8px; } }
    @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } .menu-grid { grid-template-columns: 1fr; } }
  `]
})
export class MenuManagement implements OnInit {
  menuItems = signal<MenuItem[]>([]);
  loading = signal(true);
  showForm = signal(false);
  editingItem = signal<MenuItem | null>(null);
  saving = signal(false);
  uploadingImage = signal(false);
  imagePreview = signal<string | null>(null);
  selectedFile: File | null = null;
  itemForm: FormGroup;

  constructor(private fb: FormBuilder, private menuService: MenuService, private snackBar: MatSnackBar) {
    this.itemForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: [null, [Validators.required, Validators.min(1)]],
      is_available: [true],
    });
  }

  ngOnInit() { this.loadItems(); }

  loadItems() {
    this.menuService.getMenuItems().subscribe({
      next: items => { this.menuItems.set(items); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openForm() {
    this.editingItem.set(null);
    this.itemForm.reset({ is_available: true });
    this.imagePreview.set(null);
    this.selectedFile = null;
    this.showForm.set(true);
  }

  editItem(item: MenuItem) {
    this.editingItem.set(item);
    this.itemForm.patchValue({ name: item.name, description: item.description, price: item.price, is_available: item.is_available });
    this.imagePreview.set(item.image_url);
    this.selectedFile = null;
    this.showForm.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  closeForm() {
    this.showForm.set(false);
    this.editingItem.set(null);
    this.imagePreview.set(null);
    this.selectedFile = null;
  }

  onFileSelect(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = e => this.imagePreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  async saveItem() {
    if (this.itemForm.invalid) { this.itemForm.markAllAsTouched(); return; }
    this.saving.set(true);
    try {
      let imageUrl = this.editingItem()?.image_url || null;
      if (this.selectedFile) {
        this.uploadingImage.set(true);
        imageUrl = await this.menuService.uploadImage(this.selectedFile);
        this.uploadingImage.set(false);
      }
      const data = { ...this.itemForm.value, image_url: imageUrl };
      if (this.editingItem()) {
        this.menuService.updateMenuItem(this.editingItem()!.id, data).subscribe({
          next: () => { this.snackBar.open('Item updated!', '✕', { duration: 3000, panelClass: 'success-snack' }); this.closeForm(); this.loadItems(); },
          error: e => this.snackBar.open('Error: ' + e.message, '✕', { duration: 3000, panelClass: 'error-snack' })
        });
      } else {
        this.menuService.addMenuItem(data).subscribe({
          next: () => { this.snackBar.open('Item added!', '✕', { duration: 3000, panelClass: 'success-snack' }); this.closeForm(); this.loadItems(); },
          error: e => this.snackBar.open('Error: ' + e.message, '✕', { duration: 3000, panelClass: 'error-snack' })
        });
      }
    } catch (e: any) {
      this.snackBar.open('Upload failed: ' + e.message, '✕', { duration: 3000, panelClass: 'error-snack' });
    } finally {
      this.saving.set(false);
    }
  }

  toggleAvailability(item: MenuItem) {
    this.menuService.updateMenuItem(item.id, { is_available: !item.is_available }).subscribe({
      next: () => { this.loadItems(); this.snackBar.open('Updated!', '✕', { duration: 2000, panelClass: 'success-snack' }); },
      error: e => this.snackBar.open('Error: ' + e.message, '✕', { duration: 3000, panelClass: 'error-snack' })
    });
  }

  deleteItem(item: MenuItem) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    this.menuService.deleteMenuItem(item.id).subscribe({
      next: () => { this.loadItems(); this.snackBar.open('Deleted.', '✕', { duration: 2000 }); },
      error: e => this.snackBar.open('Error: ' + e.message, '✕', { duration: 3000, panelClass: 'error-snack' })
    });
  }
}