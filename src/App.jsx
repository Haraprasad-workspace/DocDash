import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

// --- Student / User ---
import Header from "./common/Header";
import Footer from "./common/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Upload from "./pages/Upload";
import Dashboard from "./pages/Dashboard";

// --- Shop ---
import ShopSetup from "./pages/shop/ShopSetup";
import ShopDashboard from "./pages/shop/ShopDashboard";

// --- Auth ---
import { AuthProvider } from "./context/AuthContext";
import {
  RedirectIfAuth,
  RequireAuth,
  RequireShop,
} from "./routes/ProtectedRoutes";

import BackgroundDoodles from "./common/BackgroundDoodles";

function App() {
  const BaseLayout = () => (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );

  return (
    <BrowserRouter>
      <AuthProvider>
        <BackgroundDoodles />
        <Routes>
          {/* =========================================
              SHOP OWNER ROUTES (No Header/Footer)
             ========================================= */}
          <Route element={<RequireShop />}>
            <Route path='/shop/setup' element={<ShopSetup />} />
            <Route path='/shop/dashboard' element={<ShopDashboard />} />
          </Route>

          {/* =========================================
              USER ROUTES (With Header/Footer)
             ========================================= */}
          <Route path='/' element={<BaseLayout />}>
            <Route index element={<Home />} />

            {/* Auth Pages (Redirect if logged in) */}
            <Route element={<RedirectIfAuth />}>
              <Route path='login' element={<Login />} />
              <Route path='register' element={<Register />} />
            </Route>

            {/* Protected User Pages */}
            <Route element={<RequireAuth />}>
              <Route path='user/upload' element={<Upload />} />
              <Route path='user/dashboard' element={<Dashboard />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
