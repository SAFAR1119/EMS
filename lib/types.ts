export type Role = 'admin' | 'employee';
export interface User {
  username: string; name: string; role: Role; dept?: string; salary?: number;
}
export interface AttendanceRecord {
  username: string; name: string; dept: string;
  status: 'Present' | 'Late' | 'Absent'; time: string;
}
export interface AttendanceMap { [username: string]: AttendanceRecord; }
export interface WorkTask {
  id: number; name: string; desc: string;
  status: 'Completed' | 'In Progress' | 'Pending';
}
export interface LeaveRequest {
  id: number; username: string; name: string; dept: string;
  type: 'Sick Leave' | 'Annual Leave' | 'Emergency Leave' | 'Unpaid Leave';
  from: string; to: string; reason: string;
  status: 'Pending' | 'Approved' | 'Rejected'; submittedAt: string;
}
export interface PayrollRecord {
  username: string; name: string; dept: string;
  basicSalary: number; bonus: number; deductions: number; month: string;
}
export interface PerformanceRecord {
  id: number; username: string; name: string; dept: string;
  rating: number; feedback: string; reviewedBy: string; date: string;
}