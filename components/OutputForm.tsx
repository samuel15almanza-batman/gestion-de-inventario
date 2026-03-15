'use client';

import { useState, useRef } from 'react';
import { Product } from '@/models/Product';
import { Output } from '@/models/Output';
import axios from 'axios';
import SignatureCanvas from 'react-signature-canvas';

interface OutputFormProps {
  products: Product[];
  onSuccess: (output: Output) => void;
  onCancel: () => void;
}

export default function OutputForm({ products, onSuccess, onCancel }: OutputFormProps) {
  const [formData, setFormData] = useState({
    productoId: '',
    cantidad: 1,
    destinatarioNombre: '',
    destinatarioFicha: '',
    destinatarioArea: ''
  });
  const [loading, setLoading] = useState(false);
  const sigCanvas = useRef<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
        alert('Por favor, firme la entrega.');
        return;
    }
    
    setLoading(true);
    try {
      const signatureData = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
      
      const payload = {
          ...formData,
          firmaDigital: signatureData
      };

      const response = await axios.post('/api/outputs', payload);
      onSuccess(response.data);
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.error || 'Error al registrar salida');
    } finally {
      setLoading(false);
    }
  };
  
  const selectedProduct = products.find(p => p.id === formData.productoId);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Producto</label>
        <select
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          value={formData.productoId}
          onChange={(e) => setFormData({...formData, productoId: e.target.value})}
        >
            <option value="">Seleccione un producto</option>
            {products.map(p => (
                <option key={p.id} value={p.id} disabled={p.cantidad <= 0}>
                    {p.nombre} (Stock: {p.cantidad})
                </option>
            ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cantidad</label>
        <input
          type="number"
          required
          min="1"
          max={selectedProduct?.cantidad || 1}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          value={formData.cantidad}
          onChange={(e) => setFormData({...formData, cantidad: Number(e.target.value)})}
        />
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
          disabled={loading}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Registrando...' : 'Registrar Salida'}
        </button>
      </div>
    </form>
  );
}
