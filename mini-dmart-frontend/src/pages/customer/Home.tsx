import React, { useEffect, useState } from 'react';
import { axiosInstance } from '../../api/axios';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  price: string;
  discount_price: string | null;
  image: string | null;
}

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get('/products/');
        setProducts(response.data.results || response.data);
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <div className="bg-primary-900 rounded-2xl p-8 mb-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Fresh Groceries, Delivered to You.</h1>
          <p className="text-lg text-primary-100 mb-8">Shop the best quality products at Mini D-Mart with exclusive discounts.</p>
          <button className="bg-white text-primary-900 font-bold py-3 px-6 rounded-lg shadow-md hover:bg-gray-100 transition-colors">
            Shop Now
          </button>
        </div>
      </div>

      <div className="flex justify-between items-end mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
        <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium text-sm">View All &rarr;</Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="card hover-lift flex flex-col h-full">
              <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">
                    No Image
                  </div>
                )}
                {product.discount_price && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    Sale
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-2">SKU: {product.sku}</p>
                <div className="mt-auto flex items-center justify-between">
                  <div>
                    {product.discount_price ? (
                      <>
                        <span className="text-lg font-bold text-gray-900">${product.discount_price}</span>
                        <span className="text-sm text-gray-500 line-through ml-2">${product.price}</span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">${product.price}</span>
                    )}
                  </div>
                  <button className="bg-primary-50 text-primary-600 p-2 rounded-lg hover:bg-primary-100 transition-colors">
                    <ShoppingCart size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
