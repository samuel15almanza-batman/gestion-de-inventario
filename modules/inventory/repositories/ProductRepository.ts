import { supabase } from '../../../lib/supabase';
import { getAppMode, AppMode, isDemoMode } from '../../../lib/app-config';
import { Product } from '../models/Product';
import { inMemoryStore } from '../../../lib/in-memory-store';

export interface IProductRepository {
  getAll(): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
  create(product: Product): Promise<Product>;
  update(id: string, updates: Partial<Product>): Promise<Product | null>;
  delete(id: string): Promise<boolean>;
}

export class SupabaseProductRepository implements IProductRepository {
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase.from('productos').select('*');
    if (error) throw new Error(error.message);
    return data || [];
  }

  async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase.from('productos').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  }

  async create(product: Product): Promise<Product> {
    const { data, error } = await supabase.from('productos').insert([product]).select().single();
    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: string, updates: Partial<Product>): Promise<Product | null> {
    const { data, error } = await supabase.from('productos').update(updates).eq('id', id).select().single();
    if (error) return null;
    return data;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('productos').delete().eq('id', id);
    return !error;
  }
}

export class MockProductRepository implements IProductRepository {
  async getAll(): Promise<Product[]> {
    return inMemoryStore.products;
  }

  async getById(id: string): Promise<Product | null> {
    return inMemoryStore.products.find(p => p.id === id) || null;
  }

  async create(product: Product): Promise<Product> {
    inMemoryStore.products.push(product);
    return product;
  }

  async update(id: string, updates: Partial<Product>): Promise<Product | null> {
    const index = inMemoryStore.products.findIndex(p => p.id === id);
    if (index === -1) return null;
    inMemoryStore.products[index] = { ...inMemoryStore.products[index], ...updates };
    return inMemoryStore.products[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = inMemoryStore.products.findIndex(p => p.id === id);
    if (index === -1) return false;
    inMemoryStore.products.splice(index, 1);
    return true;
  }
}

/**
 * Factory for Product Repository
 */
export class ProductRepositoryFactory {
  static get(mode?: AppMode): IProductRepository {
    return isDemoMode(mode) ? new MockProductRepository() : new SupabaseProductRepository();
  }
}
