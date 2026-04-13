'use client';

import { useState } from 'react';
import { Product } from '@/modules/inventory/models/Product';
import axios from 'axios';

interface ProductFormProps {
  initialData?: Product;
  onSuccess: (product: Product, isEdit: boolean) => void;
  onCancel: () => void;
}

export default function ProductForm({ initialData, onSuccess, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || '',
    descripcion: initialData?.descripcion || '',
    cantidad: initialData?.cantidad || 0,
    precio: initialData?.precio || 0,
    categoria: initialData?.categoria || '',
    fecha_entrada: initialData?.fecha_entrada 
      ? new Date(initialData.fecha_entrada).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initialData?.id) {
        // Edit existing product
        const response = await axios.put(`/api/products/${initialData.id}`, formData);
        onSuccess(response.data, true);
      } else {
        // Create new product
        const response = await axios.post('/api/products', formData);
        onSuccess(response.data, false);
      }
    } catch (error) {
      console.error(error);
      alert(`Error al ${initialData ? 'actualizar' : 'crear'} producto`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
        <input
          type="text"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          value={formData.nombre}
          onChange={(e) => setFormData({...formData, nombre: e.target.value})}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
        <textarea
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          value={formData.descripcion}
          onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cantidad</label>
            <input
            type="number"
            required
            min="0"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={formData.cantidad}
            onChange={(e) => setFormData({...formData, cantidad: Number(e.target.value)})}
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Precio</label>
            <input
            type="number"
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={formData.precio}
            onChange={(e) => setFormData({...formData, precio: Number(e.target.value)})}
            />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoría</label>
        <input
          type="text"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          value={formData.categoria}
          onChange={(e) => setFormData({...formData, categoria: e.target.value})}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Entrada</label>
        <input
          type="date"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          value={formData.fecha_entrada}
          onChange={(e) => setFormData({...formData, fecha_entrada: e.target.value})}
        />
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
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
