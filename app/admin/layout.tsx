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