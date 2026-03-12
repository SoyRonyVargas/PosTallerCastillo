import { useState, useMemo } from 'react';
import { Plus, Search, Pencil, Phone, Mail, ToggleLeft, ToggleRight, History } from 'lucide-react';
import { Modal }           from '../components/ui/Modal';
import { EmptyState }      from '../components/ui/EmptyState';
import { customerService } from '../services/customerService';
import { salesService }    from '../services/salesService';
import type { Customer, CustomerForm, Sale } from '../types';
import { formatCurrency, formatDateTime, formatDate, paymentLabel } from '../utils/format';

const EMPTY_FORM: CustomerForm = { name: '', phone: '', email: '', notes: '', active: true };

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(() => customerService.getAll());
  const [search, setSearch]       = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [editing, setEditing]     = useState<Customer | null>(null);
  const [form, setForm]           = useState<CustomerForm>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return customers.filter((c) =>
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q),
    );
  }, [customers, search]);

  const customerSales = useMemo<Sale[]>(() => {
    if (!selectedCustomer) return [];
    return salesService.getAll().filter(
      (s) => s.customerId === selectedCustomer.id && s.status === 'completada',
    );
  }, [selectedCustomer]);

  function openCreate() {
    setEditing(null); setForm(EMPTY_FORM); setFormError(''); setModalOpen(true);
  }
  function openEdit(c: Customer) {
    setEditing(c);
    setForm({ name: c.name, phone: c.phone, email: c.email, notes: c.notes, active: c.active });
    setFormError(''); setModalOpen(true);
  }
  function openHistory(c: Customer) {
    setSelectedCustomer(c); setHistoryOpen(true);
  }

  function handleToggle(id: string) {
    customerService.toggleActive(id);
    setCustomers(customerService.getAll());
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setFormError('El nombre es obligatorio.'); return; }
    setFormError('');
    if (editing) { customerService.update(editing.id, form); }
    else          { customerService.create(form); }
    setCustomers(customerService.getAll());
    setModalOpen(false);
  }

  const field = (k: keyof CustomerForm, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Clientes</h2>
          <p className="text-sm text-gray-500">Directorio de clientes del taller</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} /> Nuevo cliente
        </button>
      </div>

      {/* Buscador */}
      <div className="card p-4">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Buscar por nombre, teléfono o correo…"
            className="input pl-9" value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <EmptyState message="No se encontraron clientes." />
          ) : (
            <table className="table-base">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Contacto</th>
                  <th>Notas</th>
                  <th>Registro</th>
                  <th>Estado</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td className="font-medium text-gray-800">{c.name}</td>
                    <td>
                      <div className="space-y-0.5">
                        {c.phone && (
                          <p className="flex items-center gap-1 text-gray-600 text-xs">
                            <Phone size={11} /> {c.phone}
                          </p>
                        )}
                        {c.email && (
                          <p className="flex items-center gap-1 text-gray-400 text-xs">
                            <Mail size={11} /> {c.email}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="text-xs text-gray-400 max-w-xs truncate">{c.notes || '—'}</td>
                    <td className="text-xs text-gray-400">{formatDate(c.createdAt)}</td>
                    <td>
                      <span className={c.active ? 'badge-green' : 'badge-gray'}>
                        {c.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openHistory(c)} className="btn-secondary btn-sm" title="Historial">
                          <History size={13} />
                        </button>
                        <button onClick={() => openEdit(c)} className="btn-secondary btn-sm" title="Editar">
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleToggle(c.id)}
                          className={`btn-sm btn ${c.active ? 'bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100' : 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100'}`}
                          title={c.active ? 'Desactivar' : 'Activar'}
                        >
                          {c.active ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Formulario */}
      <Modal open={modalOpen} title={editing ? 'Editar cliente' : 'Nuevo cliente'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Nombre completo *</label>
            <input className="input" value={form.name} onChange={(e) => field('name', e.target.value)} placeholder="Ej. Juan Pérez García" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Teléfono</label>
              <input className="input" value={form.phone} onChange={(e) => field('phone', e.target.value)} placeholder="555-000-0000" />
            </div>
            <div>
              <label className="label">Correo electrónico</label>
              <input type="email" className="input" value={form.email} onChange={(e) => field('email', e.target.value)} placeholder="correo@ejemplo.com" />
            </div>
          </div>
          <div>
            <label className="label">Notas</label>
            <textarea className="input resize-none" rows={2} value={form.notes} onChange={(e) => field('notes', e.target.value)} placeholder="Vehículos, observaciones, etc." />
          </div>
          <div className="flex items-center gap-2">
            <input id="cust-active" type="checkbox" checked={form.active} onChange={(e) => field('active', e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
            <label htmlFor="cust-active" className="text-sm text-gray-700">Cliente activo</label>
          </div>
          {formError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">{editing ? 'Guardar' : 'Crear cliente'}</button>
          </div>
        </form>
      </Modal>

      {/* Modal Historial */}
      <Modal open={historyOpen} title={`Historial · ${selectedCustomer?.name}`} onClose={() => setHistoryOpen(false)} size="lg">
        <div className="p-6">
          {customerSales.length === 0 ? (
            <EmptyState message="Este cliente no tiene ventas registradas." />
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">
                {customerSales.length} venta{customerSales.length !== 1 ? 's' : ''} ·{' '}
                Total acumulado: <strong>{formatCurrency(customerSales.reduce((a, s) => a + s.total, 0))}</strong>
              </p>
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Folio</th>
                    <th>Total</th>
                    <th>Método</th>
                    <th>Items</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {customerSales.map((s) => (
                    <tr key={s.id}>
                      <td className="font-mono text-xs text-blue-600">{s.folio}</td>
                      <td className="font-semibold">{formatCurrency(s.total)}</td>
                      <td><span className="badge-gray">{paymentLabel(s.paymentMethod)}</span></td>
                      <td className="text-xs text-gray-500">{s.items.map((i) => i.name).join(', ')}</td>
                      <td className="text-xs text-gray-400">{formatDateTime(s.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
