'use client';

import { useState, useRef } from 'react';
import { Product } from '@/modules/inventory/models/Product';
import { Output } from '@/modules/outputs/models/Output';
import axios, { AxiosError } from 'axios';
import SignatureCanvas from 'react-signature-canvas';

interface OutputFormProps {
  products: Product[];
  onSuccess: (output: Output) => void;
  onCancel: () => void;
}

export default function OutputForm({ products, onSuccess, onCancel }: OutputFormProps) {
  const [formData, setFormData] = useState({
    destinatarioNombre: '',
    destinatarioFicha: '',
    destinatarioArea: ''
  });
  const [selectedProductId, setSelectedProductId] = useState('');
  const [items, setItems] = useState<Array<{ productoId: string; cantidad: number }>>([]);
  const [loading, setLoading] = useState(false);
  const sigCanvas = useRef<SignatureCanvas | null>(null);

  const addSelectedProduct = () => {
    if (!selectedProductId) return;
    setItems((prev) => {
      if (prev.some(i => i.productoId === selectedProductId)) {
        return prev;
      }
      return [...prev, { productoId: selectedProductId, cantidad: 1 }];
    });
    setSelectedProductId('');
  };

  const updateCantidad = (productoId: string, cantidad: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.productoId === productoId ? { ...i, cantidad: Number.isFinite(cantidad) ? cantidad : 0 } : i
      )
    );
  };

  const removeItem = (productoId: string) => {
    setItems((prev) => prev.filter((i) => i.productoId !== productoId));
  };

  const itemErrors = items
    .map((i) => {
      const product = products.find(p => p.id === i.productoId);
      if (!product) return 'Producto no encontrado en la lista';
      if (i.cantidad <= 0) return `Cantidad inválida para "${product.nombre}"`;
      if (i.cantidad > product.cantidad) return `Stock insuficiente para "${product.nombre}". Disponible: ${product.cantidad}`;
      return null;
    })
    .filter(Boolean) as string[];

  const totalProductos = items.length;
  const totalCantidad = items.reduce((acc, it) => acc + (Number(it.cantidad) || 0), 0);
  const canSubmit = !loading && items.length > 0 && itemErrors.length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
        alert('Por favor, firme la entrega.');
        return;
    }

    if (items.length === 0) {
      alert('Debe agregar al menos un producto a la salida.');
      return;
    }

    if (itemErrors.length > 0) {
      alert(itemErrors[0]);
      return;
    }
    
    setLoading(true);
    try {
      const signatureData = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');
      if (!signatureData) {
        alert('No se pudo capturar la firma. Intenta nuevamente.');
        return;
      }
      
      const payload = {
          ...formData,
          items,
          firmaDigital: signatureData
      };

      const response = await axios.post('/api/outputs', payload);
      onSuccess(response.data);
    } catch (error: unknown) {
      console.error(error);
      const axiosError = error as AxiosError<{ error?: string }>;
      alert(axiosError.response?.data?.error || 'Error al registrar salida');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Producto</label>
        <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
          <select
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
              <option value="">Seleccione un producto</option>
              {products.map(p => (
                  <option key={p.id} value={p.id} disabled={p.cantidad <= 0}>
                      {p.nombre} (Stock: {p.cantidad})
                  </option>
              ))}
          </select>
          <button
            type="button"
            onClick={addSelectedProduct}
            disabled={!selectedProductId}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Agregar
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Productos a retirar</h3>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {totalProductos} producto(s) · {totalCantidad} unidad(es)
          </div>
        </div>

        {items.length === 0 ? (
          <div className="mt-3 rounded-md bg-gray-50 p-3 text-sm text-gray-600 dark:bg-gray-700/40 dark:text-gray-300">
            Agrega uno o más productos desde el selector.
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {items.map((it) => {
              const product = products.find(p => p.id === it.productoId);
              const max = product?.cantidad ?? 0;
              const invalid = !product || it.cantidad <= 0 || it.cantidad > max;
              return (
                <div key={it.productoId} className="flex flex-col gap-2 rounded-md border border-gray-200 p-3 dark:border-gray-700 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      {product?.nombre || 'Producto'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Stock disponible: {max}
                    </div>
                    {invalid && (
                      <div className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {product
                          ? it.cantidad <= 0
                            ? 'La cantidad debe ser mayor a 0.'
                            : `La cantidad supera el stock disponible (${max}).`
                          : 'Producto no encontrado.'}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Cantidad</label>
                    <input
                      type="number"
                      min={1}
                      max={Math.max(1, max)}
                      value={it.cantidad}
                      onChange={(e) => updateCantidad(it.productoId, Number(e.target.value))}
                      className="w-24 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(it.productoId)}
                      className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {itemErrors.length > 0 && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
            {itemErrors[0]}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Destinatario</label>
            <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={formData.destinatarioNombre}
            onChange={(e) => setFormData({...formData, destinatarioNombre: e.target.value})}
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ficha</label>
            <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={formData.destinatarioFicha}
            onChange={(e) => setFormData({...formData, destinatarioFicha: e.target.value})}
            />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Área</label>
        <input
          type="text"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          value={formData.destinatarioArea}
          onChange={(e) => setFormData({...formData, destinatarioArea: e.target.value})}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Firma Digital</label>
        <div className="border border-gray-300 rounded-md overflow-hidden dark:border-gray-600 bg-white">
            <SignatureCanvas 
                ref={sigCanvas}
                canvasProps={{width: 400, height: 150, className: 'sigCanvas w-full'}} 
                backgroundColor="rgb(255, 255, 255)"
            />
        </div>
        <button 
            type="button" 
            onClick={() => sigCanvas.current?.clear()}
            className="mt-1 text-xs text-indigo-600 hover:text-indigo-800"
        >
            Limpiar firma
        </button>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Registrando...' : 'Registrar Salida'}
        </button>
      </div>
    </form>
  );
}
