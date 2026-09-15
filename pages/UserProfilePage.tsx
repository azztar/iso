import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Shield, Key, Mail, CheckCircle2, Lock, Save, BadgeCheck } from 'lucide-react';
import { PERMISSION_METADATA, Permission } from '../types';

const UserProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [nombre, setNombre] = useState(user?.nombre || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState('');

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      user.nombre = nombre;
      user.email = email;
      localStorage.setItem('erp-user', JSON.stringify(user));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    if (!currentPass) {
      setPassError('Debe ingresar su contraseña actual.');
      return;
    }
    if (newPass.length < 6) {
      setPassError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError('Las contraseñas no coinciden.');
      return;
    }
    setPassSuccess(true);
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setTimeout(() => setPassSuccess(false), 3000);
  };

  const permissions = user?.role?.permissions || [];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Mi Perfil</h1>
        <p className="text-gray-600 mt-1">Gestione sus datos de acceso y consulte sus permisos en el sistema.</p>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 bg-brand-accent text-white rounded-full flex items-center justify-center font-bold text-2xl shadow-sm">
            {user?.nombre.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user?.nombre}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                {user?.role?.name}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-green-600 mr-1.5"></span>
                Cuenta Activa
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details Form */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b">
            <User className="text-brand-primary" size={20} />
            <h3 className="text-md font-semibold text-gray-800">Datos Personales</h3>
          </div>

          {savedSuccess && (
            <div className="p-3 bg-green-50 text-green-700 text-xs rounded-lg border border-green-200 flex items-center">
              <CheckCircle2 size={16} className="mr-2" /> Datos actualizados con éxito
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nombre Completo</label>
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-brand-primary focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-brand-primary focus:border-brand-primary"
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2 px-4 text-sm font-medium text-white bg-brand-primary hover:bg-brand-secondary rounded-lg flex items-center justify-center shadow-sm"
              >
                <Save size={16} className="mr-2" /> Guardar Cambios
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b">
            <Key className="text-brand-primary" size={20} />
            <h3 className="text-md font-semibold text-gray-800">Seguridad y Contraseña</h3>
          </div>

          {passSuccess && (
            <div className="p-3 bg-green-50 text-green-700 text-xs rounded-lg border border-green-200 flex items-center">
              <CheckCircle2 size={16} className="mr-2" /> Contraseña actualizada correctamente
            </div>
          )}
          {passError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              {passError}
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Contraseña Actual</label>
              <input
                type="password"
                value={currentPass}
                onChange={e => setCurrentPass(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-brand-primary focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nueva Contraseña</label>
              <input
                type="password"
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-brand-primary focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
              <input
                type="password"
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
                placeholder="Repetir contraseña"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-brand-primary focus:border-brand-primary"
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2 px-4 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border rounded-lg flex items-center justify-center"
              >
                <Lock size={16} className="mr-2" /> Actualizar Contraseña
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Permissions List */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-2 pb-4 border-b mb-4">
          <Shield className="text-brand-primary" size={20} />
          <div>
            <h3 className="text-md font-semibold text-gray-800">Permisos Asignados a tu Rol</h3>
            <p className="text-xs text-gray-500">Capacidades habilitadas para tu perfil según la política de acceso de la empresa.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {permissions.map(perm => {
            const meta = PERMISSION_METADATA[perm as Permission];
            return (
              <div key={perm} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-start space-x-2.5">
                <BadgeCheck size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-gray-900 block">{meta?.label || perm}</span>
                  <span className="text-[11px] text-gray-500 block leading-tight mt-0.5">{meta?.descripcion}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
