import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { DotacionItem, ProcessType, DocumentType } from '../types';
import { PlusCircle, Trash2, Send, ShieldCheck, Sparkles } from 'lucide-react';

const COMMON_ITEMS = [
  { elemento: 'Camisa institucional con logo', talla: 'M' },
  { elemento: 'Pantalón de dril industrial con reflectivo', talla: '32' },
  { elemento: 'Botas de seguridad con puntera dieléctrica', talla: '41' },
  { elemento: 'Casco de seguridad Tipo 1 Clase E', talla: 'Única' },
  { elemento: 'Gafas de seguridad con filtro UV', talla: 'Única' },
  { elemento: 'Guantes de nitrilo para manipulación', talla: 'M' },
  { elemento: 'Protector auditivo tipo inserción', talla: 'Única' },
];

const DotacionForm: React.FC = () => {
  const [colaboradorNombre, setColaboradorNombre] = useState('');
  const [colaboradorCedula, setColaboradorCedula] = useState('');
  const [cargo, setCargo] = useState('');
  const [observaciones, setObservaciones] = useState(
    'El colaborador recibe a entera satisfacción los elementos de dotación y protección personal y se compromete a su uso obligatorio y custodia.'
  );
  const [items, setItems] = useState<DotacionItem[]>([
    { id: `item-${Date.now()}-1`, elemento: 'Camisa institucional con logo', talla: 'L', cantidad: 2, estadoEntrega: 'Nuevo' },
    { id: `item-${Date.now()}-2`, elemento: 'Pantalón de dril industrial con reflectivo', talla: '34', cantidad: 2, estadoEntrega: 'Nuevo' },
    { id: `item-${Date.now()}-3`, elemento: 'Botas de seguridad con puntera dieléctrica', talla: '42', cantidad: 1, estadoEntrega: 'Nuevo' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const { fetchData: refreshDocuments } = useData();
  const navigate = useNavigate();

  const handleAddItem = (preset?: { elemento: string; talla: string }) => {
    setItems(prev => [
      ...prev,
      {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        elemento: preset ? preset.elemento : '',
        talla: preset ? preset.talla : 'Única',
        cantidad: 1,
        estadoEntrega: 'Nuevo',
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      setError('La entrega debe contener al menos un elemento de dotación o EPP.');
      return;
    }
    setError('');
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = <K extends keyof DotacionItem>(id: string, field: K, value: DotacionItem[K]) => {
    setItems(items.map(item => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colaboradorNombre.trim() || !colaboradorCedula.trim() || !cargo.trim()) {
      setError('Por favor diligencie todos los datos del colaborador.');
      return;
    }

    if (items.some(i => !i.elemento.trim() || i.cantidad <= 0)) {
      setError('Todos los elementos deben tener una descripción válida y cantidad mayor a 0.');
      return;
    }

    if (!user) {
      setError('No se ha podido identificar al usuario activo.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await api.createDotacion(
        {
          colaboradorNombre: colaboradorNombre.trim(),
          colaboradorCedula: colaboradorCedula.trim(),
          cargo: cargo.trim(),
          fecha: new Date().toISOString().split('T')[0],
          items,
          observaciones,
        },
        user
      );

      alert('Registro de entrega de dotación y EPP generado exitosamente en el proceso de Apoyo (Gestión Humana).');
      await refreshDocuments();
      navigate(`/drive/${encodeURIComponent(ProcessType.APOYO)}/Gestión Humana/documentos/${encodeURIComponent(DocumentType.FORMATO)}`);
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al guardar el registro de dotación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm space-y-6 border border-gray-200">
      {/* Colaborador Info */}
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
          <ShieldCheck className="text-brand-primary mr-2" size={20} />
          Datos del Colaborador (Receptor)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="colaborador-nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              id="colaborador-nombre"
              value={colaboradorNombre}
              onChange={e => setColaboradorNombre(e.target.value)}
              placeholder="Ej. Juan Pérez Gómez"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>
          <div>
            <label htmlFor="colaborador-cedula" className="block text-sm font-medium text-gray-700 mb-1">
              Cédula / Documento
            </label>
            <input
              type="text"
              id="colaborador-cedula"
              value={colaboradorCedula}
              onChange={e => setColaboradorCedula(e.target.value)}
              placeholder="Ej. 1.018.456.789"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>
          <div>
            <label htmlFor="cargo" className="block text-sm font-medium text-gray-700 mb-1">
              Cargo / Área
            </label>
            <input
              type="text"
              id="cargo"
              value={cargo}
              onChange={e => setCargo(e.target.value)}
              placeholder="Ej. Operario de Producción"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>
        </div>
      </div>

      {/* Quick Add Suggestions */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">
            <Sparkles size={14} className="text-brand-primary mr-1" />
            Sugerencias de Dotación y EPP Frecuentes
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          {COMMON_ITEMS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAddItem(preset)}
              className="text-xs bg-gray-100 hover:bg-blue-50 hover:text-brand-primary hover:border-blue-300 border border-gray-200 px-2.5 py-1 rounded-full transition-colors"
            >
              + {preset.elemento}
            </button>
          ))}
        </div>
      </div>

      {/* Items Section */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-gray-800">Elementos a Entregar</h3>
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="flex flex-wrap md:flex-nowrap items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <input
                type="text"
                placeholder="Descripción del elemento o EPP"
                value={item.elemento}
                onChange={e => handleItemChange(item.id, 'elemento', e.target.value)}
                required
                className="flex-grow min-w-[200px] px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm bg-white"
              />
              <div className="w-24">
                <input
                  type="text"
                  placeholder="Talla"
                  value={item.talla}
                  onChange={e => handleItemChange(item.id, 'talla', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm bg-white text-center"
                />
              </div>
              <div className="w-20">
                <input
                  type="number"
                  placeholder="Cant."
                  value={item.cantidad}
                  onChange={e => handleItemChange(item.id, 'cantidad', parseInt(e.target.value, 10) || 1)}
                  min="1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm bg-white text-center"
                />
              </div>
              <div className="w-32">
                <select
                  value={item.estadoEntrega}
                  onChange={e => handleItemChange(item.id, 'estadoEntrega', e.target.value as 'Nuevo' | 'Reposición')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm bg-white"
                >
                  <option value="Nuevo">Nuevo</option>
                  <option value="Reposición">Reposición</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveItem(item.id)}
                className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-colors"
                title="Eliminar elemento"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => handleAddItem()}
          className="flex items-center gap-2 text-sm font-medium text-brand-primary hover:text-brand-secondary mt-3"
        >
          <PlusCircle size={16} />
          Agregar Otro Elemento
        </button>
      </div>

      {/* Observations & Legal Acceptance Clause */}
      <div className="space-y-2 pt-4 border-t border-gray-200">
        <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700">
          Compromiso y Observaciones de Entrega
        </label>
        <textarea
          id="observaciones"
          value={observaciones}
          onChange={e => setObservaciones(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-brand-primary focus:border-brand-primary"
        />
        <p className="text-xs text-gray-500">
          El registro generará automáticamente el formato oficial controlado <code>FOR-APO-DOT-xxxx</code> con firma digital del responsable y acuse de recibo.
        </p>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">{error}</p>}

      {/* Submit Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-gray-400 transition-colors"
        >
          <Send size={16} className="mr-2" />
          {isSubmitting ? 'Registrando...' : 'Emitir Acta de Dotación'}
        </button>
      </div>
    </form>
  );
};

export default DotacionForm;
