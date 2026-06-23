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