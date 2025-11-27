from django.urls import path
from .views import QuizListAPIView, QuizDetailAPIView

urlpatterns = [
    path("", QuizListAPIView.as_view(), name="quiz-list"),
    path("<int:id>/", QuizDetailAPIView.as_view(), name="quiz-detail"),
]
