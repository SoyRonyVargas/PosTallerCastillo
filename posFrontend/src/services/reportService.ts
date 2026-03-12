/**
 * reportService — Genera resúmenes y estadísticas a partir de los datos en localStorage.
 * No conecta a ningún backend.
 */
import type { Sale, DailySummary, ReportFilters } from '../types';
import { salesService } from './salesService';

function filterSales(filters: ReportFilters): Sale[] {
  let sales = salesService.getAll().filter((s) => s.status === 'completada');

  if (filters.dateFrom) {
    sales = sales.filter((s) => s.createdAt >= filters.dateFrom);
  }
  if (filters.dateTo) {
    // Include the full day of dateTo
    const end = filters.dateTo + 'T23:59:59.999Z';
    sales = sales.filter((s) => s.createdAt <= end);
  }
  if (filters.paymentMethod) {
    sales = sales.filter((s) => s.paymentMethod === filters.paymentMethod);
  }
  if (filters.userId) {
    sales = sales.filter((s) => s.createdBy === filters.userId);
  }

  return sales;
}

function getDailySummary(filters: ReportFilters): DailySummary[] {
  const sales = filterSales(filters);
  const map   = new Map<string, DailySummary>();

  for (const sale of sales) {
    const day = sale.createdAt.substring(0, 10);
    const existing = map.get(day) ?? {
      date:        day,
      totalSales:  0,
      salesCount:  0,
      totalAmount: 0,
    };
    existing.salesCount   += 1;
    existing.totalAmount  += sale.total;
    existing.totalSales    = existing.salesCount;
    map.set(day, existing);
  }

  return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
}

function getTotals(filters: ReportFilters) {
  const sales = filterSales(filters);
  return {
    count:           sales.length,
    totalAmount:     sales.reduce((a, s) => a + s.total, 0),
    byPaymentMethod: {
      efectivo:      sales.filter((s) => s.paymentMethod === 'efectivo').reduce((a, s) => a + s.total, 0),
      tarjeta:       sales.filter((s) => s.paymentMethod === 'tarjeta').reduce((a, s) => a + s.total, 0),
      transferencia: sales.filter((s) => s.paymentMethod === 'transferencia').reduce((a, s) => a + s.total, 0),
    },
  };
}

export const reportService = {
  filterSales,
  getDailySummary,
  getTotals,
};
