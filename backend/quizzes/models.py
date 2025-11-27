from django.db import models

class Quiz(models.Model):
    title = models.CharField(max_length=255)
    creator = models.CharField(max_length=100)  # Firebase UID or username
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Question(models.Model):
    quiz = models.ForeignKey(
        Quiz,
        related_name="questions",
        on_delete=models.CASCADE
    )
    text = models.CharField(max_length=255)

    def __str__(self):
        return self.text


class Option(models.Model):
    question = models.ForeignKey(
        Question,
        related_name="options",
        on_delete=models.CASCADE
    )
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.text} ({'Correct' if self.is_correct else 'Wrong'})"
