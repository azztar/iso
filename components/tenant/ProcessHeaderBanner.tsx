import React from 'react';
import { NavLink } from 'react-router-dom';
import { ProcessType } from '../../types';
import { useData } from '../../contexts/DataContext';
import { 
  Target, 
  Briefcase, 
  Users, 
  ShieldCheck, 
  FileText, 
  BarChart2, 
  PlusCircle, 
  ShoppingCart, 
  Shield, 
  CheckCircle2,
  FileCheck
} from 'lucide-react';

interface ProcessHeaderBannerProps {
  processType: ProcessType;
  subproceso?: string;
}

const PROCESS_CONFIGS: Record<ProcessType, {
  title: string;
  normaRef: string;
  description: string;
  icon: React.ElementType;
  gradientClass: string;
  badgeBg: string;
  badgeText: string;
  accentBorder: string;
  shortcuts: Array<{ label: string; to: string; icon: React.ElementType; isAction?: boolean }>;
}> = {
  [ProcessType.ESTRATEGICO]: {
    title: 'Proceso Estratégico',
    normaRef: 'ISO 9001:2015 · Cláusulas 4 (Contexto) y 5 (Liderazgo)',
    description: 'Direccionamiento de la alta dirección, formulación de la política de calidad, mapa de procesos, gestión de riesgos organizacionales y objetivos corporativos.',
    icon: Target,
    gradientClass: 'from-blue-900 via-indigo-900 to-slate-900 text-white',
    badgeBg: 'bg-blue-500/20 border-blue-400/30 text-blue-200',
    badgeText: 'text-blue-300',
    accentBorder: 'border-blue-500/30',
    shortcuts: [
      { label: 'Manual de Calidad', to: `/drive/${ProcessType.ESTRATEGICO}/documentos/Manual`, icon: FileText },
      { label: 'Políticas Corporativas', to: `/drive/${ProcessType.ESTRATEGICO}/documentos/Política`, icon: Shield },
      { label: 'Procedimientos', to: `/drive/${ProcessType.ESTRATEGICO}/documentos/Procedimiento`, icon: FileCheck },
      { label: 'Indicadores Estratégicos', to: `/drive/${ProcessType.ESTRATEGICO}/kpis`, icon: BarChart2 },
    ]
  },
  [ProcessType.MISIONAL]: {
    title: 'Proceso Misional (Cadena de Valor)',
    normaRef: 'ISO 9001:2015 · Cláusula 8 (Operación y Prestación de Servicios)',
    description: 'Procesos sustantivos y productivos de la organización: captación comercial, formulación de cotizaciones, ejecución operativa y entrega conforme al cliente.',
    icon: Briefcase,
    gradientClass: 'from-teal-950 via-emerald-900 to-slate-900 text-white',
    badgeBg: 'bg-emerald-500/20 border-emerald-400/30 text-emerald-200',
    badgeText: 'text-emerald-300',
    accentBorder: 'border-emerald-500/30',
    shortcuts: [
      { label: 'Nueva Cotización', to: '/forms/quotation/new', icon: PlusCircle, isAction: true },
      { label: 'Procedimientos de Operación', to: `/drive/${ProcessType.MISIONAL}/documentos/Procedimiento`, icon: FileCheck },
      { label: 'Fichas e Instructivos', to: `/drive/${ProcessType.MISIONAL}/documentos/Instructivo`, icon: FileText },
      { label: 'Indicadores de Entrega (OTIF)', to: `/drive/${ProcessType.MISIONAL}/kpis`, icon: BarChart2 },
    ]
  },
  [ProcessType.APOYO]: {
    title: 'Proceso de Apoyo (Recursos y Soporte)',
    normaRef: 'ISO 9001:2015 · Cláusula 7 (Apoyo, Talento Humano e Infraestructura)',
    description: 'Suministro oportuno de recursos necesarios para el funcionamiento de la empresa: gestión humana, entrega de dotaciones/EPP, compras a proveedores y mantenimiento de equipos.',
    icon: Users,
    gradientClass: 'from-amber-950 via-orange-950 to-slate-900 text-white',
    badgeBg: 'bg-amber-500/20 border-amber-400/30 text-amber-200',
    badgeText: 'text-amber-300',
    accentBorder: 'border-amber-500/30',
    shortcuts: [
      { label: 'Registrar Dotación y EPP', to: '/forms/dotacion/new', icon: PlusCircle, isAction: true },
      { label: 'Nueva Orden de Compra', to: '/forms/purchase-order/new', icon: ShoppingCart, isAction: true },
      { label: 'Gestión Humana', to: `/drive/${ProcessType.APOYO}/Gestión Humana/documentos/Formato`, icon: Users },
      { label: 'Compras y Proveedores', to: `/drive/${ProcessType.APOYO}/Compras/documentos/Procedimiento`, icon: FileCheck },
    ]
  },
  [ProcessType.CONTROL]: {
    title: 'Proceso de Control y Evaluación',
    normaRef: 'ISO 9001:2015 · Cláusulas 9 (Evaluación del Desempeño) y 10 (Mejora Continua)',
    description: 'Medición de la conformidad del sistema de gestión: auditorías internas de calidad, actas de revisión gerencial por la dirección y tratamiento de no conformidades (CAPA).',
    icon: ShieldCheck,
    gradientClass: 'from-indigo-950 via-purple-950 to-slate-900 text-white',
    badgeBg: 'bg-purple-500/20 border-purple-400/30 text-purple-200',
    badgeText: 'text-purple-300',
    accentBorder: 'border-purple-500/30',
    shortcuts: [
      { label: 'Actas de Revisión por Dirección', to: `/drive/${ProcessType.CONTROL}/documentos/Acta`, icon: FileText },
      { label: 'Listado Maestro de Documentos', to: '/master-list/documents', icon: CheckCircle2 },
      { label: 'Registro de Auditorías', to: '/tenant/audit', icon: Shield },
      { label: 'Cuadro de Mando de Calidad', to: `/drive/${ProcessType.CONTROL}/kpis`, icon: BarChart2 },
    ]
  }
};

export const ProcessHeaderBanner: React.FC<ProcessHeaderBannerProps> = ({ processType, subproceso }) => {
  const config = PROCESS_CONFIGS[processType] || PROCESS_CONFIGS[ProcessType.ESTRATEGICO];
  const IconComponent = config.icon;
  const { documents, kpis } = useData();

  const processDocsCount = documents.filter(d => d.proceso === processType).length;
  const processKpisCount = kpis.filter(k => k.proceso === processType).length;

  return (
    <div className={`mb-6 rounded-2xl p-6 shadow-md border ${config.accentBorder} bg-gradient-to-r ${config.gradientClass} relative overflow-hidden`}>
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.badgeBg}`}>
              <IconComponent size={14} />
              {config.normaRef}
            </span>
            {subproceso && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-gray-200 border border-white/20">
                Subproceso: {subproceso}
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            {config.title}
          </h1>

          <p className="text-sm text-gray-300 leading-relaxed">
            {config.description}
          </p>
        </div>

        {/* Counters */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-center min-w-[100px]">
            <span className="block text-2xl font-extrabold text-white">{processDocsCount}</span>
            <span className="block text-[11px] font-medium text-gray-300 uppercase tracking-wider">Documentos</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-center min-w-[100px]">
            <span className="block text-2xl font-extrabold text-white">{processKpisCount}</span>
            <span className="block text-[11px] font-medium text-gray-300 uppercase tracking-wider">Indicadores</span>
          </div>
        </div>
      </div>

      {/* Process shortcuts */}
      <div className="mt-5 pt-4 border-t border-white/15 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-gray-400 mr-1 uppercase tracking-wider">Accesos Rápidos:</span>
        {config.shortcuts.map((sc, idx) => {
          const ShortcutIcon = sc.icon;
          return (
            <NavLink
              key={idx}
              to={sc.to}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                sc.isAction 
                  ? 'bg-brand-primary text-white hover:bg-brand-secondary shadow-sm' 
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/15'
              }`}
            >
              <ShortcutIcon size={14} />
              {sc.label}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessHeaderBanner;
