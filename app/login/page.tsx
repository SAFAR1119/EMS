'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, saveSession } from '../../lib/auth';
export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleLogin = () => {
    setLoading(true); setError('');
    setTimeout(() => {
      const user = login(username.trim().toLowerCase(), password);
      if (!user) { setError('Invalid username or password.'); setLoading(false); return; }
      saveSession(user);
      router.push(user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard');
    }, 400);
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">👥</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">HRM Portal</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Human Resource Management System</p>
        </div>
        {error && <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm text-center">{error}</div>}
        <div className="space-y-4">
          <div><label className="label">Username</label><input className="input" placeholder="Enter username" value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} /></div>
          <div><label className="label">Password</label><input className="input" type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} /></div>
          <button className="btn-primary w-full py-2.5 text-base" onClick={handleLogin} disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
        </div>
        <div className="mt-6 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Demo Accounts</p>
          {[['admin','admin123','HR Admin'],['alice','emp123','Employee'],['bob','emp123','Employee'],['carol','emp123','Employee']].map(([u,p,r]) => (
            <div key={u} className="flex justify-between">
              <span><code className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 px-1 rounded">{u}</code> / <code className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 px-1 rounded">{p}</code></span>
              <span className="text-gray-400">{r}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}