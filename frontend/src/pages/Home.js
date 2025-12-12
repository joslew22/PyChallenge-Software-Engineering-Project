import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Home.css';

function Home() {
  const [quizzes, setQuizzes] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'mine', 'others'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    fetchQuizzes();
  }, [filter]);

  const fetchQuizzes = async () => {
    setLoading(true);
    setError('');

    try {
      let response;
      if (filter === 'mine') {
        response = await quizAPI.getMyQuizzes();
      } else if (filter === 'others') {
        response = await quizAPI.getOthersQuizzes();
      } else {
        response = await quizAPI.getAll();
      }
      setQuizzes(response.data);
    } catch (err) {
      setError('Failed to load quizzes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Available Quizzes</h1>
        {user && (
          <Link to="/create-quiz" className="btn-primary">
            Create New Quiz
          </Link>
        )}
      </div>

      {user && (
        <div className="filter-buttons">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All Quizzes
          </button>
          <button
            className={filter === 'mine' ? 'active' : ''}
            onClick={() => setFilter('mine')}
          >
            My Quizzes
          </button>
          <button
            className={filter === 'others' ? 'active' : ''}
            onClick={() => setFilter('others')}
          >
            Others' Quizzes
          </button>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading quizzes...</div>
      ) : quizzes.length === 0 ? (
        <div className="no-quizzes">
          <p>No quizzes found.</p>
          {filter === 'mine' && (
            <Link to="/create-quiz" className="btn-primary">
              Create your first quiz
            </Link>
          )}
        </div>
      ) : (
        <div className="quiz-grid">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="quiz-card">
              <h3>{quiz.title}</h3>
              <p className="quiz-description">{quiz.description}</p>
              <div className="quiz-meta">
                <span>By: {quiz.creator_username}</span>
                <span>{quiz.question_count} questions</span>
              </div>
              <div className="quiz-actions">
                <Link to={`/quiz/${quiz.id}`} className="btn-secondary">
                  Take Quiz
                </Link>
                {user && user.username === quiz.creator_username && (
                  <Link to={`/my-quizzes/${quiz.id}`} className="btn-edit">
                    Manage
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
