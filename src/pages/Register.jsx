import { useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../firebase";
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  getDocs,
  where,
} from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function emailAlreadyExists(email) {
    const q = query(collection(db, "users"), where("email", "==", email));

    const snap = await getDocs(q);
    return !snap.empty;
  }

  async function createUserDoc(user, selectedRole, displayName = "") {
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name: displayName || name,
      email: user.email,
      role: selectedRole,
      createdAt: serverTimestamp(),
    });
  }

  async function handleGoogleRegister() {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const email = result.user.email;

      // 🔴 HARD BLOCK
      const exists = await emailAlreadyExists(email);
      if (exists) {
        await auth.signOut();
        setError("This email is already registered. Please log in.");
        return;
      }

      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        name: result.user.displayName || "",
        email,
        role,
        createdAt: serverTimestamp(),
      });

      navigate(role === "shop" ? "/shop/setup" : "/user/upload");
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailRegister(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 🔴 HARD BLOCK
      const exists = await emailAlreadyExists(email);
      if (exists) {
        setError("This email is already registered. Please log in.");
        return;
      }

      const cred = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        name,
        email,
        role,
        createdAt: serverTimestamp(),
      });

      navigate(role === "shop" ? "/shop/setup" : "/user/upload");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className='flex-1 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-page-bg'>
      <div className='max-w-md w-full space-y-8 bg-white p-8 rounded-3xl shadow-lg border border-border-default'>
        <div className='text-center'>
          <h2 className='text-3xl font-extrabold text-brand-text-primary'>
            Create an account
          </h2>
          <p className='mt-2 text-sm text-brand-text-muted'>
            Join DocDash today
          </p>
        </div>

        <div className='mt-8 space-y-6'>
          {/* Role Selection */}
          <div className='space-y-3'>
            <p className='text-center text-xs font-bold uppercase tracking-widest text-brand-text-muted'>
              I am a
            </p>
            <div className='grid grid-cols-2 gap-4'>
              <button
                type='button'
                onClick={() => setRole("user")}
                className={`group relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${
                  role === "user"
                    ? "bg-brand-surface-primary border-brand-text-primary shadow-lg scale-[1.02]"
                    : "bg-white border-border-default hover:border-brand-text-muted opacity-80"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2 transition-colors ${
                    role === "user" ? "bg-white" : "bg-gray-100"
                  }`}
                >
                  👤
                </div>
                <span
                  className={`font-bold transition-colors ${
                    role === "user"
                      ? "text-brand-text-primary"
                      : "text-brand-text-muted"
                  }`}
                >
                  User
                </span>
                {role === "user" && (
                  <div className='absolute -top-2 -right-2 w-6 h-6 bg-brand-text-primary text-white rounded-full flex items-center justify-center text-[10px] shadow-sm animate-in zoom-in duration-300'>
                    ✓
                  </div>
                )}
              </button>

              <button
                type='button'
                onClick={() => setRole("shop")}
                className={`group relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${
                  role === "shop"
                    ? "bg-brand-surface-primary border-brand-text-primary shadow-lg scale-[1.02]"
                    : "bg-white border-border-default hover:border-brand-text-muted opacity-80"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2 transition-colors ${
                    role === "shop" ? "bg-white" : "bg-gray-100"
                  }`}
                >
                  🖨️
                </div>
                <span
                  className={`font-bold transition-colors ${
                    role === "shop"
                      ? "text-brand-text-primary"
                      : "text-brand-text-muted"
                  }`}
                >
                  Print Shop
                </span>
                {role === "shop" && (
                  <div className='absolute -top-2 -right-2 w-6 h-6 bg-brand-text-primary text-white rounded-full flex items-center justify-center text-[10px] shadow-sm animate-in zoom-in duration-300'>
                    ✓
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Google Register */}
          <button
            onClick={handleGoogleRegister}
            disabled={loading}
            className='w-full flex justify-center py-3 px-4 border border-btn-secondary-border rounded-xl shadow-sm bg-btn-secondary-bg text-sm font-medium text-btn-secondary-text hover:bg-btn-secondary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-focus-ring disabled:opacity-50'
          >
            <svg className='h-5 w-5 mr-2' viewBox='0 0 24 24'>
              <path
                d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                fill='#4285F4'
              />
              <path
                d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                fill='#34A853'
              />
              <path
                d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z'
                fill='#FBBC05'
              />
              <path
                d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                fill='#EA4335'
              />
            </svg>
            Continue with Google
          </button>

          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-divider-light'></div>
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-2 bg-white text-brand-text-muted'>
                Or register with email
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form className='space-y-4' onSubmit={handleEmailRegister}>
            <div>
              <input
                type='text'
                required
                className='appearance-none relative block w-full px-3 py-3 border border-input-border placeholder-input-placeholder text-input-text rounded-xl focus:outline-none focus:ring-focus-ring focus:border-focus-ring sm:text-sm bg-input-bg transition-shadow'
                placeholder='Full Name'
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <input
                type='email'
                required
                className='appearance-none relative block w-full px-3 py-3 border border-input-border placeholder-input-placeholder text-input-text rounded-xl focus:outline-none focus:ring-focus-ring focus:border-focus-ring sm:text-sm bg-input-bg transition-shadow'
                placeholder='Email address'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type='password'
                required
                minLength={6}
                className='appearance-none relative block w-full px-3 py-3 border border-input-border placeholder-input-placeholder text-input-text rounded-xl focus:outline-none focus:ring-focus-ring focus:border-focus-ring sm:text-sm bg-input-bg transition-shadow'
                placeholder='Password (min 6 characters)'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className='text-color-status-error-text text-sm text-center bg-color-status-error-bg p-2 rounded'>
                {error}
              </div>
            )}

            <button
              type='submit'
              disabled={loading}
              className='group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-btn-primary-text bg-btn-primary-bg hover:bg-btn-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-focus-ring transition-colors shadow-md hover:shadow-lg disabled:opacity-50'
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className='text-center'>
            <p className='text-sm text-brand-text-muted'>
              Already have an account?{" "}
              <Link
                to='/login'
                className='font-medium text-brand-text-link hover:text-brand-text-link-hover transition-colors underline decoration-dotted underline-offset-4'
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Register;
