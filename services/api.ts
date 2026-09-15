import { User, Role, Document, KPI, DocumentStatus, ProcessType, DocumentType, Contacto, OrdenCompra, Cotizacion, Dotacion, DotacionItem, Tenant, Plan, Template, TemplateType, AuditLog, DocumentoHistorial, Permission } from '../types';

const ALL_PERMISSIONS: Permission[] = [
  'platform:access', 'platform:manage_tenants', 'platform:manage_plans', 'platform:manage_roles', 'platform:view_audit_log',
  'tenant:admin', 'tenant:view_master_list', 'tenant:manage_users',
  'document:create', 'document:update', 'document:publish', 'document:submit', 'document:download', 'document:view_all', 'document:view_published',
  'kpi:manage', 'kpi:read',
  'form:create'
];

let roles: Role[] = [
  { 
    id: 'role-superadmin', name: 'SUPERADMIN', description: 'Acceso total a la plataforma y todos los tenants.',
    permissions: [...ALL_PERMISSIONS], isDefault: true,
  },
  {
    id: 'role-admin', name: 'ADMIN', description: 'Administrador del tenant, gestiona usuarios y documentos.',
    permissions: [
      'tenant:admin', 'tenant:view_master_list', 'tenant:manage_users',
      'document:create', 'document:update', 'document:publish', 'document:submit', 'document:download', 'document:view_all',
      'kpi:manage', 'kpi:read',
      'form:create'
    ], isDefault: true,
  },
  {
    id: 'role-editor', name: 'EDITOR', description: 'Puede crear y gestionar sus propios documentos.',
    permissions: [
      'document:create', 'document:submit', 'document:download', 'document:view_all',
      'kpi:read',
      'form:create'
    ], isDefault: true,
  },
  {
    id: 'role-lector', name: 'LECTOR', description: 'Solo puede ver y descargar documentos publicados.',
    permissions: ['document:download', 'document:view_published', 'kpi:read'], isDefault: true,
  }
];

const users: User[] = [
  { id: 'user-super', email: 'superadmin@platform.local', nombre: 'Super Admin', role: roles[0], activo: true },
  { id: 'user-admin', email: 'admin@acme-demo.local', nombre: 'Admin Acme', role: roles[1], tenantId: 'tenant-acme', activo: true },
  { id: 'user-editor', email: 'editor@acme-demo.local', nombre: 'Editor Acme', role: roles[2], tenantId: 'tenant-acme', activo: true },
  { id: 'user-lector', email: 'lector@acme-demo.local', nombre: 'Lector Acme', role: roles[3], tenantId: 'tenant-acme', activo: true },
  { id: 'user-admin-globex', email: 'admin@globex.local', nombre: 'Admin Globex', role: roles[1], tenantId: 'tenant-globex', activo: true },
];

let documents: Document[] = [
    { id: 'doc-1', codigo: 'MAN-EST-001', nombre: 'Manual de Calidad', proceso: ProcessType.ESTRATEGICO, tipo: DocumentType.MANUAL, version: 2, estado: DocumentStatus.VIGENTE, responsableId: 'user-admin', responsableNombre: 'Admin Acme', fechaEmision: '2023-01-15', fechaRevision: '2024-01-10', archivoUrl: '#', vinculos: { kpiIds: ['kpi-1'] }, historial: [
        { id: 'hist-1-2', fecha: '2024-01-10T10:00:00Z', autor: 'Admin Acme', version: 2, cambios: 'Versión 2 publicada.'},
        { id: 'hist-1-1', fecha: '2023-01-15T09:00:00Z', autor: 'Admin Acme', version: 1, cambios: 'Documento Creado.'},
    ]},
    { id: 'doc-2', codigo: 'PROC-EST-002', nombre: 'Procedimiento de Planificación', proceso: ProcessType.ESTRATEGICO, tipo: DocumentType.PROCEDIMIENTO, version: 1, estado: DocumentStatus.VIGENTE, responsableId: 'user-editor', responsableNombre: 'Editor Acme', fechaEmision: '2023-03-20', fechaRevision: '2024-03-25', archivoUrl: '#', historial: [
        { id: 'hist-2-2', fecha: '2023-03-22T11:00:00Z', autor: 'Admin Acme', version: 1, cambios: 'Documento aprobado y publicado.'},
        { id: 'hist-2-1', fecha: '2023-03-20T14:00:00Z', autor: 'Editor Acme', version: 1, cambios: 'Documento enviado a revisión.'},
    ]},
    { id: 'doc-3', codigo: 'PROC-MIS-001', nombre: 'Procedimiento de Ventas', proceso: ProcessType.MISIONAL, tipo: DocumentType.PROCEDIMIENTO, version: 3, estado: DocumentStatus.VIGENTE, responsableId: 'user-admin', responsableNombre: 'Admin Acme', fechaEmision: '2022-11-05', fechaRevision: '2024-02-15', archivoUrl: '#', vinculos: { kpiIds: ['kpi-2', 'kpi-1'] }, historial: [] },
    { id: 'doc-4', codigo: 'FOR-MIS-002', nombre: 'Cotización de Servicios', proceso: ProcessType.MISIONAL, tipo: DocumentType.FORMATO, version: 4, estado: DocumentStatus.BORRADOR, responsableId: 'user-editor', responsableNombre: 'Editor Acme', fechaEmision: '2024-04-01', fechaRevision: '2024-04-01', archivoUrl: '#', vinculos: { formId: 'cot-1', formType: 'Cotizacion' }, historial: [] },
    { id: 'doc-5', codigo: 'POL-APO-001', nombre: 'Política de Recursos Humanos', proceso: ProcessType.APOYO, subproceso: 'Gestión Humana', tipo: DocumentType.POLITICA, version: 1, estado: DocumentStatus.OBSOLETO, responsableId: 'user-admin', responsableNombre: 'Admin Acme', fechaEmision: '2021-06-01', fechaRevision: '2023-06-01', archivoUrl: '#', historial: [] },
    { id: 'doc-6', codigo: 'ACTA-CON-001', nombre: 'Acta de Revisión por Dirección', proceso: ProcessType.CONTROL, tipo: DocumentType.ACTA, version: 1, estado: DocumentStatus.APROBADO, responsableId: 'user-admin', responsableNombre: 'Admin Acme', fechaEmision: '2024-01-30', fechaRevision: '2024-01-30', archivoUrl: '#', historial: [] },
    { id: 'doc-7', codigo: 'FOR-APO-DOT-0001', nombre: 'Registro de Entrega de Dotación y EPP', proceso: ProcessType.APOYO, subproceso: 'Gestión Humana', tipo: DocumentType.FORMATO, version: 1, estado: DocumentStatus.VIGENTE, responsableId: 'user-admin', responsableNombre: 'Admin Acme', fechaEmision: '2024-03-15', fechaRevision: '2025-03-15', archivoUrl: '#', vinculos: { formId: 'dot-1', formType: 'Dotacion' }, historial: [] },
];

const kpis: KPI[] = [
    { id: 'kpi-1', nombre: 'Satisfacción del Cliente', unidad: '%', meta: 95, periodicidad: 'Anual', proceso: ProcessType.ESTRATEGICO, responsableId: 'user-admin', responsableNombre: 'Admin Acme' },
    { id: 'kpi-2', nombre: 'Tasa de Cierre de Ventas', unidad: '%', meta: 25, periodicidad: 'Mensual', proceso: ProcessType.MISIONAL, responsableId: 'user-editor', responsableNombre: 'Editor Acme' },
    { id: 'kpi-3', nombre: 'Rotación de Personal', unidad: '%', meta: 5, periodicidad: 'Anual', proceso: ProcessType.APOYO, subproceso: 'Gestión Humana', responsableId: 'user-admin', responsableNombre: 'Admin Acme' },
];

const contactos: Contacto[] = [
    { id: 'prov-1', tipo: 'PROVEEDOR', rut_nit: '800.123.456-1', razonSocial: 'Suministros Industriales S.A.S.', email: 'ventas@suministros.com' },
    { id: 'prov-2', tipo: 'PROVEEDOR', rut_nit: '900.789.012-3', razonSocial: 'Tecnología y Sistemas Ltda.', email: 'contacto@tecnologia.co' },
    { id: 'cli-1', tipo: 'CLIENTE', rut_nit: '123.456.789-0', razonSocial: 'Constructora El Futuro', email: 'compras@elfuturo.com' }
];

const ordenesCompra: OrdenCompra[] = [];

const cotizaciones: Cotizacion[] = [
  {
    id: 'cot-1',
    numero: 'COT-0001',
    clienteId: 'cli-1',
    fecha: '2024-04-01',
    vigencia: '30 días',
    items: [
      { id: 'item-c1', descripcion: 'Auditoría Interna Sistema de Gestión ISO 9001:2015', cantidad: 1, precioUnitario: 3500000 },
      { id: 'item-c2', descripcion: 'Capacitación en Mapeo de Procesos y Calidad (16h)', cantidad: 1, precioUnitario: 1800000 }
    ],
    subtotal: 5300000,
    impuestos: 1007000,
    total: 6307000,
    condiciones: 'Pago: 50% anticipo y 50% al entregar el informe final de auditoría. Oferta válida por 30 días.',
    documentoId_link: 'doc-4',
  }
];

const dotaciones: Dotacion[] = [
  {
    id: 'dot-1',
    numero: 'DOT-0001',
    colaboradorNombre: 'Carlos Mendoza',
    colaboradorCedula: '1.020.345.678',
    cargo: 'Técnico de Mantenimiento',
    fecha: '2024-03-15',
    items: [
      { id: 'dot-item-1', elemento: 'Overol Industrial reflectivo de alta visibilidad', talla: 'L', cantidad: 2, estadoEntrega: 'Nuevo' },
      { id: 'dot-item-2', elemento: 'Botas de seguridad dieléctricas con puntera composite', talla: '42', cantidad: 1, estadoEntrega: 'Nuevo' },
      { id: 'dot-item-3', elemento: 'Casco de seguridad Tipo 1 Clase E con barbuquejo', talla: 'Única', cantidad: 1, estadoEntrega: 'Nuevo' },
      { id: 'dot-item-4', elemento: 'Gafas de seguridad antiempañante protección UV', talla: 'Única', cantidad: 2, estadoEntrega: 'Nuevo' },
    ],
    observaciones: 'Entrega de dotación correspondiente al primer cuatrimestre del año según normativa legal y SG-SST.',
    documentoId_link: 'doc-7',
  }
];

let plans: Plan[] = [
    { id: 'plan-basic', nombre: 'Básico', precio: 49900, userLimit: 5, storageLimit: 1, descripcion: 'Ideal para equipos pequeños que empiezan.' },
    { id: 'plan-pro', nombre: 'Pro', precio: 149900, userLimit: 20, storageLimit: 10, descripcion: 'Funcionalidades avanzadas para empresas en crecimiento.' },
    { id: 'plan-enterprise', nombre: 'Enterprise', precio: 499900, userLimit: 100, storageLimit: 100, descripcion: 'Soluciones a medida para grandes corporaciones.' },
];

let tenants: Tenant[] = [
  { id: 'tenant-acme', nombre: 'Acme Corp', subdominio: 'acme-demo', planId: 'plan-pro', planNombre: 'Pro', estado: 'Activo', fechaCreacion: '2023-05-20', userCount: 3, storageUsed: 1.2, userLimit: 20, storageLimit: 10 },
  { id: 'tenant-globex', nombre: 'Globex Corporation', subdominio: 'globex', planId: 'plan-enterprise', planNombre: 'Enterprise', estado: 'Activo', fechaCreacion: '2023-08-15', userCount: 50, storageUsed: 25.6, userLimit: 100, storageLimit: 100 },
  { id: 'tenant-initech', nombre: 'Initech', subdominio: 'initech', planId: 'plan-basic', planNombre: 'Básico', estado: 'Suspendido', fechaCreacion: '2024-01-10', userCount: 5, storageUsed: 0.5, userLimit: 5, storageLimit: 1 },
];

let templates: Template[] = [
    { id: 'tpl-1', nombre: 'Plantilla de Cotización Estándar', tipo: 'COTIZACION', version: 2, lastUpdated: '2024-05-10', fileUrl: '#' },
    { id: 'tpl-2', nombre: 'Orden de Compra General', tipo: 'ORDEN_COMPRA', version: 1, lastUpdated: '2024-03-22', fileUrl: '#' },
    { id: 'tpl-3', nombre: 'Formato de Entrega de Dotación y EPP', tipo: 'DOTACION', version: 1, lastUpdated: '2024-06-01', fileUrl: '#' },
];

let auditLogs: AuditLog[] = [
    { id: 1, actor: 'superadmin@platform.local', action: 'IMPERSONATE_START', resource: 'tenant:tenant-acme', timestamp: new Date(Date.now() - 86400000).toISOString() },
];

let platformSettings = {
  smtp: {
    host: 'smtp.example.com',
    port: '587',
    user: 'user@example.com',
    pass: 'defaultpassword', 
  },
  stripe: {
    publicKey: 'pk_test_12345',
    secretKey: 'sk_test_67890',
  }
};

const simulateDelay = <T,>(data: T): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(data), 500));

const logAuditEvent = (action: string, resource: string, actor: User) => {
    console.log(`[AUDIT LOG] Actor: ${actor.email} | Action: ${action} | Resource: ${resource}`);
    const newLog: AuditLog = {
        id: auditLogs.length + 1,
        actor: actor.email,
        action,
        resource,
        timestamp: new Date().toISOString(),
    };
    auditLogs.unshift(newLog);
};

export const api = {
  login: (email: string): Promise<User | undefined> => {
    console.log(`Attempting login for: ${email}`);
    const user = users.find(u => u.email === email);
    if (!user) {
        return Promise.reject(new Error("User not found"));
    }
    if (user?.tenantId) {
      const tenant = tenants.find(t => t.id === user.tenantId);
      if (tenant?.estado === 'Suspendido') {
        return Promise.reject(new Error("Tenant suspendido."));
      }
    }
    return simulateDelay(user);
  },
  // FIX: Expose logAuditEvent so it can be called from the UI for actions like impersonation.
  logAuditEvent: (action: string, resource: string, actor: User): Promise<void> => {
    logAuditEvent(action, resource, actor);
    return simulateDelay(undefined);
  },
  getDocuments: (permissions: Permission[]): Promise<Document[]> => {
    if (permissions.includes('document:view_all')) {
        return simulateDelay(documents);
    }
    return simulateDelay(documents.filter(d => d.estado === DocumentStatus.VIGENTE));
  },
  getKPIs: (): Promise<KPI[]> => {
    return simulateDelay(kpis);
  },
  getTenants: (): Promise<Tenant[]> => {
    return simulateDelay([...tenants].sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()));
  },
  updateDocumentStatus: (docId: string, status: DocumentStatus, actor: User): Promise<Document> => {
    const docIndex = documents.findIndex(d => d.id === docId);
    if (docIndex !== -1) {
        documents[docIndex].estado = status;
        if (!documents[docIndex].historial) {
            documents[docIndex].historial = [];
        }
        documents[docIndex].historial!.unshift({
            id: `hist-${Date.now()}`,
            fecha: new Date().toISOString(),
            autor: actor.nombre,
            version: documents[docIndex].version,
            cambios: `Estado cambiado a "${status}".`
        });
        
        if (actor.role.name === 'ADMIN' && status === DocumentStatus.VIGENTE) {
          logAuditEvent('PUBLISH_DOCUMENT', `doc:${docId} (${documents[docIndex].codigo})`, actor);
        }
        return simulateDelay(documents[docIndex]);
    }
    return Promise.reject(new Error("Documento no encontrado"));
  },
  addDocument: (newDocData: Omit<Document, 'id' | 'version' | 'estado' | 'fechaEmision' | 'fechaRevision' | 'archivoUrl' | 'responsableNombre'>, creator: User): Promise<Document> => {
    const responsibleUser = users.find(u => u.id === newDocData.responsableId);
    if (!responsibleUser) {
        return Promise.reject(new Error("Usuario responsable no encontrado"));
    }
    
    const today = new Date().toISOString().split('T')[0];
    const newDocument: Document = {
      id: `doc-${Date.now()}`,
      ...newDocData,
      version: 1,
      estado: DocumentStatus.BORRADOR,
      responsableNombre: responsibleUser.nombre,
      fechaEmision: today,
      fechaRevision: today,
      archivoUrl: '#', // Placeholder URL
      historial: [{
          id: `hist-${Date.now()}`,
          fecha: new Date().toISOString(),
          autor: responsibleUser.nombre,
          version: 1,
          cambios: 'Documento Creado.'
      }]
    };
    documents.unshift(newDocument); // Add to the beginning of the list

    logAuditEvent('UPLOAD_DOCUMENT', `doc:${newDocument.id} (${newDocument.codigo})`, creator);
    
    return simulateDelay(newDocument);
  },

  updateDocument: (docId: string, data: Partial<Omit<Document, 'id'>>, actor: User): Promise<Document> => {
    const docIndex = documents.findIndex(d => d.id === docId);
    if (docIndex !== -1) {
        const originalDoc = { ...documents[docIndex] };
        let updatedData = { ...data };

        if (data.responsableId && data.responsableId !== originalDoc.responsableId) {
            const newResponsible = users.find(u => u.id === data.responsableId);
            if(newResponsible) {
                updatedData.responsableNombre = newResponsible.nombre;
            }
        }
        
        documents[docIndex] = { ...documents[docIndex], ...updatedData };
        
        if (!data.fechaRevision) {
            documents[docIndex].fechaRevision = new Date().toISOString().split('T')[0];
        }

        if (!documents[docIndex].historial) {
            documents[docIndex].historial = [];
        }
        
        documents[docIndex].historial!.unshift({
            id: `hist-${Date.now()}`,
            fecha: new Date().toISOString(),
            autor: actor.nombre,
            version: documents[docIndex].version,
            cambios: 'Propiedades del documento actualizadas.'
        });
        
        return simulateDelay(documents[docIndex]);
    }
    return Promise.reject(new Error("Documento no encontrado"));
  },

  getUsers: (): Promise<User[]> => {
    return simulateDelay(users);
  },

  getProveedores: (): Promise<Contacto[]> => {
    return simulateDelay(contactos.filter(c => c.tipo === 'PROVEEDOR'));
  },

  getProveedor: (id: string): Promise<Contacto | undefined> => {
    const proveedor = contactos.find(c => c.id === id && c.tipo === 'PROVEEDOR');
    return simulateDelay(proveedor);
  },

  getOrdenCompra: (id: string): Promise<OrdenCompra | undefined> => {
    const orden = ordenesCompra.find(oc => oc.id === id);
    return simulateDelay(orden);
  },

  createOrdenCompra: async (ordenData: Omit<OrdenCompra, 'id' | 'numero' | 'documentoId_link'>, creator: User): Promise<OrdenCompra> => {
    const today = new Date().toISOString().split('T')[0];
    const newOrdenId = `oc-${Date.now()}`;
    const newNumero = `OC-${String(ordenesCompra.length + 1).padStart(4, '0')}`;
    const proveedor = contactos.find(c => c.id === ordenData.proveedorId);

    const newDocument = await api.addDocument({
        nombre: `Orden de Compra ${newNumero} - ${proveedor?.razonSocial || ''}`,
        codigo: `FOR-APO-OC-${newNumero}`,
        tipo: DocumentType.FORMATO,
        proceso: ProcessType.APOYO,
        subproceso: 'Compras',
        responsableId: creator.id,
    }, creator);

    const newOrdenCompra: OrdenCompra = {
        id: newOrdenId,
        numero: newNumero,
        fecha: today,
        ...ordenData,
        documentoId_link: newDocument.id,
    };
    ordenesCompra.unshift(newOrdenCompra);

    const docIndex = documents.findIndex(d => d.id === newDocument.id);
    if (docIndex !== -1) {
        documents[docIndex].vinculos = {
            formId: newOrdenId,
            formType: 'OrdenCompra'
        };
    }

    return simulateDelay(newOrdenCompra);
  },

  // Cotizaciones APIs
  getClientes: (): Promise<Contacto[]> => {
    return simulateDelay(contactos.filter(c => c.tipo === 'CLIENTE'));
  },

  getCliente: (id: string): Promise<Contacto | undefined> => {
    const cliente = contactos.find(c => c.id === id && c.tipo === 'CLIENTE');
    return simulateDelay(cliente);
  },

  getCotizaciones: (): Promise<Cotizacion[]> => {
    return simulateDelay(cotizaciones);
  },

  getCotizacion: (id: string): Promise<Cotizacion | undefined> => {
    const cot = cotizaciones.find(c => c.id === id);
    return simulateDelay(cot);
  },

  createCotizacion: async (cotData: Omit<Cotizacion, 'id' | 'numero' | 'documentoId_link'>, creator: User): Promise<Cotizacion> => {
    const today = new Date().toISOString().split('T')[0];
    const newCotId = `cot-${Date.now()}`;
    const newNumero = `COT-${String(cotizaciones.length + 1).padStart(4, '0')}`;
    const cliente = contactos.find(c => c.id === cotData.clienteId);

    const newDocument = await api.addDocument({
      nombre: `Cotización ${newNumero} - ${cliente?.razonSocial || 'Cliente'}`,
      codigo: `FOR-MIS-${newNumero}`,
      tipo: DocumentType.FORMATO,
      proceso: ProcessType.MISIONAL,
      responsableId: creator.id,
    }, creator);

    const newCotizacion: Cotizacion = {
      id: newCotId,
      numero: newNumero,
      fecha: today,
      ...cotData,
      documentoId_link: newDocument.id,
    };
    cotizaciones.unshift(newCotizacion);

    const docIndex = documents.findIndex(d => d.id === newDocument.id);
    if (docIndex !== -1) {
      documents[docIndex].vinculos = {
        formId: newCotId,
        formType: 'Cotizacion'
      };
    }

    logAuditEvent('COTIZACION_CREATE', `cotizacion:${newNumero} (${cliente?.razonSocial})`, creator);
    return simulateDelay(newCotizacion);
  },

  // Dotación APIs (Apoyo - Gestión Humana)
  getDotaciones: (): Promise<Dotacion[]> => {
    return simulateDelay(dotaciones);
  },

  getDotacion: (id: string): Promise<Dotacion | undefined> => {
    const dot = dotaciones.find(d => d.id === id);
    return simulateDelay(dot);
  },

  createDotacion: async (dotacionData: Omit<Dotacion, 'id' | 'numero' | 'documentoId_link'>, creator: User): Promise<Dotacion> => {
    const today = new Date().toISOString().split('T')[0];
    const newDotId = `dot-${Date.now()}`;
    const newNumero = `DOT-${String(dotaciones.length + 1).padStart(4, '0')}`;

    const newDocument = await api.addDocument({
      nombre: `Entrega de Dotación ${newNumero} - ${dotacionData.colaboradorNombre}`,
      codigo: `FOR-APO-${newNumero}`,
      tipo: DocumentType.FORMATO,
      proceso: ProcessType.APOYO,
      subproceso: 'Gestión Humana',
      responsableId: creator.id,
    }, creator);

    const newDotacion: Dotacion = {
      id: newDotId,
      numero: newNumero,
      fecha: today,
      ...dotacionData,
      documentoId_link: newDocument.id,
    };
    dotaciones.unshift(newDotacion);

    const docIndex = documents.findIndex(d => d.id === newDocument.id);
    if (docIndex !== -1) {
      documents[docIndex].vinculos = {
        formId: newDotId,
        formType: 'Dotacion'
      };
    }

    logAuditEvent('DOTACION_CREATE', `dotacion:${newNumero} (${dotacionData.colaboradorNombre})`, creator);
    return simulateDelay(newDotacion);
  },

  // KPI Management APIs
  addKPI: (kpiData: Omit<KPI, 'id' | 'responsableNombre'>, actor: User): Promise<KPI> => {
    const responsable = users.find(u => u.id === kpiData.responsableId);
    const newKpi: KPI = {
      id: `kpi-${Date.now()}`,
      ...kpiData,
      responsableNombre: responsable?.nombre || actor.nombre,
    };
    kpis.push(newKpi);
    logAuditEvent('KPI_CREATE', `kpi:${newKpi.nombre}`, actor);
    return simulateDelay(newKpi);
  },

  deleteKPI: (kpiId: string, actor: User): Promise<void> => {
    const index = kpis.findIndex(k => k.id === kpiId);
    if (index !== -1) {
      const deleted = kpis.splice(index, 1)[0];
      logAuditEvent('KPI_DELETE', `kpi:${deleted.nombre}`, actor);
    }
    return simulateDelay(undefined);
  },

  // Document Versioning APIs
  createNewDocumentVersion: async (docId: string, actor: User, changeNote: string): Promise<Document> => {
    const docIndex = documents.findIndex(d => d.id === docId);
    if (docIndex === -1) throw new Error("Documento no encontrado");
    
    const currentDoc = documents[docIndex];
    const newVersion = currentDoc.version + 1;
    
    if (!currentDoc.historial) {
      currentDoc.historial = [];
    }

    currentDoc.historial.unshift({
      id: `hist-${Date.now()}`,
      fecha: new Date().toISOString(),
      autor: actor.nombre,
      version: currentDoc.version,
      cambios: changeNote || `Cierre de versión ${currentDoc.version}. Iniciada nueva versión ${newVersion}.`
    });

    currentDoc.version = newVersion;
    currentDoc.estado = DocumentStatus.BORRADOR;
    currentDoc.fechaRevision = new Date().toISOString().split('T')[0];
    
    logAuditEvent('DOCUMENT_NEW_VERSION', `document:${currentDoc.codigo} (v${newVersion})`, actor);
    return simulateDelay(currentDoc);
  },

  // Tenant Specific APIs
  getTenantById: (tenantId: string): Promise<Tenant | undefined> => {
    const tenant = tenants.find(t => t.id === tenantId);
    return simulateDelay(tenant);
  },

  getTenantUsers: (tenantId: string): Promise<User[]> => {
    const tenantUsers = users.filter(u => u.tenantId === tenantId);
    return simulateDelay(tenantUsers);
  },

  addTenantUser: (tenantId: string, userData: { email: string; nombre: string; roleName: string }, actor: User): Promise<User> => {
    const targetRole = roles.find(r => r.name === userData.roleName) || roles[2]; // Default to editor
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: userData.email,
      nombre: userData.nombre,
      role: targetRole,
      tenantId: tenantId,
      activo: true,
    };
    users.push(newUser);

    // Update tenant userCount
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
      tenant.userCount = users.filter(u => u.tenantId === tenantId).length;
    }

    logAuditEvent('USER_CREATE', `user:${newUser.email} en tenant:${tenantId}`, actor);
    return simulateDelay(newUser);
  },

  toggleUserStatus: (userId: string, actor: User): Promise<User> => {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("Usuario no encontrado");
    users[userIndex].activo = !users[userIndex].activo;
    logAuditEvent('USER_STATUS_CHANGE', `user:${users[userIndex].email} activo:${users[userIndex].activo}`, actor);
    return simulateDelay(users[userIndex]);
  },

  getTenantAuditLogs: (tenantId: string): Promise<AuditLog[]> => {
    // Return logs matching this tenant or global logs pertinent to it
    const tenantLogs = auditLogs.filter(log => log.resource.includes(tenantId));
    return simulateDelay(tenantLogs);
  },

  isSubdomainTaken: (subdomain: string): Promise<boolean> => {
    return simulateDelay(tenants.some(t => t.subdominio === subdomain));
  },
  createTenant: (
    tenantData: Omit<Tenant, 'id' | 'fechaCreacion' | 'userCount' | 'storageUsed' | 'estado' | 'userLimit' | 'storageLimit' | 'planNombre'>, 
    adminData: Omit<User, 'id' | 'role' | 'tenantId' | 'activo'>,
    actor: User
  ): Promise<Tenant> => {
    const selectedPlan = plans.find(p => p.id === tenantData.planId);
    if (!selectedPlan) return Promise.reject(new Error("Plan not found"));

    const newTenantId = `tenant-${tenantData.subdominio}`;
    
    const newTenant: Tenant = {
      id: newTenantId,
      nombre: tenantData.nombre,
      subdominio: tenantData.subdominio,
      planId: tenantData.planId,
      planNombre: selectedPlan.nombre,
      fechaCreacion: new Date().toISOString().split('T')[0],
      userCount: 1,
      storageUsed: 0,
      estado: 'Activo',
      userLimit: selectedPlan.userLimit,
      storageLimit: selectedPlan.storageLimit,
    };
    tenants.push(newTenant);

    const adminRole = roles.find(r => r.name === 'ADMIN');
    if (!adminRole) return Promise.reject(new Error("Admin role not found"));

    const newAdmin: User = {
      id: `user-${Date.now()}`,
      ...adminData,
      role: adminRole,
      tenantId: newTenantId,
      activo: true,
    };
    users.push(newAdmin);
    
    logAuditEvent('TENANT_CREATE', `tenant:${newTenant.id} (${newTenant.nombre})`, actor);

    return simulateDelay(newTenant);
  },
  updateTenant: (tenantId: string, data: Partial<Pick<Tenant, 'nombre' | 'userLimit' | 'storageLimit'> & { planId: string }>): Promise<Tenant> => {
    const tenantIndex = tenants.findIndex(t => t.id === tenantId);
    if (tenantIndex !== -1) {
        if (data.planId) {
            const newPlan = plans.find(p => p.id === data.planId);
            if (newPlan) {
                tenants[tenantIndex].planId = newPlan.id;
                tenants[tenantIndex].planNombre = newPlan.nombre;
                // Optionally update limits when plan changes
                tenants[tenantIndex].userLimit = newPlan.userLimit;
                tenants[tenantIndex].storageLimit = newPlan.storageLimit;
            }
        }
        tenants[tenantIndex] = { ...tenants[tenantIndex], ...data };
        return simulateDelay(tenants[tenantIndex]);
    }
    return Promise.reject(new Error("Tenant not found"));
  },
  updateTenantStatus: (tenantId: string, estado: Tenant['estado']): Promise<Tenant> => {
    const tenantIndex = tenants.findIndex(t => t.id === tenantId);
    if (tenantIndex !== -1) {
      tenants[tenantIndex].estado = estado;
      return simulateDelay(tenants[tenantIndex]);
    }
    return Promise.reject(new Error("Tenant not found"));
  },
  deleteTenant: (tenantId: string): Promise<void> => {
    tenants = tenants.filter(t => t.id !== tenantId);
    return simulateDelay(undefined);
  },
  getTenantAdmin: (tenantId: string): Promise<User | undefined> => {
    const admin = users.find(u => u.tenantId === tenantId && u.role.name === 'ADMIN');
    return simulateDelay(admin);
  },
  getPlatformSettings: (): Promise<typeof platformSettings> => {
    const settingsToSend = {
      smtp: { ...platformSettings.smtp, pass: '********' },
      stripe: { ...platformSettings.stripe, secretKey: '********' }
    };
    return simulateDelay(settingsToSend);
  },
  updateSmtpSettings: (smtpData: typeof platformSettings.smtp): Promise<void> => {
     if (smtpData.pass && smtpData.pass !== '********') {
        platformSettings.smtp.pass = smtpData.pass;
     }
     platformSettings.smtp.host = smtpData.host;
     platformSettings.smtp.port = smtpData.port;
     platformSettings.smtp.user = smtpData.user;
     return simulateDelay(undefined);
  },
  updateStripeSettings: (stripeData: typeof platformSettings.stripe): Promise<void> => {
    if (stripeData.secretKey && stripeData.secretKey !== '********') {
        platformSettings.stripe.secretKey = stripeData.secretKey;
    }
    platformSettings.stripe.publicKey = stripeData.publicKey;
    return simulateDelay(undefined);
  },

  // Role Management APIs
  getRoles: (): Promise<Role[]> => simulateDelay(roles),
  getAllPermissions: (): Promise<Permission[]> => simulateDelay(ALL_PERMISSIONS),
  createRole: (roleData: Omit<Role, 'id' | 'isDefault'>, actor: User): Promise<Role> => {
      const newRole: Role = {
          id: `role-custom-${Date.now()}`,
          ...roleData,
          isDefault: false,
      };
      roles.push(newRole);
      logAuditEvent('ROLE_CREATE', `role:${newRole.id} (${newRole.name})`, actor);
      return simulateDelay(newRole);
  },
  updateRole: (roleId: string, roleData: Partial<Role>, actor: User): Promise<Role> => {
      const roleIndex = roles.findIndex(r => r.id === roleId);
      if (roleIndex !== -1) {
          const existing = roles[roleIndex];
          // Keep SUPERADMIN name fixed to prevent breaking platform-level permissions, but allow editing other role names
          const targetName = existing.id === 'role-superadmin' ? 'SUPERADMIN' : (roleData.name || existing.name);
          const updatedRole: Role = {
              ...existing,
              ...roleData,
              id: existing.id,
              isDefault: existing.isDefault,
              name: targetName.trim(),
              description: (roleData.description !== undefined ? roleData.description : existing.description).trim(),
              permissions: roleData.permissions || existing.permissions,
          };
          roles[roleIndex] = updatedRole;

          // Synchronize any active user assigned to this role so changes take effect immediately
          users.forEach(u => {
              if (u.role.id === roleId) {
                  u.role = updatedRole;
              }
          });

          logAuditEvent('ROLE_UPDATE', `rol:${roleId} (${updatedRole.name})`, actor);
          return simulateDelay(updatedRole);
      }
      return Promise.reject(new Error("Rol no encontrado."));
  },
  deleteRole: (roleId: string, actor: User): Promise<void> => {
      const roleIndex = roles.findIndex(r => r.id === roleId);
      if (roleIndex !== -1) {
          if (roles[roleIndex].isDefault) {
              return Promise.reject(new Error("Cannot delete default role."));
          }
          const roleToDelete = roles[roleIndex];
          // Check if any user is using this role
          const isRoleInUse = users.some(u => u.role.id === roleId);
          if (isRoleInUse) {
              return Promise.reject(new Error("Cannot delete role, it is currently assigned to one or more users."));
          }
          roles.splice(roleIndex, 1);
          logAuditEvent('ROLE_DELETE', `role:${roleId} (${roleToDelete.name})`, actor);
          return simulateDelay(undefined);
      }
      return Promise.reject(new Error("Role not found."));
  },

  // New APIs for SuperAdmin
  getPlans: (): Promise<Plan[]> => simulateDelay(plans),
  createPlan: (planData: Omit<Plan, 'id'>, actor: User): Promise<Plan> => {
    const newPlan: Plan = { id: `plan-${Date.now()}`, ...planData };
    plans.push(newPlan);
    logAuditEvent('PLAN_CREATE', `plan:${newPlan.id} (${newPlan.nombre})`, actor);
    return simulateDelay(newPlan);
  },
  updatePlan: (planId: string, planData: Omit<Plan, 'id'>, actor: User): Promise<Plan> => {
    const planIndex = plans.findIndex(p => p.id === planId);
    if (planIndex !== -1) {
      const updatedPlan = { ...plans[planIndex], ...planData };
      plans[planIndex] = updatedPlan;
      logAuditEvent('PLAN_UPDATE', `plan:${planId} (${updatedPlan.nombre})`, actor);
      return simulateDelay(updatedPlan);
    }
    return Promise.reject(new Error("Plan not found"));
  },
  getTemplates: (): Promise<Template[]> => simulateDelay(templates),
  uploadTemplate: (templateData: Omit<Template, 'id' | 'fileUrl' | 'lastUpdated' | 'version'>, actor: User): Promise<Template> => {
    const newTemplate: Template = {
      id: `tpl-${Date.now()}`,
      ...templateData,
      version: 1,
      lastUpdated: new Date().toISOString().split('T')[0],
      fileUrl: '#', // Placeholder
    };
    templates.push(newTemplate);
    logAuditEvent('TEMPLATE_CREATE', `template:${newTemplate.id} (${newTemplate.nombre})`, actor);
    return simulateDelay(newTemplate);
  },
  updateTemplate: (templateId: string, templateData: Partial<Omit<Template, 'id' | 'fileUrl' | 'lastUpdated' | 'version'>> & { newFile?: boolean }, actor: User): Promise<Template> => {
    const templateIndex = templates.findIndex(t => t.id === templateId);
    if (templateIndex !== -1) {
      const { newFile, ...dataToUpdate } = templateData;
      const updatedTemplate = { ...templates[templateIndex], ...dataToUpdate };
      updatedTemplate.lastUpdated = new Date().toISOString().split('T')[0];
      
      if (newFile) {
        updatedTemplate.version += 1;
        // In a real scenario, we'd update the fileUrl here after uploading to storage
      }
      
      templates[templateIndex] = updatedTemplate;
      logAuditEvent('TEMPLATE_UPDATE', `template:${templateId} (${updatedTemplate.nombre})`, actor);
      return simulateDelay(updatedTemplate);
    }
    return Promise.reject(new Error("Template not found"));
  },
  getAuditLogs: (): Promise<AuditLog[]> => simulateDelay(auditLogs),
  getPlatformStats: (): Promise<{ mrr: number; activeTenants: number; totalUsers: number; }> => {
    const activeTenants = tenants.filter(t => t.estado === 'Activo');
    const mrr = activeTenants.reduce((total, tenant) => {
        const plan = plans.find(p => p.id === tenant.planId);
        return total + (plan?.precio || 0);
    }, 0);
    const totalUsers = users.filter(u => u.role.name !== 'SUPERADMIN' && u.activo).length;
    return simulateDelay({
        mrr,
        activeTenants: activeTenants.length,
        totalUsers,
    });
  },
};