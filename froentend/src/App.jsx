// src/App.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import NavBar from "./components/NavBar.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import PlayChallenge from "./pages/PlayChallenge.jsx";
import BuildChallenge from "./pages/BuildChallenge.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";

function ProtectedRoute({ children }) {
  const { user, initializing } = useAuth();

  if (initializing) return null;     // Wait for Firebase to load auth state
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

export default function App() {
  const location = useLocation();

  return (
    <>
      {location.pathname !== "/login" && <NavBar />}
      <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Auth-Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/build"
        element={
          <ProtectedRoute>
            <BuildChallenge />
          </ProtectedRoute>
        }
      />

      <Route
        path="/play/:id"
        element={
          <ProtectedRoute>
            <PlayChallenge />
          </ProtectedRoute>
        }
      />

      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        }
      />

      {/* Redirect all unknown paths */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}
