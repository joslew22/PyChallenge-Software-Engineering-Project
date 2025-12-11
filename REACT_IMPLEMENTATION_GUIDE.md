# React Frontend Implementation Guide

## Current Progress

### ✅ Completed
- React app created with Create React App
- Dependencies installed (axios, react-router-dom)
- Folder structure created
- API service layer implemented (`src/services/api.js`)
- AuthContext created for authentication state management
- Login and Register pages created
- Home page with quiz listing created

### 🔧 Backend Ready
- Django REST API fully functional
- JWT authentication configured
- CORS enabled for React frontend
- All models migrated and ready

---

## Remaining React Components to Build

### 1. Navigation Component
**File**: `frontend/src/components/Navbar.js`

```jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">PyChallenge</Link>
      <div className="navbar-links">
        {isAuthenticated ? (
          <>
            <Link to="/">Quizzes</Link>
            <Link to="/my-quizzes">My Quizzes</Link>
            <Link to="/leaderboard">Leaderboard</Link>
            <Link to="/create-quiz">Create Quiz</Link>
            <span>Welcome, {user.username}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
```

### 2. Protected Route Component
**File**: `frontend/src/components/ProtectedRoute.js`

```jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
```

### 3. Quiz Taking Page
**File**: `frontend/src/pages/TakeQuiz.js`

Key features:
- Load quiz by ID
- Display questions one at a time or all at once
- Shuffle options
- Track user answers
- Submit to backend
- Show results with correct/incorrect indicators
- "Reveal Answers" button

### 4. Quiz Creation Page
**File**: `frontend/src/pages/CreateQuiz.js`

Key features:
- Form to create quiz title and description
- Dynamic add/remove questions
- Dynamic add/remove options per question
- Mark correct answer for each question
- Validate at least one correct answer per question
- Submit to backend API

### 5. My Quizzes Page
**File**: `frontend/src/pages/MyQuizzes.js`

Key features:
- List quizzes created by current user
- View button to see quiz details
- Delete button with confirmation
- Edit functionality (optional)

### 6. Leaderboard Page
**File**: `frontend/src/pages/Leaderboard.js`

Key features:
- Global leaderboard (all users' top scores)
- Personal score history
- Filter by quiz
- Display username, quiz title, score, date

### 7. Quiz Results Component
**File**: `frontend/src/components/QuizResults.js`

Key features:
- Show score (X out of Y)
- Percentage
- Question-by-question breakdown
- Correct answer display
- Option to retake or go home

### 8. CSS Styling
Create the following CSS files:

**`src/styles/Auth.css`** - Login/Register styling
**`src/styles/Home.css`** - Quiz listing styling
**`src/styles/Quiz.css`** - Quiz taking styling
**`src/styles/Navbar.css`** - Navigation styling
**`src/styles/App.css`** - Global styles

### 9. Main App Component
**File**: `frontend/src/App.js`

```jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import TakeQuiz from './pages/TakeQuiz';
import CreateQuiz from './pages/CreateQuiz';
import MyQuizzes from './pages/MyQuizzes';
import Leaderboard from './pages/Leaderboard';
import './styles/App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <div className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Home />} />
              <Route path="/quiz/:id" element={<TakeQuiz />} />
              <Route
                path="/create-quiz"
                element={
                  <ProtectedRoute>
                    <CreateQuiz />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-quizzes"
                element={
                  <ProtectedRoute>
                    <MyQuizzes />
                  </ProtectedRoute>
                }
              />
              <Route path="/leaderboard" element={<Leaderboard />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

### 10. Update `frontend/src/index.js`

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## Running the Application

### Terminal 1: Django Backend
```bash
cd /Users/pop/PyChallenge-Software-Engineering-Project-1/backend
python manage.py runserver
```
Backend runs on: http://localhost:8000

### Terminal 2: React Frontend
```bash
cd /Users/pop/PyChallenge-Software-Engineering-Project-1/frontend
npm start
```
Frontend runs on: http://localhost:3000

---

## Testing Checklist

### Core User Stories
- [ ] I can create a challenge with multiple questions and correct answers
- [ ] I can see all challenges that I have created
- [ ] I can delete any challenge that I have created
- [ ] I can complete challenges made by other users and check my answers
- [ ] I can reveal answers to another user's challenge if I cannot figure them out

### Additional Features
- [ ] User registration and login
- [ ] JWT token authentication
- [ ] Quiz browsing and filtering
- [ ] Quiz attempt tracking
- [ ] Leaderboard display
- [ ] Responsive design
- [ ] Error handling

---

## Data Migration

To migrate existing quiz data from `data/sample_quizzes.json` to Django database:

**File**: `backend/migrate_quizzes.py`

```python
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from quizzes.models import Quiz, Question, Option

# Create a default admin user if doesn't exist
admin_user, created = User.objects.get_or_create(
    username='admin',
    defaults={'email': 'admin@pychallenge.com'}
)
if created:
    admin_user.set_password('admin123')
    admin_user.save()

# Load JSON data
with open('../data/sample_quizzes.json', 'r') as f:
    quizzes_data = json.load(f)

# Migrate each quiz
for quiz_data in quizzes_data:
    quiz = Quiz.objects.create(
        title=quiz_data['title'],
        description=quiz_data.get('description', ''),
        creator=admin_user
    )

    for question_data in quiz_data['questions']:
        question = Question.objects.create(
            quiz=quiz,
            text=question_data['question']
        )

        for option_text in question_data['options']:
            is_correct = option_text == question_data['correct_answer']
            Option.objects.create(
                question=question,
                text=option_text,
                is_correct=is_correct
            )

print(f"Migrated {len(quizzes_data)} quizzes successfully!")
```

Run: `python backend/migrate_quizzes.py`

---

## Next Steps

1. Create remaining React components (TakeQuiz, CreateQuiz, MyQuizzes, Leaderboard)
2. Implement CSS styling for all pages
3. Add error handling and loading states
4. Write unit tests for critical components
5. Test full user flow end-to-end
6. Migrate quiz data from JSON to database
7. Add accessibility features (ARIA labels, keyboard navigation)
8. Deploy to production (optional)

---

## File Structure Summary

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── Navbar.js ⚠️ TO CREATE
│   │   ├── ProtectedRoute.js ⚠️ TO CREATE
│   │   └── QuizResults.js ⚠️ TO CREATE
│   ├── contexts/
│   │   └── AuthContext.js ✅ DONE
│   ├── pages/
│   │   ├── Home.js ✅ DONE
│   │   ├── Login.js ✅ DONE
│   │   ├── Register.js ✅ DONE
│   │   ├── TakeQuiz.js ⚠️ TO CREATE
│   │   ├── CreateQuiz.js ⚠️ TO CREATE
│   │   ├── MyQuizzes.js ⚠️ TO CREATE
│   │   └── Leaderboard.js ⚠️ TO CREATE
│   ├── services/
│   │   └── api.js ✅ DONE
│   ├── styles/
│   │   ├── App.css ⚠️ TO CREATE
│   │   ├── Auth.css ⚠️ TO CREATE
│   │   ├── Home.css ⚠️ TO CREATE
│   │   ├── Navbar.css ⚠️ TO CREATE
│   │   └── Quiz.css ⚠️ TO CREATE
│   ├── App.js ⚠️ TO CREATE
│   └── index.js ⚠️ TO UPDATE
└── package.json ✅ DONE
```

---

## API Endpoints Reference

### Authentication
- POST `/api/auth/register/` - Register new user
- POST `/api/auth/login/` - Login user
- GET `/api/auth/profile/` - Get user profile
- POST `/api/token/refresh/` - Refresh JWT token

### Quizzes
- GET `/api/quizzes/` - List all quizzes
- POST `/api/quizzes/` - Create quiz (auth required)
- GET `/api/quizzes/{id}/` - Get quiz details
- PUT `/api/quizzes/{id}/` - Update quiz (creator only)
- DELETE `/api/quizzes/{id}/` - Delete quiz (creator only)
- GET `/api/quizzes/my_quizzes/` - Get user's quizzes
- GET `/api/quizzes/others_quizzes/` - Get other users' quizzes
- POST `/api/quizzes/{id}/submit/` - Submit quiz answers

### Quiz Attempts
- GET `/api/attempts/` - Get user's attempts
- GET `/api/attempts/my_scores/` - Get user's score history
- GET `/api/attempts/leaderboard/` - Get global leaderboard

---

This guide provides the complete roadmap for finishing your React frontend implementation!
