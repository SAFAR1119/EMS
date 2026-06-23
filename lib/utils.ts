export function formatDate(d: string | Date): string {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
export function formatCurrency(n: number): string {
  return '৳' + n.toLocaleString('en-IN');
}
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}