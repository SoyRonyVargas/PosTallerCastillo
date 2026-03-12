import { useMemo } from 'react';
import {
  ShoppingCart,
  DollarSign,
  Users,
  BookOpen,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard }        from '../components/ui/StatCard';
import { useAuth }         from '../context/AuthContext';
import { salesService }    from '../services/salesService';
import { customerService } from '../services/customerService';
import { catalogService }  from '../services/catalogService';
import { cashService }     from '../services/cashService';
import { formatCurrency, formatDateTime, paymentLabel } from '../utils/format';

export function DashboardPage() {
  const { session } = useAuth();

  const stats = useMemo(() => {
    const sales     = salesService.getAll().filter((s) => s.status === 'completada');
    const customers = customerService.getAll().filter((c) => c.active);
    const catalog   = catalogService.getAll().filter((i) => i.active);
    const active    = cashService.getActiveSession();

    const today  = new Date().toISOString().substring(0, 10);
    const todaySales = sales.filter((s) => s.createdAt.startsWith(today));

    return {
      totalSales:      sales.length,
      totalRevenue:    sales.reduce((a, s) => a + s.total, 0),
      customers:       customers.length,
      catalogItems:    catalog.length,
      todaySalesCount: todaySales.length,
      todayRevenue:    todaySales.reduce((a, s) => a + s.total, 0),
      cashOpen:        !!active,
      recentSales:     sales.slice(0, 5),
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Bienvenido, {session?.name?.split(' ')[0]}
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Resumen general del sistema POS · Taller Castillo
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Ventas totales"
          value={String(stats.totalSales)}
          icon={ShoppingCart}
          color="blue"
          sub="Todas las registradas"
        />
        <StatCard
          label="Ingresos totales"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          color="green"
          sub="Ventas completadas"
        />
        <StatCard
          label="Clientes activos"
          value={String(stats.customers)}
          icon={Users}
          color="purple"
          sub="En el sistema"
        />
        <StatCard
          label="Items en catálogo"
          value={String(stats.catalogItems)}
          icon={BookOpen}
          color="amber"
          sub="Activos"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ventas recientes */}
        <div className="card lg:col-span-2">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-500" />
              Ventas recientes
            </h3>
            <Link to="/reportes" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Ver todas <ArrowRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            {stats.recentSales.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-10">No hay ventas registradas.</p>
            ) : (
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Folio</th>
                    <th>Cliente</th>
                    <th>Total</th>
                    <th>Método</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentSales.map((sale) => (
                    <tr key={sale.id}>
                      <td>
                        <Link
                          to={`/ticket/${sale.id}`}
                          className="text-blue-600 hover:underline font-mono text-xs"
                        >
                          {sale.folio}
                        </Link>
                      </td>
                      <td className="text-gray-700">{sale.customerName}</td>
                      <td className="font-semibold text-gray-900">{formatCurrency(sale.total)}</td>
                      <td>
                        <span className={`badge ${
                          sale.paymentMethod === 'efectivo'      ? 'badge-green'  :
                          sale.paymentMethod === 'tarjeta'       ? 'badge-blue'   :
                          'badge-purple'
                        }`}>
                          {paymentLabel(sale.paymentMethod)}
                        </span>
                      </td>
                      <td className="text-gray-400 text-xs">{formatDateTime(sale.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-4">
          {/* Estado de caja */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-3">Estado de caja</h3>
            <div className={`flex items-center gap-3 p-3 rounded-lg ${
              stats.cashOpen ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
            }`}>
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                stats.cashOpen ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              <div>
                <p className={`text-sm font-semibold ${stats.cashOpen ? 'text-green-700' : 'text-gray-600'}`}>
                  {stats.cashOpen ? 'Caja abierta' : 'Caja cerrada'}
                </p>
                <p className="text-xs text-gray-500">
                  {stats.cashOpen ? 'Sesión activa en curso' : 'No hay sesión activa'}
                </p>
              </div>
            </div>
            <Link to="/caja" className="btn-secondary btn-sm w-full mt-3 justify-center">
              Ir a Caja
            </Link>
          </div>

          {/* Accesos rápidos */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-3">Acciones rápidas</h3>
            <div className="space-y-2">
              <Link to="/ventas"   className="btn-primary  btn-sm w-full justify-center">Nueva venta</Link>
              <Link to="/catalogo" className="btn-secondary btn-sm w-full justify-center">Ver catálogo</Link>
              <Link to="/clientes" className="btn-secondary btn-sm w-full justify-center">Ver clientes</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
