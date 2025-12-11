# PyChallenge — Interactive Quiz Application

A full-stack quiz platform built with **React** and **Django**, featuring user authentication, quiz creation, leaderboards, and real-time scoring.

Built for **CSCI 375 Software Engineering** - Fall 2025

---

## 🚀 Features

### Core Functionality
- ✅ **User Authentication** - Secure JWT-based registration and login
- ✅ **Create Quizzes** - Build custom quizzes with multiple-choice questions
- ✅ **Take Quizzes** - Complete quizzes created by other users
- ✅ **View My Quizzes** - Manage and delete your own quizzes
- ✅ **Quiz Deletion** - Creator-only deletion with authorization
- ✅ **Reveal Answers** - Option to reveal correct answers during quiz attempts

### Additional Features
- 📊 **Global Leaderboard** - Top scores across all users
- 📈 **Personal Score Tracking** - View your quiz attempt history
- 🔒 **Authorization** - Users can only delete their own quizzes
- 🎯 **Quiz Filtering** - Browse all quizzes, your quizzes, or others' quizzes
- 📱 **RESTful API** - Complete backend API with Django REST Framework

---

## 🛠️ Tech Stack

**Frontend:**
- React 18
- React Router v6
- Axios for API calls
- Context API for state management

**Backend:**
- Django 6.0
- Django REST Framework 3.16
- djangorestframework-simplejwt (JWT Authentication)
- django-cors-headers

**Database:**
- SQLite (development)
- PostgreSQL ready (production)

---

## 📋 Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- npm or yarn
- Git

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/joslew22/PyChallenge-Software-Engineering-Project.git
cd PyChallenge-Software-Engineering-Project
```

### 2. Backend Setup (Django)

#### Create and activate virtual environment

```bash
# macOS/Linux
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

#### Install dependencies

```bash
pip install -r requirements.txt
```

#### Run database migrations

```bash
cd backend
python manage.py migrate
```

#### Load sample quiz data (optional but recommended)

```bash
python migrate_quizzes.py
```

This creates:
- Admin user (username: `admin`, password: `admin123`)
- 5 sample quizzes with 17 questions

#### Create a superuser for Django admin (optional)

```bash
python manage.py createsuperuser
```

Follow the prompts to create your admin account.

#### Start the Django development server

```bash
python manage.py runserver
```

Backend will run on: **http://localhost:8000**

Django Admin: **http://localhost:8000/admin**

API Root: **http://localhost:8000/api/**

### 3. Frontend Setup (React)

**Open a new terminal** and navigate to the frontend directory:

```bash
cd frontend
```

#### Install dependencies

```bash
npm install
```

#### Start the React development server

```bash
npm start
```

Frontend will run on: **http://localhost:3000**

---

## 🎮 Usage

### Using the Application

1. **Register** a new account or login with existing credentials
2. **Browse Quizzes** on the home page
3. **Create a Quiz** using the "Create New Quiz" button
4. **Take a Quiz** by clicking "Take Quiz" on any quiz card
5. **View Leaderboard** to see top scores
6. **Manage Your Quizzes** in the "My Quizzes" section

### Default Test Account

After running `migrate_quizzes.py`:
- **Username:** `admin`
- **Password:** `admin123`

---

## 🧪 Running Tests

### Backend Tests (Django)

```bash
cd backend
python manage.py test quizzes
```

**Test Coverage:**
- 25 comprehensive unit tests
- Authentication (registration, login, JWT)
- Quiz CRUD operations
- Authorization (creator-only deletion)
- Quiz submission and scoring
- Leaderboard functionality

### Frontend Tests (React)

```bash
cd frontend
npm test
```

---

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register/` | Register new user | No |
| POST | `/api/auth/login/` | Login and get JWT tokens | No |
| GET | `/api/auth/profile/` | Get current user profile | Yes |
| POST | `/api/token/refresh/` | Refresh JWT access token | No |

### Quiz Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/quizzes/` | List all quizzes | No |
| POST | `/api/quizzes/` | Create a new quiz | Yes |
| GET | `/api/quizzes/{id}/` | Get quiz details | No |
| PUT | `/api/quizzes/{id}/` | Update quiz | Yes (creator only) |
| DELETE | `/api/quizzes/{id}/` | Delete quiz | Yes (creator only) |
| GET | `/api/quizzes/my_quizzes/` | Get user's quizzes | Yes |
| GET | `/api/quizzes/others_quizzes/` | Get other users' quizzes | Yes |
| POST | `/api/quizzes/{id}/submit/` | Submit quiz answers | Yes |

### Quiz Attempt Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/attempts/my_scores/` | Get personal score history | Yes |
| GET | `/api/attempts/leaderboard/` | Get global leaderboard | Yes |

### Example API Requests

**Register a User:**
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Test123!@#",
    "password2": "Test123!@#",
    "email": "test@example.com"
  }'
```

**Create a Quiz:**
```bash
curl -X POST http://localhost:8000/api/quizzes/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Python Basics",
    "description": "Test your Python knowledge",
    "questions": [
      {
        "text": "What is 2 + 2?",
        "options": [
          {"text": "3", "is_correct": false},
          {"text": "4", "is_correct": true},
          {"text": "5", "is_correct": false}
        ]
      }
    ]
  }'
```

**Submit Quiz Answers:**
```bash
curl -X POST http://localhost:8000/api/quizzes/1/submit/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "answers": {
      "1": "2",
      "2": "5"
    },
    "answers_revealed": false
  }'
```

For interactive API documentation, visit: **http://localhost:8000/api/** (when server is running)

---

## 📁 Project Structure

```
PyChallenge-Software-Engineering-Project/
│
├── backend/                     # Django Backend
│   ├── backend/
│   │   ├── settings.py          # Django settings (CORS, JWT, REST)
│   │   └── urls.py              # Main URL routing
│   ├── quizzes/
│   │   ├── models.py            # Quiz, Question, Option, QuizAttempt models
│   │   ├── serializers.py       # DRF serializers
│   │   ├── views.py             # API views and ViewSets
│   │   ├── urls.py              # Quiz API routes
│   │   ├── admin.py             # Django admin configuration
│   │   └── tests.py             # Unit tests (25 tests)
│   ├── migrate_quizzes.py       # Script to load sample data
│   ├── db.sqlite3               # Database file
│   └── manage.py
│
├── frontend/                    # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/          # Reusable React components
│   │   ├── contexts/
│   │   │   └── AuthContext.js   # Authentication state management
│   │   ├── pages/
│   │   │   ├── Home.js          # Quiz listing
│   │   │   ├── Login.js         # Login page
│   │   │   ├── Register.js      # Registration page
│   │   │   ├── TakeQuiz.js      # Quiz taking interface
│   │   │   ├── CreateQuiz.js    # Quiz creation form
│   │   │   ├── MyQuizzes.js     # User's quiz management
│   │   │   └── Leaderboard.js   # Scores and leaderboard
│   │   ├── services/
│   │   │   └── api.js           # API service layer (axios)
│   │   ├── styles/              # CSS files
│   │   ├── App.js               # Main React app
│   │   └── index.js
│   ├── package.json
│   └── node_modules/
│
├── data/                        # Sample data
│   └── sample_quizzes.json      # Quiz seed data
│
├── requirements.txt             # Python dependencies
├── README.md                    # This file
├── PROJECT_STATUS.md            # Project status and roadmap
├── REACT_IMPLEMENTATION_GUIDE.md  # Frontend development guide
└── COMPLETION_CHECKLIST.md      # Final completion checklist
```

---

## 👥 Team Members

- [Add your names here]

---

## 📝 Project Requirements Met

This project fulfills all **CSCI 375 Software Engineering** core requirements:

### Core User Stories (5/5 Complete)
- ✅ I can create a challenge with multiple questions and correct answers
- ✅ I can see all challenges that I have created
- ✅ I can delete any challenge that I have created
- ✅ I can complete challenges made by other users and check my answers
- ✅ I can reveal answers to another user's challenge if I cannot figure them out

### Technical Requirements
- ✅ Frontend web interface (React)
- ✅ Backend API (Django REST Framework)
- ✅ User authentication (JWT)
- ✅ Database CRUD operations (SQLite/PostgreSQL)
- ✅ Unit testing (25 backend tests)

### Additional Features (Stretch Goals)
- ✅ Leadership boards and metrics
- ✅ API architecture
- ⚠️ Responsive mobile design (in progress)
- ⚠️ Accessibility features (in progress)

---

## 🐛 Troubleshooting

### Backend Issues

**Port 8000 already in use:**
```bash
# Find and kill the process
lsof -ti:8000 | xargs kill -9

# Or use a different port
python manage.py runserver 8001
```

**Database migration errors:**
```bash
# Reset database
rm db.sqlite3
python manage.py migrate
python migrate_quizzes.py
```

**CORS errors:**
- Ensure `CORS_ALLOWED_ORIGINS` in `backend/settings.py` includes `http://localhost:3000`
- Check that `corsheaders.middleware.CorsMiddleware` is in `MIDDLEWARE`

### Frontend Issues

**Node modules errors:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**API connection errors:**
- Verify backend is running on `http://localhost:8000`
- Check `frontend/src/services/api.js` has correct `API_BASE_URL`
- Open browser DevTools > Network tab to debug API calls

**JWT token expired:**
- Logout and login again
- Token refresh happens automatically via axios interceptors

---

## 🚀 Deployment

### Backend (Django)

For production deployment:

1. Set `DEBUG = False` in `settings.py`
2. Configure `ALLOWED_HOSTS`
3. Use PostgreSQL instead of SQLite
4. Set up environment variables for secrets
5. Deploy to Heroku, AWS, or DigitalOcean

### Frontend (React)

```bash
cd frontend
npm run build
```

Deploy the `build/` folder to:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

---

## 📄 License

This project is for educational purposes as part of CSCI 375 Software Engineering course.

---

## 🙏 Acknowledgments

- Built with [Django](https://www.djangoproject.com/)
- Frontend powered by [React](https://react.dev/)
- Authentication via [djangorestframework-simplejwt](https://github.com/jazzband/djangorestframework-simplejwt)
- Icons and UI inspiration from modern quiz applications

---

## 📞 Support

For questions or issues:
- Check [COMPLETION_CHECKLIST.md](COMPLETION_CHECKLIST.md) for project status
- Review [REACT_IMPLEMENTATION_GUIDE.md](REACT_IMPLEMENTATION_GUIDE.md) for frontend help
- See [PROJECT_STATUS.md](PROJECT_STATUS.md) for detailed documentation

---

**Last Updated:** December 11, 2025
**Version:** 1.0.0
**Status:** 🟢 Backend Complete | 🟡 Frontend In Progress
