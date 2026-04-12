import { ProductService } from '@/services/ProductService';

export class InventoryQueryService {
  constructor(private readonly productService = new ProductService()) {}

  async processQuery(query: string): Promise<string> {
    const products = await this.productService.getAll();
    const q = query.toLowerCase();

    if (q.includes('cantidad') || q.includes('cuantos') || q.includes('cuántos') || q.includes('disponible') || q.includes('stock')) {
      const product = products.find((item) => q.includes(item.nombre.toLowerCase()));

      if (product) {
        return `La cantidad disponible de **${product.nombre}** es: **${product.cantidad}** unidades.`;
      }

      const categories = Array.from(new Set(products.map((item) => item.categoria.toLowerCase())));
      const category = categories.find((item) => q.includes(item));

      if (category) {
        const categoryProducts = products.filter((item) => item.categoria.toLowerCase() === category);
        const totalCategoryItems = categoryProducts.reduce((sum, item) => sum + item.cantidad, 0);

        return `Hay un total de **${totalCategoryItems}** unidades disponibles en la categoría **${category}**.`;
      }

      return "No encontré el producto o categoría especificada. Intenta decir 'cantidad de [nombre del producto]'.";
    }

    if (q.includes('precio') || q.includes('costo') || q.includes('vale')) {
      const product = products.find((item) => q.includes(item.nombre.toLowerCase()));

      if (product) {
        return `El precio de **${product.nombre}** es: **$${product.precio}**.`;
      }

      return "No encontré el producto. Intenta decir 'precio de [nombre del producto]'.";
    }

    if (q.includes('listar') || q.includes('lista') || q.includes('mostrar') || q.includes('ver')) {
      if (q.includes('todos') || q.includes('todo') || q.includes('inventario')) {
        return `Hay **${products.length}** tipos de productos registrados en total.`;
      }

      const categories = Array.from(new Set(products.map((item) => item.categoria.toLowerCase())));
      const category = categories.find((item) => q.includes(item));

      if (category) {
        const categoryProducts = products.filter((item) => item.categoria.toLowerCase() === category);
        const names = categoryProducts.map((item) => item.nombre).join(', ');

        return `Productos en categoría **${category}**: ${names}.`;
      }
    }

    return "Soy tu Agente de Inventario. Pregúntame sobre 'cantidad de X', 'precio de Y', o 'listar categoría Z'.";
  }
}
