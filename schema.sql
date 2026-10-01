-- ==============================================================================
-- CeCIP Paraná - Esquema Oficial de Base de Datos PostgreSQL / Supabase
-- Sistema ERP + Portal Web Institucional V1 Productivo
-- ==============================================================================

-- Habilitar extensión para generación de identificadores UUID v4
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. TABLA: usuarios (Administración y Permisos RBAC)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE,
  nombre VARCHAR(120) NOT NULL,
  apellido VARCHAR(120) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  rol VARCHAR(50) NOT NULL CHECK (rol IN ('Administrador General', 'Tesorería', 'Atención al Socio', 'Gerencia')),
  estado VARCHAR(30) NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo', 'Suspendido')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 2. TABLA: socios (Padrón Central de Asociados)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS socios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  razon_social VARCHAR(255) NOT NULL,
  nombre_comercial VARCHAR(255) NOT NULL,
  cuit VARCHAR(30) NOT NULL UNIQUE,
  rubro VARCHAR(150) NOT NULL,
  categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('Pequeño Comercio', 'Mediana Empresa', 'Gran Industria', 'Servicios')),
  estado VARCHAR(30) NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo', 'Pendiente')),
  direccion VARCHAR(255) NOT NULL,
  localidad VARCHAR(120) NOT NULL DEFAULT 'Paraná',
  provincia VARCHAR(120) NOT NULL DEFAULT 'Entre Ríos',
  email VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(50) NOT NULL,
  web VARCHAR(255),
  redes_sociales JSONB DEFAULT '{}'::jsonb,
  observaciones TEXT,
  fecha_alta DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_socios_cuit ON socios(cuit);
CREATE INDEX IF NOT EXISTS idx_socios_estado ON socios(estado);
CREATE INDEX IF NOT EXISTS idx_socios_rubro ON socios(rubro);

-- ==============================================================================
-- 3. TABLA: socios_timeline (Historial Cronológico de Vida del Socio)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS socios_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  socio_id UUID NOT NULL REFERENCES socios(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('crm', 'factura', 'sistema', 'nota', 'evento')),
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  origen_tipo VARCHAR(50),
  origen_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_timeline_socio_id ON socios_timeline(socio_id);
CREATE INDEX IF NOT EXISTS idx_timeline_fecha ON socios_timeline(fecha DESC);

-- ==============================================================================
-- 4. TABLA: facturas_cuotas (Emisión de Cuotas Sociales y Estado de Pagos)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS facturas_cuotas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  socio_id UUID NOT NULL REFERENCES socios(id) ON DELETE CASCADE,
  socio_nombre VARCHAR(255) NOT NULL,
  mes VARCHAR(30) NOT NULL,
  anio INTEGER NOT NULL,
  detalle VARCHAR(255) NOT NULL,
  monto NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  vencimiento DATE NOT NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pagado', 'Pendiente', 'Vencido', 'Mora')),
  fecha_pago DATE,
  recibo_id VARCHAR(50),
  intereses NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  refinanciada BOOLEAN NOT NULL DEFAULT FALSE,
  metodo_pago VARCHAR(50) CHECK (metodo_pago IS NULL OR metodo_pago IN ('Mercado Pago', 'Transferencia', 'Efectivo', 'Tarjeta de Crédito')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_facturas_socio ON facturas_cuotas(socio_id);
CREATE INDEX IF NOT EXISTS idx_facturas_estado ON facturas_cuotas(estado);
CREATE INDEX IF NOT EXISTS idx_facturas_periodo ON facturas_cuotas(anio, mes);

-- ==============================================================================
-- 5. TABLA: tesoreria_movimientos (Libro Diario de Caja y Bancos)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS tesoreria_movimientos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('Ingreso', 'Egreso')),
  detalle VARCHAR(255) NOT NULL,
  monto NUMERIC(12, 2) NOT NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('Cuotas Sociales', 'Sueldos', 'Servicios Públicos', 'Capacitaciones', 'Mantenimiento', 'Eventos', 'Otros')),
  banco VARCHAR(50) NOT NULL CHECK (banco IN ('Banco Entre Ríos', 'Banco Nación', 'Caja Efectiva', 'Mercado Pago Cuenta')),
  conciliado BOOLEAN NOT NULL DEFAULT FALSE,
  factura_id UUID REFERENCES facturas_cuotas(id) ON DELETE SET NULL,
  created_by UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tesoreria_fecha ON tesoreria_movimientos(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_tesoreria_tipo ON tesoreria_movimientos(tipo);
CREATE INDEX IF NOT EXISTS idx_tesoreria_banco ON tesoreria_movimientos(banco);

-- ==============================================================================
-- 6. TABLA: crm_interacciones (Gestión de Contacto Gremial y Asistencia)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS crm_interacciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  socio_id UUID NOT NULL REFERENCES socios(id) ON DELETE CASCADE,
  socio_nombre VARCHAR(255) NOT NULL,
  tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('Llamada', 'Correo', 'Reunión', 'Reclamo', 'Consulta', 'Visita')),
  fecha TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  responsable_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  responsable_nombre VARCHAR(150),
  detalle TEXT NOT NULL,
  remitente VARCHAR(150) NOT NULL,
  recordatorio TIMESTAMP WITH TIME ZONE,
  estado VARCHAR(30) NOT NULL DEFAULT 'Realizado' CHECK (estado IN ('Pendiente', 'Realizado', 'Cancelado')),
  resultado VARCHAR(255),
  proxima_accion TEXT,
  fecha_proxima_accion TIMESTAMP WITH TIME ZONE,
  prioridad VARCHAR(30) DEFAULT 'Normal' CHECK (prioridad IS NULL OR prioridad IN ('Baja', 'Normal', 'Alta', 'Urgente')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_crm_socio ON crm_interacciones(socio_id);
CREATE INDEX IF NOT EXISTS idx_crm_fecha ON crm_interacciones(fecha DESC);

-- ==============================================================================
-- 7. TABLA: eventos_capacitaciones (Cursos, Charlas y Actividades)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS eventos_capacitaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(255) NOT NULL,
  fecha DATE NOT NULL,
  hora VARCHAR(30) NOT NULL,
  lugar VARCHAR(255) NOT NULL,
  cupos_max INTEGER NOT NULL DEFAULT 50,
  descripcion TEXT NOT NULL,
  orador VARCHAR(150) NOT NULL,
  categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('Curso', 'Charla', 'Seminario', 'Reunión de Comisión', 'Muestra', 'Capacitación')),
  banner_url VARCHAR(500),
  color VARCHAR(50) DEFAULT 'bg-cecip-blue',
  border_color VARCHAR(50) DEFAULT 'border-cecip-blue',
  text_color VARCHAR(50) DEFAULT 'text-cecip-blue',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 8. TABLA: inscripciones_eventos (Participantes a Eventos)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS inscripciones_eventos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evento_id UUID NOT NULL REFERENCES eventos_capacitaciones(id) ON DELETE CASCADE,
  nombre_socio VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(50) NOT NULL,
  asistio BOOLEAN NOT NULL DEFAULT FALSE,
  certificado_enviado BOOLEAN NOT NULL DEFAULT FALSE,
  fecha_inscripcion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_inscripciones_evento ON inscripciones_eventos(evento_id);

-- ==============================================================================
-- 9. TABLA: bolsa_cvs (Bolsa de Empleo y Postulaciones)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS bolsa_cvs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(50) NOT NULL,
  area_busqueda VARCHAR(100) NOT NULL,
  tipo_profesional VARCHAR(100) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  fecha_subida TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  comentarios TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cvs_area ON bolsa_cvs(area_busqueda);

-- ==============================================================================
-- 10. TABLA: cv_interes_socios (Empresas Socias Interesadas en Postulantes)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS cv_interes_socios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cv_id UUID NOT NULL REFERENCES bolsa_cvs(id) ON DELETE CASCADE,
  socio_id UUID REFERENCES socios(id) ON DELETE CASCADE,
  socio_nombre VARCHAR(255) NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  estado VARCHAR(50) DEFAULT 'Interesado',
  observacion TEXT,
  UNIQUE(cv_id, socio_nombre)
);

CREATE INDEX IF NOT EXISTS idx_cv_interes ON cv_interes_socios(cv_id);

-- ==============================================================================
-- 11. TABLA: convenios_beneficios (CeCIP Comercia y Alianzas)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS convenios_beneficios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  descuento VARCHAR(100) NOT NULL,
  vigencia_desde DATE,
  vigencia_hasta DATE,
  vigencia_texto VARCHAR(100) DEFAULT 'Vigente',
  categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('Comercios', 'Salud', 'Educación', 'Gastronomía', 'Turismo')),
  imagen_url VARCHAR(500),
  estado VARCHAR(30) DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Pausado', 'Vencido')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 12. TABLA: convenio_socios (Adhesión de Socios a Convenios)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS convenio_socios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  convenio_id UUID NOT NULL REFERENCES convenios_beneficios(id) ON DELETE CASCADE,
  socio_id UUID REFERENCES socios(id) ON DELETE CASCADE,
  socio_nombre VARCHAR(255) NOT NULL,
  fecha_adhesion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  estado VARCHAR(30) DEFAULT 'Adherido',
  UNIQUE(convenio_id, socio_nombre)
);

-- ==============================================================================
-- 13. TABLA: documentos_digitales (Repositorio Oficial)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS documentos_digitales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  carpeta VARCHAR(50) NOT NULL CHECK (carpeta IN ('Actas', 'Balances', 'Contratos', 'Estatutos', 'Reglamentos', 'Prensa')),
  version VARCHAR(50) NOT NULL DEFAULT '1.0',
  fecha_subida TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  tamanio BIGINT NOT NULL DEFAULT 0,
  tamanio_formato VARCHAR(30) DEFAULT '1.0 MB',
  file_path VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100) DEFAULT 'application/pdf',
  creado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  permisos JSONB DEFAULT '["Administrador", "Gerencia"]'::jsonb,
  estado VARCHAR(30) DEFAULT 'Publicado',
  descargas_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 14. TABLA: tickets_mesa_ayuda (Mesa de Soporte al Socio)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS tickets_mesa_ayuda (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  socio_id UUID NOT NULL REFERENCES socios(id) ON DELETE CASCADE,
  socio_nombre VARCHAR(255) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'En proceso', 'Resuelto', 'Cerrado')),
  categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('Facturación', 'Asesoramiento', 'Inscripción Evento', 'Inconveniente Técnico', 'Otros')),
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  ultima_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  sugerencia_ia TEXT,
  asignado_a UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 15. TABLA: ticket_mensajes (Mensajes individuales del Ticket)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS ticket_mensajes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets_mesa_ayuda(id) ON DELETE CASCADE,
  remitente VARCHAR(150) NOT NULL,
  rol VARCHAR(20) NOT NULL CHECK (rol IN ('socio', 'staff', 'ia')),
  texto TEXT NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_mensajes_ticket ON ticket_mensajes(ticket_id);

-- ==============================================================================
-- 16. TABLA: mensajes_contacto (Consultas desde el Portal Web Público)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS mensajes_contacto (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(150) NOT NULL,
  empresa VARCHAR(150),
  telefono VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  respondido BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 17. TABLA: noticias_web (Prensa, Novedades y Comunicados Web)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS noticias_web (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category VARCHAR(100) NOT NULL DEFAULT 'Prensa',
  badge VARCHAR(100) NOT NULL DEFAULT 'Novedad',
  description TEXT NOT NULL,
  additional_info TEXT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  items_list JSONB DEFAULT '[]'::jsonb,
  publicada BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- POLÍTICAS RLS (Row Level Security) EN SUPABASE
-- ==============================================================================
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE socios ENABLE ROW LEVEL SECURITY;
ALTER TABLE socios_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas_cuotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tesoreria_movimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_interacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_capacitaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE bolsa_cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_interes_socios ENABLE ROW LEVEL SECURITY;
ALTER TABLE convenios_beneficios ENABLE ROW LEVEL SECURITY;
ALTER TABLE convenio_socios ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_digitales ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets_mesa_ayuda ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes_contacto ENABLE ROW LEVEL SECURITY;
ALTER TABLE noticias_web ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública para tablas no confidenciales
CREATE POLICY "Lectura publica noticias" ON noticias_web FOR SELECT USING (publicada = TRUE);
CREATE POLICY "Lectura publica eventos" ON eventos_capacitaciones FOR SELECT USING (TRUE);
CREATE POLICY "Lectura publica convenios" ON convenios_beneficios FOR SELECT USING (estado = 'Activo');
CREATE POLICY "Insertar contacto web" ON mensajes_contacto FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Insertar inscripcion web" ON inscripciones_eventos FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Insertar cv publico" ON bolsa_cvs FOR INSERT WITH CHECK (TRUE);

-- Políticas de acceso completo para usuarios autenticados del ERP
CREATE POLICY "Acceso total personal autenticado usuarios" ON usuarios FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acceso total personal autenticado socios" ON socios FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acceso total personal autenticado timeline" ON socios_timeline FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acceso total personal autenticado facturas" ON facturas_cuotas FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acceso total personal autenticado tesoreria" ON tesoreria_movimientos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acceso total personal autenticado crm" ON crm_interacciones FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acceso total personal autenticado eventos" ON eventos_capacitaciones FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acceso total personal autenticado inscripciones" ON inscripciones_eventos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acceso total personal autenticado bolsa" ON bolsa_cvs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acceso total personal autenticado cv_interes" ON cv_interes_socios FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acceso total personal autenticado convenios" ON convenios_beneficios FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acceso total personal autenticado convenio_socios" ON convenio_socios FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acceso total personal autenticado documentos" ON documentos_digitales FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acceso total personal autenticado tickets" ON tickets_mesa_ayuda FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acceso total personal autenticado mensajes" ON ticket_mensajes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acceso total personal autenticado contacto" ON mensajes_contacto FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acceso total personal autenticado noticias" ON noticias_web FOR ALL USING (auth.role() = 'authenticated');
