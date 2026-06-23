interface CardProps { title?: string; icon?: React.ReactNode; children: React.ReactNode; className?: string; }
export default function Card({ title, icon, children, className }: CardProps) {
  return (
    <div className={"bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 " + (className ?? '')}>
      {(title || icon) && <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100 dark:border-gray-700">{icon && <span className="text-xl">{icon}</span>}{title && <h3 className="font-semibold text-gray-800 dark:text-white text-base">{title}</h3>}</div>}
      {children}
    </div>
  );
}
export function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  const colors: Record<string, string> = { green: 'bg-green-50 text-green-700', blue: 'bg-blue-50 text-blue-700', orange: 'bg-orange-50 text-orange-700', red: 'bg-red-50 text-red-700' };
  return (
    <div className={"rounded-xl p-5 text-center " + (colors[color] ?? colors.blue)}>
      <p className="text-3xl font-extrabold">{value}</p>
      <p className="text-sm font-semibold mt-1 opacity-80">{label}</p>
    </div>
  );
}