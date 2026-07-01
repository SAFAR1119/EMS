'use client';
import { useEffect, useState } from 'react';
import { getLeaves, saveLeaves } from '../../../lib/storage';
import type { LeaveRequest } from '../../../lib/types';
import { formatDate } from '../../../lib/utils';
import Card from '../../../components/Card';
import Badge, { statusVariant } from '../../../components/Badge';
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