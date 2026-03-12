import { useState, useMemo, useCallback } from 'react';
import { Landmark, Lock, Unlock, ArrowDownCircle, ArrowUpCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal }       from '../components/ui/Modal';
import { EmptyState }  from '../components/ui/EmptyState';
import { cashService } from '../services/cashService';
import { salesService } from '../services/salesService';
import { useAuth }     from '../context/AuthContext';
import type { CashSession, CashMovement } from '../types';
import { formatCurrency, formatDateTime } from '../utils/format';

export function CashPage() {
  const { session } = useAuth();
  const username    = session?.username ?? 'sistema';

  const [sessions,   setSessions]   = useState<CashSession[]>(() => cashService.getSessions());
  const [movements,  setMovements]  = useState<CashMovement[]>(() => cashService.getMovements());
  const [activeSession, setActive]  = useState(() => cashService.getActiveSession());

  const [openModal,  setOpenModal]  = useState(false);
  const [closeModal, setCloseModal] = useState(false);
  const [moveModal,  setMoveModal]  = useState(false);
  const [moveType,   setMoveType]   = useState<'ingreso' | 'egreso'>('ingreso');

  const [openAmt,    setOpenAmt]    = useState('');
  const [closeAmt,   setCloseAmt]   = useState('');
  const [closeNotes, setCloseNotes] = useState('');
  const [moveConcept, setMoveConcept] = useState('');
  const [moveAmt,    setMoveAmt]    = useState('');
  const [actionError, setActionError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const refresh = useCallback(() => {
    setSessions(cashService.getSessions());
    setMovements(cashService.getMovements());
    setActive(cashService.getActiveSession());
  }, []);

  const activeMovements = useMemo(
    () => activeSession ? movements.filter((m) => m.sessionId === activeSession.id) : [],
    [movements, activeSession],
  );

  const activeSales = useMemo(
    () => activeSession ? salesService.getByCashSession(activeSession.id) : [],
    [activeSession],
  );

  const activeTotalSales = activeSales.reduce((a, s) => a + s.total, 0);

  function handleOpen(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(openAmt);
    if (isNaN(amt) || amt < 0) { setActionError('Ingresa un monto inicial válido.'); return; }
    try {
      cashService.openSession(amt, username);
      setActionError('');
      setOpenAmt('');
      setOpenModal(false);
      setSuccessMsg('Caja abierta correctamente.');
      refresh();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error al abrir caja.');
    }
  }

  function handleClose(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(closeAmt);
    if (isNaN(amt) || amt < 0) { setActionError('Ingresa el monto real contado.'); return; }
    try {
      cashService.closeSession(amt, username, closeNotes);
      setActionError('');
      setCloseAmt('');
      setCloseNotes('');
      setCloseModal(false);
      setSuccessMsg('Caja cerrada. Arqueo guardado.');
      refresh();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error al cerrar caja.');
    }
  }

  function handleMovement(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(moveAmt);
    if (!moveConcept.trim()) { setActionError('El concepto es obligatorio.'); return; }
    if (isNaN(amt) || amt <= 0) { setActionError('El monto debe ser mayor a 0.'); return; }
    try {
      cashService.addMovement(moveType, moveConcept, amt, username);
      setActionError('');
      setMoveConcept('');
      setMoveAmt('');
      setMoveModal(false);
      setSuccessMsg('Movimiento registrado.');
      refresh();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error al registrar movimiento.');
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Caja</h2>
          <p className="text-sm text-gray-500">Control de apertura, movimientos y cierre</p>
        </div>
        <div className="flex gap-2">
          {!activeSession ? (
            <button onClick={() => { setActionError(''); setOpenModal(true); }} className="btn-success">
              <Unlock size={15} /> Abrir caja
            </button>
          ) : (
            <>
              <button onClick={() => { setMoveType('ingreso'); setActionError(''); setMoveModal(true); }} className="btn-secondary">
                <ArrowDownCircle size={15} className="text-green-600" /> Ingreso
              </button>
              <button onClick={() => { setMoveType('egreso'); setActionError(''); setMoveModal(true); }} className="btn-secondary">
                <ArrowUpCircle size={15} className="text-red-500" /> Egreso
              </button>
              <button onClick={() => { setActionError(''); setCloseModal(true); }} className="btn-danger">
                <Lock size={15} /> Cerrar caja
              </button>
            </>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <CheckCircle2 size={16} /> <span className="text-sm">{successMsg}</span>
        </div>
      )}

      {/* Estado actual */}
      <div className={`card p-5 flex items-start gap-4 ${activeSession ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          activeSession ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
        }`}>
          <Landmark size={20} />
        </div>
        <div className="flex-1">
          <p className={`font-semibold ${activeSession ? 'text-green-800' : 'text-gray-600'}`}>
            {activeSession ? 'Caja abierta' : 'Sin sesión activa'}
          </p>
          {activeSession ? (
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-500">Fondo inicial</p>
                <p className="font-bold text-gray-800">{formatCurrency(activeSession.openingAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Ventas en sesión</p>
                <p className="font-bold text-green-700">{formatCurrency(activeTotalSales)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Movimientos</p>
                <p className="font-bold text-gray-800">{activeMovements.length}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Abierta por</p>
                <p className="font-bold text-gray-800">{activeSession.openedBy}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 mt-1">Abre la caja para empezar a registrar ventas asociadas.</p>
          )}
        </div>
      </div>

      {/* Movimientos de la sesión activa */}
      {activeSession && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Movimientos de la sesión actual</h3>
          </div>
          {activeMovements.length === 0 ? (
            <EmptyState message="No hay movimientos en esta sesión." />
          ) : (
            <table className="table-base">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Concepto</th>
                  <th>Monto</th>
                  <th>Usuario</th>
                  <th>Hora</th>
                </tr>
              </thead>
              <tbody>
                {activeMovements.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <span className={m.type === 'ingreso' ? 'badge-green' : 'badge-red'}>
                        {m.type === 'ingreso' ? '↓ Ingreso' : '↑ Egreso'}
                      </span>
                    </td>
                    <td className="text-gray-700">{m.concept}</td>
                    <td className={`font-semibold ${m.type === 'ingreso' ? 'text-green-700' : 'text-red-600'}`}>
                      {m.type === 'egreso' ? '−' : '+'}{formatCurrency(m.amount)}
                    </td>
                    <td className="text-gray-500">{m.createdBy}</td>
                    <td className="text-xs text-gray-400">{formatDateTime(m.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Historial de sesiones cerradas */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Historial de sesiones</h3>
        </div>
        {sessions.filter((s) => s.status === 'cerrada').length === 0 ? (
          <EmptyState message="No hay sesiones cerradas." />
        ) : (
          <table className="table-base">
            <thead>
              <tr>
                <th>Apertura</th>
                <th>Cierre</th>
                <th>Fondo inicial</th>
                <th>Ventas</th>
                <th>Monto real</th>
                <th>Diferencia</th>
                <th>Operador</th>
              </tr>
            </thead>
            <tbody>
              {sessions.filter((s) => s.status === 'cerrada').map((s) => (
                <tr key={s.id}>
                  <td className="text-xs text-gray-500">{formatDateTime(s.openedAt)}</td>
                  <td className="text-xs text-gray-500">{s.closedAt ? formatDateTime(s.closedAt) : '—'}</td>
                  <td>{formatCurrency(s.openingAmount)}</td>
                  <td className="text-green-700 font-medium">{formatCurrency(s.totalSales)}</td>
                  <td className="font-semibold">{s.realAmount !== null ? formatCurrency(s.realAmount) : '—'}</td>
                  <td>
                    {s.difference !== null && (
                      <span className={`badge ${s.difference === 0 ? 'badge-green' : s.difference > 0 ? 'badge-blue' : 'badge-red'}`}>
                        {s.difference > 0 ? '+' : ''}{formatCurrency(s.difference)}
                      </span>
                    )}
                  </td>
                  <td className="text-gray-500 text-xs">{s.openedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal: Abrir caja */}
      <Modal open={openModal} title="Abrir caja" onClose={() => setOpenModal(false)} size="sm">
        <form onSubmit={handleOpen} className="p-6 space-y-4">
          <div>
            <label className="label">Monto inicial de apertura (MXN)</label>
            <input type="number" min="0" step="0.01" className="input" value={openAmt}
              onChange={(e) => setOpenAmt(e.target.value)} placeholder="Ej. 2000.00" />
          </div>
          {actionError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{actionError}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setOpenModal(false)}>Cancelar</button>
            <button type="submit" className="btn-success">Abrir caja</button>
          </div>
        </form>
      </Modal>

      {/* Modal: Cerrar caja */}
      <Modal open={closeModal} title="Cerrar caja — Arqueo" onClose={() => setCloseModal(false)} size="sm">
        <form onSubmit={handleClose} className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Fondo inicial</span>
              <span>{formatCurrency(activeSession?.openingAmount ?? 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Ventas en sesión</span>
              <span className="text-green-600 font-medium">{formatCurrency(activeTotalSales)}</span>
            </div>
          </div>
          <div>
            <label className="label">Monto real contado en caja (MXN)</label>
            <input type="number" min="0" step="0.01" className="input" value={closeAmt}
              onChange={(e) => setCloseAmt(e.target.value)} placeholder="Ej. 5000.00" />
          </div>
          <div>
            <label className="label">Notas de cierre</label>
            <textarea className="input resize-none" rows={2} value={closeNotes}
              onChange={(e) => setCloseNotes(e.target.value)} placeholder="Observaciones del cierre…" />
          </div>
          {actionError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{actionError}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setCloseModal(false)}>Cancelar</button>
            <button type="submit" className="btn-danger">Cerrar y arquear</button>
          </div>
        </form>
      </Modal>

      {/* Modal: Movimiento */}
      <Modal open={moveModal} title={moveType === 'ingreso' ? 'Registrar ingreso' : 'Registrar egreso'} onClose={() => setMoveModal(false)} size="sm">
        <form onSubmit={handleMovement} className="p-6 space-y-4">
          <div className="flex gap-2">
            {(['ingreso', 'egreso'] as const).map((t) => (
              <button
                key={t} type="button"
                onClick={() => setMoveType(t)}
                className={`flex-1 btn btn-sm ${moveType === t
                  ? (t === 'ingreso' ? 'bg-green-600 text-white border-green-600' : 'bg-red-600 text-white border-red-600')
                  : 'btn-secondary'
                }`}
              >
                {t === 'ingreso' ? '↓ Ingreso' : '↑ Egreso'}
              </button>
            ))}
          </div>
          <div>
            <label className="label">Concepto *</label>
            <input className="input" value={moveConcept} onChange={(e) => setMoveConcept(e.target.value)} placeholder="Describe el motivo del movimiento…" />
          </div>
          <div>
            <label className="label">Monto (MXN) *</label>
            <input type="number" min="0.01" step="0.01" className="input" value={moveAmt}
              onChange={(e) => setMoveAmt(e.target.value)} placeholder="0.00" />
          </div>
          {actionError && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle size={13} /> {actionError}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setMoveModal(false)}>Cancelar</button>
            <button type="submit" className={moveType === 'ingreso' ? 'btn-success' : 'btn-danger'}>
              Registrar {moveType}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
