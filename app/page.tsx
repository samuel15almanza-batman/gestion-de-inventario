import { ProductRepository } from '@/repositories/ProductRepository';
import { OutputRepository } from '@/repositories/OutputRepository';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const productRepo = new ProductRepository();
  const outputRepo = new OutputRepository();

  const [products, outputs] = await Promise.all([
    productRepo.getAll(),
    outputRepo.getAll()
  ]);

  // Contar productos únicos (tipos) en lugar de sumar las cantidades
  const totalProducts = products.length;
  const lowStock = products.filter(p => p.cantidad < 10).length;
  const totalOutputs = outputs.length;
  // Get last 5 outputs, reverse to show newest first
  const recentOutputs = [...outputs].reverse().slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Panel de Control
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Bienvenido al Sistema de Gestión de Inventario
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800 transition-all hover:shadow-lg">
          <div className="flex items-center">
            <div className="rounded-full bg-indigo-100 p-3 dark:bg-indigo-900">
              <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Total Productos</h2>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800 transition-all hover:shadow-lg">
          <div className="flex items-center">
            <div className="rounded-full bg-red-100 p-3 dark:bg-red-900">
              <svg className="h-6 w-6 text-red-600 dark:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Stock Bajo</h2>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{lowStock}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800 transition-all hover:shadow-lg">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
              <svg className="h-6 w-6 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Total Salidas</h2>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{totalOutputs}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/products" className="flex flex-col items-center justify-center rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors">
              <span className="text-indigo-600 font-medium">Gestionar Productos</span>
            </Link>
            <Link href="/outputs" className="flex flex-col items-center justify-center rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors">
              <span className="text-green-600 font-medium">Registrar Salida</span>
            </Link>
             <Link href="/agent" className="flex flex-col items-center justify-center rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors">
              <span className="text-purple-600 font-medium">Consultar IA</span>
            </Link>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Salidas Recientes</h3>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentOutputs.length > 0 ? recentOutputs.map((output) => (
              <li key={output.id} className="py-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{output.nombreProducto}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{new Date(output.fecha).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Destino: {output.destinatarioNombre} ({output.cantidad} un.)
                </p>
              </li>
            )) : (
                <li className="py-3 text-sm text-gray-500">No hay salidas recientes.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
