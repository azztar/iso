import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { KPI, ProcessType } from '../types';
import { 
  BarChart2, 
  Target, 
  Calendar, 
  User, 
  Download, 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Calculator
} from 'lucide-react';
import CreateKpiModal from './CreateKpiModal';

const KpiCard: React.FC<{ kpi: KPI; canManage: boolean; onDelete: (id: string) => void }> = ({
  kpi,
  canManage,
  onDelete
}) => {
  const actual = kpi.valorActual !== undefined ? kpi.valorActual : null;
  const meta = kpi.meta;
  
  // Calculate compliance percentage
  const compliance = actual !== null && meta > 0 ? Math.round((actual / meta) * 100) : null;

  // Determine status and colors
  let statusBadge = {
    label: 'Sin medición',
    badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
    barClass: 'bg-gray-300',
    textClass: 'text-gray-600',
    icon: HelpCircle
  };

  if (compliance !== null) {
    if (compliance >= 100) {
      statusBadge = {
        label: 'Meta Cumplida',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        barClass: 'bg-emerald-500',
        textClass: 'text-emerald-700',
        icon: CheckCircle2
      };
    } else if (compliance >= 80) {
      statusBadge = {
        label: 'En Seguimiento',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        barClass: 'bg-amber-500',
        textClass: 'text-amber-700',
        icon: AlertTriangle
      };
    } else {
      statusBadge = {
        label: 'Crítico / No Conforme',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        barClass: 'bg-rose-500',
        textClass: 'text-rose-700',
        icon: AlertTriangle
      };
    }
  }

  const StatusIcon = statusBadge.icon;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col justify-between hover:shadow-md transition-all relative group">
      <div>
        {/* Header: Title and Delete */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-brand-primary flex-shrink-0">
              <BarChart2 size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 line-clamp-1" title={kpi.nombre}>
                {kpi.nombre}
              </h3>
              <p className="text-xs text-gray-500">{kpi.subproceso ? `${kpi.proceso} · ${kpi.subproceso}` : kpi.proceso}</p>
            </div>
          </div>

          {canManage && (
            <button
              onClick={() => {
                if (confirm(`¿Eliminar el indicador "${kpi.nombre}"?`)) {
                  onDelete(kpi.id);
                }
              }}
              className="text-gray-300 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
              title="Eliminar Indicador"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {/* Status Badge */}
        <div className="mt-3 flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadge.badgeClass}`}>
            <StatusIcon size={13} />
            {statusBadge.label}
          </span>
          {compliance !== null && (
            <span className={`text-xs font-bold ${statusBadge.textClass}`}>
              {compliance}% de eficacia
            </span>
          )}
        </div>

        {/* Measurement Values */}
        <div className="mt-4 bg-gray-50 rounded-xl p-3.5 border border-gray-100">
          <div className="flex justify-between items-baseline mb-2">
            <div>
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">Resultado Actual</span>
              <span className="text-2xl font-extrabold text-gray-900">
                {actual !== null ? actual : '--'}
                <span className="text-sm font-semibold text-gray-500 ml-1">{kpi.unidad}</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">Meta Fijada</span>
              <span className="text-lg font-bold text-gray-700">
                {meta}
                <span className="text-xs font-medium text-gray-500 ml-1">{kpi.unidad}</span>
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div 
              className={`h-2.5 rounded-full transition-all duration-500 ${statusBadge.barClass}`}
              style={{ width: `${Math.min(compliance !== null ? compliance : 0, 100)}%` }}
            />
          </div>
        </div>

        {/* Calculation Formula Callout */}
        <div className="mt-3 p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 flex items-start gap-2 text-xs text-blue-900">
          <Calculator size={14} className="text-brand-primary flex-shrink-0 mt-0.5" />
          <div className="leading-tight">
            <strong className="font-semibold text-blue-950">Fórmula de cálculo:</strong>
            <p className="font-mono text-[11px] text-blue-800 mt-0.5 break-words">
              {kpi.formula || `(Resultado Obtenido / Meta Establecida) * 100`}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="space-y-1.5 text-xs text-gray-600 border-t border-gray-100 pt-3 mt-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 flex items-center">
            <Calendar size={13} className="mr-1.5 text-gray-400" /> Periodicidad:
          </span>
          <span className="font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md">
            {kpi.periodicidad}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 flex items-center">
            <User size={13} className="mr-1.5 text-gray-400" /> Responsable:
          </span>
          <span className="font-medium text-gray-800 truncate max-w-[160px]" title={kpi.responsableNombre}>
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

  // Executive summary statistics
  const stats = useMemo(() => {
    const total = filteredKpis.length;
    if (total === 0) return { total: 0, cumplidos: 0, seguimiento: 0, criticos: 0, avgCompliance: 0 };

    let totalPercent = 0;
    let cumplidos = 0;
    let seguimiento = 0;
    let criticos = 0;

    filteredKpis.forEach(k => {
      const actual = k.valorActual !== undefined ? k.valorActual : 0;
      const comp = k.meta > 0 ? (actual / k.meta) * 100 : 0;
      totalPercent += comp;
      if (comp >= 100) cumplidos++;
      else if (comp >= 80) seguimiento++;
      else criticos++;
    });

    return {
      total,
      cumplidos,
      seguimiento,
      criticos,
      avgCompliance: Math.round(totalPercent / total)
    };
  }, [filteredKpis]);

  const handleExport = () => {
    if (filteredKpis.length === 0) {
      alert('No hay KPIs para exportar.');
      return;
    }

    const headers = ['Nombre', 'Unidad', 'Valor Actual', 'Meta', 'Fórmula', 'Periodicidad', 'Proceso', 'Subproceso', 'Responsable'];
    const escapeCsvField = (field: string | number | undefined) => {
      if (field === undefined || field === null) return '';
      const str = String(field);
      return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    };

    const rows = filteredKpis.map(kpi =>
      [
        escapeCsvField(kpi.nombre),
        escapeCsvField(kpi.unidad),
        escapeCsvField(kpi.valorActual),
        escapeCsvField(kpi.meta),
        escapeCsvField(kpi.formula),
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
      <div className="space-y-6">
        {/* KPI Executive KPI Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Indicadores Activos</span>
              <span className="text-2xl font-extrabold text-gray-900">{stats.total}</span>
            </div>
            <div className="p-3 bg-blue-50 text-brand-primary rounded-xl">
              <BarChart2 size={22} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Cumplimiento Medio</span>
              <span className="text-2xl font-extrabold text-brand-primary">{stats.avgCompliance}%</span>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <TrendingUp size={22} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block">En Meta (100%+)</span>
              <span className="text-2xl font-extrabold text-emerald-700">{stats.cumplidos}</span>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 size={22} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider block">En Alerta / Riesgo</span>
              <span className="text-2xl font-extrabold text-amber-700">{stats.seguimiento + stats.criticos}</span>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <AlertTriangle size={22} />
            </div>
          </div>
        </div>

        {/* KPI List Card Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BarChart2 className="text-brand-primary" size={20} />
                Cuadro de Mando de Indicadores (KPIs)
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Seguimiento del desempeño, fórmulas matemáticas y cumplimiento de metas para el proceso {processType}.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {canManageKpis && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-brand-primary hover:bg-brand-secondary flex items-center shadow-sm transition-all"
                >
                  <Plus size={16} className="mr-1.5" /> Nuevo Indicador
                </button>
              )}
              <button
                onClick={handleExport}
                className="px-3.5 py-2 rounded-xl text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 flex items-center shadow-xs transition-all"
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
            <div className="p-12 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
              <Target size={36} className="mx-auto text-gray-300 mb-2" />
              <p className="font-semibold text-gray-700">No hay indicadores registrados para este proceso.</p>
              <p className="text-xs text-gray-500 mt-1">Puedes registrar metas y fórmulas de cálculo para este proceso.</p>
              {canManageKpis && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-semibold hover:bg-brand-secondary shadow-sm inline-flex items-center"
                >
                  <Plus size={14} className="mr-1.5" /> Registrar primer indicador
                </button>
              )}
            </div>
          )}
        </div>
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