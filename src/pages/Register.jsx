import { useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      await createUserDoc(result.user, role, result.user.displayName);

      if (role === "shop") {
        navigate("/shop/setup");
      } else {
        navigate("/user/upload");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to sign up with Google.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailRegister(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await createUserDoc(userCredential.user, role);

      if (role === "shop") {
        navigate("/shop/setup");
      } else {
        navigate("/user/upload");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Registration failed.");
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
            Join PrintZap today
          </p>
        </div>

        <div className='mt-8 space-y-6'>
          {/* Role Selection */}
          <div>
            <label className='block text-sm font-medium text-brand-text-primary mb-2'>
              I am a:
            </label>
            <div className='grid grid-cols-2 gap-3'>
              <button
                type='button'
                onClick={() => setRole("user")}
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  role === "user"
                    ? "bg-btn-primary-bg text-btn-primary-text shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                👤 Student
              </button>
              <button
                type='button'
                onClick={() => setRole("shop")}
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  role === "shop"
                    ? "bg-btn-primary-bg text-btn-primary-text shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                🖨️ Print Shop
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
