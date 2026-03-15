import { OutputRepository } from '@/repositories/OutputRepository';
import { ProductRepository } from '@/repositories/ProductRepository';
import OutputList from '@/components/OutputList';

export const dynamic = 'force-dynamic';

export default async function OutputsPage() {
  const outputRepo = new OutputRepository();
  const productRepo = new ProductRepository();
  
  // Use Promise.all for parallel fetching
  const [outputs, products] = await Promise.all([
    outputRepo.getAll(),
    productRepo.getAll()
  ]);

  // Sort outputs by date descending
  outputs.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Registro de Salidas</h1>
      </div>
      <OutputList initialOutputs={outputs} products={products} />
    </div>
  );
}
