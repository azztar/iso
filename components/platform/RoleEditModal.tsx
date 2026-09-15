import React, { useState, useEffect, useMemo } from 'react';
import { Role, Permission, PERMISSION_METADATA } from '../../types';
import { X, Loader2, ShieldCheck, CheckSquare, Square } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface RoleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  role: Role | null;
}

const GROUPS_ORDER: Array<{
  key: string;
  label: string;
  descripcion: string;
  permissions: Permission[];
}> = [
  {
    key: 'PLATFORM',
    label: 'Plataforma (Superadmin)',
    descripcion: 'Control global del sistema y administración de tenants.',
    permissions: [
      'platform:access',
      'platform:manage_tenants',
      'platform:manage_plans',
      'platform:manage_roles',
      'platform:view_audit_log',
    ],
  },
  {
    key: 'TENANT_ADMIN',
    label: 'Administración de Organización (Tenant)',
    descripcion: 'Gestión corporativa, equipo de trabajo y listado maestro.',
    permissions: [
      'tenant:admin',
      'tenant:view_master_list',
      'tenant:manage_users',
    ],
  },
  {
    key: 'DOCUMENTS',
    label: 'Gestión Documental ISO 9001',
    descripcion: 'Ciclo de vida, revisión, aprobación y consulta de documentos controlados.',
    permissions: [
      'document:create',
      'document:update',
      'document:publish',
      'document:submit',
      'document:download',
      'document:view_all',
      'document:view_published',
    ],
  },
  {
    key: 'KPIS',
    label: 'Indicadores de Calidad (KPIs)',
    descripcion: 'Medición de metas de procesos y tableros de rendimiento.',
    permissions: ['kpi:manage', 'kpi:read'],
  },
  {
    key: 'FORMS',
    label: 'Formularios Operativos',
    descripcion: 'Diligenciamiento de cotizaciones, órdenes de compra y dotación/EPP.',
    permissions: ['form:create'],
  },
];

const RoleEditModal: React.FC<RoleEditModalProps> = ({ isOpen, onClose, onSuccess, role }) => {
  const { user } = useAuth();
  const isEditMode = !!role;
  const isSuperAdminRole = role?.id === 'role-superadmin';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<Set<Permission>>(new Set());

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description);
      setSelectedPermissions(new Set(role.permissions));
    } else {
      setName('');
      setDescription('');
      setSelectedPermissions(new Set());
    }
    setFormError('');
  }, [role, isOpen]);

  const handlePermissionToggle = (permission: Permission) => {
    setSelectedPermissions(prev => {
      const next = new Set(prev);
      if (next.has(permission)) {
        next.delete(permission);
      } else {
        next.add(permission);
      }
      return next;
    });
  };

  const handleToggleGroup = (groupPermissions: Permission[]) => {
    const allSelected = groupPermissions.every(p => selectedPermissions.has(p));
    setSelectedPermissions(prev => {
      const next = new Set(prev);
      if (allSelected) {
        groupPermissions.forEach(p => next.delete(p));
      } else {
        groupPermissions.forEach(p => next.add(p));
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const allPerms = GROUPS_ORDER.flatMap(g => g.permissions);
    setSelectedPermissions(new Set(allPerms));
  };

  const handleDeselectAll = () => {
    setSelectedPermissions(new Set());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setFormError('No se encuentra una sesión activa.');
      return;
    }
    if (!name.trim()) {
      setFormError('El nombre del rol es obligatorio.');
      return;
    }
    if (selectedPermissions.size === 0) {
      setFormError('Debe asignar al menos un permiso al rol.');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    const roleData: { name: string; description: string; permissions: Permission[] } = {
      name: name.trim(),
      description: description.trim(),
      permissions: Array.from(selectedPermissions) as Permission[],
    };

    try {
      if (isEditMode && role) {
        await api.updateRole(role.id, roleData, user);
      } else {
        await api.createRole(roleData, user);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      setFormError(error.message || 'Error al guardar la configuración del rol.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-fade-in-scale">
        <style>{`
          @keyframes fade-in-scale {
            0% { transform: scale(0.96); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-fade-in-scale { animation: fade-in-scale 0.15s ease-out forwards; }
          .input-style { border-radius: 0.5rem; border: 1px solid #D1D5DB; padding: 0.5rem 0.75rem; font-size: 0.875rem; }
          .input-style:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2); }
        `}</style>

        {/* Modal Header */}
        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 text-brand-primary rounded-lg">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {isEditMode ? `Editar Rol: ${role.name}` : 'Crear Nuevo Rol de Usuario'}
              </h2>
              <p className="text-xs text-gray-500">
                Configure los privilegios y accesos en el sistema de acuerdo con la política de seguridad.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* General Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="role-name" className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Nombre del Rol *
                </label>
                <input
                  type="text"
                  id="role-name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  disabled={isSuperAdminRole}
                  placeholder="Ej. COORDINADOR_CALIDAD"
                  required
                  className={`w-full input-style ${isSuperAdminRole ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
                />
                {isSuperAdminRole && (
                  <p className="text-[11px] text-gray-500 mt-1">
                    El nombre del rol <strong>SUPERADMIN</strong> está protegido por el sistema.
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="role-desc" className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  id="role-desc"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Ej. Supervisa la elaboración de documentos y medición de KPIs."
                  className="w-full input-style"
                />
              </div>
            </div>

            {/* Permissions Section Header with Quick Actions */}
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Permisos y Privilegios del Sistema
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedPermissions.size} de {Object.keys(PERMISSION_METADATA).length} permisos asignados
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-xs font-medium text-brand-primary hover:text-brand-secondary bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-md transition-colors"
                  >
                    Marcar Todos
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="text-xs font-medium text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-2.5 py-1 rounded-md transition-colors"
                  >
                    Desmarcar Todos
                  </button>
                </div>
              </div>

              {/* Grouped Permissions in 100% Spanish */}
              <div className="space-y-4">
                {GROUPS_ORDER.map(group => {
                  const groupSelectedCount = group.permissions.filter(p => selectedPermissions.has(p)).length;
                  const isGroupAllSelected = groupSelectedCount === group.permissions.length;

                  return (
                    <div
                      key={group.key}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-200">
                        <div>
                          <span className="text-sm font-bold text-gray-800">{group.label}</span>
                          <p className="text-xs text-gray-500">{group.descripcion}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleGroup(group.permissions)}
                          className="flex items-center text-xs text-brand-primary hover:text-brand-secondary font-medium px-2 py-1 rounded hover:bg-white transition-colors"
                        >
                          {isGroupAllSelected ? (
                            <>
                              <CheckSquare size={14} className="mr-1" /> Desmarcar grupo
                            </>
                          ) : (
                            <>
                              <Square size={14} className="mr-1" /> Marcar grupo ({groupSelectedCount}/{group.permissions.length})
                            </>
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {group.permissions.map(permission => {
                          const meta = PERMISSION_METADATA[permission];
                          const isChecked = selectedPermissions.has(permission);

                          return (
                            <label
                              key={permission}
                              htmlFor={`perm-${permission}`}
                              className={`flex items-start p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                                isChecked
                                  ? 'bg-blue-50/60 border-blue-300 shadow-xs'
                                  : 'bg-white border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <input
                                id={`perm-${permission}`}
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handlePermissionToggle(permission)}
                                className="h-4 w-4 mt-0.5 text-brand-primary rounded border-gray-300 focus:ring-brand-secondary flex-shrink-0 cursor-pointer"
                              />
                              <div className="ml-2.5">
                                <span className="text-xs font-semibold text-gray-900 block">
                                  {meta?.label || permission}
                                </span>
                                <span className="text-[11px] text-gray-500 block leading-tight mt-0.5">
                                  {meta?.descripcion}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                {formError}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl flex justify-end space-x-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-brand-primary border border-transparent rounded-lg shadow-sm hover:bg-brand-secondary disabled:bg-gray-400 flex items-center transition-colors"
            >
              {isSubmitting && <Loader2 className="animate-spin mr-2" size={16} />}
              {isSubmitting ? 'Guardando...' : isEditMode ? 'Guardar Cambios' : 'Crear Rol'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleEditModal;
