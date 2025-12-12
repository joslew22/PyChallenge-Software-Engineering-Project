import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/api';
import '../styles/Quiz.css';

function CreateQuiz() {
  const navigate = useNavigate();
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [questions, setQuestions] = useState([
    {
      text: '',
      options: [
        { text: '', is_correct: false },
        { text: '', is_correct: false },
      ],
    },
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: '',
        options: [
          { text: '', is_correct: false },
          { text: '', is_correct: false },
        ],
      },
    ]);
  };

  const removeQuestion = (questionIndex) => {
    setQuestions(questions.filter((_, i) => i !== questionIndex));
  };

  const updateQuestion = (questionIndex, text) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].text = text;
    setQuestions(newQuestions);
  };

  const addOption = (questionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.push({ text: '', is_correct: false });
    setQuestions(newQuestions);
  };

  const removeOption = (questionIndex, optionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter(
      (_, i) => i !== optionIndex
    );
    setQuestions(newQuestions);
  };

  const updateOption = (questionIndex, optionIndex, text) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex].text = text;
    setQuestions(newQuestions);
  };

  const toggleCorrectAnswer = (questionIndex, optionIndex) => {
    const newQuestions = [...questions];
    // Set all options to false first
    newQuestions[questionIndex].options.forEach((opt) => (opt.is_correct = false));
    // Set selected option to true
    newQuestions[questionIndex].options[optionIndex].is_correct = true;
    setQuestions(newQuestions);
  };

  const validateQuiz = () => {
    if (!quizTitle.trim()) {
      setError('Quiz title is required');
      return false;
    }

    if (questions.length === 0) {
      setError('At least one question is required');
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        setError(`Question ${i + 1} text is required`);
        return false;
      }

      if (q.options.length < 2) {
        setError(`Question ${i + 1} must have at least 2 options`);
        return false;
      }

      const hasCorrectAnswer = q.options.some((opt) => opt.is_correct);
      if (!hasCorrectAnswer) {
        setError(`Question ${i + 1} must have a correct answer selected`);
        return false;
      }

      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].text.trim()) {
          setError(`Question ${i + 1}, Option ${j + 1} text is required`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateQuiz()) {
      return;
    }

    setLoading(true);

    try {
      const quizData = {
        title: quizTitle,
        description: quizDescription,
        questions: questions,
      };

      await quizAPI.create(quizData);
      alert('Quiz created successfully!');
      navigate('/my-quizzes');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-quiz-container">
      <h1>Create New Quiz</h1>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="quizTitle">Quiz Title *</label>
          <input
            type="text"
            id="quizTitle"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            placeholder="Enter quiz title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="quizDescription">Description (optional)</label>
          <textarea
            id="quizDescription"
            value={quizDescription}
            onChange={(e) => setQuizDescription(e.target.value)}
            placeholder="Enter quiz description"
            rows="3"
          />
        </div>

        <div className="questions-section">
          <h2>Questions</h2>

          {questions.map((question, qIndex) => (
            <div key={qIndex} className="question-card">
              <div className="question-header">
                <h3>Question {qIndex + 1}</h3>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="btn-delete"
                  >
                    Remove Question
                  </button>
                )}
              </div>

              <div className="form-group">
                <label>Question Text *</label>
                <input
                  type="text"
                  value={question.text}
                  onChange={(e) => updateQuestion(qIndex, e.target.value)}
                  placeholder="Enter question"
                  required
                />
              </div>

              <div className="options-section">
                <label>Options *</label>
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="option-input-group">
                    <input
                      type="radio"
                      name={`correct-${qIndex}`}
                      checked={option.is_correct}
                      onChange={() => toggleCorrectAnswer(qIndex, oIndex)}
                      title="Mark as correct answer"
                    />
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                      placeholder={`Option ${oIndex + 1}`}
                      required
                    />
                    {question.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(qIndex, oIndex)}
                        className="btn-delete-small"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addOption(qIndex)}
                  className="btn-secondary"
                >
                  + Add Option
                </button>
              </div>
            </div>
          ))}

          <button type="button" onClick={addQuestion} className="btn-secondary">
            + Add Question
          </button>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating Quiz...' : 'Create Quiz'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateQuiz;
