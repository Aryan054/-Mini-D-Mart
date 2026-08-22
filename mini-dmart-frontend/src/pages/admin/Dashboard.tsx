import React, { useEffect, useState } from 'react';
import { axiosInstance } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Users, Package, ShoppingBag, AlertTriangle, DollarSign, CheckCircle, MapPin } from 'lucide-react';

import OrderManagement from './OrderManagement';
import ReturnsManagement from './ReturnsManagement';
import InventoryManagement from './InventoryManagement';
import UserManagement from './UserManagement';
import ProductManagement from './ProductManagement';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        let endpoint = '/dashboard/staff/';
        if (user?.role === 'MANAGER') endpoint = '/dashboard/manager/';
        if (user?.role === 'ADMIN') endpoint = '/dashboard/admin/';
        
        const response = await axiosInstance.get(endpoint);
        setData(response.data.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) fetchAnalytics();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const renderStaffDashboard = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="card p-6 flex items-center gap-4 border-l-4 border-blue-500">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><ShoppingBag size={24} /></div>
        <div><p className="text-sm text-gray-500">Today's Orders</p><h3 className="text-2xl font-bold">{data?.today_orders || 0}</h3></div>
      </div>
      <div className="card p-6 flex items-center gap-4 border-l-4 border-orange-500">
        <div className="p-3 bg-orange-100 text-orange-600 rounded-lg"><Package size={24} /></div>
        <div><p className="text-sm text-gray-500">Pending Orders</p><h3 className="text-2xl font-bold">{data?.pending_orders || 0}</h3></div>
      </div>
      <div className="card p-6 flex items-center gap-4 border-l-4 border-green-500">
        <div className="p-3 bg-green-100 text-green-600 rounded-lg"><CheckCircle size={24} /></div>
        <div><p className="text-sm text-gray-500">Ready for Pickup</p><h3 className="text-2xl font-bold">{data?.ready_for_pickup || 0}</h3></div>
      </div>
      <div className="card p-6 flex items-center gap-4 border-l-4 border-purple-500">
        <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><MapPin size={24} /></div>
        <div><p className="text-sm text-gray-500">Delivery Queue</p><h3 className="text-2xl font-bold">{data?.delivery_orders || 0}</h3></div>
      </div>
    </div>
  );

  const renderManagerDashboard = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="card p-6 flex items-center gap-4 border-l-4 border-green-500">
        <div className="p-3 bg-green-100 text-green-600 rounded-lg"><DollarSign size={24} /></div>
        <div><p className="text-sm text-gray-500">Total Sales</p><h3 className="text-2xl font-bold">${data?.total_sales || 0}</h3></div>
      </div>
      <div className="card p-6 flex items-center gap-4 border-l-4 border-blue-500">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><ShoppingBag size={24} /></div>
        <div><p className="text-sm text-gray-500">Total Orders</p><h3 className="text-2xl font-bold">{data?.total_orders || 0}</h3></div>
      </div>
      <div className="card p-6 flex items-center gap-4 border-l-4 border-red-500">
        <div className="p-3 bg-red-100 text-red-600 rounded-lg"><AlertTriangle size={24} /></div>
        <div><p className="text-sm text-gray-500">Pending Returns</p><h3 className="text-2xl font-bold">{data?.pending_returns || 0}</h3></div>
      </div>
      <div className="card p-6 flex items-center gap-4 border-l-4 border-orange-500">
        <div className="p-3 bg-orange-100 text-orange-600 rounded-lg"><Package size={24} /></div>
        <div><p className="text-sm text-gray-500">Low Stock Products</p><h3 className="text-2xl font-bold">{data?.low_stock_products || 0}</h3></div>
      </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      <div className="card p-6 flex items-center gap-4 border-l-4 border-blue-500">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Users size={24} /></div>
        <div><p className="text-sm text-gray-500">Total Users</p><h3 className="text-2xl font-bold">{data?.total_users || 0}</h3></div>
      </div>
      <div className="card p-6 flex items-center gap-4 border-l-4 border-purple-500">
        <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><Users size={24} /></div>
        <div><p className="text-sm text-gray-500">Staff & Managers</p><h3 className="text-2xl font-bold">{data?.staff_users || 0}</h3></div>
      </div>
      <div className="card p-6 flex items-center gap-4 border-l-4 border-green-500">
        <div className="p-3 bg-green-100 text-green-600 rounded-lg"><Package size={24} /></div>
        <div><p className="text-sm text-gray-500">Total Products</p><h3 className="text-2xl font-bold">{data?.total_products || 0}</h3></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500">Welcome back, {user?.first_name}.</p>
        </div>
        
        {/* Navigation Tabs for Staff/Managers/Admins */}
        {['STAFF', 'MANAGER', 'ADMIN'].includes(user?.role || '') && (
          <div className="mt-4 md:mt-0 flex space-x-2 bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('overview')} 
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'overview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('orders')} 
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'orders' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Orders
            </button>
            <button 
              onClick={() => setActiveTab('returns')} 
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'returns' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Returns
            </button>
            <button 
              onClick={() => setActiveTab('inventory')} 
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'inventory' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Inventory
            </button>
            {['MANAGER', 'ADMIN'].includes(user?.role || '') && (
              <button 
                onClick={() => setActiveTab('products')} 
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'products' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Products
              </button>
            )}
            {user?.role === 'ADMIN' && (
              <button 
                onClick={() => setActiveTab('users')} 
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'users' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Users
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {['STAFF', 'MANAGER', 'ADMIN'].includes(user?.role || '') && renderStaffDashboard()}
          {['MANAGER', 'ADMIN'].includes(user?.role || '') && renderManagerDashboard()}
          {user?.role === 'ADMIN' && renderAdminDashboard()}
        </div>
      )}

      {activeTab === 'orders' && <OrderManagement />}
      {activeTab === 'returns' && <ReturnsManagement />}
      {activeTab === 'inventory' && <InventoryManagement />}
      {activeTab === 'products' && ['MANAGER', 'ADMIN'].includes(user?.role || '') && <ProductManagement />}
      {activeTab === 'users' && user?.role === 'ADMIN' && <UserManagement />}
      
    </div>
  );
};

export default Dashboard;
