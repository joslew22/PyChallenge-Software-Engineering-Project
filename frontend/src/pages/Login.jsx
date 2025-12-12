// src/pages/Login.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { signInWithGoogle, error, user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to dashboard if already signed in
  if (user) {
    navigate("/", { replace: true });
    return null;
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signInWithGoogle();
    setIsLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        backgroundColor: "#f5f5f5",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "2rem", color: "#333" }}>PyChallenge</h1>
      <h2 style={{ fontSize: "1.3rem", color: "#666" }}>Login to PyChallenge</h2>

      {/* Error Message */}
      {error && (
        <div
          style={{
            color: "#c00",
            backgroundColor: "#ffe0e0",
            padding: "0.75rem 1rem",
            borderRadius: "0.4rem",
            border: "1px solid #f00",
            maxWidth: "400px",
            textAlign: "center",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Google Sign-In Button */}
      <button
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        style={{
          padding: "0.75rem 1.5rem",
          borderRadius: "0.5rem",
          border: "none",
          fontSize: "1rem",
          cursor: isLoading ? "not-allowed" : "pointer",
          backgroundColor: isLoading ? "#ccc" : "#4285f4",
          color: "white",
          fontWeight: "bold",
          opacity: isLoading ? 0.6 : 1,
          transition: "opacity 0.2s",
        }}
      >
        {isLoading ? "Signing in..." : "Sign in with Google"}
      </button>

      <p style={{ fontSize: "0.9rem", color: "#999", marginTop: "1rem" }}>
        This will open a Google sign-in popup.
      </p>
    </div>
  );
}
