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
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await ensureUserDoc(result.user);
      navigate("/upload");
    } catch (err) {
      console.error(err);
    }
  }

  async function handleEmailAuth() {
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
    }
  }

  return (
    <main className='flex-1'>
      <h2>{isSignup ? "Sign up" : "Login"}</h2>

      <button onClick={handleGoogleLogin}>Continue with Google</button>

      <hr />

      <input
        type='email'
        placeholder='Email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type='password'
        placeholder='Password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleEmailAuth}>
        {isSignup ? "Create account" : "Login with Email"}
      </button>

      <p onClick={() => setIsSignup(!isSignup)} style={{ cursor: "pointer" }}>
        {isSignup
          ? "Already have an account? Login"
          : "New user? Create account"}
      </p>
    </main>
  );
}

export default Login;
