'use client';

import { useState } from 'react';
import { Product } from '@/modules/inventory/models/Product';
import ProductForm from './ProductForm';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface ProductListProps {
  initialProducts: Product[];
}

export default function ProductList({ initialProducts }: ProductListProps) {
  const [products, setProducts] = useState(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [maxPriceFilter, setMaxPriceFilter] = useState('');
  const [minQuantityFilter, setMinQuantityFilter] = useState('');
  const router = useRouter();

  const categories = Array.from(new Set(initialProducts.map(p => p.categoria))).filter(Boolean);

  const filteredProducts = products.filter(product => {
    const matchesCategory = categoryFilter ? product.categoria === categoryFilter : true;
    const matchesPrice = maxPriceFilter ? product.precio <= Number(maxPriceFilter) : true;
    const matchesQuantity = minQuantityFilter ? product.cantidad >= Number(minQuantityFilter) : true;
    return matchesCategory && matchesPrice && matchesQuantity;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
        await axios.delete(`/api/products/${id}`);
        setProducts(products.filter(p => p.id !== id));
        router.refresh();
    } catch (error: any) {
        console.error(error);
        if (error.response?.data?.error) {
          alert(error.response.data.error);
        } else {
          alert('Error al eliminar');
        }
    }
  };

  const handleProductAdded = (savedProduct: Product, isEdit: boolean) => {
      if (isEdit) {
        setProducts(products.map(p => p.id === savedProduct.id ? savedProduct : p));
        alert('Producto actualizado con éxito');
      } else {
        setProducts([...products, savedProduct]);
      }
      setIsModalOpen(false);
      setEditingProduct(undefined);
      router.refresh();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(undefined);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex flex-wrap gap-4 w-full">
            <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-500 mb-1">Categoría</label>
                <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                    <option value="">Todas</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
            <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-500 mb-1">Precio Máx ($)</label>
                <input 
                    type="number" 
                    placeholder="0.00"
                    value={maxPriceFilter}
                    onChange={(e) => setMaxPriceFilter(e.target.value)}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white w-24"
                />
            </div>
            <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-500 mb-1">Cant. Mínima</label>
                <input 
                    type="number" 
                    placeholder="0"
                    value={minQuantityFilter}
                    onChange={(e) => setMinQuantityFilter(e.target.value)}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white w-24"
                />
            </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="shrink-0 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 shadow-md transition-all hover:shadow-lg mt-4 sm:mt-0"
        >
          Agregar Producto
        </button>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[600px] rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Cantidad</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Fecha Ingreso</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{product.nombre}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{product.descripcion}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{product.categoria}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">${product.precio}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{product.cantidad}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {product.fecha_entrada ? new Date(product.fecha_entrada).toLocaleDateString() : '-'}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <button onClick={() => handleEdit(product)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        No hay productos registrados.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800 animate-in fade-in zoom-in duration-200">
                  <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                    {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                  </h2>
                  <ProductForm 
                    initialData={editingProduct}
                    onSuccess={handleProductAdded} 
                    onCancel={handleCloseModal} 
                  />
              </div>
          </div>
      )}
    </div>
  );
}
