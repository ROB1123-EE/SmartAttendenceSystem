export interface Student {
  uuid: string;
  id: string;
  name: string;
  imageDataUrl: string;
}

export interface AttendanceRecord {
  studentUuid: string;
  studentId: string;
  studentName: string;
  timestamp: number;
}
