import { Product } from '../models/Product';

export class ProductFactory {
  static create(data: Omit<Product, 'id'>): Product {
    return {
      id: crypto.randomUUID(),
      ...data
    };
  }
}
