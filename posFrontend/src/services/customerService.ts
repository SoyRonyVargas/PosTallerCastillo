/**
 * customerService — CRUD de clientes con localStorage.
 */
import type { Customer, CustomerForm } from '../types';
import { MOCK_CUSTOMERS } from '../mocks/customers.mock';

const LS_KEY = 'tc_pos_customers';

function init(): void {
  if (!localStorage.getItem(LS_KEY)) {
    localStorage.setItem(LS_KEY, JSON.stringify(MOCK_CUSTOMERS));
  }
}

function getAll(): Customer[] {
  init();
  return JSON.parse(localStorage.getItem(LS_KEY) || '[]') as Customer[];
}

function save(customers: Customer[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(customers));
}

function getById(id: string): Customer | null {
  return getAll().find((c) => c.id === id) ?? null;
}

function create(data: CustomerForm): Customer {
  const customers = getAll();
  const customer: Customer = {
    ...data,
    id:        `cus-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  save([...customers, customer]);
  return customer;
}

function update(id: string, data: Partial<CustomerForm>): Customer | null {
  const customers = getAll();
  const idx = customers.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  customers[idx] = { ...customers[idx], ...data };
  save(customers);
  return customers[idx];
}

function toggleActive(id: string): Customer | null {
  const customers = getAll();
  const idx = customers.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  customers[idx].active = !customers[idx].active;
  save(customers);
  return customers[idx];
}

export const customerService = {
  getAll,
  getById,
  create,
  update,
  toggleActive,
};
