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