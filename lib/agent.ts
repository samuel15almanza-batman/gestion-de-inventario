import { ProductRepository } from '@/repositories/ProductRepository';

export class InventoryAgent {
  private productRepo: ProductRepository;

  constructor() {
    this.productRepo = new ProductRepository();
  }

  async processQuery(query: string): Promise<string> {
    const products = await this.productRepo.getAll();
    const q = query.toLowerCase();

    // 1. Quantity Query
    if (q.includes('cantidad') || q.includes('cuantos') || q.includes('cuántos') || q.includes('disponible') || q.includes('stock')) {
      const product = products.find(p => q.includes(p.nombre.toLowerCase()));
      if (product) {
        return `La cantidad disponible de **${product.nombre}** es: **${product.cantidad}** unidades.`;
      }
      
      const categories = Array.from(new Set(products.map(p => p.categoria.toLowerCase())));
      const category = categories.find(c => q.includes(c));
      if (category) {
          const catProducts = products.filter(p => p.categoria.toLowerCase() === category);
          const totalCat = catProducts.reduce((sum, p) => sum + p.cantidad, 0);
          return `Hay un total de **${totalCat}** productos en la categoría **${category}**.`;
      }
      return "No encontré el producto o categoría especificada. Intenta decir 'cantidad de [nombre del producto]'.";
    }

    // 2. Price Query
    if (q.includes('precio') || q.includes('costo') || q.includes('vale')) {
      const product = products.find(p => q.includes(p.nombre.toLowerCase()));
      if (product) {
        return `El precio de **${product.nombre}** es: **$${product.precio}**.`;
      }
      return "No encontré el producto. Intenta decir 'precio de [nombre del producto]'.";
    }

    // 3. List Query
    if (q.includes('listar') || q.includes('lista') || q.includes('mostrar') || q.includes('ver')) {
       if (q.includes('todos') || q.includes('todo') || q.includes('inventario')) {
           return `Hay **${products.length}** productos registrados en total.`;
       }
       const categories = Array.from(new Set(products.map(p => p.categoria.toLowerCase())));
       const category = categories.find(c => q.includes(c));
       if (category) {
           const catProducts = products.filter(p => p.categoria.toLowerCase() === category);
           const names = catProducts.map(p => p.nombre).join(', ');
           return `Productos en categoría **${category}**: ${names}.`;
       }
    }

    return "Soy tu Agente de Inventario. Pregúntame sobre 'cantidad de X', 'precio de Y', o 'listar categoría Z'.";
  }
}
