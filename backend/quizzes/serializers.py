from rest_framework import serializers
from .models import Quiz, Question, Option


class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ["id", "text", "is_correct"]


class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True)

    class Meta:
        model = Question
        fields = ["id", "text", "options"]


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, source="question_set")

    class Meta:
        model = Quiz
        fields = ["id", "title", "created_at", "creator", "questions"]
