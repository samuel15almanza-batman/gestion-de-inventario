import { Product } from '../models/Product';

export class ProductFactory {
  static create(data: Omit<Product, 'id' | 'fecha_entrada'>): Product {
    return {
      id: crypto.randomUUID(),
      fecha_entrada: new Date().toISOString(),
      ...data
    };
  }
}
