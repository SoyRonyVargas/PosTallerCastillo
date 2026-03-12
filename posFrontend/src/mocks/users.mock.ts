import type { User } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 'usr-001',
    name: 'Carlos Castillo',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    active: true,
    createdAt: '2024-01-01T08:00:00.000Z',
  },
  {
    id: 'usr-002',
    name: 'Laura Mendoza',
    username: 'cajero',
    password: 'cajero123',
    role: 'cajero',
    active: true,
    createdAt: '2024-03-15T10:00:00.000Z',
  },
  {
    id: 'usr-003',
    name: 'Ricardo Flores',
    username: 'consulta',
    password: 'consulta123',
    role: 'consulta',
    active: true,
    createdAt: '2024-06-01T09:00:00.000Z',
  },
];

export const ROLE_LABELS: Record<string, string> = {
  admin:    'Administrador',
  cajero:   'Cajero',
  consulta: 'Consulta',
};
