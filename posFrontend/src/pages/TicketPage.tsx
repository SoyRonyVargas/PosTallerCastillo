import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowLeft, AlertTriangle } from 'lucide-react';
import { salesService }   from '../services/salesService';
import { formatCurrency, formatDateTime, paymentLabel } from '../utils/format';

export function TicketPage() {
  const { id } = useParams<{ id: string }>();
  const sale   = useMemo(() => (id ? salesService.getById(id) : null), [id]);

  if (!sale) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-gray-500">
        <AlertTriangle size={36} className="text-amber-400" />
        <p className="text-sm">Venta no encontrada. El folio puede haber expirado.</p>
        <Link to="/ventas" className="btn-secondary btn-sm">Ir a Ventas</Link>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto space-y-4">
      {/* Controles (no se imprimen) */}
      <div className="no-print flex items-center justify-between">
        <Link to={-1 as never} className="btn-secondary btn-sm">
          <ArrowLeft size={14} /> Regresar
        </Link>
        <button onClick={() => window.print()} className="btn-primary btn-sm">
          <Printer size={14} /> Imprimir ticket
        </button>
      </div>

      {/* Ticket */}
      <div className="ticket-print-wrapper card p-6 font-mono text-xs" id="ticket">
        {/* Cabecera */}
        <div className="text-center border-b border-dashed border-gray-300 pb-3 mb-3">
          <p className="text-base font-bold text-gray-900">TALLER CASTILLO</p>
          <p className="text-gray-500">Sistema POS · Prototipo</p>
          <p className="text-gray-400 text-xs mt-1">Calle Principal #123, Ciudad</p>
          <p className="text-gray-400">Tel. 555-000-0000</p>
        </div>

        {/* Folio y fecha */}
        <div className="mb-3">
          <div className="flex justify-between">
            <span className="text-gray-500">Folio:</span>
            <span className="font-bold">{sale.folio}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Fecha:</span>
            <span>{formatDateTime(sale.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Atendió:</span>
            <span>{sale.createdBy}</span>
          </div>
          {sale.customerName && (
            <div className="flex justify-between">
              <span className="text-gray-500">Cliente:</span>
              <span className="text-right max-w-36 truncate">{sale.customerName}</span>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="border-t border-dashed border-gray-300 pt-3 mb-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500">
                <th className="text-left font-semibold pb-1">Concepto</th>
                <th className="text-center font-semibold pb-1">Cant</th>
                <th className="text-right font-semibold pb-1">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item, idx) => (
                <tr key={idx} className="align-top">
                  <td className="py-0.5 pr-2">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-gray-400">{formatCurrency(item.unitPrice)} c/u</p>
                  </td>
                  <td className="py-0.5 text-center text-gray-700">{item.quantity}</td>
                  <td className="py-0.5 text-right font-semibold text-gray-800">
                    {formatCurrency(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totales */}
        <div className="border-t border-dashed border-gray-300 pt-3 mb-3 space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span>{formatCurrency(sale.subtotal)}</span>
          </div>
          <div className="flex justify-between font-bold text-sm">
            <span>TOTAL</span>
            <span>{formatCurrency(sale.total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Pago</span>
            <span className="font-medium">{paymentLabel(sale.paymentMethod)}</span>
          </div>
        </div>

        {/* Notas */}
        {sale.notes && (
          <div className="border-t border-dashed border-gray-300 pt-3 mb-3">
            <p className="text-gray-500">Nota: {sale.notes}</p>
          </div>
        )}

        {/* Pie */}
        <div className="border-t border-dashed border-gray-300 pt-3 text-center text-gray-400">
          <p>Gracias por su preferencia</p>
          <p className="mt-1">Este es un documento de prueba.</p>
          <p className="mt-2 text-gray-300">— Taller Castillo POS —</p>
        </div>
      </div>
    </div>
  );
}
