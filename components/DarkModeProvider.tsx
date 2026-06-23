'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { getDarkMode, setDarkMode } from '../lib/storage';
const DarkCtx = createContext({ dark: false, toggle: () => {} });
export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);
  useEffect(() => { const saved = getDarkMode(); setDark(saved); document.documentElement.classList.toggle('dark', saved); }, []);
  const toggle = () => { const next = !dark; setDark(next); setDarkMode(next); document.documentElement.classList.toggle('dark', next); };
  return <DarkCtx.Provider value={{ dark, toggle }}>{children}</DarkCtx.Provider>;
}
export const useDarkMode = () => useContext(DarkCtx);