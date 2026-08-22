import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../../api/axios';
import { PackageSearch, Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ProductManagement: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '', sku: '', price: '', category: '', brand: '', unit: '', description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        axiosInstance.get('/products/'),
        axiosInstance.get('/categories/')
      ]);
      setProducts(prodRes.data.results || prodRes.data);
      setCategories(catRes.data.results || catRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', sku: '', price: '', category: categories[0]?.id || '', brand: '', unit: '', description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price,
      category: product.category,
      brand: product.brand || '',
      unit: product.unit || '',
      description: product.description || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axiosInstance.patch(`/products/${editingId}/`, formData);
      } else {
        await axiosInstance.post('/products/', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axiosInstance.delete(`/products/${id}/`);
        fetchData();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading products...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
        {user?.role === 'MANAGER' && (
          <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Add Product
          </button>
        )}
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 overflow-hidden">
                      {p.image ? <img src={p.image} alt={p.name} className="h-full w-full object-cover" /> : <ImageIcon size={20} />}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{p.name}</div>
                      <div className="text-sm text-gray-500">SKU: {p.sku} | Brand: {p.brand || 'N/A'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-medium">${p.price}</div>
                  <div className="text-xs text-gray-500">Unit: {p.unit || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {p.category_name}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {user?.role === 'MANAGER' && (
                    <>
                      <button onClick={() => openEditModal(p)} className="text-primary-600 hover:text-primary-900 mx-2 p-1 bg-primary-50 rounded hover:bg-primary-100 transition-colors">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-900 mx-2 p-1 bg-red-50 rounded hover:bg-red-100 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  <PackageSearch className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  No products found. Add some!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{editingId ? 'Edit Product' : 'Add Product'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input type="text" name="sku" value={formData.sku} onChange={handleInputChange} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="input-field" required>
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit (e.g. 1 kg)</label>
                  <input type="text" name="unit" value={formData.unit} onChange={handleInputChange} className="input-field" />
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} className="input-field min-h-[80px]"></textarea>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  {editingId ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
