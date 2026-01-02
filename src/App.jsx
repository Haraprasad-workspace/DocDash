import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Header from "./common/Header";
import Footer from "./common/Footer";

import Home from "./pages/Home";
import UserLogin from "./pages/UserLogin";
import Upload from "./pages/Upload";
import OrderStatus from "./pages/OrderStatus";
import Dashboard from "./pages/Dashboard";

import { AuthProvider } from "./context/AuthContext";
import { RequireAuth, RedirectIfAuth } from "./routes/ProtectedRoutes";

function App() {
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
