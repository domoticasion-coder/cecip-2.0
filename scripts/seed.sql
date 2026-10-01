-- ==============================================================================
-- CeCIP Paraná - Script de Datos Iniciales (Seed Data)
-- Para ejecutar en el SQL Editor de Supabase o PostgreSQL
-- ==============================================================================

-- 1. Usuarios del ERP
INSERT INTO usuarios (id, nombre, apellido, email, rol, estado)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Carlos', 'Rossi', 'admin@cecip.org', 'Administrador General', 'Activo'),
  ('a0000000-0000-0000-0000-000000000002', 'Esteban', 'Peralta', 'tesorero@cecip.org', 'Tesorería', 'Activo'),
  ('a0000000-0000-0000-0000-000000000003', 'Clara', 'Viggiano', 'atencion@cecip.org', 'Atención al Socio', 'Activo')
ON CONFLICT (email) DO NOTHING;

-- 2. Socios
INSERT INTO socios (id, razon_social, nombre_comercial, cuit, rubro, categoria, estado, direccion, localidad, provincia, email, whatsapp, web, redes_sociales, observaciones, fecha_alta)
VALUES
  (
    'b0000000-0000-0000-0000-000000000001',
    'Calzados Paraná S.R.L.',
    'Zapatilandia Paraná',
    '30-76543210-9',
    'Calzado y Vestimenta',
    'Pequeño Comercio',
    'Activo',
    'Peatonal San Martín 420',
    'Paraná',
    'Entre Ríos',
    'contacto@zapatilandia.com.ar',
    '3434551234',
    'https://www.zapatilandia.com.ar',
    '{"instagram": "@zapatilandia.parana", "facebook": "ZapatilandiaParana"}'::jsonb,
    'Socio fundador, siempre participa de reuniones de comercio minorista.',
    '2021-03-15'
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'Metalúrgica Entre Ríos S.A.',
    'MetER Estructuras',
    '30-55443322-8',
    'Industria / Metalúrgica',
    'Gran Industria',
    'Activo',
    'Parque Industrial Paraná, Lote 12',
    'Paraná',
    'Entre Ríos',
    'info@meterestructuras.com',
    '3434119988',
    'https://www.meterestructuras.com',
    '{"linkedin": "metalurgica-entre-rios"}'::jsonb,
    'Interesado en capacitaciones técnicas de soldadura avanzada y convenios de exportación.',
    '2019-08-20'
  ),
  (
    'b0000000-0000-0000-0000-000000000003',
    'Panadería El Sol S.A.S.',
    'El Sol Dulce',
    '27-99887766-5',
    'Gastronomía / Alimentos',
    'Mediana Empresa',
    'Activo',
    'Av. Ramirez 1540',
    'Paraná',
    'Entre Ríos',
    'administracion@elsoldulce.com',
    '3434992211',
    NULL,
    '{}'::jsonb,
    'Registra retraso en el pago de las últimas cuotas. Riesgo de mora evaluado.',
    '2023-11-02'
  ),
  (
    'b0000000-0000-0000-0000-000000000004',
    'Gómez Computación',
    'Gómez Tecno',
    '20-33445566-1',
    'Tecnología / Software',
    'Pequeño Comercio',
    'Pendiente',
    'Almafuerte 850',
    'Paraná',
    'Entre Ríos',
    'gomezcomputacion@gmail.com',
    '3434771122',
    NULL,
    '{}'::jsonb,
    'Inscripción en proceso de aprobación por Comisión Directiva.',
    '2026-06-28'
  )
ON CONFLICT (cuit) DO NOTHING;

-- 3. Timeline de Socios
INSERT INTO socios_timeline (socio_id, tipo, titulo, descripcion, fecha)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'sistema', 'Socio Registrado', 'Alta formal en el padrón del CeCIP.', '2021-03-15 10:00:00+00'),
  ('b0000000-0000-0000-0000-000000000001', 'crm', 'Contacto CRM', 'Consulta sobre subsidios de energía y tasas municipales.', '2026-06-10 11:30:00+00'),
  ('b0000000-0000-0000-0000-000000000001', 'factura', 'Factura Generada', 'Suscripción cuota mensual Julio 2026 emitida.', '2026-07-01 08:00:00+00'),
  ('b0000000-0000-0000-0000-000000000002', 'sistema', 'Ingreso al CeCIP', 'Incorporación como Socio Gran Industria.', '2019-08-20 09:00:00+00'),
  ('b0000000-0000-0000-0000-000000000002', 'crm', 'Reunión de Comisión', 'Participación de los directores en debate de Parque Industrial.', '2026-05-15 17:00:00+00'),
  ('b0000000-0000-0000-0000-000000000003', 'sistema', 'Alta de Cuenta', 'Ingresó como socio categoría Mediana Empresa.', '2023-11-02 12:00:00+00'),
  ('b0000000-0000-0000-0000-000000000003', 'factura', 'Alerta de Pago', 'Aviso de deuda de cuotas Mayo y Junio.', '2026-06-25 14:00:00+00')
ON CONFLICT DO NOTHING;

-- 4. Facturas / Cuotas Sociales
INSERT INTO facturas_cuotas (id, socio_id, socio_nombre, mes, anio, detalle, monto, vencimiento, estado, fecha_pago, recibo_id, intereses, refinanciada, metodo_pago)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Zapatilandia Paraná', 'Julio', 2026, 'Cuota Social Julio 2026', 3500.00, '2026-07-10', 'Pendiente', NULL, NULL, 0.00, FALSE, NULL),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'MetER Estructuras', 'Julio', 2026, 'Cuota Social Julio 2026 - Gran Empresa', 12000.00, '2026-07-10', 'Pagado', '2026-07-02', 'REC-00219', 0.00, FALSE, 'Transferencia'),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'El Sol Dulce', 'Junio', 2026, 'Cuota Social Junio 2026', 6000.00, '2026-06-10', 'Mora', NULL, NULL, 450.00, FALSE, NULL),
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003', 'El Sol Dulce', 'Mayo', 2026, 'Cuota Social Mayo 2026', 6000.00, '2026-05-10', 'Mora', NULL, NULL, 900.00, FALSE, NULL),
  ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 'Zapatilandia Paraná', 'Junio', 2026, 'Cuota Social Junio 2026', 3500.00, '2026-06-10', 'Pagado', '2026-06-08', 'REC-00185', 0.00, FALSE, 'Mercado Pago')
ON CONFLICT (id) DO NOTHING;

-- 5. Tesorería
INSERT INTO tesoreria_movimientos (id, tipo, detalle, monto, fecha, categoria, banco, conciliado, factura_id)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'Ingreso', 'Cobro transferencia Cuota MetER Estructuras', 12000.00, '2026-07-02', 'Cuotas Sociales', 'Banco Entre Ríos', TRUE, 'c0000000-0000-0000-0000-000000000002'),
  ('d0000000-0000-0000-0000-000000000002', 'Egreso', 'Pago servicio Internet Fibra Óptica CeCIP', 4500.00, '2026-07-01', 'Servicios Públicos', 'Caja Efectiva', TRUE, NULL),
  ('d0000000-0000-0000-0000-000000000003', 'Ingreso', 'Acreditación Mercado Pago cuotas minoristas (Junio)', 87500.00, '2026-06-29', 'Cuotas Sociales', 'Mercado Pago Cuenta', TRUE, NULL),
  ('d0000000-0000-0000-0000-000000000004', 'Egreso', 'Honorarios Diseñador Web - Mantenimiento', 35000.00, '2026-06-28', 'Mantenimiento', 'Banco Nación', FALSE, NULL),
  ('d0000000-0000-0000-0000-000000000005', 'Egreso', 'Sueldo Secretaria Administrativa (Adelanto)', 120000.00, '2026-06-25', 'Sueldos', 'Banco Entre Ríos', TRUE, NULL)
ON CONFLICT (id) DO NOTHING;

-- 6. CRM Interacciones
INSERT INTO crm_interacciones (id, socio_id, socio_nombre, tipo, fecha, responsable_nombre, detalle, remitente, estado)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Zapatilandia Paraná', 'Llamada', '2026-06-10 10:30:00+00', 'Mariela G. (Atención)', 'El socio consulta sobre los descuentos vigentes del convenio con Banco Entre Ríos. Se le envían detalles por PDF.', 'Comercio', 'Realizado'),
  ('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'MetER Estructuras', 'Reunión', '2026-06-15 15:00:00+00', 'Ing. Carlos Rossi (Gerente)', 'Reunión en Parque Industrial sobre el dictado de un seminario de seguridad laboral. Aceptaron patrocinar el coffee break.', 'Institucional', 'Realizado'),
  ('e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'El Sol Dulce', 'Correo', '2026-06-25 09:00:00+00', 'Esteban F. (Tesorero)', 'Envío de intimación cordial por mora en cuotas. Respondieron pidiendo plan de refinanciación.', 'Cobranzas', 'Realizado'),
  ('e0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'Zapatilandia Paraná', 'Visita', '2026-07-05 16:00:00+00', 'Mariela G. (Atención)', 'Visita programada para entregar la nueva calcomanía oficial del CeCIP Comercio Adherido.', 'Promoción', 'Pendiente')
ON CONFLICT (id) DO NOTHING;

-- 7. Eventos & Capacitaciones
INSERT INTO eventos_capacitaciones (id, titulo, fecha, hora, lugar, cupos_max, descripcion, orador, categoria, banner_url, color, border_color, text_color)
VALUES
  ('f0000000-0000-0000-0000-000000000001', 'Transformación Digital para Pymes y Comercios', '2026-07-15', '19:30', 'Salón Auditorio CeCIP, Paraná', 60, 'Un taller enfocado en herramientas gratuitas de automatización, comercio electrónico y cómo integrar inteligencia artificial en negocios tradicionales. Incluye ronda de networking al finalizar.', 'Lic. Esteban Peralta (UADER)', 'Curso', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=500&q=80', 'bg-rose-500', 'border-rose-500', 'text-rose-600'),
  ('f0000000-0000-0000-0000-000000000002', 'Liderazgo y Gestión de Equipos de Venta', '2026-07-28', '18:00', 'Modalidad Virtual (Zoom CeCIP)', 150, 'Estrategias para motivar personal, diseñar metas realistas, técnicas modernas de venta consultiva y manejo de clientes difíciles.', 'Coach Andrea Varela (Consultora Litoral)', 'Seminario', 'https://images.unsplash.com/photo-1552581230-2641474dd514?auto=format&fit=crop&w=500&q=80', 'bg-indigo-600', 'border-indigo-600', 'text-indigo-600'),
  ('f0000000-0000-0000-0000-000000000003', 'Reunión de Comisión Directiva Extraordinaria', '2026-07-08', '20:00', 'Oficinas CeCIP Paraná', 15, 'Reunión mensual para el análisis de finanzas, aprobación de nuevos convenios médicos para asociados y planificación del aniversario institucional.', 'Ing. Carlos Rossi (Presidente)', 'Reunión de Comisión', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=500&q=80', 'bg-sky-500', 'border-sky-500', 'text-sky-600')
ON CONFLICT (id) DO NOTHING;

-- 8. Inscripciones a Eventos
INSERT INTO inscripciones_eventos (evento_id, nombre_socio, email, telefono, asistio, certificado_enviado)
VALUES
  ('f0000000-0000-0000-0000-000000000001', 'Daniel Carbonell', 'carbonelldaniel04@gmail.com', '3434665544', FALSE, FALSE),
  ('f0000000-0000-0000-0000-000000000001', 'Mariana Gómez (Zapatilandia)', 'mariana@zapatilandia.com.ar', '3434551234', FALSE, FALSE),
  ('f0000000-0000-0000-0000-000000000002', 'Roberto Rossi (MetER)', 'r.rossi@meterestructuras.com', '3434119988', FALSE, FALSE)
ON CONFLICT DO NOTHING;

-- 9. Bolsa de Empleo
INSERT INTO bolsa_cvs (id, nombre, email, telefono, area_busqueda, tipo_profesional, file_name, file_size, file_path, fecha_subida, comentarios)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'Mariana Alejandra Gómez', 'mariana.gomez@gmail.com', '343 154889922', 'Administración', 'Técnico Especialista', 'gomez_mariana_cv_2026.pdf', 1258291, '/storage/cvs/gomez_mariana_cv_2026.pdf', '2026-06-28', 'Tengo 5 años de experiencia en liquidación de sueldos, atención a proveedores y manejo de sistemas contables tango/bejerman. Busco jornada completa en Paraná.'),
  ('10000000-0000-0000-0000-000000000002', 'Nicolás Agustín Fontana', 'nicolas.fontana.tech@gmail.com', '343 155331144', 'Tecnología y Sistemas', 'Estudiante / Junior', 'cv_fontana_desarrollador.pdf', 870400, '/storage/cvs/cv_fontana_desarrollador.pdf', '2026-06-29', 'Estudiante avanzado de Licenciatura en Sistemas en UTN Paraná. Conocimientos en React, TypeScript y Node.js. Busco mi primera experiencia formal.'),
  ('10000000-0000-0000-0000-000000000003', 'Claudio Rubén Martínez', 'claudio_martinez77@hotmail.com', '343 156221199', 'Industria y Producción', 'Oficios / Operativo', 'curriculum_martinez_metalurgico.docx', 1468006, '/storage/cvs/curriculum_martinez_metalurgico.docx', '2026-06-30', 'Soldador calificado MIG-MAG y electricista industrial matriculado con más de 10 años en plantas industriales del Parque Industrial Paraná.'),
  ('10000000-0000-0000-0000-000000000004', 'Sofía Belén Rossi', 'sofia.rossi.ventas@gmail.com', '343 154774411', 'Ventas y Comercial', 'Profesional Senior', 'rossi_sofia_comercial_cv.pdf', 1003520, '/storage/cvs/rossi_sofia_comercial_cv.pdf', '2026-06-30', 'Licenciada en Marketing con trayectoria liderando equipos comerciales de retail y preventas. Excelente manejo de CRM y relaciones públicas.')
ON CONFLICT (id) DO NOTHING;

-- 10. Interés de Socios en Postulantes
INSERT INTO cv_interes_socios (cv_id, socio_nombre)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'Supermercados Paraná S.A.'),
  ('10000000-0000-0000-0000-000000000003', 'Metalúrgica Entre Ríos S.A.')
ON CONFLICT DO NOTHING;

-- 11. Convenios y Beneficios
INSERT INTO convenios_beneficios (id, titulo, descripcion, descuento, vigencia_texto, categoria, estado)
VALUES
  ('20000000-0000-0000-0000-000000000001', 'Descuento en Publicidad de El Diario de Paraná', 'Tarifa preferencial con un 30% de bonificación en anuncios destacados en las ediciones impresas y digitales.', '30% OFF', 'Hasta 31/12/2026', 'Comercios', 'Activo'),
  ('20000000-0000-0000-0000-000000000002', 'Atención Médica en Sanatorio de la Ciudad', 'Aranceles preferenciales para empleados y directores de empresas socias del CeCIP sin cobertura social o con planes básicos.', 'Bonificación Especial', 'Vigente (Renovación Anual)', 'Salud', 'Activo'),
  ('20000000-0000-0000-0000-000000000003', 'Capacitaciones UADER Bonificadas', 'Becas de descuento del 50% en diplomaturas universitarias de negocios y marketing organizadas en conjunto.', '50% de Descuento', 'Ciclo Lectivo 2026', 'Educación', 'Activo')
ON CONFLICT (id) DO NOTHING;

-- 12. Documentos Digitales
INSERT INTO documentos_digitales (id, nombre, carpeta, version, fecha_subida, tamanio, tamanio_formato, file_path, permisos, descargas_count)
VALUES
  ('30000000-0000-0000-0000-000000000001', 'Acta_Asamblea_Ordinaria_2025.pdf', 'Actas', '1.0', '2025-11-12', 2516582, '2.4 MB', '/storage/docs/Acta_Asamblea_Ordinaria_2025.pdf', '["Administrador", "Gerencia", "Atención al Socio"]'::jsonb, 18),
  ('30000000-0000-0000-0000-000000000002', 'Balance_Contable_Anual_2025.pdf', 'Balances', '2.1 (Auditoría)', '2026-04-10', 5033164, '4.8 MB', '/storage/docs/Balance_Contable_Anual_2025.pdf', '["Administrador", "Gerencia", "Tesorería"]'::jsonb, 8),
  ('30000000-0000-0000-0000-000000000003', 'Contrato_Convenio_UADER.pdf', 'Contratos', 'Firmado', '2026-03-01', 1153433, '1.1 MB', '/storage/docs/Contrato_Convenio_UADER.pdf', '["Administrador", "Gerencia", "Atención al Socio"]'::jsonb, 14),
  ('30000000-0000-0000-0000-000000000004', 'Estatuto_Social_Vigente_CeCIP.pdf', 'Estatutos', 'Revisión 2024', '2024-05-15', 3355443, '3.2 MB', '/storage/docs/Estatuto_Social_Vigente_CeCIP.pdf', '["Administrador", "Gerencia", "Tesorería", "Atención al Socio", "Prensa"]'::jsonb, 45)
ON CONFLICT (id) DO NOTHING;

-- 13. Tickets Mesa de Ayuda
INSERT INTO tickets_mesa_ayuda (id, socio_id, socio_nombre, titulo, estado, categoria, fecha_creacion, ultima_actualizacion, sugerencia_ia)
VALUES
  ('40000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Zapatilandia Paraná', 'Error en el link de pago de cuota de Junio', 'Resuelto', 'Facturación', '2026-06-15 10:15:00+00', '2026-06-16 09:30:00+00', 'Token desvinculado o vencido. Regenerar link en pasarela de cobros o proponer CBU.'),
  ('40000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 'El Sol Dulce', 'Solicitud de Facilidades de Pago (Mora)', 'Pendiente', 'Facturación', '2026-07-02 11:00:00+00', '2026-07-02 11:02:00+00', 'Proponer plan de 3 cuotas condonando el 50% de los intereses moratorios para conservar al asociado.')
ON CONFLICT (id) DO NOTHING;

-- 14. Mensajes del Ticket
INSERT INTO ticket_mensajes (ticket_id, remitente, rol, texto, fecha)
VALUES
  ('40000000-0000-0000-0000-000000000001', 'Mariana Gómez (Socio)', 'socio', 'Hola, intento pagar la cuota con Mercado Pago pero me arroja un error 403. ¿Podrían revisar si el link de pago es correcto?', '2026-06-15 10:15:00+00'),
  ('40000000-0000-0000-0000-000000000001', 'Sistema IA', 'ia', 'Sugerencia del Asistente IA: Este error suele originarse por un token de Mercado Pago vencido o por una desvinculación temporal de la cuenta del CeCIP. Se aconseja regenerar el link individual y enviar el CVU del banco como alternativa.', '2026-06-15 10:16:00+00'),
  ('40000000-0000-0000-0000-000000000001', 'Esteban F. (Tesorero)', 'staff', 'Hola Mariana, efectivamente el token de Mercado Pago se había desvinculado. Ya regeneramos el link para tu cuenta, o bien puedes transferir a nuestro CBU. Saludos!', '2026-06-16 09:30:00+00'),
  ('40000000-0000-0000-0000-000000000002', 'Administración El Sol (Socio)', 'socio', 'Buenos días. Hemos recibido el aviso de deuda por los meses de Mayo y Junio. Debido a una caída en las ventas quisiéramos saber si podemos consolidar la deuda sin intereses en tres pagos quincenales.', '2026-07-02 11:00:00+00'),
  ('40000000-0000-0000-0000-000000000002', 'Asistente IA', 'ia', 'Sugerencia del Asistente IA: Para socios activos con caída de ventas, se recomienda aceptar refinanciación condonando el 50% de los intereses si el pago se debita automáticamente, asegurando la continuidad del asociado.', '2026-07-02 11:02:00+00')
ON CONFLICT DO NOTHING;

-- 15. Mensajes de Contacto Web
INSERT INTO mensajes_contacto (nombre, empresa, telefono, email, mensaje, fecha, respondido)
VALUES
  ('Esteban Rossi', 'Rossi Distribuidora', '343 154121212', 'esteban@rossidistribuidora.com.ar', 'Hola, nos interesa asociarnos al CeCIP para acceder al plan de capacitaciones de marketing digital para nuestros 15 empleados de ventas. ¿Me envían información de costos?', '2026-06-29', FALSE),
  ('Clara Viggiano', 'Heladerías Trevi', '343 155998877', 'administracion@treviparanade.com.ar', 'Buenas tardes, quisiéramos consultar sobre la mediación comercial del estatuto por un inconveniente con un local de la peatonal San Martín. Muchas gracias.', '2026-06-30', TRUE)
ON CONFLICT DO NOTHING;

-- 16. Noticias Web
INSERT INTO noticias_web (id, title, date, category, badge, description, additional_info, image_url, items_list, publicada)
VALUES
  (
    '50000000-0000-0000-0000-000000000001',
    'Día del Padre 2026: las ventas bajaron 0,3% anual',
    '2026-06-18',
    'Informe de Prensa',
    'Relevamiento Local',
    'El relevamiento del CeCIP junto a CAME reflejó un comportamiento dispar según los rubros comerciales de la ciudad de Paraná.',
    'De acuerdo con el relevamiento efectuado por el Departamento de Estadísticas del CeCIP en conjunto con la CAME, las ventas minoristas por la celebración del Día del Padre experimentaron una leve contracción del 0,3% en comparación con el mismo período del año anterior, medidas a precios constantes.\n\nEl ticket promedio en los comercios de Paraná se ubicó en torno a los $34.500, destacándose el uso intensivo de promociones con tarjetas de crédito bancarias y cuotas sin interés coordinadas con la Cámara de Comercio local.',
    '/src/assets/images/dia_del_padre_1782854741068.jpg',
    '["El ticket promedio fue de $34.500 en comercios de Paraná.", "Los rubros más destacados fueron Indumentaria y Tecnología.", "Se acordaron promociones especiales con entidades bancarias locales.", "El 68% de las operaciones se concretaron en planes de pago con tarjetas."]'::jsonb,
    TRUE
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    'Turismo: 2,6 millones de personas viajaron el fin de semana largo',
    '2026-06-23',
    'Comercio y Turismo',
    'Impacto Económico',
    'Paraná y la provincia de Entre Ríos alcanzaron altos niveles de ocupación hotelera y gastronómica.',
    'Un total de 2,6 millones de turistas y excursionistas recorrieron los principales destinos del país durante el fin de semana extra largo. En la ciudad de Paraná, el impacto económico en la hotelería, la gastronomía costera y el comercio céntrico superó las expectativas iniciales de la temporada invernal.\n\nDesde el CeCIP destacamos la importancia de continuar fortaleciendo la agenda cultural y deportiva como motor de atracción turística que irrigue recursos directos hacia nuestros socios del rubro servicios y comercio.',
    '/src/assets/images/turismo_parana_1782854754924.jpg',
    '["Ocupación hotelera en Paraná superior al 85%.", "Fuerte afluencia de visitantes de Santa Fe, Buenos Aires y Córdoba.", "Dinamización del paseo gastronómico de la Costanera y el Puerto.", "Crecimiento del consumo en artesanías y productos regionales."]'::jsonb,
    TRUE
  ),
  (
    '50000000-0000-0000-0000-000000000003',
    'Seleccionamos Analista de Gestión de Personas y Empleo',
    '2026-06-27',
    'Institucional',
    'Búsqueda Laboral',
    'Abrimos convocatoria laboral para sumarse al equipo interdisciplinario del CeCIP Paraná.',
    'En el marco del proceso de expansión institucional y mejora continua de los servicios al socio, el CeCIP abre la búsqueda formal de un/a Analista de Gestión de Personas y Empleo.\n\nLa persona seleccionada tendrá a su cargo la coordinación técnica de la Bolsa de Empleo, la intermediación de perfiles laborales para las pymes socias y la gestión de planes de capacitación junto a las universidades de Entre Ríos.',
    '/src/assets/images/cecip_representatives_1782854765721.jpg',
    '["Requisitos: Título universitario en RRHH, Relaciones Laborales o Administración.", "Experiencia comprobable mínima de 2 años en reclutamiento y selección.", "Excelente manejo de herramientas digitales y comunicación interpersonal.", "Modalidad: Presencial en Sede Central Paraná."]'::jsonb,
    TRUE
  )
ON CONFLICT (id) DO NOTHING;
