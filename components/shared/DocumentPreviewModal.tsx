import React, { useMemo, useState, useEffect } from 'react';
import { Document, DocumentStatus, KPI, OrdenCompra, Cotizacion, Dotacion, Contacto, ProcessType } from '../../types';
import { useData } from '../../contexts/DataContext';
import { api } from '../../services/api';
import { X, Target, BarChart2, Info, Tag, Calendar, User, CheckCircle, FileText, CheckCircle2, ShieldCheck, Award } from 'lucide-react';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
}

const statusConfig = {
    [DocumentStatus.VIGENTE]: { color: 'bg-status-green', text: 'text-white' },
    [DocumentStatus.APROBADO]: { color: 'bg-status-blue', text: 'text-white' },
    [DocumentStatus.REVISION]: { color: 'bg-status-yellow', text: 'text-yellow-800' },
    [DocumentStatus.BORRADOR]: { color: 'bg-gray-200', text: 'text-gray-800' },
    [DocumentStatus.OBSOLETO]: { color: 'bg-status-red', text: 'text-white' },
};

const DetailItem: React.FC<{ icon: React.ElementType, label: string, children: React.ReactNode }> = ({ icon: Icon, label, children }) => (
    <div className="flex items-start">
        <Icon className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
        <div>
            <dt className="font-medium text-gray-500">{label}</dt>
            <dd className="text-gray-800">{children}</dd>
        </div>
    </div>
);

const KpiInfoCard: React.FC<{ kpi: KPI }> = ({ kpi }) => (
    <div className="bg-white p-3 rounded-lg border border-gray-200 hover:border-brand-primary transition-colors">
        <div className="flex items-center text-gray-500 mb-2">
            <Target size={16} className="mr-2 text-brand-primary" />
            <h4 className="text-sm font-semibold text-gray-800 truncate" title={kpi.nombre}>{kpi.nombre}</h4>
        </div>
        <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600">Meta:</span>
            <span className="font-medium text-gray-800 bg-gray-100 px-2 py-0.5 rounded">{kpi.meta} {kpi.unidad}</span>
        </div>
    </div>
);

const OrdenCompraPreview: React.FC<{ ordenCompraId: string }> = ({ ordenCompraId }) => {
    const [orden, setOrden] = useState<OrdenCompra | null>(null);
    const [proveedor, setProveedor] = useState<Contacto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const ordenData = await api.getOrdenCompra(ordenCompraId);
                if (ordenData) {
                    setOrden(ordenData);
                    const proveedorData = await api.getProveedor(ordenData.proveedorId);
                    if(proveedorData) {
                        setProveedor(proveedorData);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch purchase order details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [ordenCompraId]);

    if (loading) {
        return <div className="p-6 text-center h-full flex items-center justify-center bg-gray-50">Cargando orden de compra...</div>;
    }

    if (!orden || !proveedor) {
        return <div className="p-6 text-center text-red-500 h-full flex items-center justify-center bg-gray-50">No se pudo cargar la orden de compra.</div>;
    }

    return (
        <div className="p-8 bg-white h-full overflow-y-auto">
            <header className="flex justify-between items-start mb-8 pb-4 border-b">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Orden de Compra</h1>
                    <p className="text-gray-600 font-semibold text-lg">{orden.numero}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold text-gray-800">Acme Corp</h2>
                    <p className="text-sm text-gray-500">Calle Falsa 123, Bogotá</p>
                </div>
            </header>
            
            <section className="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Proveedor</h3>
                    <p className="font-bold text-gray-800">{proveedor.razonSocial}</p>
                    <p className="text-gray-600">{proveedor.rut_nit}</p>
                    <p className="text-gray-600">{proveedor.email}</p>
                </div>
                <div className="text-right">
                    <p><strong className="text-gray-600">Fecha:</strong> {new Date(orden.fecha).toLocaleDateString('es-CO')}</p>
                    <p><strong className="text-gray-600">Centro de Costo:</strong> {orden.centroCosto || 'N/A'}</p>
                </div>
            </section>
            
            <section className="mb-8">
                <table className="w-full text-left table-auto">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-sm font-semibold text-gray-600 uppercase">Descripción</th>
                            <th className="p-3 text-sm font-semibold text-gray-600 uppercase text-right">Cantidad</th>
                            <th className="p-3 text-sm font-semibold text-gray-600 uppercase text-right">Precio Unitario</th>
                            <th className="p-3 text-sm font-semibold text-gray-600 uppercase text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orden.items.map(item => (
                            <tr key={item.id} className="border-b">
                                <td className="p-3">{item.descripcion}</td>
                                <td className="p-3 text-right">{item.cantidad}</td>
                                <td className="p-3 text-right">{item.precioUnitario.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
                                <td className="p-3 text-right font-medium">{(item.cantidad * item.precioUnitario).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
            
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Condiciones</h3>
                    <p className="text-gray-600">{orden.condiciones}</p>
                </div>
                <div className="space-y-2 text-right">
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-600">Subtotal:</span>
                        <span className="text-gray-800">{orden.subtotal.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-600">IVA (19%):</span>
                        <span className="text-gray-800">{orden.impuestos.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
                    </div>
                     <div className="flex justify-between items-center border-t pt-2 mt-2">
                        <span className="text-lg font-bold text-gray-900">Total:</span>
                        <span className="text-lg font-bold text-gray-900">{orden.total.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
                    </div>
                </div>
            </section>
        </div>
    );
};

const CotizacionPreview: React.FC<{ cotizacionId: string }> = ({ cotizacionId }) => {
    const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null);
    const [cliente, setCliente] = useState<Contacto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const cotData = await api.getCotizacion(cotizacionId);
                if (cotData) {
                    setCotizacion(cotData);
                    const clienteData = await api.getCliente(cotData.clienteId);
                    if (clienteData) {
                        setCliente(clienteData);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch quotation details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [cotizacionId]);

    if (loading) {
        return <div className="p-6 text-center h-full flex items-center justify-center bg-gray-50">Cargando cotización...</div>;
    }

    if (!cotizacion || !cliente) {
        return <div className="p-6 text-center text-red-500 h-full flex items-center justify-center bg-gray-50">No se pudo cargar la cotización.</div>;
    }

    return (
        <div className="p-8 bg-white h-full overflow-y-auto">
            <header className="flex justify-between items-start mb-8 pb-4 border-b">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Cotización Comercial</h1>
                    <p className="text-brand-primary font-semibold text-lg">{cotizacion.numero}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold text-gray-800">Acme Corp</h2>
                    <p className="text-sm text-gray-500">Sistema Integrado de Gestión de Calidad</p>
                    <p className="text-xs text-gray-400">Bogotá D.C., Colombia</p>
                </div>
            </header>
            
            <section className="grid grid-cols-2 gap-8 mb-8 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Cliente / Solicitante</h3>
                    <p className="font-bold text-gray-900 text-base">{cliente.razonSocial}</p>
                    <p className="text-gray-600 text-sm">NIT: {cliente.rut_nit}</p>
                    <p className="text-gray-600 text-sm">Email: {cliente.email}</p>
                </div>
                <div className="text-right space-y-1">
                    <p className="text-sm"><strong className="text-gray-600">Fecha de Emisión:</strong> {cotizacion.fecha}</p>
                    <p className="text-sm"><strong className="text-gray-600">Vigencia:</strong> {cotizacion.vigencia}</p>
                    <p className="text-sm"><strong className="text-gray-600">Estado:</strong> <span className="text-green-700 font-semibold">Oferta Vigente</span></p>
                </div>
            </section>
            
            <section className="mb-8">
                <table className="w-full text-left table-auto border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-gray-100 text-xs font-semibold text-gray-600 uppercase">
                        <tr>
                            <th className="p-3">Descripción del Servicio</th>
                            <th className="p-3 text-right">Cantidad</th>
                            <th className="p-3 text-right">Valor Unitario</th>
                            <th className="p-3 text-right">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-sm">
                        {cotizacion.items.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="p-3 text-gray-800">{item.descripcion}</td>
                                <td className="p-3 text-right text-gray-600">{item.cantidad}</td>
                                <td className="p-3 text-right text-gray-600">{item.precioUnitario.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
                                <td className="p-3 text-right font-semibold text-gray-900">{(item.cantidad * item.precioUnitario).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
            
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Términos y Condiciones</h3>
                    <p className="text-xs text-gray-700 leading-relaxed">{cotizacion.condiciones}</p>
                </div>
                <div className="space-y-2 text-right">
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-600">Subtotal:</span>
                        <span className="text-gray-800">{cotizacion.subtotal.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
                    </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-600">IVA (19%):</span>
                        <span className="text-gray-800">{cotizacion.impuestos.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
                    </div>
                     <div className="flex justify-between items-center border-t pt-3 mt-2">
                        <span className="text-lg font-bold text-gray-900">Total Cotización:</span>
                        <span className="text-lg font-bold text-brand-primary">{cotizacion.total.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
                    </div>
                </div>
            </section>
        </div>
    );
};

const DotacionPreview: React.FC<{ dotacionId: string }> = ({ dotacionId }) => {
    const [dotacion, setDotacion] = useState<Dotacion | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await api.getDotacion(dotacionId);
                if (data) {
                    setDotacion(data);
                }
            } catch (error) {
                console.error("Failed to fetch dotacion details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [dotacionId]);

    if (loading) {
        return <div className="p-6 text-center h-full flex items-center justify-center bg-gray-50">Cargando registro de dotación...</div>;
    }

    if (!dotacion) {
        return <div className="p-6 text-center text-red-500 h-full flex items-center justify-center bg-gray-50">No se pudo cargar el registro de dotación.</div>;
    }

    return (
        <div className="p-8 bg-white h-full overflow-y-auto">
            <header className="flex justify-between items-start mb-6 pb-4 border-b">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Acta de Entrega de Dotación y EPP</h1>
                    <p className="text-brand-primary font-semibold text-lg">{dotacion.numero}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold text-gray-800">Acme Corp S.A.S.</h2>
                    <p className="text-sm text-gray-500">Gestión de Seguridad y Salud en el Trabajo</p>
                    <p className="text-xs text-gray-400">ISO 9001:2015 / ISO 45001</p>
                </div>
            </header>
            
            <section className="grid grid-cols-2 gap-6 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm">
                <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Colaborador / Receptor</p>
                    <p className="font-bold text-gray-900 text-base">{dotacion.colaboradorNombre}</p>
                    <p className="text-gray-600">C.C. {dotacion.colaboradorCedula}</p>
                    <p className="text-gray-600">Cargo: <span className="font-medium text-gray-800">{dotacion.cargo}</span></p>
                </div>
                <div className="text-right space-y-1">
                    <p><strong className="text-gray-600">Fecha de Entrega:</strong> {dotacion.fecha}</p>
                    <p><strong className="text-gray-600">Proceso:</strong> Apoyo - Gestión Humana</p>
                    <p><strong className="text-gray-600">Estado de Entrega:</strong> <span className="text-green-700 font-semibold">Entregado a Satisfacción</span></p>
                </div>
            </section>

            <section className="mb-6">
                <table className="w-full text-left table-auto border border-gray-200 rounded-lg overflow-hidden text-sm">
                    <thead className="bg-gray-100 text-xs font-semibold text-gray-600 uppercase">
                        <tr>
                            <th className="p-3">#</th>
                            <th className="p-3">Elemento de Dotación / EPP</th>
                            <th className="p-3 text-center">Talla</th>
                            <th className="p-3 text-center">Cantidad</th>
                            <th className="p-3 text-center">Tipo de Entrega</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {dotacion.items.map((item, idx) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="p-3 text-gray-500 font-mono text-xs">{idx + 1}</td>
                                <td className="p-3 font-medium text-gray-800">{item.elemento}</td>
                                <td className="p-3 text-center text-gray-600">{item.talla}</td>
                                <td className="p-3 text-center font-semibold text-gray-900">{item.cantidad}</td>
                                <td className="p-3 text-center">
                                    <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 font-medium">
                                        {item.estadoEntrega}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-700 leading-relaxed">
                <h4 className="font-bold text-gray-900 mb-1 uppercase tracking-wider">Compromiso de Custodia y Uso:</h4>
                <p>{dotacion.observaciones}</p>
            </section>

            <section className="grid grid-cols-2 gap-8 pt-4 border-t-2 border-gray-200 text-center">
                <div className="border rounded-lg p-4 bg-white">
                    <div className="h-14 border-b border-dashed border-gray-300 mb-2 flex items-end justify-center pb-1 text-xs text-gray-400 italic">
                        Firma Digital Validada
                    </div>
                    <p className="font-bold text-xs text-gray-900">{dotacion.colaboradorNombre}</p>
                    <p className="text-[10px] text-gray-500">C.C. {dotacion.colaboradorCedula} (Receptor)</p>
                </div>
                <div className="border rounded-lg p-4 bg-white">
                    <div className="h-14 border-b border-dashed border-gray-300 mb-2 flex items-end justify-center pb-1 text-xs text-green-600 font-semibold">
                        SGC Acme Corp - Aprobado
                    </div>
                    <p className="font-bold text-xs text-gray-900">Gestión Humana & SG-SST</p>
                    <p className="text-[10px] text-gray-500">Entrega Oficial Controlada</p>
                </div>
            </section>
        </div>
    );
};

// Professional interactive ISO document reader
const IsoDocumentViewer: React.FC<{ document: Document }> = ({ document }) => {
    return (
        <div className="p-8 bg-white h-full overflow-y-auto space-y-6">
            {/* Formal ISO Header Block */}
            <div className="border-2 border-gray-800 rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 border-b border-gray-800 text-center divide-x divide-gray-800">
                    <div className="col-span-3 p-4 flex flex-col justify-center items-center bg-gray-50">
                        <Award className="text-brand-primary mb-1" size={28} />
                        <span className="font-bold text-xs text-gray-900">ACME CORP S.A.S.</span>
                        <span className="text-[10px] text-gray-500">SGC ISO 9001:2015</span>
                    </div>
                    <div className="col-span-6 p-4 flex flex-col justify-center">
                        <h1 className="text-lg font-black text-gray-900 uppercase tracking-wide">{document.nombre}</h1>
                        <p className="text-xs text-gray-600">Sistema de Gestión de la Calidad</p>
                    </div>
                    <div className="col-span-3 p-2 text-left text-xs font-mono space-y-1 bg-gray-50 flex flex-col justify-center">
                        <p><strong>Código:</strong> {document.codigo}</p>
                        <p><strong>Versión:</strong> {String(document.version).padStart(2, '0')}</p>
                        <p><strong>Vigencia:</strong> {document.fechaRevision}</p>
                    </div>
                </div>
                <div className="grid grid-cols-3 divide-x divide-gray-800 bg-gray-100 text-xs py-1.5 px-3 font-medium text-gray-700">
                    <div>Proceso: {document.proceso}</div>
                    <div>Tipo: {document.tipo}</div>
                    <div className="text-right">Estado: <span className="font-bold">{document.estado}</span></div>
                </div>
            </div>

            {/* Document Body Sections */}
            <div className="space-y-6 text-sm text-gray-800 leading-relaxed max-w-4xl mx-auto">
                <div>
                    <h3 className="text-base font-bold text-gray-900 pb-1 border-b mb-2 flex items-center">
                        <span className="bg-brand-primary text-white text-xs px-2 py-0.5 rounded mr-2">1.0</span>
                        Objetivo y Alcance
                    </h3>
                    <p className="text-gray-700">
                        El presente documento establece las directrices, responsabilidades y lineamientos requeridos para dar cumplimiento 
                        a las disposiciones normativas del proceso <strong>{document.proceso}</strong> {document.subproceso ? `(${document.subproceso})` : ''} dentro de la organización.
                        Aplica a todas las dependencias y personal involucrado en las operaciones directas e indirectas de la compañía.
                    </p>
                </div>

                <div>
                    <h3 className="text-base font-bold text-gray-900 pb-1 border-b mb-2 flex items-center">
                        <span className="bg-brand-primary text-white text-xs px-2 py-0.5 rounded mr-2">2.0</span>
                        Normas y Requisitos Aplicables
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li>Norma Internacional ISO 9001:2015 - Sistemas de Gestión de la Calidad. Requisitos.</li>
                        <li>Manual de Calidad y Políticas Institucionales de Acme Corp.</li>
                        <li>Procedimientos Operativos Estandarizados (POE) asociados al proceso.</li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-base font-bold text-gray-900 pb-1 border-b mb-2 flex items-center">
                        <span className="bg-brand-primary text-white text-xs px-2 py-0.5 rounded mr-2">3.0</span>
                        Desarrollo y Procedimiento
                    </h3>
                    <div className="bg-gray-50 border rounded-lg p-4 space-y-3">
                        <div className="flex items-start space-x-3">
                            <span className="font-bold text-brand-primary">3.1</span>
                            <div>
                                <p className="font-semibold text-gray-900">Iniciación y Registro:</p>
                                <p className="text-gray-600 text-xs mt-0.5">El responsable designado ({document.responsableNombre}) vela por la ejecución oportuna conforme a los estándares de calidad establecidos.</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <span className="font-bold text-brand-primary">3.2</span>
                            <div>
                                <p className="font-semibold text-gray-900">Control y Medición:</p>
                                <p className="text-gray-600 text-xs mt-0.5">Se realizarán auditorías periódicas de seguimiento y monitoreo de los indicadores vinculados a la efectividad de este documento.</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <span className="font-bold text-brand-primary">3.3</span>
                            <div>
                                <p className="font-semibold text-gray-900">Custodia y Archivo:</p>
                                <p className="text-gray-600 text-xs mt-0.5">El documento se almacena en el repositorio digital centralizado bajo control de versiones y con acceso según roles autorizados.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Approvals and Signatures Footer */}
                <div className="pt-6 border-t-2 border-gray-200">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Control de Aprobaciones y Emisión</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="border rounded-lg p-3 bg-gray-50">
                            <p className="text-xs text-gray-500 mb-6">Elaboró / Responsable</p>
                            <p className="font-semibold text-xs text-gray-900">{document.responsableNombre}</p>
                            <span className="text-[10px] text-gray-500">Líder de Proceso</span>
                        </div>
                        <div className="border rounded-lg p-3 bg-gray-50">
                            <p className="text-xs text-gray-500 mb-6">Revisó</p>
                            <p className="font-semibold text-xs text-gray-900">Comité de Calidad</p>
                            <span className="text-[10px] text-gray-500">Auditor Interno</span>
                        </div>
                        <div className="border rounded-lg p-3 bg-blue-50 border-blue-200 relative overflow-hidden">
                            <div className="absolute -right-3 -bottom-3 text-blue-200 pointer-events-none">
                                <ShieldCheck size={48} />
                            </div>
                            <p className="text-xs text-blue-700 font-semibold mb-6">Aprobó / Estado</p>
                            <p className="font-bold text-xs text-blue-900">{document.estado}</p>
                            <span className="text-[10px] text-blue-600">Dirección General</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ isOpen, onClose, document }) => {
  const { kpis } = useData();

  const linkedKpis = useMemo(() => {
      if (!document?.vinculos?.kpiIds || !kpis) {
          return [];
      }
      return kpis.filter(kpi => document.vinculos.kpiIds.includes(kpi.id));
  }, [document, kpis]);
  
  if (!isOpen || !document) return null;

  const isPurchaseOrder = document?.vinculos?.formType === 'OrdenCompra';
  const isQuotation = document?.vinculos?.formType === 'Cotizacion';
  const isDotacion = document?.vinculos?.formType === 'Dotacion';
  const hasExternalPdf = document.archivoUrl && document.archivoUrl !== '#' && document.archivoUrl.startsWith('http');

  const renderViewerContent = () => {
    if (isPurchaseOrder && document.vinculos?.formId) {
      return <OrdenCompraPreview ordenCompraId={document.vinculos.formId} />;
    }
    if (isQuotation && document.vinculos?.formId) {
      return <CotizacionPreview cotizacionId={document.vinculos.formId} />;
    }
    if (isDotacion && document.vinculos?.formId) {
      return <DotacionPreview dotacionId={document.vinculos.formId} />;
    }
    if (hasExternalPdf) {
      return (
        <div className="p-2 h-full w-full">
          <iframe
            src={document.archivoUrl}
            title={`Vista previa de ${document.nombre}`}
            className="w-full h-full border-0 rounded-md"
          />
        </div>
      );
    }
    // Professional interactive ISO document viewer
    return <IsoDocumentViewer document={document} />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[100] flex justify-center items-center p-4 transition-opacity duration-300" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes fade-in-scale {
            0% { transform: scale(0.95); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-fade-in-scale { animation: fade-in-scale 0.2s forwards ease-out; }
        `}</style>
        <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-800 truncate" title={`${document.nombre} (${document.codigo})`}>
            Vista Previa: {document.nombre} <span className="text-gray-500 font-normal">({document.codigo})</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100">
            <X size={24} />
          </button>
        </div>
        <div className="flex flex-grow overflow-hidden">
            <div className="flex-grow bg-gray-100 overflow-hidden">
                {renderViewerContent()}
            </div>
            <aside className="w-96 flex-shrink-0 border-l border-gray-200 overflow-y-auto bg-gray-50">
                <div className="p-6 space-y-8">
                    {/* Document Details section */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
                            <Info size={20} className="mr-3 text-brand-primary"/>
                            Detalles del Documento
                        </h3>
                        <dl className="space-y-4 text-sm">
                            <DetailItem icon={Tag} label="Código">{document.codigo}</DetailItem>
                            <DetailItem icon={Info} label="Versión">v{document.version}</DetailItem>
                            <DetailItem icon={CheckCircle} label="Estado">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusConfig[document.estado].color} ${statusConfig[document.estado].text}`}>
                                    {document.estado}
                                </span>
                            </DetailItem>
                            <DetailItem icon={User} label="Responsable">{document.responsableNombre}</DetailItem>
                            <DetailItem icon={Calendar} label="Fecha Próxima Revisión">{document.fechaRevision}</DetailItem>
                        </dl>
                    </div>

                    {/* KPIs section */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
                            <BarChart2 size={20} className="mr-3 text-brand-primary"/>
                            KPIs Vinculados
                        </h3>
                        <div className="space-y-3">
                            {linkedKpis.length > 0 ? (
                                linkedKpis.map(kpi => <KpiInfoCard key={kpi.id} kpi={kpi} />)
                            ) : (
                                <p className="text-sm text-gray-500 italic p-3 bg-white rounded-md border">No hay KPIs vinculados a este documento.</p>
                            )}
                        </div>
                    </div>
                </div>
            </aside>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;