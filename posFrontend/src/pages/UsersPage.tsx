import { useState, useMemo } from 'react';
import { Plus, Pencil, ToggleLeft, ToggleRight, Shield, ShieldCheck, Eye } from 'lucide-react';
import { Modal }          from '../components/ui/Modal';
import { EmptyState }     from '../components/ui/EmptyState';
import { authService }    from '../services/authService';
import { ROLE_LABELS }    from '../mocks/users.mock';
import type { User, UserRole } from '../types';
import { formatDate } from '../utils/format';

interface UserFormData {
  name:     string;
  username: string;
  password: string;
  role:     UserRole;
  active:   boolean;
}

const EMPTY: UserFormData = { name: '', username: '', password: '', role: 'cajero', active: true };

const ROLE_ICONS: Record<UserRole, React.ReactNode> = {
  admin:    <ShieldCheck size={14} className="text-blue-600" />,
  cajero:   <Shield      size={14} className="text-green-600" />,
  consulta: <Eye         size={14} className="text-gray-500" />,
};

const ROLE_BADGE: Record<UserRole, string> = {
  admin:    'badge-blue',
  cajero:   'badge-green',
  consulta: 'badge-gray',
};

export function UsersPage() {
  const [users, setUsers] = useState<User[]>(() => authService.getAllUsers());
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState<User | null>(null);
  const [form, setForm]           = useState<UserFormData>(EMPTY);
  const [formError, setFormError] = useState('');

  const allUsers = useMemo(() => authService.getAllUsers(), [users]);

  function openCreate() {
    setEditing(null); setForm(EMPTY); setFormError(''); setModalOpen(true);
  }
  function openEdit(u: User) {
    setEditing(u);
    setForm({ name: u.name, username: u.username, password: u.password, role: u.role, active: u.active });
    setFormError(''); setModalOpen(true);
  }
  function handleToggle(id: string) {
    authService.toggleUserActive(id);
    setUsers(authService.getAllUsers());
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim())     { setFormError('El nombre es obligatorio.'); return; }
    if (!form.username.trim()) { setFormError('El usuario es obligatorio.'); return; }
    if (!editing && !form.password.trim()) { setFormError('La contraseña es obligatoria para usuarios nuevos.'); return; }
    const existing = allUsers.find(
      (u) => u.username === form.username.trim() && u.id !== editing?.id,
    );
    if (existing) { setFormError('Ese nombre de usuario ya está en uso.'); return; }
    setFormError('');

    if (editing) {
      authService.updateUser(editing.id, {
        name: form.name.trim(),
        username: form.username.trim(),
        ...(form.password ? { password: form.password } : {}),
        role:   form.role,
        active: form.active,
      });
    } else {
      authService.createUser({
        name:     form.name.trim(),
        username: form.username.trim(),
        password: form.password,
        role:     form.role,
        active:   form.active,
      });
    }
    setUsers(authService.getAllUsers());
    setModalOpen(false);
  }

  const field = (k: keyof UserFormData, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Usuarios</h2>
          <p className="text-sm text-gray-500">Gestión de acceso al sistema (solo administradores)</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} /> Nuevo usuario
        </button>
      </div>

      <div className="card overflow-hidden">
        {users.length === 0 ? (
          <EmptyState message="No hay usuarios registrados." />
        ) : (
          <table className="table-base">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Registro</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="font-medium text-gray-800">{u.name}</td>
                  <td className="font-mono text-sm text-gray-600">{u.username}</td>
                  <td>
                    <span className={`${ROLE_BADGE[u.role]} inline-flex items-center gap-1`}>
                      {ROLE_ICONS[u.role]}
                      {ROLE_LABELS[u.role]}
                    </span>
                  </td>
                  <td>
                    <span className={u.active ? 'badge-green' : 'badge-gray'}>
                      {u.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="text-xs text-gray-400">{formatDate(u.createdAt)}</td>
                  <td>
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(u)} className="btn-secondary btn-sm" title="Editar">
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleToggle(u.id)}
                        className={`btn-sm btn ${u.active ? 'bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100' : 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100'}`}
                        title={u.active ? 'Desactivar' : 'Activar'}
                      >
                        {u.active ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} title={editing ? 'Editar usuario' : 'Nuevo usuario'} onClose={() => setModalOpen(false)} size="sm">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Nombre completo *</label>
            <input className="input" value={form.name} onChange={(e) => field('name', e.target.value)} placeholder="Ej. Juan Pérez" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Nombre de usuario *</label>
              <input className="input" value={form.username} onChange={(e) => field('username', e.target.value)} placeholder="juanperez" />
            </div>
            <div>
              <label className="label">
                {editing ? 'Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
              </label>
              <input type="password" className="input" value={form.password} onChange={(e) => field('password', e.target.value)} placeholder="••••••••" />
            </div>
          </div>
          <div>
            <label className="label">Rol *</label>
            <select className="input" value={form.role} onChange={(e) => field('role', e.target.value as UserRole)}>
              <option value="admin">Administrador</option>
              <option value="cajero">Cajero</option>
              <option value="consulta">Consulta</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input id="usr-active" type="checkbox" checked={form.active} onChange={(e) => field('active', e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
            <label htmlFor="usr-active" className="text-sm text-gray-700">Usuario activo</label>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <p className="text-xs text-amber-700">
              Esta pantalla es de demostración. Las contraseñas se almacenan en texto plano solo para efectos del prototipo.
            </p>
          </div>
          {formError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">{editing ? 'Guardar' : 'Crear usuario'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
