import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('accessToken', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: (userData) => api.post('/auth/register/', userData),
  login: (credentials) => api.post('/auth/login/', credentials),
  getProfile: () => api.get('/auth/profile/'),
};

// Quiz API
export const quizAPI = {
  getAll: () => api.get('/quizzes/'),
  getById: (id) => api.get(`/quizzes/${id}/`),
  create: (quizData) => api.post('/quizzes/', quizData),
  update: (id, quizData) => api.put(`/quizzes/${id}/`, quizData),
  delete: (id) => api.delete(`/quizzes/${id}/`),
  getMyQuizzes: () => api.get('/quizzes/my_quizzes/'),
  getOthersQuizzes: () => api.get('/quizzes/others_quizzes/'),
  submitAnswers: (quizId, answers, answersRevealed = false) =>
    api.post(`/quizzes/${quizId}/submit/`, {
      answers,
      answers_revealed: answersRevealed,
    }),
};

// Quiz Attempt API
export const attemptAPI = {
  getMyAttempts: () => api.get('/attempts/'),
  getMyScores: () => api.get('/attempts/my_scores/'),
  getLeaderboard: () => api.get('/attempts/leaderboard/'),
};

export default api;
