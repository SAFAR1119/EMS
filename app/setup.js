// Run this with: node setup.js
// Make sure you are inside the ems/ folder first

const fs = require('fs');
const path = require('path');

const files = {
'lib/types.ts': `
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
`.trim(),

'lib/auth.ts': `
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
`.trim(),

'lib/storage.ts': `
import { AttendanceMap, WorkTask, LeaveRequest, PayrollRecord, PerformanceRecord } from './types';
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
`.trim(),

'lib/utils.ts': `
export function formatDate(d: string | Date): string {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
export function formatCurrency(n: number): string {
  return '৳' + n.toLocaleString('en-IN');
}
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
`.trim(),

'app/globals.css': `
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .input { @apply w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition; }
  .btn-primary { @apply bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition; }
  .btn-success { @apply bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition; }
  .btn-danger { @apply bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition; }
  .btn-outline { @apply border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition; }
  .page-title { @apply text-xl font-bold text-gray-900 dark:text-white mb-1; }
  .page-sub { @apply text-sm text-gray-500 dark:text-gray-400 mb-6; }
  .label { @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1; }
  .th { @apply px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide bg-gray-50 dark:bg-gray-700/50; }
  .td { @apply px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700; }
}
`.trim(),

'app/layout.tsx': `
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { DarkModeProvider } from '../components/DarkModeProvider';
const inter = Inter({ subsets: ['latin'] });
export const metadata: Metadata = { title: 'HRM Portal', description: 'Human Resource Management System' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className + ' bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen'}>
        <DarkModeProvider>{children}</DarkModeProvider>
      </body>
    </html>
  );
}
`.trim(),

'app/page.tsx': `
import { redirect } from 'next/navigation';
export default function Home() { redirect('/login'); }
`.trim(),

'app/login/page.tsx': `
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, saveSession } from '../../lib/auth';
export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleLogin = () => {
    setLoading(true); setError('');
    setTimeout(() => {
      const user = login(username.trim().toLowerCase(), password);
      if (!user) { setError('Invalid username or password.'); setLoading(false); return; }
      saveSession(user);
      router.push(user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard');
    }, 400);
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">👥</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">HRM Portal</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Human Resource Management System</p>
        </div>
        {error && <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm text-center">{error}</div>}
        <div className="space-y-4">
          <div><label className="label">Username</label><input className="input" placeholder="Enter username" value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} /></div>
          <div><label className="label">Password</label><input className="input" type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} /></div>
          <button className="btn-primary w-full py-2.5 text-base" onClick={handleLogin} disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
        </div>
        <div className="mt-6 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Demo Accounts</p>
          {[['admin','admin123','HR Admin'],['alice','emp123','Employee'],['bob','emp123','Employee'],['carol','emp123','Employee']].map(([u,p,r]) => (
            <div key={u} className="flex justify-between">
              <span><code className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 px-1 rounded">{u}</code> / <code className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 px-1 rounded">{p}</code></span>
              <span className="text-gray-400">{r}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
`.trim(),

'app/employee/layout.tsx': `
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '../../lib/auth';
import Sidebar from '../../components/Sidebar';
export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => { const u = getSession(); if (!u || u.role !== 'employee') router.push('/login'); }, [router]);
  return (<div className="flex min-h-screen"><Sidebar /><main className="flex-1 p-8 overflow-y-auto">{children}</main></div>);
}
`.trim(),

'app/admin/layout.tsx': `
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '../../lib/auth';
import Sidebar from '../../components/Sidebar';
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => { const u = getSession(); if (!u || u.role !== 'admin') router.push('/login'); }, [router]);
  return (<div className="flex min-h-screen"><Sidebar /><main className="flex-1 p-8 overflow-y-auto">{children}</main></div>);
}
`.trim(),

'app/employee/dashboard/page.tsx': `
'use client';
import { useEffect, useState } from 'react';
import { getSession } from '../../../lib/auth';
import { getAttendance, saveAttendance, getTasks, saveTasks } from '../../../lib/storage';
import { AttendanceRecord, WorkTask } from '../../../lib/types';
import { formatDate, todayISO } from '../../../lib/utils';
import Card from '../../../components/Card';
import Badge, { statusVariant } from '../../../components/Badge';
export default function EmployeeDashboard() {
  const user = getSession()!;
  const [att, setAtt] = useState<AttendanceRecord | null>(null);
  const [tasks, setTasks] = useState<WorkTask[]>([]);
  const [taskName, setTaskName] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskStatus, setTaskStatus] = useState<WorkTask['status']>('Completed');
  useEffect(() => { const map = getAttendance(); setAtt(map[user.username] ?? null); setTasks(getTasks(user.username)); }, [user.username]);
  const markAttendance = (status: AttendanceRecord['status']) => {
    const map = getAttendance();
    if (map[user.username]) return alert('Attendance already marked.');
    const record: AttendanceRecord = { username: user.username, name: user.name, dept: user.dept ?? '', status, time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) };
    map[user.username] = record; saveAttendance(map); setAtt(record);
  };
  const addTask = () => {
    if (!taskName.trim()) return alert('Enter a task name.');
    const next: WorkTask[] = [...tasks, { id: Date.now(), name: taskName.trim(), desc: taskDesc.trim(), status: taskStatus }];
    saveTasks(user.username, next); setTasks(next); setTaskName(''); setTaskDesc('');
  };
  const attColor = att?.status === 'Present' ? 'bg-green-50 text-green-700 border border-green-200' : att?.status === 'Late' ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'bg-red-50 text-red-700 border border-red-200';
  return (
    <div>
      <h1 className="page-title">Employee Dashboard</h1>
      <p className="page-sub">Welcome, {user.name} — {formatDate(todayISO())}</p>
      <Card title="Today Attendance" icon="📅" className="mb-6">
        {att ? <div className={"rounded-lg px-4 py-3 font-semibold text-center " + attColor}>{att.status === 'Present' ? '✅' : att.status === 'Late' ? '⏰' : '❌'} Marked <strong>{att.status}</strong> at {att.time}</div>
        : <><p className="text-sm text-gray-500 mb-4">Mark your attendance for today:</p>
            <div className="flex gap-3 flex-wrap">
              <button className="btn-success" onClick={() => markAttendance('Present')}>✅ Present</button>
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition" onClick={() => markAttendance('Late')}>⏰ Late</button>
              <button className="btn-danger" onClick={() => markAttendance('Absent')}>❌ Absent</button>
            </div></>}
      </Card>
      <Card title="Log Today Work" icon="📝" className="mb-6">
        <div className="grid gap-4">
          <div><label className="label">Task Name</label><input className="input" placeholder="e.g. Client Meeting" value={taskName} onChange={e => setTaskName(e.target.value)} /></div>
          <div><label className="label">Description</label><textarea className="input resize-none" rows={3} placeholder="Brief description..." value={taskDesc} onChange={e => setTaskDesc(e.target.value)} /></div>
          <div><label className="label">Status</label>
            <select className="input" value={taskStatus} onChange={e => setTaskStatus(e.target.value as WorkTask['status'])}>
              <option>Completed</option><option>In Progress</option><option>Pending</option>
            </select>
          </div>
          <button className="btn-primary w-fit" onClick={addTask}>+ Add Task</button>
        </div>
      </Card>
      <Card title="My Tasks Today" icon="📋">
        {tasks.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">No tasks logged yet.</p>
        : <div className="space-y-3">{tasks.map(t => (
            <div key={t.id} className="flex items-start justify-between border border-gray-100 rounded-lg p-4">
              <div><p className="font-semibold text-gray-800 text-sm">{t.name}</p>{t.desc && <p className="text-xs text-gray-500 mt-1">{t.desc}</p>}</div>
              <Badge label={t.status} variant={statusVariant(t.status)} />
            </div>))}</div>}
      </Card>
    </div>
  );
}
`.trim(),

'app/employee/leave/page.tsx': `
'use client';
import { useEffect, useState } from 'react';
import { getSession } from '../../../lib/auth';
import { getLeaves, saveLeaves } from '../../../lib/storage';
import { LeaveRequest } from '../../../lib/types';
import { formatDate } from '../../../lib/utils';
import Card from '../../../components/Card';
import Badge, { statusVariant } from '../../../components/Badge';
export default function EmployeeLeavePage() {
  const user = getSession()!;
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [type, setType] = useState<LeaveRequest['type']>('Annual Leave');
  const [from, setFrom] = useState(''); const [to, setTo] = useState(''); const [reason, setReason] = useState(''); const [success, setSuccess] = useState('');
  useEffect(() => { setLeaves(getLeaves().filter(l => l.username === user.username)); }, [user.username]);
  const submit = () => {
    if (!from || !to || !reason.trim()) return alert('Please fill all fields.');
    if (from > to) return alert('End date must be after start date.');
    const all = getLeaves();
    const req: LeaveRequest = { id: Date.now(), username: user.username, name: user.name, dept: user.dept ?? '', type, from, to, reason: reason.trim(), status: 'Pending', submittedAt: new Date().toLocaleString() };
    all.push(req); saveLeaves(all); setLeaves(all.filter(l => l.username === user.username));
    setFrom(''); setTo(''); setReason(''); setSuccess('Leave request submitted!'); setTimeout(() => setSuccess(''), 3000);
  };
  return (
    <div>
      <h1 className="page-title">Leave Requests</h1>
      <p className="page-sub">Apply for leave and track your request status.</p>
      <Card title="Apply for Leave" icon="📋" className="mb-6">
        {success && <div className="mb-4 bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="label">Leave Type</label><select className="input" value={type} onChange={e => setType(e.target.value as LeaveRequest['type'])}><option>Annual Leave</option><option>Sick Leave</option><option>Emergency Leave</option><option>Unpaid Leave</option></select></div>
          <div />
          <div><label className="label">From Date</label><input className="input" type="date" value={from} onChange={e => setFrom(e.target.value)} /></div>
          <div><label className="label">To Date</label><input className="input" type="date" value={to} onChange={e => setTo(e.target.value)} /></div>
          <div className="md:col-span-2"><label className="label">Reason</label><textarea className="input resize-none" rows={3} value={reason} onChange={e => setReason(e.target.value)} /></div>
        </div>
        <button className="btn-primary mt-4" onClick={submit}>Submit Request</button>
      </Card>
      <Card title="My Leave History" icon="📅">
        {leaves.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">No leave requests yet.</p>
        : <table className="w-full"><thead><tr>{['Type','From','To','Reason','Status'].map(h => <th key={h} className="th">{h}</th>)}</tr></thead>
          <tbody>{leaves.map(l => (<tr key={l.id}><td className="td">{l.type}</td><td className="td">{formatDate(l.from)}</td><td className="td">{formatDate(l.to)}</td><td className="td max-w-xs truncate">{l.reason}</td><td className="td"><Badge label={l.status} variant={statusVariant(l.status)} /></td></tr>))}</tbody></table>}
      </Card>
    </div>
  );
}
`.trim(),

'app/employee/payroll/page.tsx': `
'use client';
import { useEffect, useState } from 'react';
import { getSession } from '../../../lib/auth';
import { getPayroll } from '../../../lib/storage';
import { PayrollRecord } from '../../../lib/types';
import { formatCurrency } from '../../../lib/utils';
import Card, { StatCard } from '../../../components/Card';
export default function EmployeePayrollPage() {
  const user = getSession()!;
  const [record, setRecord] = useState<PayrollRecord | null>(null);
  useEffect(() => { const all = getPayroll(); setRecord(all.find(r => r.username === user.username) ?? null); }, [user.username]);
  if (!record) return <p className="text-gray-400 p-8">No payroll record found.</p>;
  const net = record.basicSalary + record.bonus - record.deductions;
  const month = new Date(record.month + '-01').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  return (
    <div>
      <h1 className="page-title">My Payroll</h1>
      <p className="page-sub">Salary slip for {month}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Basic Salary" value={formatCurrency(record.basicSalary)} color="blue" />
        <StatCard label="Bonus" value={formatCurrency(record.bonus)} color="green" />
        <StatCard label="Deductions" value={formatCurrency(record.deductions)} color="red" />
        <StatCard label="Net Pay" value={formatCurrency(net)} color="orange" />
      </div>
      <Card title="Salary Breakdown" icon="💰">
        <table className="w-full">
          <thead><tr><th className="th">Component</th><th className="th text-right">Amount</th></tr></thead>
          <tbody>
            <tr><td className="td">Basic Salary</td><td className="td text-right font-semibold">{formatCurrency(record.basicSalary)}</td></tr>
            <tr><td className="td">Bonus</td><td className="td text-right font-semibold text-green-600">{formatCurrency(record.bonus)}</td></tr>
            <tr><td className="td">Deductions</td><td className="td text-right font-semibold text-red-600">{formatCurrency(record.deductions)} (−)</td></tr>
            <tr className="bg-blue-50"><td className="td font-bold text-blue-700">Net Pay</td><td className="td text-right font-bold text-blue-700">{formatCurrency(net)}</td></tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}
`.trim(),

'app/employee/performance/page.tsx': `
'use client';
import { useEffect, useState } from 'react';
import { getSession } from '../../../lib/auth';
import { getPerformance } from '../../../lib/storage';
import { PerformanceRecord } from '../../../lib/types';
import { formatDate } from '../../../lib/utils';
import Card from '../../../components/Card';
import StarRating from '../../../components/StarRating';
export default function EmployeePerformancePage() {
  const user = getSession()!;
  const [records, setRecords] = useState<PerformanceRecord[]>([]);
  useEffect(() => { setRecords(getPerformance().filter(r => r.username === user.username)); }, [user.username]);
  const avg = records.length ? (records.reduce((s, r) => s + r.rating, 0) / records.length).toFixed(1) : null;
  return (
    <div>
      <h1 className="page-title">My Performance</h1>
      <p className="page-sub">Performance reviews submitted by HR.</p>
      {avg && <Card className="mb-6 flex items-center gap-6"><div className="text-center"><p className="text-4xl font-extrabold text-yellow-500">{avg}</p><p className="text-sm text-gray-500 mt-1">Average Rating</p></div><div><StarRating value={Math.round(Number(avg))} readonly /><p className="text-xs text-gray-400 mt-1">{records.length} review(s)</p></div></Card>}
      <Card title="Review History" icon="⭐">
        {records.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">No performance reviews yet.</p>
        : <div className="space-y-4">{records.map(r => (<div key={r.id} className="border border-gray-100 rounded-xl p-5"><div className="flex items-center justify-between mb-2"><StarRating value={r.rating} readonly /><span className="text-xs text-gray-400">{formatDate(r.date)}</span></div><p className="text-sm text-gray-700">{r.feedback}</p><p className="text-xs text-gray-400 mt-2">Reviewed by: {r.reviewedBy}</p></div>))}</div>}
      </Card>
    </div>
  );
}
`.trim(),

'app/admin/dashboard/page.tsx': `
'use client';
import { useEffect, useState } from 'react';
import { getEmployees } from '../../lib/auth';
import { getAttendance, getTasks } from '../../lib/storage';
import { AttendanceRecord, WorkTask } from '../../lib/types';
import { formatDate, todayISO } from '../../lib/utils';
import Card, { StatCard } from '../../components/Card';
import Badge, { statusVariant } from '../../components/Badge';
export default function AdminDashboard() {
  const employees = getEmployees();
  const [attMap, setAttMap] = useState<Record<string, AttendanceRecord>>({});
  const [allTasks, setAllTasks] = useState<(WorkTask & { empName: string })[]>([]);
  useEffect(() => {
    const map = getAttendance(); setAttMap(map);
    setAllTasks(employees.flatMap(e => getTasks(e.username).map(t => ({ ...t, empName: e.name }))));
  }, []);
  const counts = { present: 0, late: 0, absent: 0 };
  employees.forEach(e => { const r = attMap[e.username]; if (r?.status === 'Present') counts.present++; else if (r?.status === 'Late') counts.late++; else if (r?.status === 'Absent') counts.absent++; });
  return (
    <div>
      <h1 className="page-title">Admin Dashboard</h1>
      <p className="page-sub">Today overview — {formatDate(todayISO())}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Employees" value={employees.length} color="blue" />
        <StatCard label="Present" value={counts.present} color="green" />
        <StatCard label="Late" value={counts.late} color="orange" />
        <StatCard label="Absent" value={counts.absent} color="red" />
      </div>
      <Card title="Today Attendance" icon="📅" className="mb-6">
        <table className="w-full"><thead><tr>{['Employee','Department','Status','Time'].map(h => <th key={h} className="th">{h}</th>)}</tr></thead>
          <tbody>{employees.map(e => { const r = attMap[e.username]; return (<tr key={e.username}><td className="td font-medium">{e.name}</td><td className="td text-gray-500">{e.dept}</td><td className="td">{r ? <Badge label={r.status} variant={statusVariant(r.status)} /> : <span className="text-xs text-gray-400">Not Marked</span>}</td><td className="td text-gray-500">{r?.time ?? '—'}</td></tr>); })}</tbody>
        </table>
      </Card>
      <Card title="Today Work Logs" icon="📝">
        {allTasks.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">No work logs today.</p>
        : <table className="w-full"><thead><tr>{['Employee','Task','Description','Status'].map(h => <th key={h} className="th">{h}</th>)}</tr></thead>
          <tbody>{allTasks.map(t => (<tr key={t.id}><td className="td font-medium">{t.empName}</td><td className="td">{t.name}</td><td className="td text-gray-500 max-w-xs truncate">{t.desc || '—'}</td><td className="td"><Badge label={t.status} variant={statusVariant(t.status)} /></td></tr>))}</tbody></table>}
      </Card>
    </div>
  );
}
`.trim(),

'app/admin/leave/page.tsx': `
'use client';
import { useEffect, useState } from 'react';
import { getLeaves, saveLeaves } from '../../lib/storage';
import { LeaveRequest } from '../../lib/types';
import { formatDate } from '../../lib/utils';
import Card from '../../components/Card';
import Badge, { statusVariant } from '../../components/Badge';
export default function AdminLeavePage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  useEffect(() => { setLeaves(getLeaves()); }, []);
  const update = (id: number, status: 'Approved' | 'Rejected') => {
    const updated = leaves.map(l => l.id === id ? { ...l, status } : l);
    saveLeaves(updated); setLeaves(updated);
  };
  const pending = leaves.filter(l => l.status === 'Pending');
  const rest = leaves.filter(l => l.status !== 'Pending');
  return (
    <div>
      <h1 className="page-title">Leave Management</h1>
      <p className="page-sub">Review and approve employee leave requests.</p>
      <Card title={"Pending Requests (" + pending.length + ")"} icon="⏳" className="mb-6">
        {pending.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">No pending requests.</p>
        : <div className="space-y-4">{pending.map(l => (<div key={l.id} className="border border-orange-200 bg-orange-50 rounded-xl p-5"><div className="flex items-start justify-between gap-4"><div><p className="font-semibold text-gray-800">{l.name} <span className="text-sm font-normal text-gray-500">({l.dept})</span></p><p className="text-sm text-gray-600 mt-1"><span className="font-medium">{l.type}</span> · {formatDate(l.from)} → {formatDate(l.to)}</p><p className="text-sm text-gray-500 mt-1">"{l.reason}"</p></div><div className="flex gap-2 shrink-0"><button className="btn-success" onClick={() => update(l.id, 'Approved')}>✅ Approve</button><button className="btn-danger" onClick={() => update(l.id, 'Rejected')}>❌ Reject</button></div></div></div>))}</div>}
      </Card>
      <Card title="All Requests" icon="📋">
        {leaves.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">No requests yet.</p>
        : <table className="w-full"><thead><tr>{['Employee','Type','From','To','Reason','Status'].map(h => <th key={h} className="th">{h}</th>)}</tr></thead>
          <tbody>{[...pending,...rest].map(l => (<tr key={l.id}><td className="td font-medium">{l.name}</td><td className="td">{l.type}</td><td className="td">{formatDate(l.from)}</td><td className="td">{formatDate(l.to)}</td><td className="td max-w-xs truncate text-gray-500">{l.reason}</td><td className="td"><Badge label={l.status} variant={statusVariant(l.status)} /></td></tr>))}</tbody></table>}
      </Card>
    </div>
  );
}
`.trim(),

'app/admin/payroll/page.tsx': `
'use client';
import { useEffect, useState } from 'react';
import { getPayroll, savePayroll } from '../../lib/storage';
import { PayrollRecord } from '../../lib/types';
import { formatCurrency } from '../../lib/utils';
import Card from '../../components/Card';
export default function AdminPayrollPage() {
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [editing, setEditing] = useState<Record<string, Partial<PayrollRecord>>>({});
  useEffect(() => { setRecords(getPayroll()); }, []);
  const setField = (username: string, field: keyof PayrollRecord, val: number) => {
    setEditing(prev => ({ ...prev, [username]: { ...prev[username], [field]: val } }));
  };
  const save = (username: string) => {
    const updated = records.map(r => r.username === username ? { ...r, ...editing[username] } : r);
    savePayroll(updated); setRecords(updated); setEditing(prev => { const n = { ...prev }; delete n[username]; return n; });
  };
  const total = records.reduce((s, r) => s + r.basicSalary + r.bonus - r.deductions, 0);
  return (
    <div>
      <h1 className="page-title">Payroll Management</h1>
      <p className="page-sub">Manage salaries, bonuses and deductions.</p>
      <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 flex items-center justify-between">
        <span className="text-sm font-medium text-blue-700">Total Monthly Payroll</span>
        <span className="text-xl font-bold text-blue-700">{formatCurrency(total)}</span>
      </div>
      <Card title="Employee Salaries" icon="💰">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr>{['Employee','Dept','Basic Salary','Bonus','Deductions','Net Pay','Action'].map(h => <th key={h} className="th">{h}</th>)}</tr></thead>
            <tbody>{records.map(r => {
              const ed = editing[r.username] ?? {};
              const basic = ed.basicSalary ?? r.basicSalary; const bonus = ed.bonus ?? r.bonus; const ded = ed.deductions ?? r.deductions;
              return (<tr key={r.username}><td className="td font-medium">{r.name}</td><td className="td text-gray-500">{r.dept}</td>
                <td className="td"><input type="number" className="input w-28 text-right" value={basic} onChange={e => setField(r.username, 'basicSalary', Number(e.target.value))} /></td>
                <td className="td"><input type="number" className="input w-24 text-right" value={bonus} onChange={e => setField(r.username, 'bonus', Number(e.target.value))} /></td>
                <td className="td"><input type="number" className="input w-24 text-right" value={ded} onChange={e => setField(r.username, 'deductions', Number(e.target.value))} /></td>
                <td className="td font-semibold text-green-700">{formatCurrency(basic + bonus - ded)}</td>
                <td className="td">{editing[r.username] && <button className="btn-success text-xs px-3 py-1" onClick={() => save(r.username)}>Save</button>}</td>
              </tr>);
            })}</tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
`.trim(),

'app/admin/performance/page.tsx': `
'use client';
import { useEffect, useState } from 'react';
import { getEmployees } from '../../lib/auth';
import { getPerformance, savePerformance } from '../../lib/storage';
import { PerformanceRecord, User } from '../../lib/types';
import { formatDate } from '../../lib/utils';
import Card from '../../components/Card';
import StarRating from '../../components/StarRating';
export default function AdminPerformancePage() {
  const employees = getEmployees();
  const [records, setRecords] = useState<PerformanceRecord[]>([]);
  const [selEmp, setSelEmp] = useState<User>(employees[0]);
  const [rating, setRating] = useState(3); const [feedback, setFeedback] = useState(''); const [success, setSuccess] = useState('');
  useEffect(() => { setRecords(getPerformance()); }, []);
  const submit = () => {
    if (!feedback.trim()) return alert('Please enter feedback.');
    const rec: PerformanceRecord = { id: Date.now(), username: selEmp.username, name: selEmp.name, dept: selEmp.dept ?? '', rating, feedback: feedback.trim(), reviewedBy: 'HR Admin', date: new Date().toISOString().slice(0,10) };
    const updated = [...records, rec]; savePerformance(updated); setRecords(updated); setFeedback(''); setRating(3);
    setSuccess('Review submitted for ' + selEmp.name + '!'); setTimeout(() => setSuccess(''), 3000);
  };
  const avgMap: Record<string, number> = {};
  employees.forEach(e => { const emp = records.filter(r => r.username === e.username); avgMap[e.username] = emp.length ? emp.reduce((s,r) => s+r.rating,0)/emp.length : 0; });
  return (
    <div>
      <h1 className="page-title">Performance Management</h1>
      <p className="page-sub">Rate employees and submit performance feedback.</p>
      <Card title="Employee Ratings Overview" icon="📊" className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {employees.map(e => (<div key={e.username} className="border border-gray-100 rounded-xl p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mx-auto mb-2">{e.name[0]}</div>
            <p className="font-semibold text-sm">{e.name}</p><p className="text-xs text-gray-400 mb-2">{e.dept}</p>
            <StarRating value={Math.round(avgMap[e.username])} readonly />
            <p className="text-xs text-gray-400 mt-1">{avgMap[e.username] ? avgMap[e.username].toFixed(1) : 'No reviews'}</p>
          </div>))}
        </div>
      </Card>
      <Card title="Submit Performance Review" icon="⭐" className="mb-6">
        {success && <div className="mb-4 bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>}
        <div className="grid gap-4">
          <div><label className="label">Select Employee</label>
            <select className="input" value={selEmp.username} onChange={e => setSelEmp(employees.find(emp => emp.username === e.target.value)!)}>
              {employees.map(e => <option key={e.username} value={e.username}>{e.name} ({e.dept})</option>)}
            </select>
          </div>
          <div><label className="label">Rating</label><StarRating value={rating} onChange={v => setRating(v)} /></div>
          <div><label className="label">Feedback</label><textarea className="input resize-none" rows={4} value={feedback} onChange={e => setFeedback(e.target.value)} /></div>
          <button className="btn-primary w-fit" onClick={submit}>Submit Review</button>
        </div>
      </Card>
      <Card title="Review History" icon="📋">
        {records.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">No reviews yet.</p>
        : <div className="space-y-3">{[...records].reverse().map(r => (<div key={r.id} className="border border-gray-100 rounded-xl p-4"><div className="flex items-center justify-between mb-2"><span className="font-semibold text-sm">{r.name} <span className="text-gray-400 font-normal">({r.dept})</span></span><span className="text-xs text-gray-400">{formatDate(r.date)}</span></div><StarRating value={r.rating} readonly /><p className="text-sm text-gray-600 mt-2">{r.feedback}</p></div>))}</div>}
      </Card>
    </div>
  );
}
`.trim(),

'app/admin/employees/page.tsx': `
'use client';
import { useEffect, useState } from 'react';
import { getEmployees } from '../../lib/auth';
import { getAttendance, getPerformance } from '../../lib/storage';
import { AttendanceRecord, PerformanceRecord } from '../../lib/types';
import { formatCurrency } from '../../lib/utils';
import Card from '../../components/Card';
import Badge, { statusVariant } from '../../components/Badge';
import StarRating from '../../components/StarRating';
export default function AdminEmployeesPage() {
  const employees = getEmployees();
  const [attMap, setAttMap] = useState<Record<string, AttendanceRecord>>({});
  const [perfRecords, setPerfRecords] = useState<PerformanceRecord[]>([]);
  useEffect(() => { setAttMap(getAttendance()); setPerfRecords(getPerformance()); }, []);
  return (
    <div>
      <h1 className="page-title">Employees</h1>
      <p className="page-sub">All registered employees and their current status.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {employees.map(e => {
          const att = attMap[e.username];
          const perf = perfRecords.filter(r => r.username === e.username);
          const avg = perf.length ? perf.reduce((s,r) => s+r.rating,0)/perf.length : 0;
          return (<Card key={e.username}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-lg">{e.name[0]}</div>
              <div><p className="font-bold text-gray-900">{e.name}</p><p className="text-sm text-gray-500">{e.dept} · <code className="text-xs bg-gray-100 px-1 rounded">{e.username}</code></p></div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-gray-400 text-xs mb-1">Salary</p><p className="font-semibold">{formatCurrency(e.salary ?? 0)}</p></div>
              <div><p className="text-gray-400 text-xs mb-1">Attendance</p>{att ? <Badge label={att.status} variant={statusVariant(att.status)} /> : <span className="text-xs text-gray-400">Not Marked</span>}</div>
              <div><p className="text-gray-400 text-xs mb-1">Performance</p>{avg ? <StarRating value={Math.round(avg)} readonly /> : <span className="text-xs text-gray-400">No reviews</span>}</div>
              <div><p className="text-gray-400 text-xs mb-1">Reviews</p><p className="font-semibold">{perf.length}</p></div>
            </div>
          </Card>);
        })}
      </div>
    </div>
  );
}
`.trim(),

'components/DarkModeProvider.tsx': `
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { getDarkMode, setDarkMode } from '../lib/storage';
const DarkCtx = createContext({ dark: false, toggle: () => {} });
export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);
  useEffect(() => { const saved = getDarkMode(); setDark(saved); document.documentElement.classList.toggle('dark', saved); }, []);
  const toggle = () => { const next = !dark; setDark(next); setDarkMode(next); document.documentElement.classList.toggle('dark', next); };
  return <DarkCtx.Provider value={{ dark, toggle }}>{children}</DarkCtx.Provider>;
}
export const useDarkMode = () => useContext(DarkCtx);
`.trim(),

'components/Sidebar.tsx': `
'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, CalendarCheck, DollarSign, Star, LogOut, Moon, Sun, Users } from 'lucide-react';
import { useDarkMode } from './DarkModeProvider';
import { clearSession, getSession } from '../lib/auth';
const empLinks = [
  { href: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/employee/leave',     label: 'Leave',     icon: CalendarCheck },
  { href: '/employee/payroll',   label: 'Payroll',   icon: DollarSign },
  { href: '/employee/performance', label: 'Performance', icon: Star },
];
const adminLinks = [
  { href: '/admin/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/admin/leave',       label: 'Leave',       icon: CalendarCheck },
  { href: '/admin/payroll',     label: 'Payroll',     icon: DollarSign },
  { href: '/admin/performance', label: 'Performance', icon: Star },
  { href: '/admin/employees',   label: 'Employees',   icon: Users },
];
export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();
  const { dark, toggle } = useDarkMode();
  const user = getSession();
  const isAdmin = user?.role === 'admin';
  const links = isAdmin ? adminLinks : empLinks;
  const handleLogout = () => { clearSession(); router.push('/login'); };
  return (
    <aside className="w-64 min-h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-sm">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-2xl">👥</span>
          <div><p className="font-bold text-gray-800 dark:text-white text-sm">HRM Portal</p><p className="text-xs text-gray-500">{isAdmin ? 'Admin Panel' : 'Employee Panel'}</p></div>
        </div>
      </div>
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">{user?.name?.[0] ?? 'U'}</div>
          <div><p className="text-sm font-semibold text-gray-800 dark:text-white">{user?.name}</p><p className="text-xs text-gray-500">{user?.dept ?? 'Admin'}</p></div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={"flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors " + (path === href ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800')}>
            <Icon size={17} />{label}
          </Link>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
        <button onClick={toggle} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          {dark ? <Sun size={17} /> : <Moon size={17} />}{dark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <LogOut size={17} />Logout
        </button>
      </div>
    </aside>
  );
}
`.trim(),

'components/Card.tsx': `
interface CardProps { title?: string; icon?: React.ReactNode; children: React.ReactNode; className?: string; }
export default function Card({ title, icon, children, className }: CardProps) {
  return (
    <div className={"bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 " + (className ?? '')}>
      {(title || icon) && <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100 dark:border-gray-700">{icon && <span className="text-xl">{icon}</span>}{title && <h3 className="font-semibold text-gray-800 dark:text-white text-base">{title}</h3>}</div>}
      {children}
    </div>
  );
}
export function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  const colors: Record<string, string> = { green: 'bg-green-50 text-green-700', blue: 'bg-blue-50 text-blue-700', orange: 'bg-orange-50 text-orange-700', red: 'bg-red-50 text-red-700' };
  return (
    <div className={"rounded-xl p-5 text-center " + (colors[color] ?? colors.blue)}>
      <p className="text-3xl font-extrabold">{value}</p>
      <p className="text-sm font-semibold mt-1 opacity-80">{label}</p>
    </div>
  );
}
`.trim(),

'components/Badge.tsx': `
type BadgeVariant = 'green' | 'orange' | 'red' | 'blue' | 'gray';
const variants: Record<BadgeVariant, string> = {
  green:  'bg-green-100 text-green-800',
  orange: 'bg-orange-100 text-orange-800',
  red:    'bg-red-100 text-red-800',
  blue:   'bg-blue-100 text-blue-800',
  gray:   'bg-gray-100 text-gray-700',
};
export default function Badge({ label, variant }: { label: string; variant: BadgeVariant }) {
  return <span className={"inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold " + variants[variant]}>{label}</span>;
}
export function statusVariant(status: string): BadgeVariant {
  if (['Present','Approved','Completed'].includes(status)) return 'green';
  if (['Late','In Progress','Pending'].includes(status)) return 'orange';
  if (['Absent','Rejected'].includes(status)) return 'red';
  return 'gray';
}
`.trim(),

'components/StarRating.tsx': `
'use client';
import { useState } from 'react';
interface StarRatingProps { value: number; onChange?: (v: number) => void; readonly?: boolean; }
export default function StarRating({ value, onChange, readonly = false }: StarRatingProps) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" disabled={readonly}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => !readonly && setHover(n)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={"text-2xl transition-transform " + (!readonly ? 'hover:scale-110 cursor-pointer ' : 'cursor-default ') + (n <= (hover || value) ? 'text-yellow-400' : 'text-gray-300')}>★</button>
      ))}
    </div>
  );
}
`.trim(),

'tailwind.config.ts': `
import type { Config } from 'tailwindcss';
const config: Config = {
  darkMode: 'class',
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}','./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: { extend: {} },
  plugins: [],
};
export default config;
`.trim(),

'next.config.js': `
/** @type {import('next').NextConfig} */
const nextConfig = {};
module.exports = nextConfig;
`.trim(),

'postcss.config.js': `
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };
`.trim(),

'.vscode/settings.json': `
{
  "css.validate": false,
  "files.associations": { "*.css": "tailwindcss" }
}
`.trim(),
};

// Create all files
let created = 0;
for (const [filePath, content] of Object.entries(files)) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Created: ' + filePath);
  created++;
}
console.log('\n🎉 Done! Created ' + created + ' files.');
console.log('Now run: npm install && npm run dev');