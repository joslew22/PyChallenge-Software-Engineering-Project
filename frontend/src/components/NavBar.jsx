// src/components/NavBar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.75rem 1.5rem",
        borderBottom: "1px solid #ddd",
        marginBottom: "1rem",
      }}
    >
      {/* Logo / Home */}
      <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          PyChallenge
        </Link>
      </div>

      {/* Navigation links */}
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <Link to="/" style={{ textDecoration: "none" }}>
          Home
        </Link>

        <Link to="/build" style={{ textDecoration: "none" }}>
          Build Challenge
        </Link>

        <Link to="/leaderboard" style={{ textDecoration: "none" }}>
          Leaderboard
        </Link>

        {/* User info + logout */}
        {user && (
          <span style={{ fontSize: "0.85rem", color: "#555" }}>
            {user.displayName || user.email}
          </span>
        )}

        <button
          onClick={handleLogout}
          style={{
            padding: "0.3rem 0.8rem",
            borderRadius: "0.4rem",
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

