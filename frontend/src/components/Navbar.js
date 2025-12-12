import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Navbar.css';

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          PyChallenge
        </Link>
        <div className="navbar-links">
          {isAuthenticated ? (
            <>
              <Link to="/">Quizzes</Link>
              <Link to="/my-quizzes">My Quizzes</Link>
              <Link to="/create-quiz">Create Quiz</Link>
              <Link to="/leaderboard">Leaderboard</Link>
              <span className="navbar-user">Welcome, {user?.username}</span>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/">Home</Link>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
