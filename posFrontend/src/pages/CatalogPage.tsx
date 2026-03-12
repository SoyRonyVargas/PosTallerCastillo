import { useState, useMemo } from 'react';
import { Plus, Search, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';
import { Modal }        from '../components/ui/Modal';
import { EmptyState }   from '../components/ui/EmptyState';
import { catalogService } from '../services/catalogService';
import { CATALOG_CATEGORIES } from '../mocks/catalog.mock';
import type { CatalogItem, CatalogItemForm, CatalogItemType } from '../types';
import { formatCurrency, formatDate } from '../utils/format';

const EMPTY_FORM: CatalogItemForm = {
  name: '', description: '', type: 'servicio', category: '',
  price: 0, active: true,
};

export function CatalogPage() {
  const [items, setItems]         = useState<CatalogItem[]>(() => catalogService.getAll());
  const [search, setSearch]       = useState('');
  const [filterType, setFilterType]   = useState<CatalogItemType | ''>('');
  const [filterCat, setFilterCat]     = useState('');
  const [modalOpen, setModalOpen]     = useState(false);
  const [editing, setEditing]         = useState<CatalogItem | null>(null);
  const [form, setForm]               = useState<CatalogItemForm>(EMPTY_FORM);
  const [formError, setFormError]     = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((i) => {
      const matchSearch = !q || i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q);
      const matchType   = !filterType || i.type === filterType;
      const matchCat    = !filterCat || i.category === filterCat;
      return matchSearch && matchType && matchCat;
    });
  }, [items, search, filterType, filterCat]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  }

  function openEdit(item: CatalogItem) {
    setEditing(item);
    setForm({
      name: item.name, description: item.description, type: item.type,
      category: item.category, price: item.price, active: item.active,
    });
    setFormError('');
    setModalOpen(true);
  }

  function handleToggle(id: string) {
    catalogService.toggleActive(id);
    setItems(catalogService.getAll());
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setFormError('El nombre es obligatorio.'); return; }
    if (!form.category)    { setFormError('Selecciona una categoría.'); return; }
    if (form.price <= 0)   { setFormError('El precio debe ser mayor a 0.'); return; }
    setFormError('');

    if (editing) {
      catalogService.update(editing.id, form);
    } else {
      catalogService.create(form);
    }
    setItems(catalogService.getAll());
    setModalOpen(false);
  }

  const field = (key: keyof CatalogItemForm, value: string | number | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Catálogo</h2>
          <p className="text-sm text-gray-500">Productos y servicios del taller</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} /> Agregar item
        </button>
      </div>

      {/* Filtros */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre…"
            className="input pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input w-40" value={filterType} onChange={(e) => setFilterType(e.target.value as CatalogItemType | '')}>
          <option value="">Todos los tipos</option>
          <option value="producto">Producto</option>
          <option value="servicio">Servicio</option>
        </select>
        <select className="input w-44" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="">Todas las categorías</option>
          {CATALOG_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <EmptyState message="No se encontraron items con esos filtros." />
          ) : (
            <table className="table-base">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Actualizado</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{item.description}</p>
                      )}
                    </td>
                    <td>
                      <span className={item.type === 'servicio' ? 'badge-blue' : 'badge-purple'}>
                        {item.type === 'servicio' ? 'Servicio' : 'Producto'}
                      </span>
                    </td>
                    <td className="text-gray-600">{item.category}</td>
                    <td className="font-semibold text-gray-900">{formatCurrency(item.price)}</td>
                    <td>
                      <span className={item.active ? 'badge-green' : 'badge-gray'}>
                        {item.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="text-xs text-gray-400">{formatDate(item.updatedAt)}</td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(item)}
                          className="btn-secondary btn-sm"
                          title="Editar"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleToggle(item.id)}
                          className={`btn-sm btn ${item.active ? 'bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100' : 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100'}`}
                          title={item.active ? 'Desactivar' : 'Activar'}
                        >
                          {item.active ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        open={modalOpen}
        title={editing ? 'Editar item' : 'Nuevo item del catálogo'}
        onClose={() => setModalOpen(false)}
        size="md"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Nombre *</label>
              <input className="input" value={form.name} onChange={(e) => field('name', e.target.value)} placeholder="Ej. Afinación menor" />
            </div>
            <div>
              <label className="label">Tipo *</label>
              <select className="input" value={form.type} onChange={(e) => field('type', e.target.value)}>
                <option value="servicio">Servicio</option>
                <option value="producto">Producto</option>
              </select>
            </div>
            <div>
              <label className="label">Categoría *</label>
              <select className="input" value={form.category} onChange={(e) => field('category', e.target.value)}>
                <option value="">Seleccionar…</option>
                {CATALOG_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Precio (MXN) *</label>
              <input
                type="number" min="0" step="0.01" className="input"
                value={form.price}
                onChange={(e) => field('price', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="flex items-center gap-2 mt-4">
              <input
                id="active-toggle" type="checkbox" checked={form.active}
                onChange={(e) => field('active', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="active-toggle" className="text-sm text-gray-700">Activo en catálogo</label>
            </div>
            <div className="col-span-2">
              <label className="label">Descripción</label>
              <textarea
                className="input resize-none" rows={2}
                value={form.description}
                onChange={(e) => field('description', e.target.value)}
                placeholder="Descripción breve del producto o servicio"
              />
            </div>
          </div>

          {formError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">
              {editing ? 'Guardar cambios' : 'Agregar item'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
