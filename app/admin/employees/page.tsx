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