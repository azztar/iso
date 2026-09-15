import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { AuditLog } from '../../types';
import { Shield, Search, Filter, Download, Clock, User, ArrowUpDown, Loader2 } from 'lucide-react';

const actionColors: { [key: string]: { bg: string; text: string } } = {
  DOCUMENT_CREATE: { bg: 'bg-green-100', text: 'text-green-800' },
  DOCUMENT_STATUS_CHANGE: { bg: 'bg-blue-100', text: 'text-blue-800' },
  DOCUMENT_UPDATE: { bg: 'bg-amber-100', text: 'text-amber-800' },
  DOCUMENT_NEW_VERSION: { bg: 'bg-purple-100', text: 'text-purple-800' },
  COTIZACION_CREATE: { bg: 'bg-teal-100', text: 'text-teal-800' },
  USER_CREATE: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  USER_STATUS_CHANGE: { bg: 'bg-rose-100', text: 'text-rose-800' },
  KPI_CREATE: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  IMPERSONATE_START: { bg: 'bg-gray-100', text: 'text-gray-800' },
};

const TenantAuditPage: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('');

  useEffect(() => {
    const fetchAudit = async () => {
      setLoading(true);
      try {
        const tenantId = user?.tenantId || 'tenant-acme';
        // Get both general audit logs from API and local tenant events
        const globalLogs = await api.getAuditLogs();
        const tenantSpecific = await api.getTenantAuditLogs(tenantId);
        // Deduplicate
        const combined = [...tenantSpecific, ...globalLogs].filter(
          (v, i, a) => a.findIndex(t => t.id === v.id) === i
        );
        setLogs(combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      } catch (err) {
        console.error('Failed to fetch audit logs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAudit();
  }, [user]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const term = searchTerm.toLowerCase();
      const matchesTerm =
        log.actor.toLowerCase().includes(term) ||
        log.resource.toLowerCase().includes(term) ||
        log.action.toLowerCase().includes(term);

      const matchesAction = filterAction ? log.action === filterAction : true;
      return matchesTerm && matchesAction;
    });
  }, [logs, searchTerm, filterAction]);

  const uniqueActions = useMemo(() => {
    return Array.from(new Set(logs.map(l => l.action)));
  }, [logs]);

  const handleExportCsv = () => {
    if (filteredLogs.length === 0) {
      alert('No hay registros de auditoría para exportar.');
      return;
    }

    const headers = ['ID', 'Fecha/Hora', 'Actor', 'Acción', 'Recurso'];
    const rows = filteredLogs.map(l => [
      l.id,
      `"${new Date(l.timestamp).toLocaleString('es-CO')}"`,
      `"${l.actor}"`,
      `"${l.action}"`,
      `"${l.resource}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `auditoria_tenant_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 text-brand-primary rounded-lg">
              <Shield size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Auditoría del Sistema ISO</h1>
              <p className="text-gray-600 text-sm mt-0.5">Trazabilidad de accesos, modificaciones, versiones y aprobaciones de calidad.</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleExportCsv}
          className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center shadow-sm"
        >
          <Download size={16} className="mr-2 text-gray-500" /> Exportar CSV
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="relative">
          <label className="block text-xs font-medium text-gray-700 mb-1">Buscar en registros</label>
          <div className="relative">
            <Search className="absolute h-4 w-4 text-gray-400 top-2.5 left-3" />
            <input
              type="text"
              placeholder="Buscar por usuario o recurso..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border rounded-lg text-sm focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Filtrar por Acción</label>
          <select
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
            className="w-full px-3 py-1.5 border rounded-lg text-sm focus:ring-brand-primary focus:border-brand-primary"
          >
            <option value="">Todas las acciones</option>
            {uniqueActions.map(act => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end justify-end">
          <button
            onClick={() => { setSearchTerm(''); setFilterAction(''); }}
            className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50"
          >
            Restablecer Filtros
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Fecha y Hora</th>
                <th className="px-6 py-3 text-left">Acción</th>
                <th className="px-6 py-3 text-left">Usuario Responsable</th>
                <th className="px-6 py-3 text-left">Recurso Afectado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-sm">
              {filteredLogs.map(log => {
                const color = actionColors[log.action] || { bg: 'bg-gray-100', text: 'text-gray-800' };
                return (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs flex items-center">
                      <Clock size={14} className="mr-2 text-gray-400" />
                      {new Date(log.timestamp).toLocaleString('es-CO')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${color.bg} ${color.text}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800 font-medium">
                      <div className="flex items-center">
                        <User size={14} className="mr-1.5 text-gray-400" />
                        {log.actor}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-mono text-xs">
                      {log.resource}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredLogs.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No se encontraron eventos de auditoría para los filtros seleccionados.
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantAuditPage;
