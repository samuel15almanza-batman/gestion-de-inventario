import { Product } from '../modules/inventory/models/Product';
import { Output } from '../modules/outputs/models/Output';

/**
 * Singleton to maintain state for demo mode in memory.
 * Note: In Serverless/Next.js API routes, this is volatile (per cold start).
 * For a more stable demo, one could use Redis or LocalStorage (client-side only).
 */
class InMemoryStore {
  private static instance: InMemoryStore;
  public products: Product[] = [
    {
      id: 'demo-1',
      nombre: 'Producto Demo 1',
      descripcion: 'Descripción del producto demo 1',
      cantidad: 100,
      precio: 10.5,
      categoria: 'Electrónica',
      fecha_entrada: '2026-04-06T00:00:00.000Z'
    },
    {
      id: 'demo-2',
      nombre: 'Producto Demo 2',
      descripcion: 'Descripción del producto demo 2',
      cantidad: 5,
      precio: 20.0,
      categoria: 'Muebles',
      fecha_entrada: '2026-04-06T00:00:00.000Z'
    }
  ];
  public outputs: Output[] = [];

  private constructor() {}

  public static getInstance(): InMemoryStore {
    if (!InMemoryStore.instance) {
      InMemoryStore.instance = new InMemoryStore();
    }
    return InMemoryStore.instance;
  }
}

export const inMemoryStore = InMemoryStore.getInstance();
