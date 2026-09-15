import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { Tenant, User, Role } from '../../types';
import { Building2, Users, HardDrive, Shield, CheckCircle2, UserPlus, Save, AlertCircle, Loader2 } from 'lucide-react';

const TenantSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [tenantUsers, setTenantUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editable company info
  const [empresaNombre, setEmpresaNombre] = useState('');
  const [rutNit, setRutNit] = useState('901.458.921-4');
  const [emailContacto, setEmailContacto] = useState('contacto@empresa.com');
  const [telefono, setTelefono] = useState('+57 (1) 745-8900');
  const [direccion, setDireccion] = useState('Calle 100 # 15-20, Bogotá D.C.');

  // New user state
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('EDITOR');
  const [addUserError, setAddUserError] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const tenantId = user?.tenantId || 'tenant-acme';
        const [tenantData, usersData, rolesData] = await Promise.all([
          api.getTenantById(tenantId),
          api.getTenantUsers(tenantId),
          api.getRoles()
        ]);

        if (tenantData) {
          setTenant(tenantData);
          setEmpresaNombre(tenantData.nombre);
        }
        setTenantUsers(usersData);
        setRoles(rolesData.filter(r => r.name !== 'SUPERADMIN'));
      } catch (err) {
        console.error('Failed to load tenant settings', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleSaveCompanyInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await api.updateTenant(tenant.id, { nombre: empresaNombre });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Error al guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleUser = async (userId: string) => {
    if (!user) return;
    try {
      const updated = await api.toggleUserStatus(userId, user);
      setTenantUsers(prev => prev.map(u => u.id === userId ? updated : u));
    } catch (err) {
      console.error(err);
      alert('Error al cambiar el estado del usuario');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant || !user) return;
    if (!newUserName.trim() || !newUserEmail.trim()) {
      setAddUserError('Por favor complete todos los campos');
      return;
    }
    setAddUserError('');
    setIsAddingUser(true);
    try {
      const created = await api.addTenantUser(tenant.id, {
        nombre: newUserName.trim(),
        email: newUserEmail.trim(),
        roleName: newUserRole,
      }, user);

      setTenantUsers(prev => [...prev, created]);
      setNewUserName('');
      setNewUserEmail('');
      setShowAddUser(false);
      if (tenant) {
        setTenant({ ...tenant, userCount: tenant.userCount + 1 });
      }
    } catch (err) {
      console.error(err);
      setAddUserError('Error al crear el usuario');
    } finally {
      setIsAddingUser(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-brand-primary" />
      </div>
    );
  }

  const userUsagePercent = tenant ? Math.min(Math.round((tenant.userCount / tenant.userLimit) * 100), 100) : 0;
  const storageUsagePercent = tenant ? Math.min(Math.round((tenant.storageUsed / tenant.storageLimit) * 100), 100) : 0;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Configuración de la Organización</h1>
        <p className="text-gray-600 mt-1">Gestione los detalles de su empresa, consumo del plan y miembros del equipo.</p>
      </div>

      {/* Plan and Resource Usage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-brand-primary tracking-wider">Plan Activo</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                {tenant?.estado}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{tenant?.planNombre}</h3>
            <p className="text-xs text-gray-500 mt-1">Subdominio: <span className="font-mono text-gray-700">{tenant?.subdominio}.isogestion.com</span></p>
          </div>
          <div className="mt-4 pt-3 border-t text-xs text-gray-500">
            Fecha de inicio: {tenant?.fechaCreacion}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-gray-500">Usuarios Asignados</span>
            <Users size={18} className="text-brand-primary" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-gray-900">{tenantUsers.length}</span>
            <span className="text-sm text-gray-500">/ {tenant?.userLimit} usuarios</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className={`h-2 rounded-full ${userUsagePercent > 90 ? 'bg-red-500' : 'bg-brand-primary'}`}
              style={{ width: `${userUsagePercent}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{userUsagePercent}% del cupo utilizado</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-gray-500">Almacenamiento en Nube</span>
            <HardDrive size={18} className="text-brand-primary" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-gray-900">{tenant?.storageUsed} GB</span>
            <span className="text-sm text-gray-500">/ {tenant?.storageLimit} GB</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className={`h-2 rounded-full ${storageUsagePercent > 90 ? 'bg-red-500' : 'bg-green-500'}`}
              style={{ width: `${storageUsagePercent}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{storageUsagePercent}% del espacio en disco</p>
        </div>
      </div>

      {/* Company Info Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between pb-4 border-b mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 text-brand-primary rounded-lg">
              <Building2 size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Datos Generales de la Empresa</h2>
              <p className="text-xs text-gray-500">Información corporativa visible en membretes y encabezados ISO.</p>
            </div>
          </div>
          {saveSuccess && (
            <span className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
              <CheckCircle2 size={16} className="mr-1.5" /> Cambios guardados
            </span>
          )}
        </div>

        <form onSubmit={handleSaveCompanyInfo} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social</label>
              <input
                type="text"
                value={empresaNombre}
                onChange={e => setEmpresaNombre(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-brand-primary focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RUT / NIT</label>
              <input
                type="text"
                value={rutNit}
                onChange={e => setRutNit(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-brand-primary focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email de Contacto</label>
              <input
                type="email"
                value={emailContacto}
                onChange={e => setEmailContacto(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-brand-primary focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono Principal</label>
              <input
                type="text"
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-brand-primary focus:border-brand-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección Física</label>
              <input
                type="text"
                value={direccion}
                onChange={e => setDireccion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-brand-primary focus:border-brand-primary"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-primary hover:bg-brand-secondary rounded-lg flex items-center shadow-sm disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save size={16} className="mr-2" />}
              Guardar Configuración
            </button>
          </div>
        </form>
      </div>

      {/* Users / Team Management */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 text-brand-primary rounded-lg">
              <Users size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Miembros del Equipo</h2>
              <p className="text-xs text-gray-500">Usuarios asignados con acceso al sistema de gestión de calidad.</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddUser(!showAddUser)}
            className="px-3.5 py-1.5 text-sm font-medium text-white bg-brand-primary hover:bg-brand-secondary rounded-lg flex items-center shadow-sm"
          >
            <UserPlus size={16} className="mr-2" />
            {showAddUser ? 'Cancelar' : 'Agregar Usuario'}
          </button>
        </div>

        {/* Add User Drawer / Section */}
        {showAddUser && (
          <form onSubmit={handleAddUser} className="p-6 bg-blue-50/50 border-b space-y-4">
            <h3 className="text-sm font-semibold text-gray-800">Nuevo Usuario del Tenant</h3>
            {addUserError && <p className="text-xs text-red-600">{addUserError}</p>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Ej. Ana Gómez"
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="ana@empresa.com"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Rol Asignado</label>
                <select
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.name}>{r.name} - {r.description.slice(0, 30)}...</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddUser(false)}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isAddingUser}
                className="px-4 py-1.5 text-xs font-medium text-white bg-brand-primary rounded-lg hover:bg-brand-secondary"
              >
                {isAddingUser ? 'Creando...' : 'Guardar Usuario'}
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Usuario</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Rol</th>
                <th className="px-6 py-3 text-left">Estado</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-sm">
              {tenantUsers.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 flex items-center">
                    <div className="h-8 w-8 rounded-full bg-brand-accent text-white flex items-center justify-center font-bold mr-3 text-xs">
                      {u.nombre.charAt(0)}
                    </div>
                    {u.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {u.role.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                    <button
                      onClick={() => handleToggleUser(u.id)}
                      className={`px-3 py-1 rounded-md border text-xs font-medium transition-colors ${
                        u.activo
                          ? 'border-gray-300 text-gray-700 hover:bg-gray-100'
                          : 'border-green-300 text-green-700 hover:bg-green-50'
                      }`}
                    >
                      {u.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TenantSettingsPage;
