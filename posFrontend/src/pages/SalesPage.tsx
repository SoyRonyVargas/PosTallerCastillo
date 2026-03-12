import { useState, useMemo } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { catalogService }  from '../services/catalogService';
import { customerService } from '../services/customerService';
import { salesService }    from '../services/salesService';
import { cashService }     from '../services/cashService';
import { useAuth }         from '../context/AuthContext';
import type { SaleItem, PaymentMethod } from '../types';
import { formatCurrency } from '../utils/format';

type Step = 'build' | 'confirm' | 'done';

export function SalesPage() {
  const { session }  = useAuth();
  const navigate     = useNavigate();

  const customers  = useMemo(() => customerService.getAll().filter((c) => c.active), []);
  const catalog    = useMemo(() => catalogService.getAll().filter((i) => i.active), []);
  const activeSession = useMemo(() => cashService.getActiveSession(), []);

  const [step, setStep]                   = useState<Step>('build');
  const [search, setSearch]               = useState('');
  const [selectedCustomerId, setCustomer] = useState<string>('');
  const [items, setItems]                 = useState<SaleItem[]>([]);
  const [paymentMethod, setPayment]       = useState<PaymentMethod>('efectivo');
  const [notes, setNotes]                 = useState('');
  const [saleError, setSaleError]         = useState('');
  const [createdSaleId, setCreatedSaleId] = useState('');

  const filteredCatalog = useMemo(() => {
    const q = search.toLowerCase();
    return catalog.filter((i) => !q || i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
  }, [catalog, search]);

  const subtotal = items.reduce((a, i) => a + i.subtotal, 0);

  function addItem(catalogId: string) {
    const ci = catalog.find((c) => c.id === catalogId);
    if (!ci) return;
    const existing = items.findIndex((i) => i.catalogItemId === catalogId);
    if (existing >= 0) {
      const updated = [...items];
      updated[existing].quantity  += 1;
      updated[existing].subtotal   = updated[existing].quantity * updated[existing].unitPrice;
      setItems(updated);
    } else {
      setItems([...items, {
        catalogItemId: ci.id,
        name:      ci.name,
        type:      ci.type,
        unitPrice: ci.price,
        quantity:  1,
        subtotal:  ci.price,
      }]);
    }
  }

  function changeQty(idx: number, delta: number) {
    const updated = [...items];
    const newQty  = updated[idx].quantity + delta;
    if (newQty <= 0) { removeItem(idx); return; }
    updated[idx].quantity = newQty;
    updated[idx].subtotal = newQty * updated[idx].unitPrice;
    setItems(updated);
  }

  function removeItem(idx: number) {
    setItems(items.filter((_, i) => i !== idx));
  }

  function resetForm() {
    setStep('build');
    setSearch('');
    setCustomer('');
    setItems([]);
    setPayment('efectivo');
    setNotes('');
    setSaleError('');
  }

  function handleConfirm() {
    if (items.length === 0) { setSaleError('Agrega al menos un concepto a la venta.'); return; }
    setSaleError('');
    setStep('confirm');
  }

  function handleFinalize() {
    try {
      const customer = customers.find((c) => c.id === selectedCustomerId);
      const sale = salesService.create({
        customerId:    selectedCustomerId || null,
        customerName:  customer?.name ?? 'Público general',
        items,
        paymentMethod,
        cashSessionId: activeSession?.id ?? null,
        createdBy:     session?.username ?? 'sistema',
        notes,
      });
      setCreatedSaleId(sale.id);
      setStep('done');
    } catch (err) {
      setSaleError(err instanceof Error ? err.message : 'Error al guardar la venta.');
      setStep('build');
    }
  }

  // ── Paso: Venta completada ────────────────────────────
  if (step === 'done') {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-5">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle size={36} className="text-green-600" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">Venta registrada</h2>
          <p className="text-sm text-gray-500 mt-1">La venta se guardó correctamente.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary" onClick={resetForm}>
            Nueva venta
          </button>
          <button className="btn-primary" onClick={() => navigate(`/ticket/${createdSaleId}`)}>
            Ver ticket
          </button>
        </div>
      </div>
    );
  }

  // ── Paso: Confirmación ─────────────────────────────────
  if (step === 'confirm') {
    const customer = customers.find((c) => c.id === selectedCustomerId);
    return (
      <div className="max-w-xl mx-auto space-y-5">
        <div className="flex items-center gap-2">
          <button onClick={() => setStep('build')} className="btn-secondary btn-sm">
            <X size={14} /> Regresar
          </button>
          <h2 className="text-lg font-bold text-gray-900">Confirmar venta</h2>
        </div>
        <div className="card p-5 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Cliente</span>
            <span className="font-medium">{customer?.name ?? 'Público general'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Método de pago</span>
            <span className="font-medium capitalize">{paymentMethod}</span>
          </div>
          <hr className="border-gray-100" />
          {items.map((i, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-gray-700">{i.name} ×{i.quantity}</span>
              <span className="font-medium">{formatCurrency(i.subtotal)}</span>
            </div>
          ))}
          <hr className="border-gray-100" />
          <div className="flex justify-between">
            <span className="font-bold text-gray-900">Total</span>
            <span className="font-bold text-blue-600 text-lg">{formatCurrency(subtotal)}</span>
          </div>
          {notes && <p className="text-xs text-gray-400">Nota: {notes}</p>}
        </div>
        <button className="btn-success w-full btn-lg" onClick={handleFinalize}>
          <CheckCircle size={18} /> Confirmar y guardar venta
        </button>
      </div>
    );
  }

  // ── Paso principal: Construir venta ────────────────────
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 h-full">

      {/* Panel izquierdo — catálogo */}
      <div className="lg:col-span-3 space-y-4">
        <div className="card p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Catálogo</h3>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9" placeholder="Buscar producto o servicio…"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0">
            {filteredCatalog.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-10 col-span-2">Sin resultados.</p>
            ) : (
              filteredCatalog.map((ci) => (
                <button
                  key={ci.id}
                  onClick={() => addItem(ci.id)}
                  className="flex items-center justify-between p-4 hover:bg-blue-50 transition-colors text-left border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{ci.name}</p>
                    <p className="text-xs text-gray-400">{ci.category} · {ci.type}</p>
                  </div>
                  <div className="text-right ml-3 flex-shrink-0">
                    <p className="text-sm font-bold text-blue-600">{formatCurrency(ci.price)}</p>
                    <Plus size={14} className="text-gray-300 mx-auto mt-0.5" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Panel derecho — resumen */}
      <div className="lg:col-span-2 space-y-4">
        <div className="card p-4 space-y-3">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <ShoppingCart size={16} className="text-blue-500" /> Venta actual
          </h3>

          {/* Cliente */}
          <div>
            <label className="label">Cliente (opcional)</label>
            <select className="input" value={selectedCustomerId} onChange={(e) => setCustomer(e.target.value)}>
              <option value="">— Público general —</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Método de pago */}
          <div>
            <label className="label">Método de pago</label>
            <select className="input" value={paymentMethod} onChange={(e) => setPayment(e.target.value as PaymentMethod)}>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </div>

          {/* Items */}
          <div>
            <label className="label">Conceptos</label>
            {items.length === 0 ? (
              <div className="text-center py-6 text-gray-300 border-2 border-dashed border-gray-200 rounded-lg">
                <ShoppingCart size={28} className="mx-auto mb-1" />
                <p className="text-xs">Selecciona items del catálogo</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 border border-gray-100 rounded-lg bg-gray-50">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">{formatCurrency(item.unitPrice)} c/u</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => changeQty(idx, -1)} className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-200 text-gray-600">
                        <Minus size={10} />
                      </button>
                      <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                      <button onClick={() => changeQty(idx, +1)} className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-200 text-gray-600">
                        <Plus size={10} />
                      </button>
                    </div>
                    <span className="text-xs font-bold text-gray-800 w-16 text-right flex-shrink-0">
                      {formatCurrency(item.subtotal)}
                    </span>
                    <button onClick={() => removeItem(idx)} className="text-gray-300 hover:text-red-500">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notas */}
          <div>
            <label className="label">Notas (opcional)</label>
            <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observaciones de la venta…" />
          </div>

          {/* Total */}
          <div className="border-t border-gray-100 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Subtotal</span>
              <span className="font-semibold text-gray-800">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-blue-600 text-xl">{formatCurrency(subtotal)}</span>
            </div>
          </div>

          {saleError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{saleError}</p>
          )}

          <button
            onClick={handleConfirm}
            disabled={items.length === 0}
            className="btn-primary w-full btn-lg"
          >
            Revisar y confirmar
          </button>
        </div>

        {!activeSession && (
          <div className="card p-4 border-amber-200 bg-amber-50">
            <p className="text-xs text-amber-700 font-medium">
              No hay sesión de caja activa. Puedes registrar la venta, pero no estará asociada a ninguna caja.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
