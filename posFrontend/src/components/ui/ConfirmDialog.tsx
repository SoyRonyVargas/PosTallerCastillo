import { AlertTriangle } from 'lucide-react';

interface Props {
  open:        boolean;
  title:       string;
  message:     string;
  confirmLabel?: string;
  cancelLabel?:  string;
  onConfirm:   () => void;
  onCancel:    () => void;
  variant?:    'danger' | 'warning';
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel  = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'danger',
}: Props) {
  if (!open) return null;

  const btnClass = variant === 'danger' ? 'btn-danger' : 'btn-warning';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="card w-full max-w-sm p-6">
        <div className="flex gap-4">
          <div className={`mt-0.5 flex-shrink-0 ${variant === 'danger' ? 'text-red-500' : 'text-amber-500'}`}>
            <AlertTriangle size={22} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button className="btn-secondary btn-sm" onClick={onCancel}>{cancelLabel}</button>
          <button className={`${btnClass} btn-sm`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
