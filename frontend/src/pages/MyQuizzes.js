import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizAPI } from '../services/api';
import '../styles/Home.css';

function MyQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyQuizzes();
  }, []);

  const fetchMyQuizzes = async () => {
    try {
      const response = await quizAPI.getMyQuizzes();
      setQuizzes(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load your quizzes');
      setLoading(false);
    }
  };

  const handleDelete = async (quizId, quizTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${quizTitle}"?`)) {
      return;
    }

    try {
      await quizAPI.delete(quizId);
      setQuizzes(quizzes.filter((q) => q.id !== quizId));
      alert('Quiz deleted successfully!');
    } catch (err) {
      alert('Failed to delete quiz. You can only delete quizzes you created.');
    }
  };

  if (loading) return <div className="loading">Loading your quizzes...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>My Quizzes</h1>
        <Link to="/create-quiz" className="btn-primary">
          Create New Quiz
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <div className="no-quizzes">
          <p>You haven't created any quizzes yet.</p>
          <Link to="/create-quiz" className="btn-primary">
            Create your first quiz
          </Link>
        </div>
      ) : (
        <div className="quiz-grid">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="quiz-card">
              <h3>{quiz.title}</h3>
              <p className="quiz-description">{quiz.description}</p>
              <div className="quiz-meta">
                <span>{quiz.question_count} questions</span>
                <span>Created: {new Date(quiz.created_at).toLocaleDateString()}</span>
              </div>
              <div className="quiz-actions">
                <Link to={`/quiz/${quiz.id}`} className="btn-secondary">
                  Preview
                </Link>
                <button
                  onClick={() => handleDelete(quiz.id, quiz.title)}
                  className="btn-delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyQuizzes;
