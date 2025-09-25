import tkinter as tk
from tkinter import simpledialog, messagebox
import database
import face_recognition_module as frm

def start_gui():
    root = tk.Tk()
    root.title("Smart Attendance System")
    root.geometry("400x350")
    root.config(bg="#f2f2f2")

    def register():
        user_name = simpledialog.askstring("Register Face", "Enter your name:")
        if user_name:
            msg = frm.register_face(user_name)
            messagebox.showinfo("Register", msg)

    def take_attendance():
        user_name = frm.recognize_face()
        if user_name != "Unknown":
            record = database.mark_attendance(user_name)
            messagebox.showinfo("Attendance", record)
        else:
            messagebox.showwarning("Attendance", "Face not recognized!")

    def view_records():
        records = database.get_records()
        messagebox.showinfo("Attendance Records", "\n".join(records) if records else "No records yet.")

    tk.Label(root, text="📷 Smart Attendance System", font=("Arial", 16, "bold"), bg="#f2f2f2").pack(pady=20)

    tk.Button(root, text="➕ Register Face", width=20, height=2, command=register, bg="#4CAF50", fg="white").pack(pady=10)
    tk.Button(root, text="✅ Start Attendance", width=20, height=2, command=take_attendance, bg="#2196F3", fg="white").pack(pady=10)
    tk.Button(root, text="📊 View Records", width=20, height=2, command=view_records, bg="#FF9800", fg="white").pack(pady=10)
    tk.Button(root, text="❌ Exit", width=20, height=2, command=root.quit, bg="#f44336", fg="white").pack(pady=10)

    root.mainloop()
