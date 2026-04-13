import { supabase } from '../../../lib/supabase';
import { getAppMode, AppMode, isDemoMode } from '../../../lib/app-config';
import { Output, OutputCreateInput } from '../models/Output';
import { inMemoryStore } from '../../../lib/in-memory-store';

export interface IOutputRepository {
  getAll(): Promise<Output[]>;
  getById(id: string): Promise<Output | null>;
  registerMulti(input: OutputCreateInput & { fecha: string }): Promise<Output>;
  delete(id: string): Promise<boolean>;
}

type SupabaseSalidaItemRow = {
  producto_id: string;
  nombre_producto: string;
  cantidad: number;
};

type SupabaseSalidaRow = {
  id: string;
  fecha: string;
  destinatarioNombre: string;
  destinatarioFicha: string;
  destinatarioArea: string;
  firmaDigital: string;
  totalProductos: number | string | null;
  totalCantidad: number | string | null;
  salida_items?: SupabaseSalidaItemRow[] | null;
};

type SupabaseSalidaLegacyRow = {
  id: string;
  fecha: string;
  destinatarioNombre: string;
  destinatarioFicha: string;
  destinatarioArea: string;
  firmaDigital: string;
  productoId?: string | null;
  nombreProducto?: string | null;
  cantidad?: number | null;
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) return Number(value);
  if (typeof value === 'bigint') return Number(value);
  return null;
};

const mapSupabaseOutputToDomain = (row: SupabaseSalidaRow): Output => {
  const items = Array.isArray(row.salida_items)
    ? row.salida_items.map((i) => ({
        productoId: i.producto_id,
        nombreProducto: i.nombre_producto,
        cantidad: i.cantidad,
      }))
    : [];

  const totalProductos =
    toNumber(row.totalProductos) ?? items.length;

  const totalCantidad =
    toNumber(row.totalCantidad) ?? items.reduce((acc, it) => acc + (Number(it.cantidad) || 0), 0);

  return {
    id: row.id,
    fecha: row.fecha,
    destinatarioNombre: row.destinatarioNombre,
    destinatarioFicha: row.destinatarioFicha,
    destinatarioArea: row.destinatarioArea,
    firmaDigital: row.firmaDigital,
    totalProductos,
    totalCantidad,
    items,
  };
};

const mapSupabaseLegacyOutputToDomain = (row: SupabaseSalidaLegacyRow): Output => {
  const cantidad = typeof row.cantidad === 'number' ? row.cantidad : 0;
  const items =
    row.productoId && cantidad > 0
      ? [
          {
            productoId: row.productoId,
            nombreProducto: row.nombreProducto || 'Producto',
            cantidad,
          },
        ]
      : [];

  return {
    id: row.id,
    fecha: row.fecha,
    destinatarioNombre: row.destinatarioNombre,
    destinatarioFicha: row.destinatarioFicha,
    destinatarioArea: row.destinatarioArea,
    firmaDigital: row.firmaDigital,
    totalProductos: items.length,
    totalCantidad: items.reduce((acc, it) => acc + it.cantidad, 0),
    items,
  };
};

export class SupabaseOutputRepository implements IOutputRepository {
  async getAll(): Promise<Output[]> {
    const joined = await supabase
      .from('salidas')
      .select(
        `
          id,
          fecha,
          destinatarioNombre,
          destinatarioFicha,
          destinatarioArea,
          firmaDigital,
          totalProductos,
          totalCantidad,
          salida_items:salida_items (
            producto_id,
            nombre_producto,
            cantidad
          )
        `
      );

    if (!joined.error) {
      return (joined.data || []).map((row) => mapSupabaseOutputToDomain(row as SupabaseSalidaRow));
    }

    if (joined.error.message.includes('relationship between')) {
      const legacy = await supabase
        .from('salidas')
        .select('id, fecha, destinatarioNombre, destinatarioFicha, destinatarioArea, firmaDigital, productoId, nombreProducto, cantidad');

      if (legacy.error) throw new Error(legacy.error.message);
      return (legacy.data || []).map((row) => mapSupabaseLegacyOutputToDomain(row as SupabaseSalidaLegacyRow));
    }

    throw new Error(joined.error.message);
  }

  async getById(id: string): Promise<Output | null> {
    const joined = await supabase
      .from('salidas')
      .select(
        `
          id,
          fecha,
          destinatarioNombre,
          destinatarioFicha,
          destinatarioArea,
          firmaDigital,
          totalProductos,
          totalCantidad,
          salida_items:salida_items (
            producto_id,
            nombre_producto,
            cantidad
          )
        `
      )
      .eq('id', id)
      .single();

    if (!joined.error && joined.data) {
      return mapSupabaseOutputToDomain(joined.data as SupabaseSalidaRow);
    }

    if (joined.error && joined.error.message.includes('relationship between')) {
      const legacy = await supabase
        .from('salidas')
        .select('id, fecha, destinatarioNombre, destinatarioFicha, destinatarioArea, firmaDigital, productoId, nombreProducto, cantidad')
        .eq('id', id)
        .single();

      if (legacy.error || !legacy.data) return null;
      return mapSupabaseLegacyOutputToDomain(legacy.data as SupabaseSalidaLegacyRow);
    }

    return null;
  }

  async registerMulti(input: OutputCreateInput & { fecha: string }): Promise<Output> {
    const rpcPayload = {
      items: input.items.map(item => ({
        productoId: item.productoId,
        cantidad: item.cantidad
      })),
      destinatarioNombre: input.destinatarioNombre,
      destinatarioFicha: input.destinatarioFicha,
      destinatarioArea: input.destinatarioArea,
      firmaDigital: input.firmaDigital,
      fecha: input.fecha,
    };
    const { data, error } = await supabase.rpc('register_salida_multi', rpcPayload);

    if (error) throw new Error(error.message);

    const created = await this.getById(data);
    if (!created) throw new Error('No se pudo recuperar la salida creada');
    return created;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from('salidas').delete().eq('id', id);
    return !error;
  }
}

export class MockOutputRepository implements IOutputRepository {
  async getAll(): Promise<Output[]> {
    return inMemoryStore.outputs;
  }

  async getById(id: string): Promise<Output | null> {
    return inMemoryStore.outputs.find(o => o.id === id) || null;
  }

  async registerMulti(input: OutputCreateInput & { fecha: string }): Promise<Output> {
    const items = input.items
      .map((it) => {
        const product = inMemoryStore.products.find(p => p.id === it.productoId);
        return {
          productoId: it.productoId,
          nombreProducto: product?.nombre || 'Producto',
          cantidad: it.cantidad,
        };
      })
      .filter((it) => it.cantidad > 0);

    const totalProductos = items.length;
    const totalCantidad = items.reduce((acc, it) => acc + it.cantidad, 0);

    const output: Output = {
      id: crypto.randomUUID(),
      fecha: input.fecha,
      destinatarioNombre: input.destinatarioNombre,
      destinatarioFicha: input.destinatarioFicha,
      destinatarioArea: input.destinatarioArea,
      firmaDigital: input.firmaDigital,
      totalProductos,
      totalCantidad,
      items,
    };

    inMemoryStore.outputs.unshift(output);
    return output;
  }

  async delete(id: string): Promise<boolean> {
    const index = inMemoryStore.outputs.findIndex(o => o.id === id);
    if (index === -1) return false;
    inMemoryStore.outputs.splice(index, 1);
    return true;
  }
}

/**
 * Factory for Output Repository
 */
export class OutputRepositoryFactory {
  static get(mode?: AppMode): IOutputRepository {
    return isDemoMode(mode) ? new MockOutputRepository() : new SupabaseOutputRepository();
  }
}
