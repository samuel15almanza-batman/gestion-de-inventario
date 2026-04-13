import { ProductRepositoryFactory } from '@/modules/inventory/repositories/ProductRepository';
import { OutputRepositoryFactory } from '@/modules/outputs/repositories/OutputRepository';
import { getAppMode } from '@/lib/app-config';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const mode = getAppMode();
  const productRepo = ProductRepositoryFactory.get(mode);
  const outputRepo = OutputRepositoryFactory.get(mode);

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
          Panel de Control {mode === 'demo' && <span className="text-sm font-normal text-yellow-500">(Modo Demo)</span>}
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Bienvenido al Sistema de Gestión de Inventario
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* ... rest of the UI ... */}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01m-.01 4h.01" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Total Salidas</h2>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{totalOutputs}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 p-4 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Salidas Recientes</h3>
          </div>
          <div className="p-4 flex flex-col h-full">
            {recentOutputs.length > 0 ? (
              <div className="flex-1 overflow-y-auto max-h-[300px] pr-2">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentOutputs.map((output) => (
                  <li key={output.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {output.items?.[0]?.nombreProducto || 'Salida'}
                          {output.totalProductos > 1 && (
                            <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                              (+{output.totalProductos - 1} más)
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Entregado a: {output.destinatarioNombre}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">x{output.totalCantidad}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(output.fecha).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </li>
                ))}
                </ul>
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">No hay salidas registradas.</p>
            )}
            <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
              <Link href="/outputs" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                Ver todas las salidas &rarr;
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 p-4 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Acciones Rápidas</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 p-4">
            <Link href="/products" className="flex flex-col items-center justify-center rounded-lg border border-gray-200 p-4 transition-all hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700">
              <svg className="mb-2 h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Nuevo Producto</span>
            </Link>
            <Link href="/outputs" className="flex flex-col items-center justify-center rounded-lg border border-gray-200 p-4 transition-all hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700">
              <svg className="mb-2 h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
              </svg>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Registrar Salida</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
