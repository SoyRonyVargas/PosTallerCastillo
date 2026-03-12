import type { LucideIcon } from 'lucide-react';
import { PackageOpen } from 'lucide-react';

interface Props {
  message?: string;
  icon?:    LucideIcon;
}

export function EmptyState({ message = 'Sin resultados', icon: Icon = PackageOpen }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <Icon size={40} strokeWidth={1.5} />
      <p className="mt-3 text-sm">{message}</p>
    </div>
  );
}
