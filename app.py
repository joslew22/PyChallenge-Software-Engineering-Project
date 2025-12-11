# app.py
import streamlit as st
from pathlib import Path
import json
from datetime import datetime

# Local modules - make sure db.py and auth.py exist as previously discussed
from db import init_db, get_connection, DB_PATH
from auth import register_user, validate_user

# --- App config ---
st.set_page_config(page_title="PyChallenge", page_icon="🐍", layout="centered")

# Ensure DB + folders exist
Path("data").mkdir(exist_ok=True)
init_db()

# --- Load quizzes ---
QUIZ_JSON = Path("data/sample_quizzes.json")
if not QUIZ_JSON.exists():
    # create a small placeholder quiz to avoid crashes
    sample = [
        {
            "title": "Python Basics (Demo)",
            "description": "A tiny demo quiz",
            "questions": [
                {
                    "question": "What is the output of: print(2 + 3)?",
                    "options": ["23", "5", "Error", "None"],
                    "answer": "5",
                    "hint": "It's simple arithmetic."
                }
            ]
        }
    ]
    QUIZ_JSON.write_text(json.dumps(sample, indent=2))

with QUIZ_JSON.open() as f:
    try:
        quizzes = json.load(f)
    except Exception:
        quizzes = []

# --- Session defaults ---
if "user" not in st.session_state:
    st.session_state.user = None
if "score" not in st.session_state:
    st.session_state.score = 0
if "responses" not in st.session_state:
    st.session_state.responses = {}
if "quiz_completed" not in st.session_state:
    st.session_state.quiz_completed = False
if "new_quiz" not in st.session_state:
    st.session_state.new_quiz = {"title": "", "description": "", "questions": []}
if "message" not in st.session_state:
    st.session_state.message = ""

# --- Top: Authentication UI (requires login before using app) ---
st.sidebar.markdown("## 🔐 Account")

def logout():
    st.session_state.user = None
    st.session_state.score = 0
    st.session_state.responses = {}
    st.session_state.quiz_completed = False
    st.rerun()

if st.session_state.user:
    st.sidebar.success(f"Signed in as **{st.session_state.user}**")
    if st.sidebar.button("Log out"):
        logout()
else:
    tab_login, tab_register = st.sidebar.tabs(["Login", "Register"])

    with tab_login:
        li_user = st.text_input("Username", key="li_user")
        li_pass = st.text_input("Password", type="password", key="li_pass")
        if st.button("Login", key="btn_login"):
            if validate_user(li_user.strip(), li_pass):
                st.session_state.user = li_user.strip()
                st.session_state.message = f"Welcome back, {st.session_state.user}!"
                st.rerun()
            else:
                st.session_state.message = "Invalid username or password."

    with tab_register:
        ru_user = st.text_input("Create username", key="ru_user")
        ru_pass = st.text_input("Create password", type="password", key="ru_pass")
        if st.button("Create account", key="btn_register"):
            if not ru_user.strip() or not ru_pass:
                st.session_state.message = "Please provide username and password."
            else:
                ok = register_user(ru_user.strip(), ru_pass)
                if ok:
                    st.session_state.message = "Account created — you can now login."
                else:
                    st.session_state.message = "Username already exists."

if st.session_state.message:
    st.sidebar.info(st.session_state.message)

# Force login before interacting with main app
if not st.session_state.user:
    st.title("🐍 PyChallenge")
    st.write("Please log in or register in the sidebar to continue.")
    st.stop()

# --- Main navigation ---
menu = st.sidebar.radio("Navigate", ["Home", "Play Quiz", "Create Quiz", "Leaderboard", "Profile"])

# --- Helper functions ---
def save_score_to_db(username: str, quiz_title: str, score: int, total: int):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO leaderboard (username, quiz_title, score, total) VALUES (?, ?, ?, ?)",
        (username, quiz_title, score, total)
    )
    conn.commit()
    conn.close()

def load_leaderboard(limit=50):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT username, quiz_title, score, total, id
        FROM leaderboard
        ORDER BY score DESC, id ASC
        LIMIT ?
    """, (limit,))
    rows = cur.fetchall()
    conn.close()
    return rows

def save_quizzes_to_file(data):
    QUIZ_JSON.write_text(json.dumps(data, indent=2))

# --- Pages ---

# Home
if menu == "Home":
    st.markdown("<h1 style='text-align:center;'>🐍 PyChallenge</h1>", unsafe_allow_html=True)
    st.markdown("""
    Welcome — test and improve your Python knowledge.
    Use **Play Quiz** to take quizzes, **Create Quiz** to add your own,
    and check the **Leaderboard** to compare with other players.
    """)
    st.divider()
    st.info(f"Signed in as **{st.session_state.user}**")

# Play Quiz
elif menu == "Play Quiz":
    st.header("🧩 Play Quiz")
    quiz_titles = [q.get("title", f"Quiz {i}") for i, q in enumerate(quizzes)]
    if not quiz_titles:
        st.warning("No quizzes available. Create one in the Create Quiz page.")
    else:
        selected_title = st.selectbox("Choose a Quiz", quiz_titles)
        quiz = next((q for q in quizzes if q.get("title") == selected_title), quizzes[0])
        
        #Shuffle questions every time the quiz is opened
        if "shuffled_questions" not in st.session_state:
            import random
            st.session_state.shuffled_questions = quiz["questions"].copy()
            random.shuffle(st.session_state.shuffled_questions)
        questions = st.session_state.shuffled_questions

        st.markdown(f"### {quiz.get('title')}")
        if quiz.get("description"):
            st.write(quiz.get("description"))

        # Reset responses when switching quizzes
        if st.button("Reset Answers"):
            st.session_state.responses = {}
            st.session_state.quiz_completed = False
            st.session_state.score = 0

        # Render questions
        for idx, q in enumerate(quiz.get("questions", [])):
            st.write(f"**Q{idx+1}.** {q.get('question')}")
            opts = q.get("options", [])
            key = f"quiz_{selected_title}_q{idx}"
            # default value if exists
            prev = st.session_state.responses.get(key) if key in st.session_state.responses else None
            choice = st.radio("", opts, index=opts.index(prev) if prev in opts else 0, key=key)
            st.session_state.responses[key] = choice
            with st.expander("Hint"):
                st.info(q.get("hint", "No hint provided."))
            st.divider()

        # Submit
        if st.button("Submit Quiz"):
            score = 0
            total = len(quiz.get("questions", []))
            for idx, q in enumerate(quiz.get("questions", [])):
                key = f"quiz_{selected_title}_q{idx}"
                answer = st.session_state.responses.get(key)
                if answer == q.get("answer"):
                    score += 1
            st.session_state.score = score
            st.session_state.quiz_completed = True

            # save to DB
            save_score_to_db(st.session_state.user, selected_title, score, total)
            st.success(f"You scored **{score}/{total}**")
            if score == total and total > 0:
                st.balloons()

        # If already submitted, show results and option to review
        if st.session_state.quiz_completed:
            st.info(f"Last score: **{st.session_state.score}**")
            if st.button("Review Answers"):
                for idx, q in enumerate(quiz.get("questions", [])):
                    key = f"quiz_{selected_title}_q{idx}"
                    user_choice = st.session_state.responses.get(key)
                    correct = q.get("answer")
                    st.write(f"**Q{idx+1}**: {q.get('question')}")
                    st.write(f"- Your answer: {user_choice}")
                    if user_choice == correct:
                        st.success("Correct")
                    else:
                        st.error(f"Incorrect — correct answer: **{correct}**")
                        st.info(f"Hint: {q.get('hint', 'No hint')}")

# Create Quiz
elif menu == "Create Quiz":
    st.header("✏️ Create a New Quiz")
    st.info("Quizzes are saved locally to data/sample_quizzes.json and available to all users on this instance.")

    with st.form("create_quiz_form", clear_on_submit=False):
        title = st.text_input("Quiz Title", value=st.session_state.new_quiz.get("title", ""))
        description = st.text_area("Description", value=st.session_state.new_quiz.get("description", ""))
        add_q = st.form_submit_button("➕ Add Question")
        save_quiz = st.form_submit_button("💾 Save Quiz")

        if add_q:
            st.session_state.new_quiz["questions"].append({
                "question": "New question text",
                "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                "answer": "Option 1",
                "hint": ""
            })
            st.rerun()

        if save_quiz:
            # collect question edits from dynamic UI below (we'll populate fields directly)
            if not title.strip():
                st.error("Provide a quiz title before saving.")
            else:
                # update title/description
                st.session_state.new_quiz["title"] = title.strip()
                st.session_state.new_quiz["description"] = description.strip()
                # append to quizzes list and save
                quizzes.append(st.session_state.new_quiz.copy())
                save_quizzes_to_file(quizzes)
                st.success("Quiz saved! It will appear in Play Quiz.")
                # reset new_quiz
                st.session_state.new_quiz = {"title": "", "description": "", "questions": []}
                st.rerun()

    # Dynamic question editors
    if st.session_state.new_quiz.get("questions"):
        st.markdown("### Edit Questions")
        # iterate by index so we can mutate easily
        for idx in range(len(st.session_state.new_quiz["questions"])):
            q = st.session_state.new_quiz["questions"][idx]
            st.text_input(f"Question {idx+1}", value=q.get("question", ""), key=f"cq_q_{idx}", on_change=lambda i=idx: st.session_state.new_quiz["questions"].__setitem__(i, {**st.session_state.new_quiz["questions"][i], "question": st.session_state.get(f"cq_q_{i}")}))
            opts_str = st.text_area(f"Options (comma separated) {idx+1}", value=",".join(q.get("options", [])), key=f"cq_opt_{idx}")
            # when changed, update options list
            st.session_state.new_quiz["questions"][idx]["options"] = [o.strip() for o in (st.session_state.get(f"cq_opt_{idx}", "")).split(",") if o.strip()]
            ans = st.text_input(f"Correct Answer {idx+1}", value=q.get("answer", ""), key=f"cq_ans_{idx}", on_change=lambda i=idx: st.session_state.new_quiz["questions"].__setitem__(i, {**st.session_state.new_quiz["questions"][i], "answer": st.session_state.get(f"cq_ans_{i}")}))
            hint = st.text_input(f"Hint {idx+1}", value=q.get("hint", ""), key=f"cq_hint_{idx}", on_change=lambda i=idx: st.session_state.new_quiz["questions"].__setitem__(i, {**st.session_state.new_quiz["questions"][i], "hint": st.session_state.get(f"cq_hint_{i}")}))
            if st.button(f"Remove Question {idx+1}", key=f"remove_{idx}"):
                st.session_state.new_quiz["questions"].pop(idx)
                st.rerun()

# Leaderboard
elif menu == "Leaderboard":
    st.header("🏆 Leaderboard")
    rows = load_leaderboard(limit=100)
    if not rows:
        st.info("No scores yet — play a quiz to appear here.")
    else:
        # Show aggregated scoreboard by user+quiz (most recent at top)
        st.write("Top scores (most recent shown first for equal scores):")
        for user, quiz_title, score, total, _id in rows:
            st.write(f"**{user}** — *{quiz_title}* — **{score}/{total}**")

    # Personal history
    st.divider()
    st.subheader("Your recent results")
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT quiz_title, score, total, id FROM leaderboard WHERE username=? ORDER BY id DESC LIMIT 20", (st.session_state.user,))
    my_rows = cur.fetchall()
    conn.close()
    if not my_rows:
        st.info("You have no recorded results yet. Take a quiz!")
    else:
        for quiz_title, score, total, _id in my_rows:
            st.write(f"*{quiz_title}*: **{score}/{total}**")

# Profile
elif menu == "Profile":
    st.header("👤 Profile")
    st.write(f"Username: **{st.session_state.user}**")

    # Allow clearing personal results
    if st.button("Clear my results"):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM leaderboard WHERE username=?", (st.session_state.user,))
        conn.commit()
        conn.close()
        st.success("Your results were cleared.")
        st.rerun()

# Footer
st.markdown("---")
st.caption("PyChallenge — local demo. Data stored locally in this instance.")


