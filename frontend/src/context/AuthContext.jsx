// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext(null);

// ✔ Export hook for consuming auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);

  // Listen for Firebase auth state changes
  useEffect(() => {
    console.log("🔍 AuthContext: Setting up auth state listener...");
    
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("✅ Auth state changed. User:", firebaseUser?.email || "null");
      setUser(firebaseUser || null);
      setInitializing(false);
    });

    return unsub;
  }, []);

  const signInWithGoogle = async () => {
    try {
      console.log("🚀 Starting Google sign-in...");
      setError(null);
      
      const result = await signInWithPopup(auth, googleProvider);
      console.log("✅ Google sign-in successful! User:", result.user.email);
      setUser(result.user);
      
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user") {
        console.log("⚠️ Google popup was closed by user.");
        setError(null); // Not a real error
        return;
      }
      
      console.error("❌ Google sign-in error:", err.code, err.message);
      setError(err.message || "Google sign-in failed. Please try again.");
    }
  };

  const logout = async () => {
    try {
      console.log("🚀 Logging out...");
      await signOut(auth);
      console.log("✅ Logout successful!");
      setUser(null);
      setError(null);
    } catch (err) {
      console.error("❌ Logout error:", err);
      setError(err.message || "Logout failed. Please try again.");
    }
  };

  const value = {
    user,
    initializing,
    error,
    signInWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!initializing && children}
    </AuthContext.Provider>
  );
}

