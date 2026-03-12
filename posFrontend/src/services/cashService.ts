/**
 * cashService — Gestión de sesiones de caja con localStorage.
 * Reglas de negocio:
 *  - Solo puede haber una sesión abierta a la vez.
 *  - No se puede cerrar si no hay sesión abierta.
 *  - El arqueo calcula la diferencia entre el monto real contado y el esperado.
 */
import type { CashSession, CashMovement, CashMovementType } from '../types';
import { MOCK_CASH_SESSIONS, MOCK_CASH_MOVEMENTS } from '../mocks/cash.mock';
import { salesService } from './salesService';

const LS_KEY_SESSIONS  = 'tc_pos_cash_sessions';
const LS_KEY_MOVEMENTS = 'tc_pos_cash_movements';

// ── Init ──────────────────────────────────────────────────────────────────────
function initSessions(): void {
  if (!localStorage.getItem(LS_KEY_SESSIONS)) {
    localStorage.setItem(LS_KEY_SESSIONS, JSON.stringify(MOCK_CASH_SESSIONS));
  }
}
function initMovements(): void {
  if (!localStorage.getItem(LS_KEY_MOVEMENTS)) {
    localStorage.setItem(LS_KEY_MOVEMENTS, JSON.stringify(MOCK_CASH_MOVEMENTS));
  }
}

// ── Sessions ──────────────────────────────────────────────────────────────────
function getSessions(): CashSession[] {
  initSessions();
  return JSON.parse(localStorage.getItem(LS_KEY_SESSIONS) || '[]') as CashSession[];
}
function saveSessions(sessions: CashSession[]): void {
  localStorage.setItem(LS_KEY_SESSIONS, JSON.stringify(sessions));
}

function getActiveSession(): CashSession | null {
  return getSessions().find((s) => s.status === 'abierta') ?? null;
}

function openSession(openingAmount: number, openedBy: string): CashSession {
  if (getActiveSession()) {
    throw new Error('Ya existe una sesión de caja abierta.');
  }
  const session: CashSession = {
    id:              `cs-${Date.now()}`,
    openingAmount,
    closingAmount:   null,
    totalSales:      0,
    totalMovements:  0,
    realAmount:      null,
    difference:      null,
    openedBy,
    closedBy:        null,
    openedAt:        new Date().toISOString(),
    closedAt:        null,
    notes:           '',
    status:          'abierta',
  };
  const sessions = getSessions();
  saveSessions([session, ...sessions]);
  return session;
}

function closeSession(realAmount: number, closedBy: string, notes: string): CashSession {
  const active = getActiveSession();
  if (!active) throw new Error('No hay sesión de caja abierta.');

  const sales     = salesService.getByCashSession(active.id);
  const movements = getMovementsBySession(active.id);
  const totalSales     = sales.reduce((acc, s) => acc + s.total, 0);
  const totalIngresses = movements.filter((m) => m.type === 'ingreso').reduce((a, m) => a + m.amount, 0);
  const totalEgresses  = movements.filter((m) => m.type === 'egreso').reduce((a, m) => a + m.amount, 0);
  const totalMovements = totalIngresses - totalEgresses;
  const expected       = active.openingAmount + totalSales + totalIngresses - totalEgresses;
  const difference     = realAmount - expected;

  const sessions = getSessions();
  const idx = sessions.findIndex((s) => s.id === active.id);
  sessions[idx] = {
    ...sessions[idx],
    closingAmount:  realAmount,
    totalSales,
    totalMovements,
    realAmount,
    difference,
    closedBy,
    closedAt:       new Date().toISOString(),
    notes,
    status:         'cerrada',
  };
  saveSessions(sessions);
  return sessions[idx];
}

// ── Movements ─────────────────────────────────────────────────────────────────
function getMovements(): CashMovement[] {
  initMovements();
  return JSON.parse(localStorage.getItem(LS_KEY_MOVEMENTS) || '[]') as CashMovement[];
}
function saveMovements(movements: CashMovement[]): void {
  localStorage.setItem(LS_KEY_MOVEMENTS, JSON.stringify(movements));
}

function getMovementsBySession(sessionId: string): CashMovement[] {
  return getMovements().filter((m) => m.sessionId === sessionId);
}

function addMovement(
  type: CashMovementType,
  concept: string,
  amount: number,
  createdBy: string,
): CashMovement {
  const active = getActiveSession();
  if (!active) throw new Error('No hay sesión de caja abierta para registrar el movimiento.');

  const movement: CashMovement = {
    id:         `cmov-${Date.now()}`,
    sessionId:  active.id,
    type,
    concept,
    amount,
    createdBy,
    createdAt:  new Date().toISOString(),
  };
  const movements = getMovements();
  saveMovements([movement, ...movements]);
  return movement;
}

export const cashService = {
  getSessions,
  getActiveSession,
  openSession,
  closeSession,
  getMovements,
  getMovementsBySession,
  addMovement,
};
