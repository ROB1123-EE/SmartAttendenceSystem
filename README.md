# 🎯 SmartAttendenceSystem

<div align="center">

![Smart Attendance](https://img.shields.io/badge/Smart-Attendance%20System-blueviolet?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-100%25-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Face Recognition](https://img.shields.io/badge/Face-Recognition-FF6B6B?style=for-the-badge&logo=opencv&logoColor=white)
![OpenCV](https://img.shields.io/badge/OpenCV-Computer%20Vision-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

An AI-powered attendance tracking system that uses **facial recognition** to automatically detect and record attendance — no sign-in sheets, no proxy attendance.

[Features](#-features) • [How It Works](#-how-it-works) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Usage](#-usage) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [How It Works](#-how-it-works)
- [Use Cases](#-use-cases)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the System](#running-the-system)
- [Usage](#-usage)
- [Sample Output](#-sample-output)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🌟 Overview

The **SmartAttendenceSystem** eliminates the hassle of traditional roll calls and manual sign-in sheets. Using a live camera feed and facial recognition technology, the system identifies registered individuals and automatically logs their attendance with a timestamp — all in real time.

> 💡 **In short:** Look at the camera → System recognizes you → Attendance marked automatically!

---

## ✨ Features

- 📸 **Real-Time Face Detection** — Detects faces instantly via webcam or camera feed
- 🧠 **Facial Recognition** — Matches detected faces against a registered database
- ✅ **Automatic Attendance Logging** — Records attendance with date and time on match
- 🚫 **Proxy Prevention** — Only physically present, registered individuals are marked
- 📊 **Report Generation** — View and export attendance records anytime
- 🏫 **Multi-Environment Support** — Works for classrooms, offices, and events
- 🗂️ **Persistent Records** — All attendance data is saved to CSV or a database
- 🔔 **Instant Confirmation** — On-screen notification when attendance is marked

---

## ⚙️ How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    ATTENDANCE PIPELINE                       │
│                                                              │
│  1. REGISTER      2. CAPTURE       3. MATCH      4. LOG     │
│  ───────────      ───────────      ────────      ───────    │
│  Save face   →   Camera reads  →  Compare   →  Mark with   │
│  encoding        live frame       encodings     timestamp   │
│                                                              │
│  5. REPORT                                                   │
│  ──────────                                                  │
│  View / export attendance records anytime                    │
└─────────────────────────────────────────────────────────────┘
```

### Step-by-Step

| Step | Action | Description |
|------|--------|-------------|
| 1️⃣ | **Register Faces** | Each person's face is captured and saved as an encoding during setup |
| 2️⃣ | **Camera Captures** | When people enter, the camera detects faces in the live frame |
| 3️⃣ | **Match & Verify** | The system compares detected faces against registered encodings |
| 4️⃣ | **Mark Attendance** | If matched, attendance is recorded with the current date and time |
| 5️⃣ | **Generate Reports** | Teachers or admins can view and download attendance records anytime |

---

## 🏢 Use Cases

| Environment | Benefit |
|-------------|---------|
| 🏫 **Schools & Universities** | Teachers save time; students can't give proxy attendance |
| 🏢 **Offices** | Employees don't need ID cards or fingerprint scans — fully automatic |
| 🎤 **Events & Seminars** | Organizers can track participants without manual check-ins |
| 🏥 **Healthcare** | Track staff presence in sensitive departments automatically |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Python 3.x** | Core programming language |
| **OpenCV** | Real-time camera access and face detection |
| **face_recognition** | Deep-learning-based facial recognition |
| **NumPy** | Numerical operations on face encodings |
| **Pandas** | Attendance data management and CSV export |
| **dlib** | Underlying facial landmark detection |

---

## 📁 Project Structure

```
SmartAttendenceSystem/
├── smart_attendance/
│   ├── faces/                  # Registered face images
│   │   ├── person1.jpg
│   │   └── person2.jpg
│   ├── attendance/             # Generated attendance records
│   │   └── attendance_YYYY-MM-DD.csv
│   ├── encode_faces.py         # Face registration & encoding script
│   ├── attendance.py           # Main attendance tracking script
│   └── report.py               # Report generation utility
├── hi.py                       # Entry point / quick demo
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.7 or higher
- A webcam or external camera
- `pip` package manager
- CMake (required for `dlib`)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ROB1123-EE/SmartAttendenceSystem.git
   cd SmartAttendenceSystem
   ```

2. **Create and activate a virtual environment** *(recommended)*
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install opencv-python face_recognition numpy pandas
   ```

   > ⚠️ If `face_recognition` fails to install, make sure `cmake` and `dlib` are installed first:
   > ```bash
   > pip install cmake dlib
   > pip install face_recognition
   > ```

### Running the System

**Step 1 — Register Faces**

Add face images (one clear photo per person) to the `smart_attendance/faces/` folder, named after the person (e.g., `John_Doe.jpg`). Then run:

```bash
python smart_attendance/encode_faces.py
```

**Step 2 — Start Attendance Tracking**

```bash
python smart_attendance/attendance.py
```

The webcam will open. When a registered face is detected, attendance is automatically marked.

**Step 3 — View Reports**

```bash
python smart_attendance/report.py
```

Attendance records are also saved as CSV files in the `smart_attendance/attendance/` folder.

---

## 📖 Usage

```python
# Run the attendance system
python attendance.py

# The system will:
# 1. Load registered face encodings
# 2. Open the webcam
# 3. Detect and recognize faces in real time
# 4. Log attendance to a CSV file with timestamp
# 5. Display live feed with name labels on recognized faces
```

**CSV Output Format:**

| Name | Date | Time | Status |
|------|------|------|--------|
| John Doe | 2025-05-15 | 09:03:47 | Present |
| Jane Smith | 2025-05-15 | 09:07:12 | Present |

---

## 📸 Sample Output

```
[INFO] Loading encoded faces...
[INFO] 12 faces loaded.
[INFO] Starting video stream...

✅ John Doe     — Attendance marked at 09:03:47
✅ Jane Smith   — Attendance marked at 09:07:12
⚠️  Unknown face — Not recorded.
```

---

## 🤝 Contributing

Contributions are welcome! Here's how to get involved:

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit** your changes
   ```bash
   git commit -m "feat: describe your change"
   ```
4. **Push** to your branch
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a **Pull Request**

### Ideas for Contribution
- 🌐 Web dashboard for attendance reports
- 📱 Mobile app integration
- 🔒 Multi-factor authentication support
- 📧 Email/SMS notifications on attendance
- 🗄️ Database integration (MySQL / MongoDB)

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 📬 Contact

**ROB1123-EE**

- GitHub: [@ROB1123-EE](https://github.com/ROB1123-EE)
- Repository: [SmartAttendenceSystem](https://github.com/ROB1123-EE/SmartAttendenceSystem)

---

<div align="center">

⭐ If this project helped you, please give it a star — it means a lot!

</div>
