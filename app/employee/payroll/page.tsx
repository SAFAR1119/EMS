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