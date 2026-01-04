import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Header from "./common/Header";
import Footer from "./common/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Upload from "./pages/Upload";
import Dashboard from "./pages/Dashboard";
import OrderStatus from "./pages/OrderStatus";

import ShopSetup from "./pages/shop/shopSetup";
import ShopDashboard from "./pages/shop/ShopDashboard";

import {
  RequireAuth,
  RequireShop,
  RedirectIfAuth,
} from "./routes/ProtectedRoutes";

import BackgroundDoodles from "./common/BackgroundDoodles";

const BaseLayout = () => (
  <>
    <Header />
    <Outlet />
    <Footer />
  </>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BackgroundDoodles />
        <Routes>
          {/* Public */}
          <Route path='/' element={<BaseLayout />}>
            <Route index element={<Home />} />

            <Route element={<RedirectIfAuth />}>
              <Route path='login' element={<Login />} />
              <Route path='register' element={<Register />} />
            </Route>

            {/* Student */}
            <Route element={<RequireAuth />}>
              <Route path='upload' element={<Upload />} />
              <Route path='dashboard' element={<Dashboard />} />
              <Route path='order/:orderId' element={<OrderStatus />} />
            </Route>
          </Route>

          {/* Shop */}
          <Route element={<RequireShop />}>
            <Route path='/shop/setup' element={<ShopSetup />} />
            <Route path='/shop/dashboard' element={<ShopDashboard />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
