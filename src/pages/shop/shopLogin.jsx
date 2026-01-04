
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase"; 
import { checkIsShopOwner } from "../../services/shopService";

const ShopLogin = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check identity immediately after login
      const isShop = await checkIsShopOwner(result.user.uid);
      
      if (isShop) {
        navigate("/shop/dashboard");
      } else {
        navigate("/shop/setup");
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Unable to sign in. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 text-center">
        {/* Header */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            🖨️
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Partner Portal</h1>
          <p className="text-gray-500">Manage your print shop queue & earnings.</p>
        </div>

        {/* Action */}
        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google" 
            className="w-6 h-6" 
          />
          <span>Continue with Google</span>
        </button>

        {/* Footer */}
        <p className="mt-8 text-xs text-gray-400">
          By continuing, you agree to our <a href="#" className="underline">Terms of Service</a>.
        </p>
      </div>
    </div>
  );
};

export default ShopLogin;