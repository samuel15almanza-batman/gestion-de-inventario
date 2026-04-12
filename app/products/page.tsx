import { ProductRepositoryFactory } from '@/modules/inventory/repositories/ProductRepository';
import ProductList from '@/components/ProductList';
import { getAppMode } from '@/lib/app-config';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const mode = getAppMode();
  const repo = ProductRepositoryFactory.get(mode);
  const products = await repo.getAll();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestión de Productos {mode === 'demo' && <span className="text-sm font-normal text-yellow-500">(Modo Demo)</span>}
        </h1>
      </div>
      <ProductList initialProducts={products} />
    </div>
  );
}
