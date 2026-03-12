// ─── Roles de usuario ─────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'cajero' | 'consulta';

export interface User {
  id: string;
  name: string;
  username: string;
  password: string; // En un proyecto real esto nunca estaría en el client
  role: UserRole;
  active: boolean;
  createdAt: string;
}

// ─── Sesión activa (lo que se guarda en localStorage) ─────────────────────────
export interface AuthSession {
  userId: string;
  username: string;
  name: string;
  role: UserRole;
  loginAt: string;
}

// ─── Catálogo: productos y servicios ──────────────────────────────────────────
export type CatalogItemType = 'producto' | 'servicio';

export interface CatalogItem {
  id: string;
  name: string;
  description: string;
  type: CatalogItemType;
  category: string;
  price: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Clientes ─────────────────────────────────────────────────────────────────
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  active: boolean;
  createdAt: string;
}

// ─── Ventas ───────────────────────────────────────────────────────────────────
export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia';
export type SaleStatus = 'completada' | 'cancelada';

export interface SaleItem {
  catalogItemId: string;
  name: string;
  type: CatalogItemType;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  folio: string;
  customerId: string | null;
  customerName: string;
  items: SaleItem[];
  subtotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  cashSessionId: string | null;
  createdBy: string; // username del responsable
  createdAt: string;
  notes: string;
}

// ─── Caja ─────────────────────────────────────────────────────────────────────
export type CashMovementType = 'ingreso' | 'egreso';

export interface CashMovement {
  id: string;
  sessionId: string;
  type: CashMovementType;
  concept: string;
  amount: number;
  createdBy: string;
  createdAt: string;
}

export interface CashSession {
  id: string;
  openingAmount: number;
  closingAmount: number | null;
  totalSales: number;
  totalMovements: number;
  realAmount: number | null;
  difference: number | null;
  openedBy: string;
  closedBy: string | null;
  openedAt: string;
  closedAt: string | null;
  notes: string;
  status: 'abierta' | 'cerrada';
}

// ─── Tipos de formulario (helpers) ────────────────────────────────────────────
export type CatalogItemForm = Omit<CatalogItem, 'id' | 'createdAt' | 'updatedAt'>;
export type CustomerForm    = Omit<Customer,    'id' | 'createdAt'>;
export type UserForm        = Omit<User,        'id' | 'createdAt'>;

// ─── Reportes ─────────────────────────────────────────────────────────────────
export interface DailySummary {
  date: string;
  totalSales: number;
  salesCount: number;
  totalAmount: number;
}

export interface ReportFilters {
  dateFrom: string;
  dateTo: string;
  paymentMethod: PaymentMethod | '';
  userId: string;
}
