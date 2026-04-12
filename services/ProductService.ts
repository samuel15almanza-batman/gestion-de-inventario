import { Product } from '@/models/Product';
import { ProductFactory } from '@/factories/ProductFactory';
import { ProductRepository } from '@/repositories/ProductRepository';

export class ProductService {
  constructor(private readonly productRepository = new ProductRepository()) {}

  async getAll(): Promise<Product[]> {
    return this.productRepository.getAll();
  }

  async getById(id: string): Promise<Product | null> {
    return this.productRepository.getById(id);
  }

  async create(data: Omit<Product, 'id'>): Promise<Product> {
    const product = ProductFactory.create(data);
    return this.productRepository.create(product);
  }

  async update(id: string, updates: Partial<Product>): Promise<Product | null> {
    return this.productRepository.update(id, updates);
  }

  async delete(id: string): Promise<boolean> {
    return this.productRepository.delete(id);
  }
}
