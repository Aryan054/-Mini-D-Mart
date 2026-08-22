import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../../api/axios';
import { Package, Truck, Store, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const OrderManagement: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/staff/orders/');
      setOrders(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (id: number, action: string) => {
    try {
      await axiosInstance.post(`/staff/orders/${id}/${action}/`);
      fetchOrders();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const getNextAction = (current: string, fulfillmentType: string) => {
    switch (current) {
      case 'PENDING': return 'confirm';
      case 'CONFIRMED': return 'prepare';
      case 'PROCESSING': return fulfillmentType === 'STORE_PICKUP' ? 'ready' : 'dispatch';
      case 'READY_FOR_PICKUP': return 'complete';
      case 'OUT_FOR_DELIVERY': return 'complete';
      default: return null;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'confirm': return 'Confirm Order';
      case 'prepare': return 'Start Processing';
      case 'ready': return 'Ready for Pickup';
      case 'dispatch': return 'Dispatch Delivery';
      case 'complete': return 'Mark Completed';
      default: return 'Update';
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading orders...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Operations</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pickup Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-4">
            <Store className="h-6 w-6 text-primary-600 mr-2" />
            <h3 className="text-lg font-bold text-gray-900">Store Pickup Queue</h3>
          </div>
          <div className="space-y-4">
            {orders.filter(o => o.fulfillment_type === 'STORE_PICKUP' && !['PICKED_UP', 'CANCELLED'].includes(o.status)).map(order => (
              <div key={order.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-gray-900">#{order.order_number}</div>
                  <div className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded">{order.status}</div>
                </div>
                <div className="text-sm text-gray-600 mb-3">{order.items?.length || 0} items | ${order.total_amount}</div>
                
                {getNextAction(order.status, order.fulfillment_type) && user?.role === 'STAFF' && (
                  <button 
                    onClick={() => updateOrderStatus(order.id, getNextAction(order.status, order.fulfillment_type)!)}
                    className="w-full btn-primary text-sm py-2 flex justify-center items-center"
                  >
                    {getActionLabel(getNextAction(order.status, order.fulfillment_type)!)} <ChevronRight className="ml-1 h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-4">
            <Truck className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-bold text-gray-900">Delivery Queue</h3>
          </div>
          <div className="space-y-4">
            {orders.filter(o => o.fulfillment_type === 'HOME_DELIVERY' && !['DELIVERED', 'CANCELLED'].includes(o.status)).map(order => (
              <div key={order.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-gray-900">#{order.order_number}</div>
                  <div className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded">{order.status}</div>
                </div>
                <div className="text-sm text-gray-600 mb-3">{order.items?.length || 0} items | ${order.total_amount}</div>
                
                {getNextAction(order.status, order.fulfillment_type) && user?.role === 'STAFF' && (
                  <button 
                    onClick={() => {
                      const next = getNextAction(order.status, order.fulfillment_type);
                      if (next) updateOrderStatus(order.id, next);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm py-2 flex justify-center items-center transition-colors"
                  >
                    {getActionLabel(getNextAction(order.status, order.fulfillment_type)!)} <ChevronRight className="ml-1 h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
