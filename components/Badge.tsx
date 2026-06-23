type BadgeVariant = 'green' | 'orange' | 'red' | 'blue' | 'gray';
const variants: Record<BadgeVariant, string> = {
  green:  'bg-green-100 text-green-800',
  orange: 'bg-orange-100 text-orange-800',
  red:    'bg-red-100 text-red-800',
  blue:   'bg-blue-100 text-blue-800',
  gray:   'bg-gray-100 text-gray-700',
};
export default function Badge({ label, variant }: { label: string; variant: BadgeVariant }) {
  return <span className={"inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold " + variants[variant]}>{label}</span>;
}
export function statusVariant(status: string): BadgeVariant {
  if (['Present','Approved','Completed'].includes(status)) return 'green';
  if (['Late','In Progress','Pending'].includes(status)) return 'orange';
  if (['Absent','Rejected'].includes(status)) return 'red';
  return 'gray';
}