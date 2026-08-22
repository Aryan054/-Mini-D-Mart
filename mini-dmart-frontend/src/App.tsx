
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './routes/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Customer Pages
import Home from './pages/customer/Home';
import Products from './pages/customer/Products';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import Orders from './pages/customer/Orders';
import Profile from './pages/auth/Profile';
import ProductDetails from './pages/customer/ProductDetails';
import Dashboard from './pages/admin/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Main Layout Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            
            {/* Any Logged In User */}
            <Route element={<ProtectedRoute allowedRoles={['CUSTOMER', 'STAFF', 'MANAGER', 'ADMIN']} />}>
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Customer Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
            </Route>

            {/* Staff/Admin Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['STAFF', 'MANAGER', 'ADMIN']} />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
