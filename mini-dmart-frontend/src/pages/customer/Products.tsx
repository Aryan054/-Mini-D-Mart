import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../api/axios';
import { ShoppingCart, Search, Filter, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Products: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/categories/');
        setCategories(response.data.results || response.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        let url = '/products/';
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (selectedCategory) params.append('category', selectedCategory);
        
        const response = await axiosInstance.get(`${url}?${params.toString()}`);
        setProducts(response.data.results || response.data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Add a slight debounce for search
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  const [addedItems, setAddedItems] = useState<number[]>([]);

  const handleAddToCart = async (e: React.MouseEvent, productId: number) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    
    setAddingToCart(productId);
    try {
      await axiosInstance.post('/cart/items/', {
        product_id: productId,
        quantity: 1
      });
      setAddedItems(prev => [...prev, productId]);
      setTimeout(() => {
        setAddedItems(prev => prev.filter(id => id !== productId));
      }, 2000);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  const handleProductClick = (id: number) => {
    navigate(`/products/${id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Our Products</h1>
          <p className="mt-2 text-sm text-gray-500">Discover our wide range of groceries and essentials.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 input-field min-w-[250px]"
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 input-field min-w-[180px] appearance-none"
            >
              <option value="">All Categories</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse h-80">
              <div className="bg-gray-200 h-48 rounded-xl mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
          <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div 
              key={product.id} 
              onClick={() => handleProductClick(product.id)}
              className="product-card cursor-pointer group"
            >
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-xl bg-gray-50 mb-4 relative">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-gray-100 text-gray-400 group-hover:scale-105 transition-transform duration-300">
                    No image
                  </div>
                )}
                {product.discount_price && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                    SALE
                  </div>
                )}
              </div>
              
              <div className="px-1">
                <div className="text-xs font-semibold text-primary-600 mb-1 uppercase tracking-wider">{product.category_name}</div>
                <h3 className="text-base font-medium text-gray-900 line-clamp-1">{product.name}</h3>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
                
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-baseline space-x-2">
                    <p className="text-lg font-bold text-gray-900">${product.price}</p>
                    {product.discount_price && (
                      <p className="text-sm font-medium text-gray-400 line-through">${product.discount_price}</p>
                    )}
                  </div>
                  
                  {user?.role !== 'ADMIN' && (
                    <button
                      onClick={(e) => handleAddToCart(e, product.id)}
                      disabled={addingToCart === product.id}
                      className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50
                        ${addedItems.includes(product.id) ? 'bg-green-100 text-green-600' : 'bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white'}`}
                    >
                      {addedItems.includes(product.id) ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <ShoppingCart className="h-5 w-5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
