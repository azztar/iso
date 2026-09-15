import React, { useState, useEffect } from 'react';
import StatCard from '../../components/platform/StatCard';
import { DollarSign, Users, Building, AlertCircle, CheckCircle, Clock, Loader2, TrendingUp, PieChart } from 'lucide-react';
import { api } from '../../services/api';

const PlatformHomePage: React.FC = () => {
    const [stats, setStats] = useState<{ mrr: number; activeTenants: number; totalUsers: number; } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getPlatformStats()
            .then(setStats)
            .catch(err => console.error("Failed to fetch platform stats", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin h-8 w-8 text-brand-primary" />
            </div>
        );
    }

    const monthlyData = [
        { month: 'Oct', tenants: 2, height: 28 },
        { month: 'Nov', tenants: 4, height: 45 },
        { month: 'Dic', tenants: 3, height: 35 },
        { month: 'Ene', tenants: 6, height: 60 },
        { month: 'Feb', tenants: 8, height: 78 },
        { month: 'Mar', tenants: 11, height: 95 },
    ];

    const planData = [
        { name: 'Plan Pro', count: 18, percent: 55, color: '#3B82F6', textClass: 'text-blue-600' },
        { name: 'Plan Enterprise', count: 9, percent: 27, color: '#8B5CF6', textClass: 'text-purple-600' },
        { name: 'Plan Básico', count: 6, percent: 18, color: '#10B981', textClass: 'text-emerald-500' },
    ];
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Dashboard de la Plataforma</h1>
                <p className="text-gray-600 mt-1">Vista general de la salud comercial y técnica del servicio multi-empresa.</p>
            </div>

            {/* Business KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard 
                    title="Ingreso Mensual Recurrente (MRR)" 
                    value={stats?.mrr.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }) || '$0 COP'} 
                    icon={<DollarSign size={24}/>} 
                />
                <StatCard 
                    title="Tenants Activos" 
                    value={stats?.activeTenants.toString() || '0'} 
                    icon={<Building size={24}/>}
                />
                 <StatCard 
                    title="Usuarios Totales Activos" 
                    value={stats?.totalUsers.toString() || '0'} 
                    icon={<Users size={24}/>}
                />
            </div>
            
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Growth trend chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-semibold text-gray-800 flex items-center">
                                <TrendingUp className="text-brand-primary mr-2" size={18} />
                                Nuevos Inquilinos (Últimos 6 meses)
                            </h3>
                            <p className="text-xs text-gray-500">Crecimiento constante de clientes activos en la plataforma.</p>
                        </div>
                        <span className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                            +37% vs mes anterior
                        </span>
                    </div>

                    <div className="h-60 flex items-end justify-between gap-3 pt-6 px-4">
                        {monthlyData.map(item => (
                            <div key={item.month} className="flex-1 flex flex-col items-center h-full justify-end group">
                                <span className="text-xs font-bold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                                    {item.tenants}
                                </span>
                                <div
                                    className="w-full max-w-[42px] bg-gradient-to-t from-brand-primary to-blue-400 rounded-t-md transition-all duration-300 group-hover:brightness-110 shadow-sm"
                                    style={{ height: `${item.height}%` }}
                                ></div>
                                <span className="text-xs text-gray-500 mt-2 font-medium">{item.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Popular plans chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-semibold text-gray-800 flex items-center">
                                <PieChart className="text-brand-primary mr-2" size={18} />
                                Distribución de Planes
                            </h3>
                            <p className="text-xs text-gray-500">Porcentaje de adopción por tipo de suscripción.</p>
                        </div>
                        <span className="text-xs font-medium text-gray-500">Total: 33 Inquilinos</span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
                        {/* Donut graphic */}
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                {/* Background circle */}
                                <path
                                    className="text-gray-100"
                                    strokeWidth="3.8"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                {/* Segments */}
                                <path
                                    className="text-blue-500"
                                    strokeDasharray="55, 100"
                                    strokeWidth="3.8"
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                    className="text-purple-500"
                                    strokeDasharray="27, 100"
                                    strokeDashoffset="-55"
                                    strokeWidth="3.8"
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                    className="text-emerald-500"
                                    strokeDasharray="18, 100"
                                    strokeDashoffset="-82"
                                    strokeWidth="3.8"
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center justify-center text-center">
                                <span className="text-xl font-bold text-gray-800">55%</span>
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Plan Pro</span>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="space-y-3 w-full sm:w-auto">
                            {planData.map(plan => (
                                <div key={plan.name} className="flex items-center justify-between sm:justify-start gap-4 text-xs">
                                    <div className="flex items-center space-x-2">
                                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: plan.color }}></span>
                                        <span className="font-medium text-gray-700">{plan.name}</span>
                                    </div>
                                    <span className="font-bold text-gray-900">{plan.percent}% ({plan.count})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Technical Health */}
            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Salud Técnica de Infraestructura</h2>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <ul className="divide-y divide-gray-200">
                        <li className="py-3 flex items-center justify-between">
                            <span className="font-medium text-gray-700">Base de Datos PostgreSQL (Multi-tenant)</span>
                            <span className="flex items-center text-green-600"><CheckCircle size={16} className="mr-2"/> Operacional (0 latencia de bloqueo)</span>
                        </li>
                        <li className="py-3 flex items-center justify-between">
                            <span className="font-medium text-gray-700">Caché & Sesiones (Redis)</span>
                            <span className="flex items-center text-green-600"><CheckCircle size={16} className="mr-2"/> Operacional</span>
                        </li>
                        <li className="py-3 flex items-center justify-between">
                            <span className="font-medium text-gray-700">Almacenamiento de Archivos y Versiones (S3 / Cloud Storage)</span>
                            <span className="flex items-center text-green-600"><CheckCircle size={16} className="mr-2"/> Operacional (99.99% disponibilidad)</span>
                        </li>
                        <li className="py-3 flex items-center justify-between">
                            <span className="font-medium text-gray-700">Latencia API Promedio (p95)</span>
                            <span className="flex items-center text-gray-700"><Clock size={16} className="mr-2"/> 85ms</span>
                        </li>
                        <li className="py-3 flex items-center justify-between">
                            <span className="font-medium text-gray-700">Tasa de Errores HTTP (5xx)</span>
                            <span className="flex items-center text-green-600"><CheckCircle size={16} className="mr-2"/> 0.00%</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PlatformHomePage;