import { useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");

  async function ensureUserDoc(user) {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName || "",
        email: user.email,
        role: "student",
        createdAt: serverTimestamp(),
      });
    }
  }

  async function handleGoogleLogin() {
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await ensureUserDoc(result.user);
      navigate("/upload");
    } catch (err) {
      console.error(err);
      setError("Failed to sign in with Google.");
    }
  }

  async function handleEmailAuth(e) {
    e.preventDefault(); // Prevent form submission handling issues if wrapped in form
    setError("");
    try {
      let userCredential;

      if (isSignup) {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
      } else {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      }

      await ensureUserDoc(userCredential.user);
      navigate("/upload");
    } catch (err) {
      console.error(err);
      setError(err.message || "Authentication failed.");
    }
  }

  return (
    <main className="flex-1 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-page-bg">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl shadow-lg border border-border-default">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-brand-text-primary">
            {isSignup ? "Create an account" : "Welcome back"}
          </h2>
          <p className="mt-2 text-sm text-brand-text-muted">
            {isSignup ? "Sign up to start printing" : "Sign in to your account"}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex justify-center py-3 px-4 border border-btn-secondary-border rounded-xl shadow-sm bg-btn-secondary-bg text-sm font-medium text-btn-secondary-text hover:bg-btn-secondary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-focus-ring"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-divider-light"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-brand-text-muted">Or continue with email</span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleEmailAuth}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-3 py-3 border border-input-border placeholder-input-placeholder text-input-text rounded-xl focus:outline-none focus:ring-focus-ring focus:border-focus-ring focus:z-10 sm:text-sm bg-input-bg transition-shadow"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none relative block w-full px-3 py-3 border border-input-border placeholder-input-placeholder text-input-text rounded-xl focus:outline-none focus:ring-focus-ring focus:border-focus-ring focus:z-10 sm:text-sm bg-input-bg transition-shadow"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="text-color-status-error-text text-sm text-center bg-color-status-error-bg p-2 rounded">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-btn-primary-text bg-btn-primary-bg hover:bg-btn-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-focus-ring transition-colors shadow-md hover:shadow-lg"
              >
                {isSignup ? "Create account" : "Sign in"}
              </button>
            </div>
          </form>

          <div className="text-center">
            <p className="text-sm text-brand-text-muted">
              {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => setIsSignup(!isSignup)}
                className="font-medium text-brand-text-link hover:text-brand-text-link-hover transition-colors underline decoration-dotted underline-offset-4"
              >
                {isSignup ? "Log in" : "Sign up"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;
