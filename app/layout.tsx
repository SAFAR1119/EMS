import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { DarkModeProvider } from '../components/DarkModeProvider';
const inter = Inter({ subsets: ['latin'] });
export const metadata: Metadata = { title: 'HRM Portal', description: 'Human Resource Management System' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className + ' bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen'}>
        <DarkModeProvider>{children}</DarkModeProvider>
      </body>
    </html>
  );
}