import type { AttendanceMap, WorkTask, LeaveRequest, PayrollRecord, PerformanceRecord } from './types';
const todayKey = () => new Date().toISOString().slice(0, 10);
const SEED: PayrollRecord[] = [
  { username: 'alice', name: 'Alice Rahman', dept: 'Engineering', basicSalary: 65000, bonus: 0, deductions: 6500, month: new Date().toISOString().slice(0,7) },
  { username: 'bob',   name: 'Bob Hossain',  dept: 'Marketing',   basicSalary: 55000, bonus: 0, deductions: 5500, month: new Date().toISOString().slice(0,7) },
  { username: 'carol', name: 'Carol Islam',  dept: 'Finance',     basicSalary: 60000, bonus: 0, deductions: 6000, month: new Date().toISOString().slice(0,7) },
  { username: 'david', name: 'David Khan',   dept: 'HR',          basicSalary: 52000, bonus: 0, deductions: 5200, month: new Date().toISOString().slice(0,7) },
];
export function getAttendance(): AttendanceMap {
  if (typeof window === 'undefined') return {};
  return JSON.parse(localStorage.getItem('hrm_att_' + todayKey()) || '{}');
}
export function saveAttendance(map: AttendanceMap): void {
  localStorage.setItem('hrm_att_' + todayKey(), JSON.stringify(map));
}
export function getTasks(username: string): WorkTask[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('hrm_tasks_' + todayKey() + '_' + username) || '[]');
}
export function saveTasks(username: string, tasks: WorkTask[]): void {
  localStorage.setItem('hrm_tasks_' + todayKey() + '_' + username, JSON.stringify(tasks));
}
export function getLeaves(): LeaveRequest[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('hrm_leaves') || '[]');
}
export function saveLeaves(leaves: LeaveRequest[]): void {
  localStorage.setItem('hrm_leaves', JSON.stringify(leaves));
}
export function getPayroll(): PayrollRecord[] {
  if (typeof window === 'undefined') return [];
  const stored = JSON.parse(localStorage.getItem('hrm_payroll') || '[]');
  if (stored.length) return stored;
  localStorage.setItem('hrm_payroll', JSON.stringify(SEED));
  return SEED;
}
export function savePayroll(records: PayrollRecord[]): void {
  localStorage.setItem('hrm_payroll', JSON.stringify(records));
}
export function getPerformance(): PerformanceRecord[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('hrm_performance') || '[]');
}
export function savePerformance(records: PerformanceRecord[]): void {
  localStorage.setItem('hrm_performance', JSON.stringify(records));
}
export function getDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('hrm_dark') === 'true';
}
export function setDarkMode(val: boolean): void {
  localStorage.setItem('hrm_dark', String(val));
}