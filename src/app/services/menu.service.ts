import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { MenuItem } from '../models';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class MenuService {
  constructor(private supabase: SupabaseService) {}

  getMenuItems(): Observable<MenuItem[]> {
    return from(
      this.supabase.client.from('menu_items').select('*').order('created_at', { ascending: true })
    ).pipe(map(({ data, error }) => { if (error) throw error; return data as MenuItem[]; }));
  }

  getAvailableMenuItems(): Observable<MenuItem[]> {
    return from(
      this.supabase.client.from('menu_items').select('*').eq('is_available', true).order('created_at', { ascending: true })
    ).pipe(map(({ data, error }) => { if (error) throw error; return data as MenuItem[]; }));
  }

  addMenuItem(item: Partial<MenuItem>): Observable<MenuItem> {
    return from(
      this.supabase.client.from('menu_items').insert(item).select().single()
    ).pipe(map(({ data, error }) => { if (error) throw error; return data as MenuItem; }));
  }

  updateMenuItem(id: string, updates: Partial<MenuItem>): Observable<MenuItem> {
    return from(
      this.supabase.client.from('menu_items').update(updates).eq('id', id).select().single()
    ).pipe(map(({ data, error }) => { if (error) throw error; return data as MenuItem; }));
  }

  deleteMenuItem(id: string): Observable<void> {
    return from(
      this.supabase.client.from('menu_items').delete().eq('id', id)
    ).pipe(map(({ error }) => { if (error) throw error; }));
  }

  async uploadImage(file: File): Promise<string> {
    const fileName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
    const { data, error } = await this.supabase.client.storage
      .from('food-images').upload(fileName, file, { upsert: true });
    if (error) throw error;
    const { data: urlData } = this.supabase.client.storage
      .from('food-images').getPublicUrl(data.path);
    return urlData.publicUrl;
  }
}