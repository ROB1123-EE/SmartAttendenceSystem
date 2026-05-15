import cv2
import face_recognition
import os

# Folder to store registered faces
REGISTERED_PATH = "registered_faces"

if not os.path.exists(REGISTERED_PATH):
    os.makedirs(REGISTERED_PATH)

def register_face(user_name):
    """Capture and save a face image"""
    cap = cv2.VideoCapture(0)  # 0 = default MacBook camera
    print("[INFO] Press 'q' to capture face and quit.")

    while True:
        ret, frame = cap.read()
        if not ret:
            continue
        cv2.imshow("Register Face", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            file_path = os.path.join(REGISTERED_PATH, f"{user_name}.jpg")
            cv2.imwrite(file_path, frame)
            break

    cap.release()
    cv2.destroyAllWindows()
    return f"Face registered for {user_name}"

def recognize_face():
    """Recognize a face from the camera"""
    cap = cv2.VideoCapture(0)

    # Load registered faces
    known_encodings = []
    known_names = []

    for file in os.listdir(REGISTERED_PATH):
        path = os.path.join(REGISTERED_PATH, file)
        image = face_recognition.load_image_file(path)
        encoding = face_recognition.face_encodings(image)[0]
        known_encodings.append(encoding)
        known_names.append(file.split(".")[0])

    print("[INFO] Looking for faces. Press 'q' to quit.")
    user_name = "Unknown"

    while True:
        ret, frame = cap.read()
        if not ret:
            continue
        rgb_frame = frame[:, :, ::-1]  # Convert BGR → RGB

        face_locations = face_recognition.face_locations(rgb_frame)
        encodings = face_recognition.face_encodings(rgb_frame, face_locations)

        for encoding in encodings:
            matches = face_recognition.compare_faces(known_encodings, encoding)
            if True in matches:
                index = matches.index(True)
                user_name = known_names[index]
                cap.release()
                cv2.destroyAllWindows()
                return user_name

        cv2.imshow("Recognizing Face", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    return user_name
