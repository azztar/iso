import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { KPI, ProcessType } from '../types';
import { BarChart2, Target, Calendar, User, Download, Plus, Trash2 } from 'lucide-react';
import CreateKpiModal from './CreateKpiModal';

const KpiCard: React.FC<{ kpi: KPI; canManage: boolean; onDelete: (id: string) => void }> = ({
  kpi,
  canManage,
  onDelete
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col justify-between hover:shadow-md transition-shadow relative group">
      <div>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center text-gray-500">
            <BarChart2 size={18} className="mr-2 text-brand-primary flex-shrink-0" />
            <h3 className="text-md font-semibold text-gray-800 line-clamp-1" title={kpi.nombre}>
              {kpi.nombre}
            </h3>
          </div>
          {canManage && (
            <button
              onClick={() => {
                if (confirm(`¿Eliminar el indicador "${kpi.nombre}"?`)) {
                  onDelete(kpi.id);
                }
              }}
              className="text-gray-300 hover:text-red-600 p-1 rounded transition-colors"
              title="Eliminar Indicador"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-4">{kpi.subproceso ? `${kpi.proceso} · ${kpi.subproceso}` : kpi.proceso}</p>
      </div>

      <div className="space-y-2 text-sm border-t pt-3 mt-1">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 flex items-center text-xs">
            <Target size={13} className="mr-1.5 text-gray-400" /> Meta
          </span>
          <span className="font-semibold text-gray-900 bg-blue-50 text-brand-primary px-2 py-0.5 rounded text-xs">
            {kpi.meta} {kpi.unidad}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 flex items-center text-xs">
            <Calendar size={13} className="mr-1.5 text-gray-400" /> Periodicidad
          </span>
          <span className="font-medium text-gray-700 text-xs">{kpi.periodicidad}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 flex items-center text-xs">
            <User size={13} className="mr-1.5 text-gray-400" /> Responsable
          </span>
          <span className="font-medium text-gray-700 text-xs truncate max-w-[140px]" title={kpi.responsableNombre}>
            {kpi.responsableNombre}
          </span>
        </div>
      </div>
    </div>
  );
};

const KpiList: React.FC = () => {
  const params = useParams<{ processType: string; level2: string }>();
  const { kpis, loading, deleteKPI } = useData();
  const { hasPermission } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { processType, level2 } = params;
  const isApoyo = processType === ProcessType.APOYO;
  const currentSubproceso = isApoyo ? decodeURIComponent(level2 || '') : undefined;
  const canManageKpis = hasPermission('kpi:manage');

  const filteredKpis = useMemo(() => {
    return kpis.filter(kpi => {
      if (kpi.proceso !== processType) return false;
      if (currentSubproceso && kpi.subproceso !== currentSubproceso) return false;
      return true;
    });
  }, [kpis, processType, currentSubproceso]);

  const handleExport = () => {
    if (filteredKpis.length === 0) {
      alert('No hay KPIs para exportar.');
      return;
    }

    const headers = ['Nombre', 'Unidad', 'Meta', 'Periodicidad', 'Proceso', 'Subproceso', 'Responsable'];
    const escapeCsvField = (field: string | number | undefined) => {
      if (field === undefined || field === null) return '';
      const str = String(field);
      return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    };

    const rows = filteredKpis.map(kpi =>
      [
        escapeCsvField(kpi.nombre),
        escapeCsvField(kpi.unidad),
        escapeCsvField(kpi.meta),
        escapeCsvField(kpi.periodicidad),
        escapeCsvField(kpi.proceso),
        escapeCsvField(kpi.subproceso),
        escapeCsvField(kpi.responsableNombre),
      ].join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `export_kpis_${processType}_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Cargando indicadores...</div>;
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b">
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <BarChart2 className="mr-2 text-brand-primary" size={20} />
              Indicadores de Desempeño (KPIs)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Metas y periodicidades de control asociadas al proceso {processType}.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {canManageKpis && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-3.5 py-1.5 border rounded-lg text-sm font-medium text-white bg-brand-primary hover:bg-brand-secondary flex items-center shadow-sm"
              >
                <Plus size={16} className="mr-1.5" /> Nuevo Indicador
              </button>
            )}
            <button
              onClick={handleExport}
              className="px-3.5 py-1.5 border rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center shadow-sm"
            >
              <Download size={16} className="mr-1.5 text-gray-500" /> Exportar CSV
            </button>
          </div>
        </div>

        {filteredKpis.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredKpis.map(kpi => (
              <KpiCard
                key={kpi.id}
                kpi={kpi}
                canManage={canManageKpis}
                onDelete={deleteKPI}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <Target size={36} className="mx-auto text-gray-300 mb-2" />
            <p className="font-medium text-gray-600">No hay indicadores registrados para este proceso.</p>
            {canManageKpis && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-3 inline-flex items-center text-xs font-semibold text-brand-primary hover:underline"
              >
                <Plus size={14} className="mr-1" /> Registrar primer indicador
              </button>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <CreateKpiModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          defaultProcess={processType as ProcessType}
          defaultSubproceso={currentSubproceso}
        />
      )}
    </>
  );
};

export default KpiList;