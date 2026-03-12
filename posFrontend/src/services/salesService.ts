/**
 * salesService — Gestión de ventas con localStorage.
 * Genera folios y persiste cada venta.
 */
import type { Sale, SaleItem, PaymentMethod } from '../types';
import { MOCK_SALES } from '../mocks/sales.mock';

const LS_KEY = 'tc_pos_sales';

function init(): void {
  if (!localStorage.getItem(LS_KEY)) {
    localStorage.setItem(LS_KEY, JSON.stringify(MOCK_SALES));
  }
}

function getAll(): Sale[] {
  init();
  return JSON.parse(localStorage.getItem(LS_KEY) || '[]') as Sale[];
}

function save(sales: Sale[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(sales));
}

function getById(id: string): Sale | null {
  return getAll().find((s) => s.id === id) ?? null;
}

function getByFolio(folio: string): Sale | null {
  return getAll().find((s) => s.folio === folio) ?? null;
}

/** Genera el siguiente folio en formato TC-YYYY-NNN */
function generateFolio(): string {
  const sales = getAll();
  const year  = new Date().getFullYear();
  const last  = sales.filter((s) => s.folio.startsWith(`TC-${year}-`)).length;
  const seq   = String(last + 1).padStart(3, '0');
  return `TC-${year}-${seq}`;
}

interface CreateSaleInput {
  customerId:     string | null;
  customerName:   string;
  items:          SaleItem[];
  paymentMethod:  PaymentMethod;
  cashSessionId:  string | null;
  createdBy:      string;
  notes:          string;
}

function create(input: CreateSaleInput): Sale {
  if (input.items.length === 0) {
    throw new Error('No se puede crear una venta sin conceptos.');
  }

  const subtotal = input.items.reduce((acc, i) => acc + i.subtotal, 0);
  const sale: Sale = {
    id:            `sale-${Date.now()}`,
    folio:         generateFolio(),
    customerId:    input.customerId,
    customerName:  input.customerName,
    items:         input.items,
    subtotal,
    total:         subtotal,
    paymentMethod: input.paymentMethod,
    status:        'completada',
    cashSessionId: input.cashSessionId,
    createdBy:     input.createdBy,
    createdAt:     new Date().toISOString(),
    notes:         input.notes,
  };

  const sales = getAll();
  save([sale, ...sales]);
  return sale;
}

function cancel(id: string): Sale | null {
  const sales = getAll();
  const idx = sales.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  sales[idx].status = 'cancelada';
  save(sales);
  return sales[idx];
}

/** Ventas de una sesión de caja particular */
function getByCashSession(sessionId: string): Sale[] {
  return getAll().filter((s) => s.cashSessionId === sessionId && s.status === 'completada');
}

export const salesService = {
  getAll,
  getById,
  getByFolio,
  getByCashSession,
  generateFolio,
  create,
  cancel,
};
