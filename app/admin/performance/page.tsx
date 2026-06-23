'use client';
import { useEffect, useState } from 'react';
import { getEmployees } from '../../../lib/auth';
import { getPerformance, savePerformance } from '../../../lib/storage';
import type { PerformanceRecord, Role, User } from '../../../lib/types';
import { formatDate } from '../../../lib/utils';
import Card from '../../../components/Card';
import StarRating from '../../../components/StarRating';
export default function AdminPerformancePage() {
  const employees = getEmployees();
  const [records, setRecords] = useState<PerformanceRecord[]>([]);
 const [selEmp, setSelEmp] = useState<User>(employees[0] ?? { username: '', name: '', role: 'employee' as Role, dept: '' });
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
            <StarRating value={Math.round(avgMap[e.username] ?? 0)} readonly />
            <p className="text-xs text-gray-400 mt-1">{avgMap[e.username] != null ? avgMap[e.username]!.toFixed(1) : 'No reviews'}</p>
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