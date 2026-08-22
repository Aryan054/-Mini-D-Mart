import React, { useEffect, useState } from 'react';
import { axiosInstance } from '../../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';

interface CartItem {
  id: number;
  quantity: number;
  item_total: number;
  product_details: {
    id: number;
    name: string;
    price: string;
    discount_price: string | null;
    image: string | null;
  };
}

interface CartData {
  id: number;
  items: CartItem[];
  subtotal: number;
  discount: number;
  delivery_fee: number;
  grand_total: number;
}

const Cart: React.FC = () => {
  const [cart, setCart] = useState<CartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const response = await axiosInstance.get('/cart/');
      setCart(response.data);
    } catch (error) {
      console.error("Failed to fetch cart", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await axiosInstance.patch(`/cart/items/${itemId}/`, { quantity: newQuantity });
      fetchCart();
    } catch (error) {
      console.error("Failed to update quantity", error);
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      await axiosInstance.delete(`/cart/items/${itemId}/`);
      fetchCart();
    } catch (error) {
      console.error("Failed to remove item", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/products" className="btn-primary">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="card p-4 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {item.product_details.image ? (
                  <img src={item.product_details.image} alt={item.product_details.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                )}
              </div>
              
              <div className="flex-grow text-center sm:text-left">
                <h3 className="text-lg font-semibold text-gray-900">{item.product_details.name}</h3>
                <div className="text-primary-600 font-bold mt-1">
                  ${item.product_details.discount_price || item.product_details.price}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-2 hover:bg-gray-100 transition-colors text-gray-600"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center font-medium">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-2 hover:bg-gray-100 transition-colors text-gray-600"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                
                <div className="font-bold text-gray-900 w-20 text-right">
                  ${item.item_total.toFixed(2)}
                </div>
                
                <button 
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div>
          <div className="card p-6 sticky top-20">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
            
            <div className="space-y-3 text-sm text-gray-600 border-b border-gray-100 pb-4 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">${cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-secondary-600">
                <span>Discount</span>
                <span className="font-medium">-${cart.discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-medium text-gray-900">${cart.delivery_fee.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-primary-600">${cart.grand_total.toFixed(2)}</span>
            </div>
            
            <button 
              onClick={() => navigate('/checkout')}
              className="w-full btn-primary py-3 text-lg"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
