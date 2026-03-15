import { ProductRepository } from '@/repositories/ProductRepository';
import ProductList from '@/components/ProductList';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const repo = new ProductRepository();
  const products = await repo.getAll();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Productos</h1>
      </div>
      <ProductList initialProducts={products} />
    </div>
  );
}
