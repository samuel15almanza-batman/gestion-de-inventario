'use client';

import { useState, useMemo } from 'react';
import { Output } from '@/modules/outputs/models/Output';
import { Product } from '@/modules/inventory/models/Product';
import OutputForm from './OutputForm';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface OutputListProps {
  initialOutputs: Output[];
  products: Product[];
}

export default function OutputList({ initialOutputs, products }: OutputListProps) {
  const [outputs, setOutputs] = useState(initialOutputs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [fichaFilter, setFichaFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [selectedOutput, setSelectedOutput] = useState<Output | null>(null);
  const router = useRouter();

  const filteredOutputs = outputs.filter(output => {
    const outputDate = new Date(output.fecha).toISOString().split('T')[0];
    const matchesDate = dateFilter ? outputDate === dateFilter : true;
    const matchesFicha = fichaFilter ? output.destinatarioFicha.toLowerCase().includes(fichaFilter.toLowerCase()) : true;
    const matchesArea = areaFilter ? output.destinatarioArea.toLowerCase().includes(areaFilter.toLowerCase()) : true;
    return matchesDate && matchesFicha && matchesArea;
  });

  const handleOutputAdded = (newOutput: Output) => {
    setOutputs([newOutput, ...outputs]);
    setIsModalOpen(false);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Está seguro de eliminar esta salida? El stock será devuelto al inventario.')) return;
    try {
      await axios.delete(`/api/outputs/${id}`);
      alert('Salida eliminada con éxito');
      router.refresh();
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.error || 'Error al eliminar salida');
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex flex-wrap gap-4 w-full">
             <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-500 mb-1">Fecha</label>
                <input 
                    type="date" 
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
            </div>
            <div className="flex flex-col flex-1 max-w-xs">
                <label className="text-xs font-medium text-gray-500 mb-1">Ficha</label>
                <input 
                    type="text" 
                    placeholder="Buscar por ficha..."
                    value={fichaFilter}
                    onChange={(e) => setFichaFilter(e.target.value)}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
            </div>
            <div className="flex flex-col flex-1 max-w-xs">
                <label className="text-xs font-medium text-gray-500 mb-1">Área</label>
                <input 
                    type="text" 
                    placeholder="Buscar por área..."
                    value={areaFilter}
                    onChange={(e) => setAreaFilter(e.target.value)}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
            </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="shrink-0 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 shadow-md transition-all hover:shadow-lg mt-4 sm:mt-0"
        >
          Registrar Salida
        </button>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[600px] rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Cantidad</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Destinatario</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Ficha/Área</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            {filteredOutputs.map((output) => {
              const firstItem = output.items?.[0];
              const extraCount = Math.max(0, (output.totalProductos || output.items?.length || 0) - 1);
              return (
                <tr key={output.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(output.fecha).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    <div className="flex flex-col">
                      <span className="truncate">{firstItem?.nombreProducto || 'Salida'}</span>
                      {extraCount > 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">+ {extraCount} más</span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {output.totalCantidad}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {output.destinatarioNombre}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {output.destinatarioFicha} / {output.destinatarioArea}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedOutput(output)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                    >
                      Detalles
                    </button>
                    <button
                      onClick={() => handleDelete(output.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
             {filteredOutputs.length === 0 && (
                <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
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

      {selectedOutput && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Detalles de Salida</h2>
                    <button onClick={() => setSelectedOutput(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Productos retirados</h3>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {selectedOutput.totalProductos} producto(s) · {selectedOutput.totalCantidad} unidad(es)
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs text-gray-500 dark:text-gray-400 block">Fecha</span>
                              <span className="font-medium text-gray-900 dark:text-white">{new Date(selectedOutput.fecha).toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="mt-4 overflow-x-auto overflow-y-auto max-h-[300px] rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                              <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Producto</th>
                                  <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Cantidad</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {selectedOutput.items.map((it) => (
                                  <tr key={it.productoId}>
                                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{it.nombreProducto}</td>
                                    <td className="px-4 py-2 text-right text-sm text-gray-600 dark:text-gray-300">{it.cantidad}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Información del Destinatario</h3>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 block">Nombre</span>
                                  <span className="font-medium text-gray-900 dark:text-white">{selectedOutput.destinatarioNombre}</span>
                              </div>
                              <div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 block">Ficha</span>
                                  <span className="font-medium text-gray-900 dark:text-white">{selectedOutput.destinatarioFicha}</span>
                              </div>
                              <div className="col-span-2">
                                  <span className="text-xs text-gray-500 dark:text-gray-400 block">Área</span>
                                  <span className="font-medium text-gray-900 dark:text-white">{selectedOutput.destinatarioArea}</span>
                              </div>
                          </div>
                      </div>

                      <div>
                          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Firma Digital</h3>
                          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white flex justify-center">
                              <img src={selectedOutput.firmaDigital} alt="Firma del destinatario" className="max-h-40 object-contain" />
                          </div>
                      </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                      <button 
                        onClick={() => setSelectedOutput(null)}
                        className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      >
                        Cerrar
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
