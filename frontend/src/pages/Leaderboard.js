import React, { useState, useEffect } from 'react';
import { attemptAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Leaderboard.css';

function Leaderboard() {
  const { isAuthenticated } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [myScores, setMyScores] = useState([]);
  const [activeTab, setActiveTab] = useState('global');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
    if (isAuthenticated) {
      fetchMyScores();
    }
  }, [isAuthenticated]);

  const fetchLeaderboard = async () => {
    if (!isAuthenticated) {
      setError('Please login to view leaderboard');
      setLoading(false);
      return;
    }

    try {
      const response = await attemptAPI.getLeaderboard();
      setLeaderboard(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load leaderboard');
      setLoading(false);
    }
  };

  const fetchMyScores = async () => {
    try {
      const response = await attemptAPI.getMyScores();
      setMyScores(response.data);
    } catch (err) {
      console.error('Failed to load personal scores');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="leaderboard-container">
        <h1>Leaderboard</h1>
        <p>Please login to view the leaderboard</p>
      </div>
    );
  }

  if (loading) return <div className="loading">Loading leaderboard...</div>;

  return (
    <div className="leaderboard-container">
      <h1>Leaderboard</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="tabs">
        <button
          className={activeTab === 'global' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('global')}
        >
          Global Leaderboard
        </button>
        <button
          className={activeTab === 'personal' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('personal')}
        >
          My Scores
        </button>
      </div>

      {activeTab === 'global' && (
        <div className="leaderboard-table">
          <h2>Top Scores</h2>
          {leaderboard.length === 0 ? (
            <p>No scores yet. Be the first to complete a quiz!</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>User</th>
                  <th>Quiz</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((attempt, index) => (
                  <tr key={attempt.id}>
                    <td>{index + 1}</td>
                    <td>{attempt.username}</td>
                    <td>{attempt.quiz_title}</td>
                    <td>{attempt.score} / {attempt.total_questions}</td>
                    <td>{Math.round((attempt.score / attempt.total_questions) * 100)}%</td>
                    <td>{new Date(attempt.completed_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'personal' && (
        <div className="leaderboard-table">
          <h2>Your Quiz History</h2>
          {myScores.length === 0 ? (
            <p>You haven't completed any quizzes yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Quiz</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Answers Revealed</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {myScores.map((attempt) => (
                  <tr key={attempt.id}>
                    <td>{attempt.quiz_title}</td>
                    <td>{attempt.score} / {attempt.total_questions}</td>
                    <td>{Math.round((attempt.score / attempt.total_questions) * 100)}%</td>
                    <td>{attempt.answers_revealed ? 'Yes' : 'No'}</td>
                    <td>{new Date(attempt.completed_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
