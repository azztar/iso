import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { api } from '../services/api';
import { ProcessType, User, KPI } from '../types';
import { X, Target, Save, Loader2 } from 'lucide-react';

interface CreateKpiModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProcess?: ProcessType;
  defaultSubproceso?: string;
}

const APOYO_SUBPROCESOS = ['Gestión Humana', 'Compras', 'Infraestructura'];

const CreateKpiModal: React.FC<CreateKpiModalProps> = ({
  isOpen,
  onClose,
  defaultProcess = ProcessType.ESTRATEGICO,
  defaultSubproceso,
}) => {
  const { addKPI } = useData();
  const [nombre, setNombre] = useState('');
  const [unidad, setUnidad] = useState('%');
  const [meta, setMeta] = useState<number>(90);
  const [valorActual, setValorActual] = useState<number>(85);
  const [formula, setFormula] = useState('');
  const [periodicidad, setPeriodicidad] = useState<'Diario' | 'Semanal' | 'Mensual' | 'Anual'>('Mensual');
  const [proceso, setProceso] = useState<ProcessType>(defaultProcess);
  const [subproceso, setSubproceso] = useState<string>(defaultSubproceso || '');
  const [responsableId, setResponsableId] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setProceso(defaultProcess);
      setSubproceso(defaultSubproceso || (defaultProcess === ProcessType.APOYO ? 'Gestión Humana' : ''));
      api.getUsers().then(usersData => {
        const tenantUsers = usersData.filter(u => u.role?.name !== 'SUPERADMIN');
        setUsers(tenantUsers);
        if (tenantUsers.length > 0 && !responsableId) {
          setResponsableId(tenantUsers[0].id);
        }
      });
    }
  }, [isOpen, defaultProcess, defaultSubproceso]);

  const resetForm = () => {
    setNombre('');
    setUnidad('%');
    setMeta(90);
    setValorActual(85);
    setFormula('');
    setPeriodicidad('Mensual');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('Por favor ingrese el nombre del indicador.');
      return;
    }
    if (!responsableId) {
      setError('Por favor asigne un responsable para este KPI.');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      await addKPI({
        nombre: nombre.trim(),
        unidad: unidad.trim(),
        meta: Number(meta),
        valorActual: Number(valorActual),
        formula: formula.trim() || undefined,
        tendencia: valorActual >= meta ? 'subiendo' : 'estable',
        periodicidad,
        proceso,
        subproceso: proceso === ProcessType.APOYO ? (subproceso || 'Gestión Humana') : undefined,
        responsableId,
      });
      handleClose();
    } catch (err) {
      console.error(err);
      setError('Error al crear el indicador.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-scale">
        <div className="p-6 border-b flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Target className="text-brand-primary" size={22} />
            <h2 className="text-lg font-bold text-gray-800">Crear Nuevo Indicador (KPI)</h2>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {error && <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">{error}</p>}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nombre del Indicador</label>
              <input
                type="text"
                placeholder="Ej. Cumplimiento de Entregas a Clientes"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-brand-primary focus:border-brand-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Meta a Alcanzar</label>
                <input
                  type="number"
                  step="any"
                  value={meta}
                  onChange={e => setMeta(parseFloat(e.target.value) || 0)}
                  required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-brand-primary focus:border-brand-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Resultado Medido Actual</label>
                <input
                  type="number"
                  step="any"
                  value={valorActual}
                  onChange={e => setValorActual(parseFloat(e.target.value) || 0)}
                  required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-brand-primary focus:border-brand-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Unidad de Medida</label>
                <input
                  type="text"
                  placeholder="%, Días, Horas, etc."
                  value={unidad}
                  onChange={e => setUnidad(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-brand-primary focus:border-brand-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Fórmula de Cálculo ISO</label>
                <input
                  type="text"
                  placeholder="Ej: (Entregas a tiempo / Total) * 100"
                  value={formula}
                  onChange={e => setFormula(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-brand-primary focus:border-brand-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Periodicidad</label>
                <select
                  value={periodicidad}
                  onChange={e => setPeriodicidad(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-brand-primary focus:border-brand-primary"
                >
                  <option value="Diario">Diario</option>
                  <option value="Semanal">Semanal</option>
                  <option value="Mensual">Mensual</option>
                  <option value="Anual">Anual</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Proceso</label>
                <select
                  value={proceso}
                  onChange={e => setProceso(e.target.value as ProcessType)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-brand-primary focus:border-brand-primary"
                >
                  {Object.values(ProcessType).map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            {proceso === ProcessType.APOYO && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Subproceso (Apoyo)</label>
                <select
                  value={subproceso}
                  onChange={e => setSubproceso(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-brand-primary focus:border-brand-primary"
                >
                  {APOYO_SUBPROCESOS.map(sp => (
                    <option key={sp} value={sp}>{sp}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Responsable del Indicador</label>
              <select
                value={responsableId}
                onChange={e => setResponsableId(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-brand-primary focus:border-brand-primary"
              >
                <option value="" disabled>Seleccione un usuario</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.nombre} ({u.role.name})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-primary hover:bg-brand-secondary rounded-lg flex items-center shadow-sm disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save size={16} className="mr-2" />}
              Crear Indicador
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateKpiModal;
