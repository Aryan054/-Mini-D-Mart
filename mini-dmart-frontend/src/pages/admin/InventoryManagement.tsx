import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../../api/axios';
import { AlertOctagon, TrendingDown, ArrowUpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const InventoryManagement: React.FC = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adjustingId, setAdjustingId] = useState<number | null>(null);
  const [adjustmentValue, setAdjustmentValue] = useState(0);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/inventory/');
      setInventory(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch inventory', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdjustStock = async (id: number) => {
    if (adjustmentValue === 0) {
      setAdjustingId(null);
      return;
    }

    try {
      const item = inventory.find(i => i.id === id);
      const newQuantity = Math.max(0, item.available_quantity + adjustmentValue);
      await axiosInstance.patch(`/inventory/${id}/`, {
        available_quantity: newQuantity
      });
      setAdjustingId(null);
      setAdjustmentValue(0);
      fetchInventory(); // Refresh data
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to adjust stock');
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading inventory...</div>;

  const lowStockItems = inventory.filter(i => i.available_quantity <= i.low_stock_threshold);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Inventory Management</h2>
      
      {lowStockItems.length > 0 && (
        <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center mb-3">
            <AlertOctagon className="h-6 w-6 text-red-500 mr-2" />
            <h3 className="text-lg font-bold text-red-800">Low Stock Alerts ({lowStockItems.length})</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {lowStockItems.slice(0, 3).map(item => (
              <div key={item.id} className="bg-white p-3 rounded-lg border border-red-100 flex justify-between items-center">
                <span className="font-medium text-gray-900 truncate pr-2">{item.product_name}</span>
                <span className="text-red-600 font-bold bg-red-100 px-2 py-0.5 rounded text-sm">{item.available_quantity} left</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Level</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inventory.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.product_name}</div>
                  <div className="text-sm text-gray-500">Threshold: {item.low_stock_threshold}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`text-sm font-bold ${item.available_quantity <= item.low_stock_threshold ? 'text-red-600' : 'text-green-600'}`}>
                      {item.available_quantity}
                    </span>
                    {item.available_quantity <= item.low_stock_threshold && (
                      <TrendingDown className="h-4 w-4 ml-2 text-red-500" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {(user?.role === 'MANAGER' || user?.role === 'ADMIN') && (
                    adjustingId === item.id ? (
                      <div className="flex items-center justify-end space-x-2">
                        <input 
                          type="number" 
                          value={adjustmentValue}
                          onChange={(e) => setAdjustmentValue(parseInt(e.target.value) || 0)}
                          className="w-20 p-1 border rounded text-center"
                          placeholder="+/-"
                        />
                        <button onClick={() => handleAdjustStock(item.id)} className="text-green-600 hover:text-green-900 bg-green-50 px-2 py-1 rounded border border-green-200">Save</button>
                        <button onClick={() => setAdjustingId(null)} className="text-gray-500 hover:text-gray-700 bg-gray-100 px-2 py-1 rounded">Cancel</button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => { setAdjustingId(item.id); setAdjustmentValue(0); }} 
                        className="text-primary-600 hover:text-primary-900 flex items-center justify-end w-full"
                      >
                        <ArrowUpCircle className="h-4 w-4 mr-1" /> Adjust
                      </button>
                    )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryManagement;
