import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

// --- Existing Imports (Student Flow) ---
import Header from "./common/Header";
import Footer from "./common/Footer";
import Home from "./pages/Home";
import UserLogin from "./pages/UserLogin";
import Upload from "./pages/Upload";
import OrderStatus from "./pages/OrderStatus";
import Dashboard from "./pages/Dashboard";

// --- NEW Imports (Shop Flow) ---
import ShopLogin from "./pages/shop/shopLogin";
import ShopSetup from "./pages/shop/shopSetup";
import ShopDashboard from "./pages/shop/ShopDashboard";

// --- Context & Auth ---
import { AuthProvider } from "./context/AuthContext";
import { RequireAuth, RedirectIfAuth } from "./routes/ProtectedRoutes";

function App() {
  // Layout for Students (Header + Footer)
  const BaseLayout = () => {
    return (
      <>
        <Header />
        <Outlet />
        <Footer />
      </>
    );
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          
          {/* =========================================
              SECTION 1: SHOP OWNER ROUTES
              (No Header/Footer, separate logic)
             ========================================= */}
          <Route path="/shop/login" element={<ShopLogin />} />
          <Route path="/shop/setup" element={<ShopSetup />} />
          <Route path="/shop/dashboard" element={<ShopDashboard />} />


          {/* =========================================
              SECTION 2: STUDENT / USER ROUTES
              (Wrapped in BaseLayout)
             ========================================= */}
          <Route path='/' element={<BaseLayout />}>
            <Route index element={<Home />} />

            {/* Logged-in users cannot see login */}
            <Route element={<RedirectIfAuth />}>
              <Route path='login/user' element={<UserLogin />} />
            </Route>

            {/* Only logged-in users */}
            <Route element={<RequireAuth />}>
              <Route path='upload' element={<Upload />} />
              <Route path='order/:orderId' element={<OrderStatus />} />
              <Route path='dashboard' element={<Dashboard />} />
            </Route>
          </Route>

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;