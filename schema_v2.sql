-- ==============================================================================
-- CeCIP Paraná - Módulo de Inteligencia Operativa (ERP V2)
-- Tablas Relacionales, Índices, Constraints y Políticas RLS
-- ==============================================================================

-- 1. TABLA: socio_salud_historial (Evolución y Desglose del Índice de Salud del Socio)
CREATE TABLE IF NOT EXISTS socio_salud_historial (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  socio_id UUID NOT NULL REFERENCES socios(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  categoria VARCHAR(30) NOT NULL CHECK (categoria IN ('Excelente', 'Saludable', 'Atención', 'Riesgo', 'Crítico')),
  score_financiero NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  score_relacion NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  score_participacion NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  score_atencion NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  score_antiguedad NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  factores JSONB NOT NULL DEFAULT '[]'::jsonb,
  recomendaciones JSONB NOT NULL DEFAULT '[]'::jsonb,
  tendencia VARCHAR(20) NOT NULL DEFAULT 'estable' CHECK (tendencia IN ('ascendente', 'estable', 'descendente')),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_salud_socio_id ON socio_salud_historial(socio_id);
CREATE INDEX IF NOT EXISTS idx_salud_fecha ON socio_salud_historial(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_salud_categoria ON socio_salud_historial(categoria);

-- 2. TABLA: alertas_operativas (Centro de Alertas Operativas con Idempotencia)
CREATE TABLE IF NOT EXISTS alertas_operativas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo VARCHAR(100) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  entidad_tipo VARCHAR(50) NOT NULL,
  entidad_id UUID,
  socio_id UUID REFERENCES socios(id) ON DELETE CASCADE,
  socio_nombre VARCHAR(255),
  prioridad VARCHAR(20) NOT NULL CHECK (prioridad IN ('Baja', 'Media', 'Alta', 'Crítica')),
  estado VARCHAR(30) NOT NULL DEFAULT 'Nueva' CHECK (estado IN ('Nueva', 'En revisión', 'En gestión', 'Resuelta', 'Descartada')),
  responsable_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  responsable_nombre VARCHAR(150),
  detectada_por VARCHAR(50) NOT NULL DEFAULT 'motor_reglas',
  fingerprint VARCHAR(255) UNIQUE,
  fecha_deteccion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  fecha_limite TIMESTAMP WITH TIME ZONE,
  fecha_resolucion TIMESTAMP WITH TIME ZONE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_alertas_estado ON alertas_operativas(estado);
CREATE INDEX IF NOT EXISTS idx_alertas_prioridad ON alertas_operativas(prioridad);
CREATE INDEX IF NOT EXISTS idx_alertas_socio ON alertas_operativas(socio_id);
CREATE INDEX IF NOT EXISTS idx_alertas_fingerprint ON alertas_operativas(fingerprint);

-- 3. TABLA: acciones_operativas (Bandeja de Trabajo y Tareas Priorizadas)
CREATE TABLE IF NOT EXISTS acciones_operativas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  socio_id UUID REFERENCES socios(id) ON DELETE CASCADE,
  socio_nombre VARCHAR(255),
  origen_tipo VARCHAR(50) NOT NULL DEFAULT 'alerta' CHECK (origen_tipo IN ('alerta', 'automatizacion', 'manual', 'ia_copilot', 'crm')),
  origen_id UUID,
  responsable_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  responsable_nombre VARCHAR(150),
  prioridad VARCHAR(20) NOT NULL CHECK (prioridad IN ('Baja', 'Media', 'Alta', 'Crítica')),
  estado VARCHAR(30) NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'En curso', 'Completada', 'Cancelada')),
  sugerida_por_ia BOOLEAN NOT NULL DEFAULT FALSE,
  automatica BOOLEAN NOT NULL DEFAULT FALSE,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  fecha_limite TIMESTAMP WITH TIME ZONE,
  fecha_completada TIMESTAMP WITH TIME ZONE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_acciones_estado ON acciones_operativas(estado);
CREATE INDEX IF NOT EXISTS idx_acciones_prioridad ON acciones_operativas(prioridad);
CREATE INDEX IF NOT EXISTS idx_acciones_socio ON acciones_operativas(socio_id);

-- 4. TABLA: automatizaciones (Definición de Reglas, Triggers y Acciones)
CREATE TABLE IF NOT EXISTS automatizaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  trigger_tipo VARCHAR(100) NOT NULL,
  condiciones JSONB NOT NULL DEFAULT '{}'::jsonb,
  acciones JSONB NOT NULL DEFAULT '[]'::jsonb,
  activa BOOLEAN NOT NULL DEFAULT TRUE,
  prioridad INTEGER NOT NULL DEFAULT 1,
  created_by UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_automatizaciones_activa ON automatizaciones(activa);
CREATE INDEX IF NOT EXISTS idx_automatizaciones_trigger ON automatizaciones(trigger_tipo);

-- 5. TABLA: automatizaciones_ejecuciones (Registro y Trazabilidad de Ejecuciones)
CREATE TABLE IF NOT EXISTS automatizaciones_ejecuciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  automatizacion_id UUID NOT NULL REFERENCES automatizaciones(id) ON DELETE CASCADE,
  automatizacion_nombre VARCHAR(255) NOT NULL,
  entidad_tipo VARCHAR(50) NOT NULL,
  entidad_id UUID,
  socio_id UUID REFERENCES socios(id) ON DELETE SET NULL,
  socio_nombre VARCHAR(255),
  inicio TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  finalizacion TIMESTAMP WITH TIME ZONE,
  estado VARCHAR(30) NOT NULL DEFAULT 'Completada' CHECK (estado IN ('Pendiente', 'Ejecutando', 'Completada', 'Error', 'Cancelada')),
  resultado JSONB NOT NULL DEFAULT '{}'::jsonb,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_auto_ejec_auto ON automatizaciones_ejecuciones(automatizacion_id);
CREATE INDEX IF NOT EXISTS idx_auto_ejec_fecha ON automatizaciones_ejecuciones(inicio DESC);

-- 6. TABLA: oportunidades_operativas (Detección Proactiva de Negocio y Vínculo)
CREATE TABLE IF NOT EXISTS oportunidades_operativas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo VARCHAR(100) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  socio_id UUID REFERENCES socios(id) ON DELETE CASCADE,
  socio_nombre VARCHAR(255),
  score NUMERIC(5, 2) NOT NULL DEFAULT 75.00,
  estado VARCHAR(30) NOT NULL DEFAULT 'Detectada' CHECK (estado IN ('Detectada', 'En contacto', 'Concretada', 'Descartada')),
  detectada_por VARCHAR(50) NOT NULL DEFAULT 'motor_inteligencia',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_oportunidades_socio ON oportunidades_operativas(socio_id);
CREATE INDEX IF NOT EXISTS idx_oportunidades_estado ON oportunidades_operativas(estado);

-- 7. TABLA: ia_actividad (Bitácora de Uso y Recomendaciones de CeCIP Copilot)
CREATE TABLE IF NOT EXISTS ia_actividad (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  usuario_nombre VARCHAR(150),
  tipo VARCHAR(50) NOT NULL,
  accion VARCHAR(100) NOT NULL,
  entidad_tipo VARCHAR(50),
  entidad_id UUID,
  input_resumen TEXT,
  output_resumen TEXT,
  modelo VARCHAR(80) NOT NULL DEFAULT 'gemini-3.7-flash',
  herramienta VARCHAR(100),
  resultado VARCHAR(50) NOT NULL DEFAULT 'Exitoso',
  fecha TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ia_actividad_fecha ON ia_actividad(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_ia_actividad_herramienta ON ia_actividad(herramienta);

-- 8. TABLA: auditoria (Trazabilidad Estricta de Operaciones Críticas)
CREATE TABLE IF NOT EXISTS auditoria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  usuario_nombre VARCHAR(150),
  accion VARCHAR(100) NOT NULL,
  entidad VARCHAR(50) NOT NULL,
  entidad_id UUID NOT NULL,
  antes JSONB,
  despues JSONB,
  ip VARCHAR(50),
  fecha TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_auditoria_entidad ON auditoria(entidad, entidad_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON auditoria(fecha DESC);
