'use client';

import { useState } from 'react';
import { Output } from '@/models/Output';
import { Product } from '@/models/Product';
import OutputForm from './OutputForm';
import { useRouter } from 'next/navigation';

interface OutputListProps {
  initialOutputs: Output[];
  products: Product[];
}

export default function OutputList({ initialOutputs, products }: OutputListProps) {
  const [outputs, setOutputs] = useState(initialOutputs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleOutputAdded = (newOutput: Output) => {
    setOutputs([newOutput, ...outputs]);
    setIsModalOpen(false);
    router.refresh();
  };

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 shadow-md transition-all hover:shadow-lg"
        >
          Registrar Salida
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Cantidad</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Destinatario</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Ficha/Área</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            {outputs.map((output) => (
              <tr key={output.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {new Date(output.fecha).toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                  {output.nombreProducto}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {output.cantidad}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {output.destinatarioNombre}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {output.destinatarioFicha} / {output.destinatarioArea}
                </td>
              </tr>
            ))}
             {outputs.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        No hay salidas registradas.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                  <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Registrar Salida</h2>
                  <OutputForm products={products} onSuccess={handleOutputAdded} onCancel={() => setIsModalOpen(false)} />
              </div>
          </div>
      )}
    </div>
  );
}
