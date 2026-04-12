import { Product } from '../models/Product';
import { ProductFactory } from '../factories/ProductFactory';
import { IProductRepository, ProductRepositoryFactory } from '../repositories/ProductRepository';
import { AppMode } from '../../../lib/app-config';

export class ProductService {
  private productRepository: IProductRepository;

  constructor(mode?: AppMode) {
    this.productRepository = ProductRepositoryFactory.get(mode);
  }

  async getAll(): Promise<Product[]> {
    return this.productRepository.getAll();
  }

  async getById(id: string): Promise<Product | null> {
    return this.productRepository.getById(id);
  }

  async create(data: Omit<Product, 'id' | 'fecha_entrada'>): Promise<Product> {
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
