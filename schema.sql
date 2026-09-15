-- =====================================================================
-- ESQUEMA DE BASE DE DATOS - ERP ISO 9000 GESTIÓN
-- Compatible con PostgreSQL, SQLite y MySQL (ANSI SQL Estándar)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. PLANES DE SUSCRIPCIÓN (Nivel Plataforma)
-- ---------------------------------------------------------------------
CREATE TABLE plans (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    user_limit INT NOT NULL DEFAULT 5,
    storage_limit INT NOT NULL DEFAULT 1, -- en GB
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 2. INQUILINOS / CLIENTES MULTITENANT
-- ---------------------------------------------------------------------
CREATE TABLE tenants (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    subdominio VARCHAR(100) NOT NULL UNIQUE,
    plan_id VARCHAR(50) NOT NULL REFERENCES plans(id) ON UPDATE CASCADE,
    estado VARCHAR(20) NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Suspendido', 'Prueba')),
    user_count INT NOT NULL DEFAULT 0,
    storage_used NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
    user_limit INT NOT NULL DEFAULT 5,
    storage_limit INT NOT NULL DEFAULT 1,
    fecha_creacion DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 3. ROLES Y PERMISOS (RBAC)
-- ---------------------------------------------------------------------
CREATE TABLE roles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
    id VARCHAR(100) PRIMARY KEY,
    description TEXT
);

CREATE TABLE role_permissions (
    role_id VARCHAR(50) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id VARCHAR(100) NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- ---------------------------------------------------------------------
-- 4. USUARIOS
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255),
    role_id VARCHAR(50) NOT NULL REFERENCES roles(id) ON UPDATE CASCADE,
    tenant_id VARCHAR(50) REFERENCES tenants(id) ON DELETE CASCADE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 5. GESTIÓN DOCUMENTAL ISO 9001
-- ---------------------------------------------------------------------
CREATE TABLE documents (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(id) ON DELETE CASCADE,
    codigo VARCHAR(50) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    proceso VARCHAR(50) NOT NULL CHECK (proceso IN ('Estratégico', 'Misional', 'Apoyo', 'Control-Calidad')),
    subproceso VARCHAR(100),
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('Manual', 'Procedimiento', 'Formato', 'Política', 'Acta')),
    version INT NOT NULL DEFAULT 1,
    estado VARCHAR(30) NOT NULL DEFAULT 'Borrador' CHECK (estado IN ('Borrador', 'En Revisión', 'Aprobado', 'Vigente', 'Obsoleto')),
    responsable_id VARCHAR(50) NOT NULL REFERENCES users(id),
    fecha_emision DATE NOT NULL,
    fecha_revision DATE NOT NULL,
    archivo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE document_history (
    id VARCHAR(50) PRIMARY KEY,
    document_id VARCHAR(50) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    fecha TIMESTAMP NOT NULL,
    autor VARCHAR(150) NOT NULL,
    version INT NOT NULL,
    cambios TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 6. INDICADORES DE GESTIÓN (KPIS)
-- ---------------------------------------------------------------------
CREATE TABLE kpis (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    unidad VARCHAR(50) NOT NULL,
    meta NUMERIC(10, 2) NOT NULL,
    periodicidad VARCHAR(20) NOT NULL CHECK (periodicidad IN ('Diario', 'Semanal', 'Mensual', 'Anual')),
    proceso VARCHAR(50) NOT NULL,
    subproceso VARCHAR(100),
    responsable_id VARCHAR(50) NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE document_kpi_links (
    document_id VARCHAR(50) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    kpi_id VARCHAR(50) NOT NULL REFERENCES kpis(id) ON DELETE CASCADE,
    PRIMARY KEY (document_id, kpi_id)
);

-- ---------------------------------------------------------------------
-- 7. CONTACTOS (CLIENTES Y PROVEEDORES)
-- ---------------------------------------------------------------------
CREATE TABLE contactos (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('CLIENTE', 'PROVEEDOR')),
    rut_nit VARCHAR(50) NOT NULL,
    razon_social VARCHAR(200) NOT NULL,
    email VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 8. ÓRDENES DE COMPRA
-- ---------------------------------------------------------------------
CREATE TABLE ordenes_compra (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(id) ON DELETE CASCADE,
    numero VARCHAR(50) NOT NULL UNIQUE,
    proveedor_id VARCHAR(50) NOT NULL REFERENCES contactos(id),
    fecha DATE NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    impuestos NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    condiciones TEXT,
    centro_costo VARCHAR(100),
    documento_id_link VARCHAR(50) REFERENCES documents(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orden_compra_items (
    id VARCHAR(50) PRIMARY KEY,
    orden_id VARCHAR(50) NOT NULL REFERENCES ordenes_compra(id) ON DELETE CASCADE,
    descripcion VARCHAR(255) NOT NULL,
    cantidad NUMERIC(10, 2) NOT NULL DEFAULT 1,
    precio_unitario NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0.00
);

-- ---------------------------------------------------------------------
-- 9. COTIZACIONES COMERCIALES
-- ---------------------------------------------------------------------
CREATE TABLE cotizaciones (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(id) ON DELETE CASCADE,
    numero VARCHAR(50) NOT NULL UNIQUE,
    cliente_id VARCHAR(50) NOT NULL REFERENCES contactos(id),
    fecha DATE NOT NULL,
    vigencia VARCHAR(100) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    impuestos NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    condiciones TEXT,
    documento_id_link VARCHAR(50) REFERENCES documents(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cotizacion_items (
    id VARCHAR(50) PRIMARY KEY,
    cotizacion_id VARCHAR(50) NOT NULL REFERENCES cotizaciones(id) ON DELETE CASCADE,
    descripcion VARCHAR(255) NOT NULL,
    cantidad NUMERIC(10, 2) NOT NULL DEFAULT 1,
    precio_unitario NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0.00
);

-- ---------------------------------------------------------------------
-- 10. PLANTILLAS GLOBALES
-- ---------------------------------------------------------------------
CREATE TABLE templates (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('COTIZACION', 'ORDEN_COMPRA', 'DOTACION')),
    version INT NOT NULL DEFAULT 1,
    last_updated DATE NOT NULL,
    file_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- 11. REGISTRO DE AUDITORÍA
-- ---------------------------------------------------------------------
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    actor VARCHAR(150) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- ÍNDICES DE RENDIMIENTO RECOMENDADOS
-- =====================================================================
CREATE INDEX idx_documents_tenant_proceso ON documents(tenant_id, proceso);
CREATE INDEX idx_documents_codigo ON documents(codigo);
CREATE INDEX idx_documents_estado ON documents(estado);
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_kpis_tenant_proceso ON kpis(tenant_id, proceso);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);