export type Permission = 
  // Platform
  'platform:access' |
  'platform:manage_tenants' |
  'platform:manage_plans' |
  'platform:manage_roles' |
  'platform:view_audit_log' |

  // Tenant
  'tenant:admin' |
  'tenant:view_master_list' |
  'tenant:manage_users' |

  // Documents
  'document:create' |
  'document:update' | // Can edit any document from master list
  'document:publish' | // Can approve, set to 'Vigente', or 'Obsoleto'
  'document:submit' | // Can send 'Borrador' to 'En Revisión'
  'document:download' |
  'document:view_all' | // Can see drafts, etc.
  'document:view_published' | // Can only see 'Vigente'

  // KPIs
  'kpi:manage' |
  'kpi:read' |
  
  // Forms
  'form:create';

export interface PermissionDetail {
  label: string;
  descripcion: string;
  categoria: 'Plataforma' | 'Administración de Organización' | 'Gestión Documental' | 'Indicadores (KPIs)' | 'Formularios';
}

export const PERMISSION_METADATA: Record<Permission, PermissionDetail> = {
  // Plataforma
  'platform:access': {
    label: 'Acceso a Plataforma Superadmin',
    descripcion: 'Permite acceder a la administración global de todos los tenants y servicios.',
    categoria: 'Plataforma'
  },
  'platform:manage_tenants': {
    label: 'Gestionar Organizaciones (Tenants)',
    descripcion: 'Crear, editar, suspender y administrar empresas clientes.',
    categoria: 'Plataforma'
  },
  'platform:manage_plans': {
    label: 'Gestionar Planes de Suscripción',
    descripcion: 'Configurar tarifas, cuotas de usuarios y almacenamiento en nube.',
    categoria: 'Plataforma'
  },
  'platform:manage_roles': {
    label: 'Gestionar Roles y Permisos',
    descripcion: 'Crear, modificar y asignar roles de seguridad en la plataforma.',
    categoria: 'Plataforma'
  },
  'platform:view_audit_log': {
    label: 'Consultar Auditoría Global',
    descripcion: 'Revisar el registro de actividad y trazabilidad de toda la plataforma.',
    categoria: 'Plataforma'
  },

  // Tenant
  'tenant:admin': {
    label: 'Administrador de Organización',
    descripcion: 'Configuración corporativa, cuotas de consumo y perfil de empresa.',
    categoria: 'Administración de Organización'
  },
  'tenant:view_master_list': {
    label: 'Ver Listado Maestro',
    descripcion: 'Acceso centralizado para buscar y gestionar todos los documentos.',
    categoria: 'Administración de Organización'
  },
  'tenant:manage_users': {
    label: 'Gestionar Miembros de Equipo',
    descripcion: 'Invitar usuarios a la organización y habilitar o deshabilitar sus accesos.',
    categoria: 'Administración de Organización'
  },

  // Documentos
  'document:create': {
    label: 'Crear Documentos y Versiones',
    descripcion: 'Subir borradores de documentos y generar nuevas versiones de trabajo.',
    categoria: 'Gestión Documental'
  },
  'document:update': {
    label: 'Editar Propiedades de Documentos',
    descripcion: 'Modificar metadatos, responsables y fechas de vigencia en el listado maestro.',
    categoria: 'Gestión Documental'
  },
  'document:publish': {
    label: 'Aprobar y Publicar Documentos',
    descripcion: 'Aprobar revisiones, publicar versiones vigentes y declarar obsolescencia.',
    categoria: 'Gestión Documental'
  },
  'document:submit': {
    label: 'Enviar Documentos a Revisión',
    descripcion: 'Trasladar borradores al flujo de aprobación del comité de calidad.',
    categoria: 'Gestión Documental'
  },
  'document:download': {
    label: 'Descargar Documentos Controlados',
    descripcion: 'Exportar copias oficiales en formato estándar de calidad ISO.',
    categoria: 'Gestión Documental'
  },
  'document:view_all': {
    label: 'Ver Documentos en Cualquier Estado',
    descripcion: 'Visualizar documentos en borrador, en revisión y obsoletos.',
    categoria: 'Gestión Documental'
  },
  'document:view_published': {
    label: 'Ver Solo Documentos Vigentes',
    descripcion: 'Acceso restringido únicamente a los documentos oficiales aprobados.',
    categoria: 'Gestión Documental'
  },

  // KPIs
  'kpi:manage': {
    label: 'Gestionar Indicadores (KPIs)',
    descripcion: 'Crear, definir metas, periodicidad y eliminar indicadores de calidad.',
    categoria: 'Indicadores (KPIs)'
  },
  'kpi:read': {
    label: 'Consultar Indicadores (KPIs)',
    descripcion: 'Visualizar tableros de control y cumplimiento de metas del proceso.',
    categoria: 'Indicadores (KPIs)'
  },

  // Formularios
  'form:create': {
    label: 'Diligenciar Formularios Oficiales',
    descripcion: 'Crear cotizaciones comerciales, órdenes de compra y actas de dotación/EPP.',
    categoria: 'Formularios'
  }
};


export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isDefault?: boolean;
}

export interface User {
  id: string;
  email: string;
  nombre: string;
  role: Role;
  tenantId?: string;
  activo: boolean;
}

export interface Plan {
  id: string;
  nombre: string;
  precio: number;
  userLimit: number;
  storageLimit: number; // in GB
  descripcion: string;
}

export interface Tenant {
  id: string;
  nombre: string;
  subdominio: string;
  planId: string; // Changed from Plan (string) to planId
  planNombre: string;
  estado: 'Activo' | 'Suspendido' | 'Prueba';
  fechaCreacion: string;
  userCount: number;
  storageUsed: number; // in GB
  userLimit: number;
  storageLimit: number; // in GB
}

export enum ProcessType {
  ESTRATEGICO = 'Estratégico',
  MISIONAL = 'Misional',
  APOYO = 'Apoyo',
  CONTROL = 'Control-Calidad',
}

export enum DocumentType {
  MANUAL = 'Manual',
  PROCEDIMIENTO = 'Procedimiento',
  INSTRUCTIVO = 'Instructivo',
  FORMATO = 'Formato',
  POLITICA = 'Política',
  ACTA = 'Acta',
}

export enum DocumentStatus {
  BORRADOR = 'Borrador',
  REVISION = 'En Revisión',
  APROBADO = 'Aprobado',
  VIGENTE = 'Vigente',
  OBSOLETO = 'Obsoleto',
}

export interface DocumentoHistorial {
  id: string;
  fecha: string;
  autor: string;
  version: number;
  cambios: string;
}

export interface Document {
  id: string;
  codigo: string;
  nombre: string;
  proceso: ProcessType;
  subproceso?: string;
  tipo: DocumentType;
  version: number;
  estado: DocumentStatus;
  responsableId: string;
  responsableNombre: string;
  fechaEmision: string;
  fechaRevision: string;
  archivoUrl: string;
  vinculos?: {
    kpiIds?: string[];
    formId?: string;
    formType?: 'Cotizacion' | 'OrdenCompra' | 'Dotacion';
  };
  historial?: DocumentoHistorial[];
}

export interface KPI {
    id: string;
    nombre: string;
    unidad: string;
    meta: number;
    valorActual?: number;
    formula?: string;
    tendencia?: 'subiendo' | 'bajando' | 'estable';
    periodicidad: 'Diario' | 'Semanal' | 'Mensual' | 'Anual';
    proceso: ProcessType;
    subproceso?: string;
    responsableId: string;
    responsableNombre: string;
}

export interface Contacto {
  id: string;
  tipo: 'CLIENTE' | 'PROVEEDOR';
  rut_nit: string;
  razonSocial: string;
  email: string;
}

export interface OrdenCompraItem {
  id: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
}

export interface OrdenCompra {
  id: string;
  numero: string;
  proveedorId: string;
  fecha: string;
  items: OrdenCompraItem[];
  subtotal: number;
  impuestos: number;
  total: number;
  condiciones: string;
  centroCosto: string;
  documentoId_link?: string;
}

export interface CotizacionItem {
  id: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
}

export interface Cotizacion {
  id: string;
  numero: string;
  clienteId: string;
  fecha: string;
  vigencia: string;
  items: CotizacionItem[];
  subtotal: number;
  impuestos: number;
  total: number;
  condiciones: string;
  documentoId_link?: string;
}

export interface DotacionItem {
  id: string;
  elemento: string;
  talla: string;
  cantidad: number;
  estadoEntrega: 'Nuevo' | 'Reposición';
}

export interface Dotacion {
  id: string;
  numero: string;
  colaboradorNombre: string;
  colaboradorCedula: string;
  cargo: string;
  fecha: string;
  items: DotacionItem[];
  observaciones: string;
  documentoId_link?: string;
}

export type TemplateType = 'COTIZACION' | 'ORDEN_COMPRA' | 'DOTACION';

export interface Template {
    id: string;
    nombre: string;
    tipo: TemplateType;
    version: number;
    lastUpdated: string;
    fileUrl: string;
}

export interface AuditLog {
    id: number;
    actor: string;
    action: string;
    resource: string;
    timestamp: string;
}