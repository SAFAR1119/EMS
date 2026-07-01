'use client';
import { useEffect, useState } from 'react';
import { getSession } from '../../../lib/auth';
import { getAttendance, saveAttendance, getTasks, saveTasks } from '../../../lib/storage';
import type { AttendanceRecord, WorkTask } from '../../../lib/types';
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