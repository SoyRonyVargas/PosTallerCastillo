import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Wrench, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo_tallercastillo.jpg';

export function LoginPage() {
  const { session, login, isLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (session) navigate('/dashboard', { replace: true });
  }, [session, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.username.trim() || !form.password.trim()) {
      setError('Por favor ingresa usuario y contraseña.');
      return;
    }
    const ok = await login(form.username.trim(), form.password);
    if (!ok) {
      setError('Credenciales incorrectas. Verifica usuario y contraseña.');
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-blue-600 items-center justify-center mb-4 shadow-lg ">
            <img src={logo} alt="Logo" className="w-16 h-16" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Taller Castillo</h1>
          <p className="text-sm text-gray-500 mt-1">Sistema POS · Acceso simulado</p>
        </div>

        {/* Panel */}
        <div className="card p-8">
          <h2 className="text-base font-semibold text-gray-800 mb-6">Iniciar sesión</h2>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="label" htmlFor="username">Usuario</label>
              <input
                id="username"
                type="text"
                className={`input ${error ? 'input-error' : ''}`}
                placeholder="Ej. admin"
                autoComplete="username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="label" htmlFor="password">Contraseña</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  className={`input pr-10 ${error ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPwd((v) => !v)}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                <p className="text-xs">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full btn-lg mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Verificando…
                </>
              ) : (
                'Ingresar al sistema'
              )}
            </button>
          </form>

          {/* Credenciales de demo */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs font-semibold text-blue-700 mb-2">Credenciales de prueba</p>
            <div className="space-y-1 text-xs text-blue-600 font-mono">
              <p>admin / admin123 — Administrador</p>
              <p>cajero / cajero123 — Cajero</p>
              <p>consulta / consulta123 — Consulta</p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Prototipo estático · Sin conexión a backend
        </p>
      </div>
    </div>
  );
}
