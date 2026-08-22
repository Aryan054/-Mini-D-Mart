import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { axiosInstance } from '../api/axios';
import { ShoppingCart, User as UserIcon, LogOut, LayoutDashboard } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [cartCount, setCartCount] = React.useState(0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  React.useEffect(() => {
    if (isAuthenticated && user?.role === 'CUSTOMER') {
      const fetchCart = async () => {
        try {
          const response = await axiosInstance.get('/cart/');
          const count = response.data.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
          setCartCount(count);
        } catch (error) {
          console.error("Failed to fetch cart", error);
        }
      };
      fetchCart();
      // Optional polling for a mini project to keep count updated without global context
      const interval = setInterval(fetchCart, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">Mini D-Mart</span>
            </Link>
            
            {/* Desktop Menu */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <Link to="/products" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Products
              </Link>
              {isAuthenticated && (
                <Link to="/orders" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  My Orders
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {/* Cart Icon */}
                {user?.role === 'CUSTOMER' && (
                  <Link to="/cart" className="text-gray-500 hover:text-primary-600 p-2 rounded-full hover:bg-gray-50 transition-colors relative">
                    <ShoppingCart size={20} />
                    {cartCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                )}
                
                {/* Dashboard Link for Staff/Admin */}
                {['STAFF', 'MANAGER', 'ADMIN'].includes(user?.role || '') && (
                  <Link to="/dashboard" className="text-gray-500 hover:text-primary-600 p-2 rounded-full hover:bg-gray-50 transition-colors">
                    <LayoutDashboard size={20} />
                  </Link>
                )}

                {/* Profile Link and Logout */}
                <div className="relative flex items-center gap-3 ml-2 border-l border-gray-200 pl-4">
                  <Link to="/profile" className="flex flex-col text-right hidden sm:block hover:text-primary-600 transition-colors">
                    <span className="text-sm font-medium text-gray-900">{user?.first_name} {user?.last_name}</span>
                    <span className="text-xs text-gray-500">{user?.role}</span>
                  </Link>
                  <Link to="/profile" className="text-gray-500 hover:text-primary-600 p-2 rounded-full hover:bg-primary-50 transition-colors" title="Profile">
                    <UserIcon size={20} />
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
