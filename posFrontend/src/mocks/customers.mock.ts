import type { Customer } from '../types';

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'cus-001',
    name: 'Juan Pérez García',
    phone: '555-110-2234',
    email: 'juan.perez@mail.com',
    notes: 'Cliente frecuente. Tiene Tsuru 2008 y Aveo 2015.',
    active: true,
    createdAt: '2024-02-01T10:00:00.000Z',
  },
  {
    id: 'cus-002',
    name: 'María Rodríguez López',
    phone: '555-320-4455',
    email: 'mrodriguez@mail.com',
    notes: 'Preferencia por servicios en horario matutino.',
    active: true,
    createdAt: '2024-03-10T11:30:00.000Z',
  },
  {
    id: 'cus-003',
    name: 'Roberto Sánchez Morales',
    phone: '555-441-7788',
    email: '',
    notes: 'Taxi. Viene cada 3 meses para afinación.',
    active: true,
    createdAt: '2024-04-05T09:00:00.000Z',
  },
  {
    id: 'cus-004',
    name: 'Sofía Torres Vega',
    phone: '555-990-1122',
    email: 'sofia.torres@correo.mx',
    notes: '',
    active: true,
    createdAt: '2024-05-20T14:00:00.000Z',
  },
  {
    id: 'cus-005',
    name: 'Empresa Distribuidora del Norte SA',
    phone: '555-800-9900',
    email: 'contacto@distribuidoranorte.com',
    notes: 'Facturación requerida. RFC: DDN900101XXX.',
    active: false,
    createdAt: '2024-01-15T08:00:00.000Z',
  },
];
