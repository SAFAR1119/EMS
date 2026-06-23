'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, CalendarCheck, DollarSign, Star, LogOut, Moon, Sun, Users } from 'lucide-react';
import { useDarkMode } from './DarkModeProvider';
import { clearSession, getSession } from '../lib/auth';
const empLinks = [
  { href: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/employee/leave',     label: 'Leave',     icon: CalendarCheck },
  { href: '/employee/payroll',   label: 'Payroll',   icon: DollarSign },
  { href: '/employee/performance', label: 'Performance', icon: Star },
];
const adminLinks = [
  { href: '/admin/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/admin/leave',       label: 'Leave',       icon: CalendarCheck },
  { href: '/admin/payroll',     label: 'Payroll',     icon: DollarSign },
  { href: '/admin/performance', label: 'Performance', icon: Star },
  { href: '/admin/employees',   label: 'Employees',   icon: Users },
];
export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();
  const { dark, toggle } = useDarkMode();
  const user = getSession();
  const isAdmin = user?.role === 'admin';
  const links = isAdmin ? adminLinks : empLinks;
  const handleLogout = () => { clearSession(); router.push('/login'); };
  return (
    <aside className="w-64 min-h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-sm">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-2xl">👥</span>
          <div><p className="font-bold text-gray-800 dark:text-white text-sm">HRM Portal</p><p className="text-xs text-gray-500">{isAdmin ? 'Admin Panel' : 'Employee Panel'}</p></div>
        </div>
      </div>
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">{user?.name?.[0] ?? 'U'}</div>
          <div><p className="text-sm font-semibold text-gray-800 dark:text-white">{user?.name}</p><p className="text-xs text-gray-500">{user?.dept ?? 'Admin'}</p></div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={"flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors " + (path === href ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800')}>
            <Icon size={17} />{label}
          </Link>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
        <button onClick={toggle} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          {dark ? <Sun size={17} /> : <Moon size={17} />}{dark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <LogOut size={17} />Logout
        </button>
      </div>
    </aside>
  );
}