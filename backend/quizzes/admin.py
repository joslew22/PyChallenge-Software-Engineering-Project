from django.contrib import admin
from .models import Quiz, Question, Option, QuizAttempt


class OptionInline(admin.TabularInline):
    model = Option
    extra = 2


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ['title', 'creator', 'created_at']
    list_filter = ['created_at', 'creator']
    search_fields = ['title', 'description']
    inlines = [QuestionInline]


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['text', 'quiz']
    list_filter = ['quiz']
    search_fields = ['text']
    inlines = [OptionInline]


@admin.register(Option)
class OptionAdmin(admin.ModelAdmin):
    list_display = ['text', 'question', 'is_correct']
    list_filter = ['is_correct']


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ['user', 'quiz', 'score', 'total_questions', 'completed_at', 'answers_revealed']
    list_filter = ['completed_at', 'answers_revealed']
    search_fields = ['user__username', 'quiz__title']
    readonly_fields = ['completed_at']

