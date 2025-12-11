from rest_framework import generics, viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Quiz, Question, Option, QuizAttempt
from .serializers import (
    UserSerializer, RegisterSerializer,
    QuizListSerializer, QuizDetailSerializer, QuizCreateSerializer,
    QuizAttemptSerializer
)


# Authentication Views
@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """Register a new user"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Login user and return JWT tokens"""
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)
    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile_view(request):
    """Get current user profile"""
    return Response(UserSerializer(request.user).data)


# Quiz Permission Class
class IsCreatorOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow creators of a quiz to edit or delete it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        # Write permissions are only allowed to the creator
        return obj.creator == request.user


# Quiz ViewSet
class QuizViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Quiz CRUD operations
    - List all quizzes (GET /api/quizzes/)
    - Create quiz (POST /api/quizzes/)
    - Retrieve quiz (GET /api/quizzes/{id}/)
    - Update quiz (PUT/PATCH /api/quizzes/{id}/)
    - Delete quiz (DELETE /api/quizzes/{id}/)
    - Get user's quizzes (GET /api/quizzes/my_quizzes/)
    - Get quizzes by others (GET /api/quizzes/others_quizzes/)
    """
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsCreatorOrReadOnly]

    def get_queryset(self):
        return Quiz.objects.all().prefetch_related('questions__options')

    def get_serializer_class(self):
        if self.action == 'list':
            return QuizListSerializer
        elif self.action == 'create':
            return QuizCreateSerializer
        return QuizDetailSerializer

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_quizzes(self, request):
        """Get quizzes created by the current user"""
        quizzes = Quiz.objects.filter(creator=request.user).prefetch_related('questions__options')
        serializer = QuizListSerializer(quizzes, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def others_quizzes(self, request):
        """Get quizzes created by other users"""
        quizzes = Quiz.objects.exclude(creator=request.user).prefetch_related('questions__options')
        serializer = QuizListSerializer(quizzes, many=True)
        return Response(serializer.data)


# Quiz Attempt Views
class QuizAttemptViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Quiz Attempts
    - Submit quiz attempt (POST /api/attempts/)
    - Get user's attempts (GET /api/attempts/)
    - Get leaderboard (GET /api/attempts/leaderboard/)
    """
    permission_classes = [IsAuthenticated]
    serializer_class = QuizAttemptSerializer

    def get_queryset(self):
        return QuizAttempt.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        """Get global leaderboard - top scores across all users"""
        attempts = QuizAttempt.objects.all().order_by('-score', 'completed_at')[:50]
        serializer = QuizAttemptSerializer(attempts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_scores(self, request):
        """Get current user's quiz attempt history"""
        attempts = QuizAttempt.objects.filter(user=request.user).order_by('-completed_at')[:20]
        serializer = QuizAttemptSerializer(attempts, many=True)
        return Response(serializer.data)


# Submit Quiz Answer
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_quiz_view(request, quiz_id):
    """
    Submit answers for a quiz and get score
    Expected payload: {
        "answers": {"question_id": "option_id", ...},
        "answers_revealed": false
    }
    """
    try:
        quiz = Quiz.objects.prefetch_related('questions__options').get(id=quiz_id)
    except Quiz.DoesNotExist:
        return Response({'error': 'Quiz not found'}, status=status.HTTP_404_NOT_FOUND)

    answers = request.data.get('answers', {})
    answers_revealed = request.data.get('answers_revealed', False)

    # Calculate score
    score = 0
    total_questions = quiz.questions.count()
    results = []

    for question in quiz.questions.all():
        correct_option = question.options.filter(is_correct=True).first()
        user_answer_id = answers.get(str(question.id))

        is_correct = False
        if user_answer_id and correct_option:
            is_correct = int(user_answer_id) == correct_option.id
            if is_correct:
                score += 1

        results.append({
            'question_id': question.id,
            'question_text': question.text,
            'correct_option_id': correct_option.id if correct_option else None,
            'user_answer_id': user_answer_id,
            'is_correct': is_correct
        })

    # Save attempt
    attempt = QuizAttempt.objects.create(
        quiz=quiz,
        user=request.user,
        score=score,
        total_questions=total_questions,
        answers_revealed=answers_revealed
    )

    return Response({
        'attempt_id': attempt.id,
        'score': score,
        'total_questions': total_questions,
        'percentage': round((score / total_questions * 100), 2) if total_questions > 0 else 0,
        'results': results
    })
