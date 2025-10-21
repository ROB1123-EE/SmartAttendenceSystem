import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { recognizeFace } from './services/geminiService';
import type { Student, AttendanceRecord } from './types';

const App: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [status, setStatus] = useState('Camera is off');
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);
    const [newStudentName, setNewStudentName] = useState('');
    const [newStudentId, setNewStudentId] = useState('');
    const [registrationPhoto, setRegistrationPhoto] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Load data from localStorage on initial render
    useEffect(() => {
        try {
            const savedStudents = localStorage.getItem('students');
            if (savedStudents) {
                // Data migration: Ensure all students have a UUID
                const parsedStudents: Student[] = JSON.parse(savedStudents).map((s: any) => ({
                    ...s,
                    uuid: s.uuid || uuidv4(), // Assign a new UUID if one doesn't exist
                }));
                setStudents(parsedStudents);
            }
            const savedAttendance = localStorage.getItem('attendance');
            if (savedAttendance) {
                setAttendance(JSON.parse(savedAttendance));
            }
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
        }
    }, []);

    // Save data to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('students', JSON.stringify(students));
        } catch (error) {
            console.error("Failed to save students to localStorage", error);
        }
    }, [students]);

    useEffect(() => {
        try {
            localStorage.setItem('attendance', JSON.stringify(attendance));
        } catch (error) {
            console.error("Failed to save attendance to localStorage", error);
        }
    }, [attendance]);


    const startCamera = async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                    setIsCameraOn(true);
                    setStatus('Scanning for students...');
                }
            } catch (err) {
                console.error('Error accessing camera:', err);
                setStatus('Failed to access camera. Check permissions.');
            }
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setIsCameraOn(false);
            setStatus('Camera is off');
        }
    };
    
    // Core attendance loop using useEffect to avoid stale state
    useEffect(() => {
        // Fix: Changed NodeJS.Timeout to number, which is the correct return type for setInterval in browsers.
        let intervalId: number | null = null;
        if (isCameraOn) {
            intervalId = setInterval(async () => {
                if (videoRef.current && canvasRef.current && students.length > 0 && !isLoading) {
                    const canvas = canvasRef.current;
                    const video = videoRef.current;
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                    const imageDataUrl = canvas.toDataURL('image/jpeg');

                    setIsLoading(true);
                    setStatus('Recognizing face...');
                    try {
                        const recognizedName = await recognizeFace(imageDataUrl, students);
                        if (recognizedName) {
                            const recognizedStudent = students.find(s => s.name === recognizedName);
                            if (recognizedStudent) {
                                // Check if attendance was already marked today
                                const today = new Date().toLocaleDateString();
                                const hasAttendedToday = attendance.some(record =>
                                    record.studentUuid === recognizedStudent.uuid &&
                                    new Date(record.timestamp).toLocaleDateString() === today
                                );

                                if (!hasAttendedToday) {
                                    setStatus(`Welcome, ${recognizedStudent.name}!`);
                                    setAttendance(prev => [
                                        {
                                            studentUuid: recognizedStudent.uuid,
                                            studentId: recognizedStudent.id,
                                            studentName: recognizedStudent.name,
                                            timestamp: Date.now(),
                                        },
                                        ...prev
                                    ]);
                                    setTimeout(() => setStatus('Scanning for students...'), 3000); // Reset status after a delay
                                } else {
                                     setStatus(`${recognizedStudent.name} already marked today.`);
                                     setTimeout(() => setStatus('Scanning for students...'), 3000);
                                }
                            }
                        } else {
                             setStatus('Scanning for students...');
                        }
                    } catch (error) {
                        console.error("Recognition failed:", error);
                        setStatus('Recognition error. Retrying...');
                    } finally {
                        setIsLoading(false);
                    }
                }
            }, 5000); // Scan every 5 seconds
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [isCameraOn, students, attendance, isLoading]); // Re-run effect if these change

    const handleStartStop = () => {
        if (isCameraOn) {
            stopCamera();
        } else {
            startCamera();
        }
    };

    const handleRegisterClick = async () => {
        setShowRegistrationModal(true);
        setRegistrationPhoto(null);
        setNewStudentId('');
        setNewStudentName('');
        // Start camera for registration modal
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
        } catch (err) {
            console.error('Error accessing camera for registration:', err);
        }
    };

    const handleCapturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            setRegistrationPhoto(canvas.toDataURL('image/png'));
        }
    };

    const handleRegisterStudent = () => {
        if (newStudentName.trim() && newStudentId.trim() && registrationPhoto) {
            if (students.some(s => s.id === newStudentId)) {
                alert('A student with this ID is already registered.');
                return;
            }
            const newStudent: Student = {
                uuid: uuidv4(),
                id: newStudentId,
                name: newStudentName,
                imageDataUrl: registrationPhoto,
            };
            setStudents(prev => [...prev, newStudent]);
            closeRegistrationModal();
        } else {
            alert('Please fill in all fields and capture a photo.');
        }
    };

    const closeRegistrationModal = () => {
        setShowRegistrationModal(false);
        // Stop camera used by modal
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        // If attendance camera was on, restart it
        if (isCameraOn) {
            startCamera();
        }
    };
    
    // This is the fixed version without useCallback that caused the stale closure.
    const handleDeleteStudent = (studentUuidToDelete: string) => {
        if (window.confirm('Are you sure you want to delete this student and all their attendance records?')) {
            // Use the most up-to-date state by passing a function to the setter
            setStudents(currentStudents => currentStudents.filter(s => s.uuid !== studentUuidToDelete));
            setAttendance(currentAttendance => currentAttendance.filter(a => a.studentUuid !== studentUuidToDelete));
        }
    };


    const exportToCSV = () => {
        if (attendance.length === 0) {
            alert('No attendance data to export.');
            return;
        }
        const headers = ['Student Name', 'Student ID', 'Date', 'Time'];
        const rows = attendance.map(record => {
            const date = new Date(record.timestamp);
            return [
                record.studentName,
                record.studentId,
                date.toLocaleDateString(),
                date.toLocaleTimeString(),
            ];
        });
        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "attendance_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 lg:p-8 font-sans">
            <header className="text-center mb-8">
                <h1 className="text-4xl lg:text-5xl font-bold text-cyan-400">Smart Attendance</h1>
                <p className="text-gray-400">Using AI-Powered Face Recognition</p>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Controls and Student List */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    {/* Control Panel */}
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-semibold mb-4 text-cyan-300">Controls</h2>
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={handleRegisterClick}
                                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2"
                            >
                                <i className="fas fa-user-plus"></i>
                                Register Student
                            </button>
                            <button
                                onClick={exportToCSV}
                                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2"
                            >
                                <i className="fas fa-file-csv"></i>
                                Export CSV
                            </button>
                        </div>
                    </div>

                    {/* Registered Students */}
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex-grow">
                        <h2 className="text-2xl font-semibold mb-4 text-cyan-300">Registered Students ({students.length})</h2>
                        <div className="max-h-96 overflow-y-auto pr-2">
                            {students.length > 0 ? (
                                students.map(student => (
                                    <div key={student.uuid} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg mb-3">
                                        <div className="flex items-center gap-4">
                                            <img src={student.imageDataUrl} alt={student.name} className="w-12 h-12 rounded-full object-cover" />
                                            <div>
                                                <p className="font-bold text-white">{student.name}</p>
                                                <p className="text-sm text-gray-400">ID: {student.id}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteStudent(student.uuid)} className="text-red-400 hover:text-red-600 transition">
                                            <i className="fas fa-trash-alt fa-lg"></i>
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-4">No students registered yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Middle Column: Camera Feed */}
                <div className="lg:col-span-1 bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col items-center justify-center">
                    <div className="w-full aspect-video bg-black rounded-md flex items-center justify-center overflow-hidden">
                        <video ref={videoRef} className={`w-full h-full object-cover ${!isCameraOn && 'hidden'}`} playsInline />
                        {!isCameraOn && <p className="text-gray-500">Camera is off</p>}
                    </div>
                    <div className="w-full mt-4">
                        <div className="bg-black text-green-400 font-mono p-2 rounded-md text-center">
                           Status: {isLoading ? <span className="animate-pulse">{status}</span> : status}
                        </div>
                         <button
                            onClick={handleStartStop}
                            className={`w-full mt-4 font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2 ${isCameraOn ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                        >
                            <i className={`fas ${isCameraOn ? 'fa-stop-circle' : 'fa-play-circle'}`}></i>
                            {isCameraOn ? 'Stop Attendance' : 'Start Attendance'}
                        </button>
                    </div>
                </div>

                {/* Right Column: Attendance Log */}
                <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-cyan-300">Attendance Log</h2>
                    <div className="overflow-x-auto max-h-[34rem]">
                        <table className="w-full text-left">
                            <thead className="sticky top-0 bg-gray-800">
                                <tr>
                                    <th className="p-2 text-gray-300">Student Name</th>
                                    <th className="p-2 text-gray-300">Student ID</th>
                                    <th className="p-2 text-gray-300">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendance.map((record, index) => (
                                    <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
                                        <td className="p-2">{record.studentName}</td>
                                        <td className="p-2">{record.studentId}</td>
                                        <td className="p-2">{new Date(record.timestamp).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {attendance.length === 0 && <p className="text-gray-500 text-center py-4">No attendance records yet.</p>}
                    </div>
                </div>
            </main>

             {/* Registration Modal */}
            {showRegistrationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-lg relative">
                        <h2 className="text-2xl font-bold mb-4 text-cyan-300">Register New Student</h2>
                        <button onClick={closeRegistrationModal} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl">&times;</button>
                        
                        <div className="flex flex-col items-center gap-4">
                            {registrationPhoto ? (
                                <img src={registrationPhoto} alt="Student" className="w-48 h-48 rounded-full object-cover border-4 border-cyan-400" />
                            ) : (
                                <div className="w-full aspect-video bg-black rounded-md overflow-hidden">
                                     <video ref={videoRef} className="w-full h-full object-cover" playsInline />
                                </div>
                            )}

                             <button onClick={handleCapturePhoto} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg w-full">
                                {registrationPhoto ? 'Retake Photo' : 'Capture Photo'}
                             </button>
                        </div>

                        <div className="mt-4 flex flex-col gap-4">
                            <input
                                type="text"
                                placeholder="Student Name"
                                value={newStudentName}
                                onChange={(e) => setNewStudentName(e.target.value)}
                                className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                            <input
                                type="text"
                                placeholder="Student ID"
                                value={newStudentId}
                                onChange={(e) => setNewStudentId(e.target.value)}
                                className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>
                        <div className="mt-6 flex justify-end gap-4">
                            <button onClick={closeRegistrationModal} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg">Cancel</button>
                            <button onClick={handleRegisterStudent} disabled={!registrationPhoto || !newStudentName.trim() || !newStudentId.trim()} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed">Register</button>
                        </div>
                    </div>
                </div>
            )}
            
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
};

export default App;