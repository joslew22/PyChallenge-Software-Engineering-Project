// src/pages/Login.jsx
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { signInWithGoogle } = useAuth();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
      }}
    >
      <h1>PyChallenge</h1>
      <h2>Login to PyChallenge</h2>
      <button
        onClick={signInWithGoogle}
        style={{
          padding: "0.75rem 1.5rem",
          borderRadius: "0.5rem",
          border: "none",
          fontSize: "1rem",
          cursor: "pointer",
        }}
      >
        Sign in with Google
      </button>
    </div>
  );
}
