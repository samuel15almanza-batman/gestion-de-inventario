import { Output, OutputCreateInput } from '../models/Output';
import { IOutputRepository, OutputRepositoryFactory } from '../repositories/OutputRepository';
import { ProductService } from '../../inventory/services/ProductService';
import { AppMode, isDemoMode } from '../../../lib/app-config';

export class OutputService {
  private outputRepository: IOutputRepository;
  private productService: ProductService;
  private mode?: AppMode;

  constructor(mode?: AppMode) {
    this.mode = mode;
    this.outputRepository = OutputRepositoryFactory.get(mode);
    this.productService = new ProductService(mode);
  }

  async getAll(): Promise<Output[]> {
    return this.outputRepository.getAll();
  }

  async getById(id: string): Promise<Output | null> {
    return this.outputRepository.getById(id);
  }

  async register(data: OutputCreateInput): Promise<{ output?: Output; error?: string; status: number }> {
    if (!data.items || data.items.length === 0) {
      return { error: 'Debe seleccionar al menos un producto', status: 400 };
    }

    for (const item of data.items) {
      if (!item.productoId) {
        return { error: 'Producto inválido en la lista', status: 400 };
      }
      if (!Number.isFinite(item.cantidad) || item.cantidad <= 0) {
        return { error: 'Cantidad inválida en la lista', status: 400 };
      }
    }

    const fecha = new Date().toISOString();

    if (isDemoMode(this.mode)) {
      for (const item of data.items) {
        const product = await this.productService.getById(item.productoId);

        if (!product) {
          return { error: 'Producto no encontrado', status: 404 };
        }

        if (product.cantidad < item.cantidad) {
          return { error: `Stock insuficiente para "${product.nombre}". Disponible: ${product.cantidad}`, status: 400 };
        }

        const updatedProduct = await this.productService.update(item.productoId, {
          cantidad: product.cantidad - item.cantidad,
        });

        if (!updatedProduct) {
          return { error: 'Error al actualizar stock', status: 500 };
        }
      }
    }

    try {
      const createdOutput = await this.outputRepository.registerMulti({ ...data, fecha });
      return { output: createdOutput, status: 201 };
    } catch (e: unknown) {
      const message =
        typeof e === 'object' && e !== null && 'message' in e && typeof (e as { message?: unknown }).message === 'string'
          ? (e as { message: string }).message
          : 'Error al registrar salida';
      return { error: message, status: 400 };
    }
  }

  async delete(id: string): Promise<boolean> {
    return this.outputRepository.delete(id);
  }
}
