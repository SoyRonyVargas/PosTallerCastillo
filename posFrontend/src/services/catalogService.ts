/**
 * catalogService — CRUD de productos y servicios con localStorage.
 */
import type { CatalogItem, CatalogItemForm } from '../types';
import { MOCK_CATALOG } from '../mocks/catalog.mock';

const LS_KEY = 'tc_pos_catalog';

function init(): void {
  if (!localStorage.getItem(LS_KEY)) {
    localStorage.setItem(LS_KEY, JSON.stringify(MOCK_CATALOG));
  }
}

function getAll(): CatalogItem[] {
  init();
  return JSON.parse(localStorage.getItem(LS_KEY) || '[]') as CatalogItem[];
}

function save(items: CatalogItem[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(items));
}

function getById(id: string): CatalogItem | null {
  return getAll().find((i) => i.id === id) ?? null;
}

function create(data: CatalogItemForm): CatalogItem {
  const items = getAll();
  const now = new Date().toISOString();
  const item: CatalogItem = {
    ...data,
    id:        `cat-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  save([...items, item]);
  return item;
}

function update(id: string, data: Partial<CatalogItemForm>): CatalogItem | null {
  const items = getAll();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...data, updatedAt: new Date().toISOString() };
  save(items);
  return items[idx];
}

function toggleActive(id: string): CatalogItem | null {
  const items = getAll();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  items[idx].active = !items[idx].active;
  items[idx].updatedAt = new Date().toISOString();
  save(items);
  return items[idx];
}

function remove(id: string): boolean {
  const items = getAll();
  const filtered = items.filter((i) => i.id !== id);
  if (filtered.length === items.length) return false;
  save(filtered);
  return true;
}

export const catalogService = {
  getAll,
  getById,
  create,
  update,
  toggleActive,
  remove,
};
