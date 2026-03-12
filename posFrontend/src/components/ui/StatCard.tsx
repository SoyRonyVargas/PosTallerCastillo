import type { LucideIcon } from 'lucide-react';

interface Props {
  label:    string;
  value:    string;
  icon:     LucideIcon;
  color?:   'blue' | 'green' | 'amber' | 'purple' | 'red';
  sub?:     string;
}

const COLOR_MAP = {
  blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-100  text-blue-600',  text: 'text-blue-600'  },
  green:  { bg: 'bg-green-50',  icon: 'bg-green-100 text-green-600', text: 'text-green-600' },
  amber:  { bg: 'bg-amber-50',  icon: 'bg-amber-100 text-amber-600', text: 'text-amber-600' },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600', text: 'text-purple-600' },
  red:    { bg: 'bg-red-50',    icon: 'bg-red-100   text-red-600',   text: 'text-red-600'   },
};

export function StatCard({ label, value, icon: Icon, color = 'blue', sub }: Props) {
  const c = COLOR_MAP[color];
  return (
    <div className={`card p-5 flex items-center gap-4 ${c.bg}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${c.icon}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
