import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../api/axios';
import { ArrowLeft, ShoppingCart, Tag, Check, PackageX } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [inventory, setInventory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axiosInstance.get(`/products/${id}/`);
        setProduct(response.data);
        
        // Also fetch inventory for this product if staff/admin, or we can just rely on stock count if public
        // Actually, the product serializer returns 'stock_count' explicitly via a SerializerMethodField if configured!
      } catch (err) {
        console.error('Failed to load product', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setIsAdding(true);
    setAddSuccess(false);
    try {
      await axiosInstance.post('/cart/items/', {
        product_id: product.id,
        quantity: quantity
      });
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) return <div className="p-12 text-center text-gray-500">Loading product details...</div>;
  if (!product) return <div className="p-12 text-center text-gray-500">Product not found.</div>;

  const isOutOfStock = product.stock_count !== undefined && product.stock_count <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button 
        onClick={() => navigate('/products')}
        className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Products
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Placeholder */}
          <div className="bg-gray-50 p-12 flex items-center justify-center min-h-[400px]">
             {product.image ? (
               <img src={product.image} alt={product.name} className="max-w-full h-auto object-contain drop-shadow-md rounded-xl" />
             ) : (
               <div className="text-gray-300 flex flex-col items-center">
                 <Tag className="h-24 w-24 mb-4 opacity-50" />
                 <span className="text-lg font-medium">No Image Available</span>
               </div>
             )}
          </div>

          {/* Details */}
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            <div className="uppercase tracking-wide text-sm text-primary-600 font-semibold mb-2">
              {product.category_name || 'Category'}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">{product.name}</h1>
            <p className="text-gray-500 text-base leading-relaxed mb-6">
              {product.description || 'No description available for this product.'}
            </p>
            
            <div className="flex items-baseline mb-8">
              <span className="text-4xl font-black text-gray-900">${product.price}</span>
              {product.discount_price && (
                <span className="ml-3 text-lg text-gray-400 line-through">${product.discount_price}</span>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-8">
               {isOutOfStock ? (
                  <div className="flex items-center text-red-600 font-medium bg-red-50 w-max px-3 py-1.5 rounded-full text-sm">
                    <PackageX className="h-4 w-4 mr-2" /> Out of Stock
                  </div>
               ) : (
                  <div className="flex items-center text-green-600 font-medium bg-green-50 w-max px-3 py-1.5 rounded-full text-sm">
                    <Check className="h-4 w-4 mr-2" /> In Stock {product.stock_count !== undefined ? `(${product.stock_count} available)` : ''}
                  </div>
               )}
            </div>

            {user?.role !== 'ADMIN' && (
              <div className="flex items-center space-x-4 border-t border-gray-100 pt-8">
                <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary-600 font-medium transition-colors"
                    disabled={isOutOfStock}
                  >
                    -
                  </button>
                  <span className="px-4 py-3 font-semibold text-gray-900 min-w-[3rem] text-center">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary-600 font-medium transition-colors"
                    disabled={isOutOfStock || (product.stock_count !== undefined && quantity >= product.stock_count)}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={isAdding || isOutOfStock}
                  className={`flex-1 flex justify-center items-center px-8 py-3.5 border border-transparent rounded-lg text-base font-medium text-white transition-all
                    ${isOutOfStock ? 'bg-gray-400 cursor-not-allowed' : addSuccess ? 'bg-green-500' : 'bg-primary-600 hover:bg-primary-700 hover:shadow-lg'}`}
                >
                  {addSuccess ? (
                    <>
                      <Check className="h-5 w-5 mr-2" /> Added
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" /> {isAdding ? 'Adding...' : 'Add to Cart'}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
