PyChallenge — Interactive Python Quiz App

A Streamlit-powered quiz platform featuring **user authentication**, **secure scoring**, **multiple quizzes**, and a **modern UI experience**.
Built for learning, fun, and showcasing full-stack Python skills.

---

Features

User Authentication

PyChallenge includes a full login & registration system:

* Create accounts using a unique username + password
* Passwords securely hashed using `bcrypt`
* Login and logout supported
* Persistent user database stored in `data/users.json`

---

Interactive Quiz Engine

* Quizzes loaded dynamically from JSON
* Randomized **questions** and **multiple-choice options**
* Tracks each answer in session state
* Instant feedback after finishing the quiz
* Animated celebration for perfect scores (🎉)

---

Results Summary

After completing a quiz, users get a full breakdown:

* Total score
* Question-by-question recap
* Correct answer comparison
* Correct (green) / incorrect (red) indicators
* Option to retry or return home

---

Home Dashboard

Once logged in, users are greeted with:

* Personalized welcome message
* List of available quizzes
* Start quiz button
* Easy navigation + logout

---

Quizzes from JSON

All quizzes are stored in:

```
data/sample_quizzes.json
```

Editable, expandable, and perfect for adding new content.

---

Safe & Persistent File Handling

The app automatically:

* Creates `users.json` if missing
* Ensures the quiz data file is present
* Stores user progress & authentication state safely

---

Modern, Clean UI

Built with Streamlit’s latest features:

* Page routing through session state
* Improved layout spacing
* Clean typography & responsive flow
* Accessible design for all users

---

Project Structure

```
pychallenge/
│
├── app.py                # Main Streamlit application
├── auth.py               # Authentication helper functions (bcrypt)
│
├── data/
│   ├── sample_quizzes.json   # All quiz data
│   └── users.json            # User accounts (auto-created)
│
└── venv/                 # Python Virtual Environment (optional)
```

---

Installation & Setup

1. Clone the repository**

```bash
git clone https://github.com/your-username/pychallenge.git
cd pychallenge
```

2. Create a virtual environment**

```bash
python3 -m venv venv
source venv/bin/activate      # macOS / Linux
venv\Scripts\activate         # Windows
```

3. Install dependencies**

```bash
pip install -r requirements.txt
```

If you don’t have a `requirements.txt`, generate one:

```bash
pip freeze > requirements.txt
```

---

Run the Application

From inside the project folder:

```bash
streamlit run app.py
```

Streamlit will open the app in your browser automatically, usually at:

```
http://localhost:8501
```

---
Technologies Used

* **Python 3.11+**
* **Streamlit**
* **bcrypt** (password hashing)
* **JSON** (data storage)
* **Pathlib**
* **Session State** (navigation + state mgmt)

---
