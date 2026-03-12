import type { CashSession, CashMovement } from '../types';

export const MOCK_CASH_SESSIONS: CashSession[] = [
  {
    id: 'cs-001',
    openingAmount: 2000.00,
    closingAmount: 5110.00,
    totalSales: 3110.00,
    totalMovements: 0,
    realAmount: 5110.00,
    difference: 0,
    openedBy: 'cajero',
    closedBy: 'cajero',
    openedAt: '2024-11-15T08:00:00.000Z',
    closedAt: '2024-11-15T18:00:00.000Z',
    notes: 'Jornada normal.',
    status: 'cerrada',
  },
  {
    id: 'cs-002',
    openingAmount: 2000.00,
    closingAmount: 4635.00,
    totalSales: 2635.00,
    totalMovements: 0,
    realAmount: 4635.00,
    difference: 0,
    openedBy: 'admin',
    closedBy: 'admin',
    openedAt: '2024-11-20T08:30:00.000Z',
    closedAt: '2024-11-20T17:30:00.000Z',
    notes: '',
    status: 'cerrada',
  },
];

export const MOCK_CASH_MOVEMENTS: CashMovement[] = [
  {
    id: 'cmov-001',
    sessionId: 'cs-001',
    type: 'egreso',
    concept: 'Compra de refacciones urgentes',
    amount: 350.00,
    createdBy: 'admin',
    createdAt: '2024-11-15T14:00:00.000Z',
  },
  {
    id: 'cmov-002',
    sessionId: 'cs-002',
    type: 'ingreso',
    concept: 'Reposición de fondo',
    amount: 500.00,
    createdBy: 'admin',
    createdAt: '2024-11-20T11:00:00.000Z',
  },
];
