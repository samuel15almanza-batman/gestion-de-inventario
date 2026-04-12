import { Output } from '@/models/Output';
import { OutputFactory } from '@/factories/OutputFactory';
import { OutputRepository } from '@/repositories/OutputRepository';
import { ProductService } from '@/services/ProductService';

type OutputInput = Omit<Output, 'id' | 'fecha' | 'nombreProducto'>;

export class OutputService {
  constructor(
    private readonly outputRepository = new OutputRepository(),
    private readonly productService = new ProductService()
  ) {}

  async getAll(): Promise<Output[]> {
    return this.outputRepository.getAll();
  }

  async getById(id: string): Promise<Output | null> {
    return this.outputRepository.getById(id);
  }

  async register(data: OutputInput): Promise<{ output?: Output; error?: string; status: number }> {
    const product = await this.productService.getById(data.productoId);

    if (!product) {
      return { error: 'Producto no encontrado', status: 404 };
    }

    if (product.cantidad < data.cantidad) {
      return { error: `Stock insuficiente. Disponible: ${product.cantidad}`, status: 400 };
    }

    const updatedProduct = await this.productService.update(data.productoId, {
      cantidad: product.cantidad - data.cantidad,
    });

    if (!updatedProduct) {
      return { error: 'Error al actualizar stock', status: 500 };
    }

    const output = OutputFactory.create({
      ...data,
      nombreProducto: product.nombre,
    });

    const createdOutput = await this.outputRepository.create(output);

    return { output: createdOutput, status: 201 };
  }

  async delete(id: string): Promise<boolean> {
    return this.outputRepository.delete(id);
  }
}
