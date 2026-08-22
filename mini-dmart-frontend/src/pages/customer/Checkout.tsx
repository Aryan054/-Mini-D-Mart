import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../api/axios';
import { MapPin, Store } from 'lucide-react';

interface StoreData {
  id: number;
  name: string;
  address: string;
}

const Checkout: React.FC = () => {
  const [fulfillmentType, setFulfillmentType] = useState<'HOME_DELIVERY' | 'STORE_PICKUP'>('HOME_DELIVERY');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [stores, setStores] = useState<StoreData[]>([]);
  const [selectedStore, setSelectedStore] = useState<number | ''>('');
  const [scheduledDate, setScheduledDate] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (fulfillmentType === 'STORE_PICKUP' && stores.length === 0) {
      axiosInstance.get('/stores/')
        .then(res => setStores(res.data.results || res.data))
        .catch(err => console.error("Failed to fetch stores", err));
    }
  }, [fulfillmentType, stores.length]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const payload: any = {
      fulfillment_type: fulfillmentType,
    };

    if (fulfillmentType === 'HOME_DELIVERY') {
      if (!deliveryAddress) {
        setError("Delivery address is required.");
        setIsLoading(false);
        return;
      }
      payload.delivery_address = deliveryAddress;
    } else {
      if (!selectedStore || !scheduledDate) {
        setError("Store and pickup date are required.");
        setIsLoading(false);
        return;
      }
      payload.pickup_store = selectedStore;
      payload.scheduled_date = scheduledDate;
    }

    try {
      const response = await axiosInstance.post('/orders/', payload);
      if (response.data.success) {
        navigate('/orders', { state: { message: "Order placed successfully!" } });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Checkout failed. Ensure your cart is not empty and items are in stock.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleCheckout} className="card p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Delivery Method</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <label className={`border-2 rounded-xl p-4 cursor-pointer flex flex-col items-center gap-3 transition-colors ${fulfillmentType === 'HOME_DELIVERY' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}>
            <input 
              type="radio" 
              className="sr-only" 
              name="fulfillment_type" 
              value="HOME_DELIVERY"
              checked={fulfillmentType === 'HOME_DELIVERY'}
              onChange={() => setFulfillmentType('HOME_DELIVERY')}
            />
            <div className={`p-3 rounded-full ${fulfillmentType === 'HOME_DELIVERY' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}`}>
              <MapPin size={24} />
            </div>
            <span className="font-semibold text-gray-900">Home Delivery</span>
          </label>

          <label className={`border-2 rounded-xl p-4 cursor-pointer flex flex-col items-center gap-3 transition-colors ${fulfillmentType === 'STORE_PICKUP' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}>
            <input 
              type="radio" 
              className="sr-only" 
              name="fulfillment_type" 
              value="STORE_PICKUP"
              checked={fulfillmentType === 'STORE_PICKUP'}
              onChange={() => setFulfillmentType('STORE_PICKUP')}
            />
            <div className={`p-3 rounded-full ${fulfillmentType === 'STORE_PICKUP' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}`}>
              <Store size={24} />
            </div>
            <span className="font-semibold text-gray-900">Store Pickup</span>
          </label>
        </div>

        {fulfillmentType === 'HOME_DELIVERY' ? (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Shipping Address</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
              <textarea 
                className="input-field" 
                rows={3} 
                placeholder="123 Main St, Apt 4B, New York, NY 10001"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                required
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Pickup Details</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Store</label>
              <select 
                className="input-field"
                value={selectedStore}
                onChange={(e) => setSelectedStore(Number(e.target.value))}
                required
              >
                <option value="" disabled>-- Select a store near you --</option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>{store.name} - {store.address}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date</label>
              <input 
                type="date" 
                className="input-field" 
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>
        )}

        <div className="mt-10 border-t border-gray-100 pt-6">
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full btn-primary py-4 text-lg font-bold"
          >
            {isLoading ? 'Processing Order...' : 'Confirm Order & Pay'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
