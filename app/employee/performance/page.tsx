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