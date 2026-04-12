import { OutputRepositoryFactory } from '@/modules/outputs/repositories/OutputRepository';
import { ProductRepositoryFactory } from '@/modules/inventory/repositories/ProductRepository';
import OutputList from '@/components/OutputList';
import { getAppMode } from '@/lib/app-config';

export const dynamic = 'force-dynamic';

export default async function OutputsPage() {
  const mode = getAppMode();
  const outputRepo = OutputRepositoryFactory.get(mode);
  const productRepo = ProductRepositoryFactory.get(mode);
  
  const [outputs, products] = await Promise.all([
    outputRepo.getAll(),
    productRepo.getAll()
  ]);

  outputs.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Registro de Salidas {mode === 'demo' && <span className="text-sm font-normal text-yellow-500">(Modo Demo)</span>}
        </h1>
      </div>
      <OutputList initialOutputs={outputs} products={products} />
    </div>
  );
}
