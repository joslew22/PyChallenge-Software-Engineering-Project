import bcrypt
from db import get_connection

def register_user(username, password):
    conn = get_connection()
    cur = conn.cursor()

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())

    try:
        cur.execute(
            "INSERT INTO users(username, password_hash) VALUES (?, ?)",
            (username, hashed)
        )
        conn.commit()
        conn.close()
        return True
    except:
        conn.close()
        return False

def validate_user(username, password):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT password_hash FROM users WHERE username=?", (username,))
    row = cur.fetchone()
    conn.close()

    if row and bcrypt.checkpw(password.encode(), row[0]):
        return True
    return False
