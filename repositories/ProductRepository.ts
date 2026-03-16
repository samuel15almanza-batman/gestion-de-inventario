import { supabase } from '../lib/supabase';
import { Product } from '../models/Product';

export class ProductRepository {
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('productos')
      .select('*');
    
    if (error) throw new Error(error.message);
    return data || [];
  }

  async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  }

  async create(product: Product): Promise<Product> {
    const { data, error } = await supabase
      .from('productos')
      .insert([product])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: string, updates: Partial<Product>): Promise<Product | null> {
    const { data, error } = await supabase
      .from('productos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) return null;
    return data;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id);
    
    return !error;
  }
}
