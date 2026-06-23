'use client';
import { useEffect, useState } from 'react';
import { getEmployees } from '../../../lib/auth';
import { getAttendance, getTasks } from '../../../lib/storage';
import type { AttendanceRecord, WorkTask } from '../../../lib/types';
import { formatDate, todayISO } from '../../../lib/utils';
import Card, { StatCard } from '../../../components/Card';
import Badge, { statusVariant } from '../../../components/Badge';
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