import { supabase } from '../lib/supabase';
import { Output } from '../models/Output';

export class OutputRepository {
  async getAll(): Promise<Output[]> {
    const { data, error } = await supabase
      .from('salidas')
      .select('*');
    
    if (error) throw new Error(error.message);
    return data || [];
  }

  async getById(id: string): Promise<Output | null> {
    const { data, error } = await supabase
      .from('salidas')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  }

  async create(output: Output): Promise<Output> {
    const { data, error } = await supabase
      .from('salidas')
      .insert([output])
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('salidas')
      .delete()
      .eq('id', id);
    
    return !error;
  }
}
