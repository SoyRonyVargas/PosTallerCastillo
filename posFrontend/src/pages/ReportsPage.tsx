import { useState, useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import { Link }              from 'react-router-dom';
import { EmptyState }        from '../components/ui/EmptyState';
import { StatCard }          from '../components/ui/StatCard';
import { reportService }     from '../services/reportService';
import { authService }       from '../services/authService';
import type { ReportFilters } from '../types';
import { formatCurrency, formatDate, paymentLabel, todayISO } from '../utils/format';
import { DollarSign, ShoppingCart, CreditCard, Banknote, ArrowRight } from 'lucide-react';

const EMPTY_FILTERS: ReportFilters = {
  dateFrom:      '',
  dateTo:        todayISO(),
  paymentMethod: '',
  userId:        '',
};

export function ReportsPage() {
  const users = useMemo(() => authService.getAllUsers(), []);
  const [filters, setFilters] = useState<ReportFilters>(EMPTY_FILTERS);

  const sales   = useMemo(() => reportService.filterSales(filters), [filters]);
  const totals  = useMemo(() => reportService.getTotals(filters), [filters]);
  const summary = useMemo(() => reportService.getDailySummary(filters), [filters]);

  const setF = (key: keyof ReportFilters, value: string) =>
    setFilters((f) => ({ ...f, [key]: value }));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Reportes</h2>
        <p className="text-sm text-gray-500">Resumen de ventas e ingresos</p>
      </div>

      {/* Filtros */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div>
          <label className="label">Desde</label>
          <input type="date" className="input w-40" value={filters.dateFrom} onChange={(e) => setF('dateFrom', e.target.value)} />
        </div>
        <div>
          <label className="label">Hasta</label>
          <input type="date" className="input w-40" value={filters.dateTo} onChange={(e) => setF('dateTo', e.target.value)} />
        </div>
        <div>
          <label className="label">Método de pago</label>
          <select className="input w-44" value={filters.paymentMethod} onChange={(e) => setF('paymentMethod', e.target.value)}>
            <option value="">Todos</option>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
          </select>
        </div>
        <div>
          <label className="label">Usuario</label>
          <select className="input w-44" value={filters.userId} onChange={(e) => setF('userId', e.target.value)}>
            <option value="">Todos</option>
            {users.map((u) => <option key={u.id} value={u.username}>{u.name}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <button className="btn-secondary btn-sm" onClick={() => setFilters(EMPTY_FILTERS)}>Limpiar filtros</button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Ventas"           value={String(totals.count)}                          icon={ShoppingCart} color="blue" />
        <StatCard label="Ingresos totales" value={formatCurrency(totals.totalAmount)}            icon={DollarSign}   color="green" />
        <StatCard label="Efectivo"         value={formatCurrency(totals.byPaymentMethod.efectivo)}      icon={Banknote}     color="amber" />
        <StatCard label="Tarjeta + Transfer" value={formatCurrency(totals.byPaymentMethod.tarjeta + totals.byPaymentMethod.transferencia)} icon={CreditCard} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Resumen diario */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <BarChart3 size={16} className="text-blue-500" /> Resumen por día
            </h3>
          </div>
          {summary.length === 0 ? (
            <EmptyState message="Sin datos para el período." />
          ) : (
            <table className="table-base">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Ventas</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((row) => (
                  <tr key={row.date}>
                    <td className="text-xs">{formatDate(row.date + 'T12:00:00Z')}</td>
                    <td>{row.salesCount}</td>
                    <td className="font-semibold text-green-700">{formatCurrency(row.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Detalle de ventas */}
        <div className="card overflow-hidden lg:col-span-2">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Detalle de ventas</h3>
          </div>
          {sales.length === 0 ? (
            <EmptyState message="No hay ventas para los filtros aplicados." />
          ) : (
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Folio</th>
                    <th>Cliente</th>
                    <th>Total</th>
                    <th>Método</th>
                    <th>Operador</th>
                    <th>Fecha</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((s) => (
                    <tr key={s.id}>
                      <td className="font-mono text-xs text-blue-600">{s.folio}</td>
                      <td className="text-gray-700">{s.customerName}</td>
                      <td className="font-semibold">{formatCurrency(s.total)}</td>
                      <td>
                        <span className={`badge ${
                          s.paymentMethod === 'efectivo' ? 'badge-green' :
                          s.paymentMethod === 'tarjeta'  ? 'badge-blue'  : 'badge-purple'
                        }`}>
                          {paymentLabel(s.paymentMethod)}
                        </span>
                      </td>
                      <td className="text-xs text-gray-500">{s.createdBy}</td>
                      <td className="text-xs text-gray-400">{formatDate(s.createdAt)}</td>
                      <td>
                        <Link to={`/ticket/${s.id}`} className="text-blue-500 hover:text-blue-700">
                          <ArrowRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
