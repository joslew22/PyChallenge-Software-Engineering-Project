from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from .models import Quiz, Question, Option, QuizAttempt


class AuthenticationTestCase(APITestCase):
    """Test user registration and authentication"""

    def test_user_registration(self):
        """Test that a user can register successfully"""
        url = '/api/auth/register/'
        data = {
            'username': 'testuser',
            'password': 'TestPass123!',
            'password2': 'TestPass123!',
            'email': 'test@example.com'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['username'], 'testuser')

    def test_user_registration_password_mismatch(self):
        """Test registration fails when passwords don't match"""
        url = '/api/auth/register/'
        data = {
            'username': 'testuser',
            'password': 'TestPass123!',
            'password2': 'DifferentPass123!',
            'email': 'test@example.com'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_login(self):
        """Test that a user can login successfully"""
        # Create user
        user = User.objects.create_user(username='testuser', password='TestPass123!')

        # Login
        url = '/api/auth/login/'
        data = {'username': 'testuser', 'password': 'TestPass123!'}
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_user_login_invalid_credentials(self):
        """Test login fails with invalid credentials"""
        url = '/api/auth/login/'
        data = {'username': 'nonexistent', 'password': 'wrongpass'}
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_user_profile_requires_auth(self):
        """Test that getting user profile requires authentication"""
        url = '/api/auth/profile/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_user_profile_authenticated(self):
        """Test authenticated user can get their profile"""
        user = User.objects.create_user(username='testuser', password='test123')
        self.client.force_authenticate(user=user)

        url = '/api/auth/profile/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')


class QuizModelTestCase(TestCase):
    """Test Quiz, Question, and Option models"""

    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='test123')

    def test_create_quiz(self):
        """Test creating a quiz"""
        quiz = Quiz.objects.create(
            title='Test Quiz',
            description='A test quiz',
            creator=self.user
        )
        self.assertEqual(quiz.title, 'Test Quiz')
        self.assertEqual(quiz.creator, self.user)

    def test_create_question_with_options(self):
        """Test creating a question with multiple options"""
        quiz = Quiz.objects.create(title='Test Quiz', creator=self.user)
        question = Question.objects.create(quiz=quiz, text='What is 2+2?')

        Option.objects.create(question=question, text='3', is_correct=False)
        Option.objects.create(question=question, text='4', is_correct=True)
        Option.objects.create(question=question, text='5', is_correct=False)

        self.assertEqual(question.options.count(), 3)
        correct_option = question.options.filter(is_correct=True).first()
        self.assertEqual(correct_option.text, '4')

    def test_quiz_deletion_cascades(self):
        """Test that deleting a quiz deletes its questions and options"""
        quiz = Quiz.objects.create(title='Test Quiz', creator=self.user)
        question = Question.objects.create(quiz=quiz, text='Question?')
        Option.objects.create(question=question, text='Answer', is_correct=True)

        quiz_id = quiz.id
        quiz.delete()

        self.assertEqual(Question.objects.filter(quiz_id=quiz_id).count(), 0)


class QuizAPITestCase(APITestCase):
    """Test Quiz API endpoints"""

    def setUp(self):
        self.user1 = User.objects.create_user(username='user1', password='pass123')
        self.user2 = User.objects.create_user(username='user2', password='pass123')

        # Create a quiz for user1
        self.quiz1 = Quiz.objects.create(
            title='User 1 Quiz',
            description='Quiz by user 1',
            creator=self.user1
        )
        question = Question.objects.create(quiz=self.quiz1, text='Question 1?')
        Option.objects.create(question=question, text='A', is_correct=False)
        Option.objects.create(question=question, text='B', is_correct=True)

    def test_list_quizzes_no_auth(self):
        """Test anyone can list quizzes without authentication"""
        url = '/api/quizzes/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_create_quiz_requires_auth(self):
        """Test creating a quiz requires authentication"""
        url = '/api/quizzes/'
        data = {
            'title': 'New Quiz',
            'description': 'Test',
            'questions': []
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_quiz_authenticated(self):
        """Test authenticated user can create a quiz"""
        self.client.force_authenticate(user=self.user1)

        url = '/api/quizzes/'
        data = {
            'title': 'New Quiz',
            'description': 'A new quiz',
            'questions': [
                {
                    'text': 'What is Python?',
                    'options': [
                        {'text': 'A snake', 'is_correct': False},
                        {'text': 'A programming language', 'is_correct': True}
                    ]
                }
            ]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'New Quiz')

    def test_get_quiz_detail(self):
        """Test retrieving a specific quiz"""
        url = f'/api/quizzes/{self.quiz1.id}/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'User 1 Quiz')
        self.assertEqual(len(response.data['questions']), 1)

    def test_user_can_delete_own_quiz(self):
        """Test user can delete their own quiz"""
        self.client.force_authenticate(user=self.user1)

        url = f'/api/quizzes/{self.quiz1.id}/'
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Quiz.objects.filter(id=self.quiz1.id).count(), 0)

    def test_user_cannot_delete_others_quiz(self):
        """Test user cannot delete another user's quiz"""
        self.client.force_authenticate(user=self.user2)

        url = f'/api/quizzes/{self.quiz1.id}/'
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Quiz.objects.filter(id=self.quiz1.id).count(), 1)

    def test_get_my_quizzes(self):
        """Test user can get their own quizzes"""
        # Create another quiz for user1
        Quiz.objects.create(title='Another Quiz', creator=self.user1)

        self.client.force_authenticate(user=self.user1)

        url = '/api/quizzes/my_quizzes/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_get_others_quizzes(self):
        """Test user can get quizzes created by others"""
        # Create a quiz for user2
        Quiz.objects.create(title='User 2 Quiz', creator=self.user2)

        self.client.force_authenticate(user=self.user1)

        url = '/api/quizzes/others_quizzes/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should only see user2's quiz, not user1's
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['creator_username'], 'user2')


class QuizSubmissionTestCase(APITestCase):
    """Test quiz submission and scoring"""

    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='test123')

        # Create a quiz with 2 questions
        self.quiz = Quiz.objects.create(title='Test Quiz', creator=self.user)

        q1 = Question.objects.create(quiz=self.quiz, text='What is 2+2?')
        self.opt1_correct = Option.objects.create(question=q1, text='4', is_correct=True)
        Option.objects.create(question=q1, text='5', is_correct=False)

        q2 = Question.objects.create(quiz=self.quiz, text='What is 3+3?')
        self.opt2_correct = Option.objects.create(question=q2, text='6', is_correct=True)
        Option.objects.create(question=q2, text='7', is_correct=False)

    def test_submit_quiz_answers_requires_auth(self):
        """Test submitting quiz answers requires authentication"""
        url = f'/api/quizzes/{self.quiz.id}/submit/'
        data = {'answers': {}}
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_submit_quiz_all_correct(self):
        """Test submitting all correct answers"""
        self.client.force_authenticate(user=self.user)

        url = f'/api/quizzes/{self.quiz.id}/submit/'
        data = {
            'answers': {
                str(self.quiz.questions.all()[0].id): str(self.opt1_correct.id),
                str(self.quiz.questions.all()[1].id): str(self.opt2_correct.id)
            },
            'answers_revealed': False
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['score'], 2)
        self.assertEqual(response.data['total_questions'], 2)
        self.assertEqual(response.data['percentage'], 100.0)

    def test_submit_quiz_partial_correct(self):
        """Test submitting partially correct answers"""
        self.client.force_authenticate(user=self.user)

        url = f'/api/quizzes/{self.quiz.id}/submit/'
        data = {
            'answers': {
                str(self.quiz.questions.all()[0].id): str(self.opt1_correct.id),
                str(self.quiz.questions.all()[1].id): '999'  # Wrong answer
            }
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['score'], 1)
        self.assertEqual(response.data['percentage'], 50.0)

    def test_submit_quiz_creates_attempt(self):
        """Test submitting quiz creates a QuizAttempt record"""
        self.client.force_authenticate(user=self.user)

        url = f'/api/quizzes/{self.quiz.id}/submit/'
        data = {
            'answers': {
                str(self.quiz.questions.all()[0].id): str(self.opt1_correct.id)
            }
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check attempt was created
        attempt = QuizAttempt.objects.get(id=response.data['attempt_id'])
        self.assertEqual(attempt.user, self.user)
        self.assertEqual(attempt.quiz, self.quiz)

    def test_submit_quiz_with_answers_revealed(self):
        """Test submitting quiz with answers revealed flag"""
        self.client.force_authenticate(user=self.user)

        url = f'/api/quizzes/{self.quiz.id}/submit/'
        data = {
            'answers': {},
            'answers_revealed': True
        }
        response = self.client.post(url, data, format='json')

        attempt = QuizAttempt.objects.get(id=response.data['attempt_id'])
        self.assertTrue(attempt.answers_revealed)


class LeaderboardTestCase(APITestCase):
    """Test leaderboard and score tracking"""

    def setUp(self):
        self.user1 = User.objects.create_user(username='user1', password='pass123')
        self.user2 = User.objects.create_user(username='user2', password='pass123')

        quiz = Quiz.objects.create(title='Test Quiz', creator=self.user1)

        # Create quiz attempts
        QuizAttempt.objects.create(
            quiz=quiz, user=self.user1, score=10, total_questions=10
        )
        QuizAttempt.objects.create(
            quiz=quiz, user=self.user2, score=8, total_questions=10
        )

    def test_get_leaderboard(self):
        """Test getting global leaderboard"""
        self.client.force_authenticate(user=self.user1)

        url = '/api/attempts/leaderboard/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        # Should be sorted by score (highest first)
        self.assertEqual(response.data[0]['score'], 10)

    def test_get_my_scores_requires_auth(self):
        """Test getting personal scores requires authentication"""
        url = '/api/attempts/my_scores/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_my_scores(self):
        """Test user can get their own scores"""
        self.client.force_authenticate(user=self.user1)

        url = '/api/attempts/my_scores/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['username'], 'user1')
