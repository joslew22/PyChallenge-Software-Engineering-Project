"""
Script to migrate quiz data from JSON to Django database
Run: python manage.py shell < migrate_quizzes.py
Or: python migrate_quizzes.py
"""
import os
import sys
import django
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from quizzes.models import Quiz, Question, Option

def migrate_quizzes():
    # Create a default admin user if doesn't exist
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={'email': 'admin@pychallenge.com'}
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        print(f"✅ Created admin user (username: admin, password: admin123)")
    else:
        print(f"✅ Admin user already exists")

    # Load JSON data
    json_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'sample_quizzes.json')

    if not os.path.exists(json_path):
        print(f"❌ File not found: {json_path}")
        return

    with open(json_path, 'r') as f:
        quizzes_data = json.load(f)

    print(f"\n📚 Found {len(quizzes_data)} quizzes to migrate\n")

    # Clear existing quiz data (optional - comment out if you want to keep existing)
    # Quiz.objects.all().delete()
    # print("🗑️  Cleared existing quiz data")

    # Migrate each quiz
    for idx, quiz_data in enumerate(quizzes_data, 1):
        # Check if quiz already exists
        existing_quiz = Quiz.objects.filter(title=quiz_data['title']).first()
        if existing_quiz:
            print(f"⚠️  Quiz '{quiz_data['title']}' already exists, skipping...")
            continue

        quiz = Quiz.objects.create(
            title=quiz_data['title'],
            description=quiz_data.get('description', ''),
            creator=admin_user
        )
        print(f"{idx}. Created quiz: {quiz.title}")

        for q_idx, question_data in enumerate(quiz_data['questions'], 1):
            question = Question.objects.create(
                quiz=quiz,
                text=question_data['question']
            )

            # Create options
            for option_text in question_data['options']:
                # Check if this option is the correct answer
                is_correct = option_text == question_data['answer']
                Option.objects.create(
                    question=question,
                    text=option_text,
                    is_correct=is_correct
                )

            print(f"   ✓ Question {q_idx}: {question.text[:50]}...")

    print(f"\n✅ Successfully migrated {len(quizzes_data)} quizzes!")
    print(f"\n📊 Database summary:")
    print(f"   - Total quizzes: {Quiz.objects.count()}")
    print(f"   - Total questions: {Question.objects.count()}")
    print(f"   - Total options: {Option.objects.count()}")

if __name__ == '__main__':
    migrate_quizzes()
