import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Quiz.css';

function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [answersRevealed, setAnswersRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const response = await quizAPI.getById(id);
      setQuiz(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load quiz');
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, optionId) => {
    setUserAnswers({
      ...userAnswers,
      [questionId]: optionId,
    });
  };

  const handleRevealAnswers = () => {
    setAnswersRevealed(true);
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      alert('Please login to submit your answers');
      navigate('/login');
      return;
    }

    try {
      const response = await quizAPI.submitAnswers(id, userAnswers, answersRevealed);
      setResults(response.data);
      setShowResults(true);
    } catch (err) {
      setError('Failed to submit quiz');
    }
  };

  const handleRetake = () => {
    setUserAnswers({});
    setShowResults(false);
    setResults(null);
    setAnswersRevealed(false);
    setCurrentQuestionIndex(0);
  };

  if (loading) return <div className="loading">Loading quiz...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!quiz) return <div>Quiz not found</div>;

  if (showResults) {
    return (
      <div className="quiz-results-container">
        <h1>Quiz Results</h1>
        <div className="score-summary">
          <h2>Your Score: {results.score} / {results.total_questions}</h2>
          <p>Percentage: {results.percentage}%</p>
          {results.percentage === 100 && <p className="perfect-score">🎉 Perfect Score!</p>}
        </div>

        <div className="results-details">
          <h3>Question Breakdown:</h3>
          {results.results.map((result, index) => (
            <div key={result.question_id} className={`result-item ${result.is_correct ? 'correct' : 'incorrect'}`}>
              <p><strong>Q{index + 1}:</strong> {result.question_text}</p>
              <p className="result-status">
                {result.is_correct ? '✅ Correct' : '❌ Incorrect'}
              </p>
              {!result.is_correct && result.correct_option_id && (
                <p className="correct-answer">
                  Correct answer: {quiz.questions.find(q => q.id === result.question_id)
                    ?.options.find(o => o.id === result.correct_option_id)?.text}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="results-actions">
          <button onClick={handleRetake} className="btn-primary">Retake Quiz</button>
          <button onClick={() => navigate('/')} className="btn-secondary">Back to Home</button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="take-quiz-container">
      <h1>{quiz.title}</h1>
      {quiz.description && <p className="quiz-description">{quiz.description}</p>}

      <div className="quiz-progress">
        Question {currentQuestionIndex + 1} of {quiz.questions.length}
      </div>

      <div className="question-card">
        <h2>{currentQuestion.text}</h2>

        <div className="options-list">
          {currentQuestion.options.map((option) => (
            <label key={option.id} className="option-item">
              <input
                type="radio"
                name={`question-${currentQuestion.id}`}
                value={option.id}
                checked={userAnswers[currentQuestion.id] === option.id}
                onChange={() => handleAnswerSelect(currentQuestion.id, option.id)}
              />
              <span className="option-text">{option.text}</span>
              {answersRevealed && option.is_correct && (
                <span className="correct-indicator"> ✅ (Correct Answer)</span>
              )}
            </label>
          ))}
        </div>

        <div className="question-navigation">
          {currentQuestionIndex > 0 && (
            <button
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
              className="btn-secondary"
            >
              Previous
            </button>
          )}
          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
              className="btn-primary"
            >
              Next
            </button>
          ) : (
            <button onClick={handleSubmit} className="btn-primary">
              Submit Quiz
            </button>
          )}
        </div>

        {!answersRevealed && (
          <button onClick={handleRevealAnswers} className="btn-reveal">
            Reveal Answers
          </button>
        )}
      </div>
    </div>
  );
}

export default TakeQuiz;
