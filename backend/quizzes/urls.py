from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    QuizViewSet, QuizAttemptViewSet,
    register_view, login_view, user_profile_view, submit_quiz_view
)

router = DefaultRouter()
router.register(r'quizzes', QuizViewSet, basename='quiz')
router.register(r'attempts', QuizAttemptViewSet, basename='attempt')

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', register_view, name='register'),
    path('auth/login/', login_view, name='login'),
    path('auth/profile/', user_profile_view, name='profile'),

    # Quiz submission
    path('quizzes/<int:quiz_id>/submit/', submit_quiz_view, name='submit-quiz'),

    # Include router URLs
    path('', include(router.urls)),
]
