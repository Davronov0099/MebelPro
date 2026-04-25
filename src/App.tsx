import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useApiStore } from "@/stores/apiStore";
import { initializeSocket, disconnectSocket } from "@/services/socket";
import { useEffect } from "react";
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import AdminLayout from "./components/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import Employees from "./pages/admin/Employees";
import Sales from "./pages/admin/Sales";
import Customers from "./pages/admin/Customers";
import Warehouse from "./pages/admin/Warehouse";
import Market from "./pages/admin/Market";
import Messages from "./pages/admin/Messages";
import Assistant from "./pages/admin/Assistant";
import CashierQueue from "./pages/admin/CashierQueue";
import KassirQueue from "./pages/kassir/KassirQueue";
import KassirCustomers from "./pages/kassir/KassirCustomers";
import KassirSales from "./pages/kassir/KassirSales";
import ShopLayout from "./components/ShopLayout";
import Catalog from "./pages/shop/Catalog";
import Cart from "./pages/shop/Cart";
import ShopOrders from "./pages/shop/Orders";
import About from "./pages/shop/About";
import Account from "./pages/shop/Account";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const theme = useApiStore(s => s.theme);
  const user = useApiStore(s => s.user);
  const isAuthenticated = useApiStore(s => s.isAuthenticated);

  useEffect(() => {
    // Initial theme setup
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  // Initialize socket when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      initializeSocket(user.role);
    } else {
      disconnectSocket();
    }

    return () => {
      // Cleanup on unmount
      if (!isAuthenticated) {
        disconnectSocket();
      }
    };
  }, [isAuthenticated, user]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner position="top-right" richColors />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={isAuthenticated ? <Navigate to="/admin" replace /> : <LandingPage />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/admin" replace /> : <Login />} />
            <Route path="/admin" element={isAuthenticated ? <AdminLayout /> : <Navigate to="/" replace />}>
              {user?.role === 'admin' && (
                <>
                  <Route index element={<Dashboard />} />
                  <Route path="products" element={<Products />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="employees" element={<Employees />} />
                  <Route path="sales" element={<Sales />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="warehouse" element={<Warehouse />} />
                  <Route path="market" element={<Market />} />
                  <Route path="messages" element={<Messages />} />
                  <Route path="cashier-queue" element={<CashierQueue />} />
                </>
              )}
              {user?.role === 'kassir' && (
                <>
                  <Route index element={<KassirSales />} />
                  <Route path="sales" element={<KassirSales />} />
                  <Route path="kassir-queue" element={<KassirQueue />} />
                  <Route path="customers" element={<KassirCustomers />} />
                </>
              )}
              {user?.role === 'yordamchi' && (
                <>
                  <Route index element={<Assistant />} />
                  <Route path="assistant" element={<Assistant />} />
                </>
              )}
              {user?.role === 'omborchi' && (
                <>
                  <Route index element={<Warehouse />} />
                  <Route path="warehouse" element={<Warehouse />} />
                </>
              )}
              {/* Fallback for authenticated users with unmatched routes */}
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route path="/shop" element={<ShopLayout />}>
              <Route index element={<Catalog />} />
              <Route path="cart" element={<Cart />} />
              <Route path="orders" element={<ShopOrders />} />
              <Route path="about" element={<About />} />
              <Route path="account" element={<Account />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
