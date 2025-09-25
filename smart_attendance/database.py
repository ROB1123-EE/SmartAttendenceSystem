import sqlite3
import datetime

# Connect to SQLite database (creates file if not exists)
conn = sqlite3.connect("attendance.db")
cursor = conn.cursor()

# Create table if not exists
cursor.execute("""
CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT,
    timestamp TEXT
)
""")
conn.commit()

def mark_attendance(user_name):
    """Insert a new attendance record"""
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("INSERT INTO attendance (user_name, timestamp) VALUES (?, ?)", (user_name, now))
    conn.commit()
    return f"{user_name} marked present at {now}"

def get_records():
    """Fetch all attendance records"""
    cursor.execute("SELECT user_name, timestamp FROM attendance")
    rows = cursor.fetchall()
    return [f"{row[0]} at {row[1]}" for row in rows]