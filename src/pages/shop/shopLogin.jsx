

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
    <div className="min-h-screen bg-page-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card-bg/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl p-10 text-center relative overflow-hidden">

        {/* Decorative background blob */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-accent/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-brand-surface-secondary/50 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-brand-surface-secondary text-brand-text-primary rounded-2xl rotate-3 flex items-center justify-center mx-auto mb-6 shadow-sm border border-white/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-brand-text-primary mb-2 tracking-tight">Partner Portal</h1>
          <p className="text-brand-text-muted text-base">Manage your print shop queue & earnings.</p>
        </div>

        {/* Action */}
        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-brand-text-body font-semibold py-4 px-6 rounded-xl border border-border-default transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-6 h-6"
          />
          <span>Continue with Google</span>
        </button>

        {/* Footer */}
        <p className="mt-8 text-xs text-brand-text-disabled">
          By continuing, you agree to our <a href="#" className="underline hover:text-brand-text-primary transition-colors">Terms of Service</a>.
        </p>
      </div>
    </div>
  );
};

export default ShopLogin;
