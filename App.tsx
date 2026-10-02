import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import { Shop } from './pages/Customer/Shop';
import { ProductDetail } from './pages/Customer/ProductDetail';
import { ARView } from './pages/Customer/ARView';
import { Cart } from './pages/Customer/Cart';
import { About } from './pages/Customer/About';
import { Profile } from './pages/Customer/Profile';
import { Orders } from './pages/Customer/Orders';
import { AdminDashboard } from './pages/Admin/Dashboard';
import { ProductManager } from './pages/Admin/ProductManager';
import { OrderManagement } from './pages/Admin/OrderManagement';
import { MarketingManager } from './pages/Admin/MarketingManager';
import { Settings } from './pages/Admin/Settings';
import { AdminLogin } from './pages/Admin/AdminLogin.tsx';
import { UserRole, CartItem, Product, User, Address, ProductVariant } from './types';
import { loginUser, registerUser, updateUserAddress, loginAdmin } from './services/auth';
import { db } from './services/db';
import { AuthContext } from './contexts/AuthContext';
import { CartContext, useCart } from './contexts/CartContext';
import { useAuth } from './contexts/AuthContext';

// --- App Routes Wrapper Component ---
const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect authenticated admins from login page to dashboard
  useEffect(() => {
    if ((user?.role === UserRole.ADMIN || user?.role === UserRole.SUPERADMIN) && location.pathname === '/admin/login') {
      navigate('/admin', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  return (
    <Routes>
      {/* Admin Login (No Layout) */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Main Layout Routes */}
      <Route path="*" element={
        <Layout>
          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={<Shop />} />
            <Route path="/about" element={<About />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/ar/:id" element={<ARView />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={
              user ? <Profile /> : <Navigate to="/" replace />
            } />
            <Route path="/orders" element={
              user ? <Orders /> : <Navigate to="/" replace />
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              (user?.role === UserRole.ADMIN || user?.role === UserRole.SUPERADMIN) ? <AdminDashboard /> : <Navigate to="/admin/login" replace />
            } />
            <Route path="/admin/products" element={
              (user?.role === UserRole.ADMIN || user?.role === UserRole.SUPERADMIN) ? <ProductManager /> : <Navigate to="/admin/login" replace />
            } />
            <Route path="/admin/orders" element={
              (user?.role === UserRole.ADMIN || user?.role === UserRole.SUPERADMIN) ? <OrderManagement /> : <Navigate to="/admin/login" replace />
            } />
            <Route path="/admin/marketing" element={
              (user?.role === UserRole.ADMIN || user?.role === UserRole.SUPERADMIN) ? <MarketingManager /> : <Navigate to="/admin/login" replace />
            } />
            <Route path="/admin/settings" element={
              (user?.role === UserRole.ADMIN || user?.role === UserRole.SUPERADMIN) ? <Settings /> : <Navigate to="/admin/login" replace />
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      } />
    </Routes>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  // Initialize user from localStorage
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('arfurniture_user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (error) {
      console.error('Failed to parse saved user:', error);
      localStorage.removeItem('arfurniture_user');
    }
    return null;
  });
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const savedUser = localStorage.getItem('arfurniture_user');
      if (!savedUser) {
        const savedGuestCart = localStorage.getItem('arfurniture_guest_cart');
        if (savedGuestCart) return JSON.parse(savedGuestCart);
      }
    } catch {}
    return [];
  });
  const [toast, setToast] = useState<{ show: boolean, productName: string } | null>(null);

  const showSuccessToast = (productName: string) => {
    setToast({ show: true, productName });
    setTimeout(() => setToast(null), 3000);
  };

  // Helper to merge local guest cart into authenticated user cart
  const mergeGuestCartWithUser = async (userId: string, currentLocalCart: CartItem[]) => {
    try {
      if (currentLocalCart.length > 0) {
        for (const item of currentLocalCart) {
          try {
            await db.addToCart(userId, item._id, item.selectedVariant?.id, item.quantity);
          } catch (e) {
            console.warn('Failed to merge guest cart item into account:', item._id, e);
          }
        }
      }
      localStorage.removeItem('arfurniture_guest_cart');
      const refreshedCart = await db.getCart(userId);
      setCart(refreshedCart);
    } catch (error) {
      console.error('Failed to merge cart:', error);
    }
  };

  // Load cart on initial mount if user exists (was persisted)
  useEffect(() => {
    if (user) {
      db.getCart(user._id).then(setCart).catch(console.error);
    }
  }, []);

  // Customer login only
  const handleUserLogin = async (email: string, pass: string) => {
    const customer = await loginUser(email, pass);
    setUser(customer);
    localStorage.setItem('arfurniture_user', JSON.stringify(customer));
    await mergeGuestCartWithUser(customer._id, cart);
    return customer;
  };

  // Admin login only
  const handleAdminLogin = async (identifier: string, pass: string) => {
    const admin = await loginAdmin(identifier, pass);
    setUser(admin);
    localStorage.setItem('arfurniture_user', JSON.stringify(admin));
    return admin;
  };

  const handleSignup = async (fname: string, lname: string, email: string, pass: string, mname = '') => {
    const user = await registerUser(fname, lname, email, pass, mname);
    setUser(user);
    localStorage.setItem('arfurniture_user', JSON.stringify(user));
    await mergeGuestCartWithUser(user._id, cart);
    return user;
  };

  const handleLogout = () => {
    setUser(null);
    setCart([]); // Clear cart on logout
    localStorage.removeItem('arfurniture_user');
    localStorage.removeItem('arfurniture_guest_cart');
  };

  const handleUpdateAddress = async (address: Address) => {
    if (user) {
      await updateUserAddress(user._id, address);
      const updatedUser = { ...user, addresses: user.addresses ? user.addresses.map(a => a.id === address.id ? address : a) : [address] };
      setUser(updatedUser);
      localStorage.setItem('arfurniture_user', JSON.stringify(updatedUser));
    }
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('arfurniture_user', JSON.stringify(updatedUser));
  };

  // Cart Handlers - Frictionless Guest Support + Authenticated Sync
  const addToCart = async (product: Product, variant?: ProductVariant, quantity = 1) => {
    // Stock Validation
    const availableStock = variant?.stock ?? product.stock;
    const currentItemInCart = cart.find(item => 
      item._id === product._id && 
      (variant ? item.selectedVariant?.id === variant.id : !item.selectedVariant)
    );
    const currentQtyInCart = currentItemInCart?.quantity || 0;

    if (currentQtyInCart + quantity > availableStock) {
      alert(`Cannot add ${quantity} more: only ${availableStock - currentQtyInCart} additional items in stock.`);
      return;
    }

    if (user) {
      try {
        await db.addToCart(user._id, product._id, variant?.id, quantity);
      } catch (error) {
        console.error('Failed to add to cart on server:', error);
      }
    }

    showSuccessToast(product.name);

    setCart(prev => {
      const existing = prev.find(item =>
        item._id === product._id &&
        (variant ? item.selectedVariant?.id === variant.id : !item.selectedVariant)
      );

      let nextCart: CartItem[];
      if (existing) {
        nextCart = prev.map(item =>
          (item._id === product._id && (variant ? item.selectedVariant?.id === variant.id : !item.selectedVariant))
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        nextCart = [...prev, { ...product, quantity: quantity, selectedVariant: variant }];
      }

      if (!user) {
        localStorage.setItem('arfurniture_guest_cart', JSON.stringify(nextCart));
      }
      return nextCart;
    });
  };

  const removeFromCart = async (id: string, variantId?: string) => {
    if (user) {
      try {
        await db.removeFromCart(user._id, id, variantId);
      } catch (error) {
        console.error('Failed to remove from cart on server:', error);
      }
    }
    setCart(prev => {
      const nextCart = prev.filter(item => !(item._id === id && (variantId ? item.selectedVariant?.id === variantId : !item.selectedVariant)));
      if (!user) {
        localStorage.setItem('arfurniture_guest_cart', JSON.stringify(nextCart));
      }
      return nextCart;
    });
  };

  const updateQuantity = async (id: string, delta: number, variantId?: string) => {
    const item = cart.find(i => i._id === id && (variantId ? i.selectedVariant?.id === variantId : !i.selectedVariant));
    if (!item) return;

    const newQuantity = Math.max(1, item.quantity + delta);

    if (user) {
      try {
        await db.updateCartItem(user._id, id, newQuantity, variantId);
      } catch (error) {
        console.error('Failed to update quantity on server:', error);
      }
    }

    setCart(prev => {
      const nextCart = prev.map(item => {
        if (item._id === id && (variantId ? item.selectedVariant?.id === variantId : !item.selectedVariant)) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      if (!user) {
        localStorage.setItem('arfurniture_guest_cart', JSON.stringify(nextCart));
      }
      return nextCart;
    });
  };

  const clearCart = async () => {
    if (user) {
      try {
        await db.clearCart(user._id);
      } catch (error) {
        console.error('Failed to clear cart on server:', error);
      }
    }
    setCart([]);
    localStorage.removeItem('arfurniture_guest_cart');
  };

  const updateItemVariant = async (product: Product, oldVariantId: string | undefined, newVariant: ProductVariant, quantity: number) => {
    if (!user) return;

    // Optimistic update or wait for server? Let's wait for server to ensure stock/validation
    try {
      // 1. Add new variant (merges if exists)
      // If the new variant ID is 'original', it means we are reverting to the base product (no variant)
      const variantIdToAdd = newVariant.id === 'original' ? undefined : newVariant.id;
      await db.addToCart(user._id, product._id, variantIdToAdd, quantity);

      // 2. Remove old variant
      await db.removeFromCart(user._id, product._id, oldVariantId);

      // 3. Refresh cart state (easiest way to ensure correct merged quantities)
      const updatedCart = await db.getCart(user._id);
      setCart(updatedCart);

    } catch (error) {
      console.error('Failed to update variant:', error);
      alert('Failed to update variant. Please try again.');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userLogin: handleUserLogin,
      adminLogin: handleAdminLogin,
      signup: handleSignup,
      logout: handleLogout,
      updateAddress: handleUpdateAddress,
      updateUser: handleUpdateUser,
      isAuthModalOpen,
      setAuthModalOpen
    }}>
      <CartContext.Provider value={{ 
        cart, 
        toast,
        addToCart, 
        showSuccessToast,
        removeFromCart, 
        updateQuantity, 
        clearCart, 
        updateItemVariant 
      }}>
        <Router>
          <ScrollToTop />
          <AppRoutes />
        </Router>
      </CartContext.Provider>
    </AuthContext.Provider>
  );
};

export default App;
