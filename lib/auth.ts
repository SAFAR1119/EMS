import { User } from './types';
export const USERS: Record<string, { password: string } & User> = {
  admin: { username: 'admin', password: 'admin123', role: 'admin', name: 'HR Admin' },
  alice: { username: 'alice', password: 'emp123', role: 'employee', name: 'Alice Rahman', dept: 'Engineering', salary: 65000 },
  bob:   { username: 'bob',   password: 'emp123', role: 'employee', name: 'Bob Hossain',  dept: 'Marketing',   salary: 55000 },
  carol: { username: 'carol', password: 'emp123', role: 'employee', name: 'Carol Islam',  dept: 'Finance',     salary: 60000 },
  david: { username: 'david', password: 'emp123', role: 'employee', name: 'David Khan',   dept: 'HR',          salary: 52000 },
};
export function getEmployees(): User[] {
  return Object.values(USERS).filter(u => u.role === 'employee');
}
export function login(username: string, password: string): User | null {
  const u = USERS[username.toLowerCase()];
  if (!u || u.password !== password) return null;
  const { password: _, ...user } = u;
  return user;
}
export function saveSession(user: User): void {
  sessionStorage.setItem('hrm_user', JSON.stringify(user));
}
export function getSession(): User | null {
  if (typeof window === 'undefined') return null;
  const data = sessionStorage.getItem('hrm_user');
  return data ? JSON.parse(data) : null;
}
export function clearSession(): void {
  sessionStorage.removeItem('hrm_user');
}