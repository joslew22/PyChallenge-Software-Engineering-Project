from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    QuizViewSet, QuizAttemptViewSet,
    register_view, login_view, user_profile_view, submit_quiz_view
)
from .social_auth import GoogleLogin, FacebookLogin, TwitterLogin

router = DefaultRouter()
router.register(r'quizzes', QuizViewSet, basename='quiz')
router.register(r'attempts', QuizAttemptViewSet, basename='attempt')

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', register_view, name='register'),
    path('auth/login/', login_view, name='login'),
    path('auth/profile/', user_profile_view, name='profile'),

    # Social authentication endpoints
    path('auth/google/', GoogleLogin.as_view(), name='google_login'),
    path('auth/facebook/', FacebookLogin.as_view(), name='facebook_login'),
    path('auth/twitter/', TwitterLogin.as_view(), name='twitter_login'),

    # Quiz submission
    path('quizzes/<int:quiz_id>/submit/', submit_quiz_view, name='submit-quiz'),

    # Include router URLs
    path('', include(router.urls)),
]
