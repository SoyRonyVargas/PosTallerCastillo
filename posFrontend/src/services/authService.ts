/**
 * authService — Autenticación simulada contra mocks en localStorage.
 * NOTA: Este módulo NO conecta a ningún backend real.
 * Las credenciales se validan contra datos mock.
 */
import type { User, AuthSession } from '../types';
import { MOCK_USERS } from '../mocks/users.mock';

const LS_KEY_USERS   = 'tc_pos_users';
const LS_KEY_SESSION = 'tc_pos_session';

// ── Inicialización ────────────────────────────────────────────────────────────
function initUsers(): void {
  if (!localStorage.getItem(LS_KEY_USERS)) {
    localStorage.setItem(LS_KEY_USERS, JSON.stringify(MOCK_USERS));
  }
}

function getUsers(): User[] {
  initUsers();
  return JSON.parse(localStorage.getItem(LS_KEY_USERS) || '[]') as User[];
}

function saveUsers(users: User[]): void {
  localStorage.setItem(LS_KEY_USERS, JSON.stringify(users));
}

// ── Autenticación ─────────────────────────────────────────────────────────────
/**
 * Intenta iniciar sesión.
 * Devuelve la sesión si las credenciales son válidas, o null si no.
 */
function login(username: string, password: string): AuthSession | null {
  const users = getUsers();
  const user = users.find(
    (u) => u.username === username && u.password === password && u.active,
  );
  if (!user) return null;

  const session: AuthSession = {
    userId:   user.id,
    username: user.username,
    name:     user.name,
    role:     user.role,
    loginAt:  new Date().toISOString(),
  };
  localStorage.setItem(LS_KEY_SESSION, JSON.stringify(session));
  return session;
}

function logout(): void {
  localStorage.removeItem(LS_KEY_SESSION);
}

function getSession(): AuthSession | null {
  const raw = localStorage.getItem(LS_KEY_SESSION);
  return raw ? (JSON.parse(raw) as AuthSession) : null;
}

// ── CRUD de usuarios (solo admin) ─────────────────────────────────────────────
function getAllUsers(): User[] {
  return getUsers();
}

function createUser(data: Omit<User, 'id' | 'createdAt'>): User {
  const users = getUsers();
  const newUser: User = {
    ...data,
    id:        `usr-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  saveUsers([...users, newUser]);
  return newUser;
}

function updateUser(id: string, data: Partial<User>): User | null {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...data };
  saveUsers(users);
  return users[idx];
}

function toggleUserActive(id: string): User | null {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  users[idx].active = !users[idx].active;
  saveUsers(users);
  return users[idx];
}

export const authService = {
  login,
  logout,
  getSession,
  getAllUsers,
  createUser,
  updateUser,
  toggleUserActive,
};
