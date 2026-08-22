import React, { useEffect, useState } from 'react';
import { axiosInstance } from '../../api/axios';
import { Package, Clock, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface OrderItem {
  id: number;
  quantity: number;
  price: string;
  product_details: {
    name: string;
    image: string | null;
  };
}

interface OrderData {
  id: number;
  order_number: string;
  total_amount: string;
  status: string;
  created_at: string;
  items: OrderItem[];
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  // Return Modal State
  const [returnItem, setReturnItem] = useState<{orderId: number, itemId: number, maxQty: number} | null>(null);
  const [returnQuantity, setReturnQuantity] = useState(1);
  const [returnReason, setReturnReason] = useState('DEFECTIVE');
  const [returnDescription, setReturnDescription] = useState('');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/orders/');
      setOrders(response.data.results || response.data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED':
      case 'PICKED_UP':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'CANCELLED':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Clock className="text-orange-500" size={20} />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'DELIVERED':
      case 'PICKED_UP':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-orange-100 text-orange-800';
    }
  };

  const submitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnItem) return;

    setIsSubmittingReturn(true);
    try {
      await axiosInstance.post('/returns/', {
        order: returnItem.orderId,
        order_item: returnItem.itemId,
        quantity: returnQuantity,
        reason: returnReason,
        description: returnDescription
      });
      alert('Return request submitted successfully!');
      setReturnItem(null);
      // Optional: Refetch orders or returns here
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit return request.');
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {location.state?.message && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-lg shadow-sm">
          {location.state.message}
        </div>
      )}
      
      <h2 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h2>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="card p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-6 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-gray-900">Order #{order.order_number}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${getStatusClass(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="mt-4 sm:mt-0 text-right">
                  <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                  <p className="text-xl font-bold text-gray-900">${order.total_amount}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product_details.image ? (
                        <img src={item.product_details.image} alt={item.product_details.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">No Image</div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-sm font-semibold text-gray-900">{item.product_details.name}</h4>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="font-medium text-gray-900 mr-4">
                      ${item.price}
                    </div>
                    {(order.status === 'DELIVERED' || order.status === 'PICKED_UP') && (
                      <button 
                        onClick={() => {
                          setReturnItem({ orderId: order.id, itemId: item.id, maxQty: item.quantity });
                          setReturnQuantity(1);
                        }}
                        className="text-sm text-primary-600 hover:text-primary-700 flex items-center border border-primary-200 px-3 py-1.5 rounded-md hover:bg-primary-50 transition-colors"
                      >
                        <RotateCcw size={16} className="mr-1.5" /> Return
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Return Modal */}
      {returnItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Request Return</h3>
            <form onSubmit={submitReturn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity to Return</label>
                <input 
                  type="number" 
                  min="1" 
                  max={returnItem.maxQty} 
                  value={returnQuantity}
                  onChange={e => setReturnQuantity(parseInt(e.target.value))}
                  className="input-field"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <select 
                  value={returnReason}
                  onChange={e => setReturnReason(e.target.value)}
                  className="input-field"
                >
                  <option value="DEFECTIVE">Defective / Damaged</option>
                  <option value="WRONG_ITEM">Wrong Item Received</option>
                  <option value="NOT_NEEDED">No Longer Needed</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea 
                  value={returnDescription}
                  onChange={e => setReturnDescription(e.target.value)}
                  className="input-field min-h-[80px]"
                  placeholder="Please provide details..."
                ></textarea>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setReturnItem(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmittingReturn}
                  className="flex-1 btn-primary"
                >
                  {isSubmittingReturn ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
