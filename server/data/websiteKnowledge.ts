/**
 * Base de Conocimiento Oficial de la Página Web y Presencia Institucional
 * Centro Comercial e Industrial de Paraná (CeCIP)
 */

export interface AuthorityMember {
  name: string;
  role: string;
  company: string;
  level: "presidencia" | "mesa" | "vocales" | "revisores";
}

export const WEBSITE_KNOWLEDGE = {
  institucion: {
    nombre: "Centro Comercial e Industrial de Paraná (CeCIP)",
    sigla: "CeCIP",
    fundacion: "18 de octubre de 1898 (más de 125 años de trayectoria)",
    origen: "Fundado inicialmente como 'Sociedad de Comerciantes' por pioneros inmigrantes y comerciantes paranaenses.",
    naturaleza: "Asociación civil gremial empresaria sin fines de lucro.",
    mision: "Representar con firmeza a los comerciantes, industriales y prestadores de servicios de Paraná y el departamento, defender la legalidad comercial, erradicar el comercio clandestino, fomentar un entorno competitivo equitativo y promover el empleo genuino.",
    sedeCentral: {
      direccion: "Calle 25 de Mayo 28, 1º Piso, Paraná, Entre Ríos, Argentina",
      referencia: "Pleno centro histórico de la ciudad de Paraná, a metros de Peatonal San Martín y Plaza 1º de Mayo.",
      horario: "Lunes a viernes de 09:00 a 17:00 hs.",
      telefono: "(0343) 4312785",
      whatsapp: "343 4575070 (+54 9 343 457-5070)",
      email: "info@centrocomercialparana.com.ar",
      web: "https://centrocomercialparana.com.ar",
    },
    hitosHistoricos: [
      "1898: Fundación de la Sociedad de Comerciantes para la defensa de los derechos de los mercaderes locales.",
      "1905: Liderazgo histórico en la sanción e implementación del descanso dominical mercantil en Paraná.",
      "1920: Adquisición de la prestigiosa sede propia en calle 25 de Mayo 28.",
      "1970: Rol protagónico en la planificación, gestión de tierras y fundación del Parque Industrial de Paraná.",
      "1985: Creación del primer Centro Comercial a Cielo Abierto y peatonalización de la tradicional calle San Martín.",
      "Actualidad: Representación de más de 230 empresas y comercios con herramientas digitales del siglo XXI.",
    ],
  },

  autoridades: [
    { name: "Mauricio Benitende", role: "PRESIDENTE", company: "Perseo SRL", level: "presidencia" },
    { name: "Victor E. Bejar", role: "VICEPRESIDENTE", company: "Tienda El Mago", level: "presidencia" },
    { name: "Gabriel N. Icasatti", role: "SECRETARIO", company: "BlackBaley", level: "mesa" },
    { name: "Marcelo Quiroga", role: "PROSECRETARIO", company: "EGE S.A.", level: "mesa" },
    { name: "Edgardo R. Greca", role: "TESORERO", company: "Greca S.A.", level: "mesa" },
    { name: "Ricardo Fernández", role: "PROTESORERO", company: "CMS S.A.", level: "mesa" },
    { name: "Esteban A. Danessi", role: "Vocal Titular 1°", company: "Eco Diseño Paraná", level: "vocales" },
    { name: "Raúl Habid", role: "Vocal Titular 2°", company: "Trapoteca SAS", level: "vocales" },
    { name: "Mirko Pacoricona", role: "Vocal Suplente 1°", company: "Yasu S.R.L.", level: "vocales" },
    { name: "Pedro Guzmán Berón", role: "Vocal Suplente 2°", company: "Win S.R.L", level: "vocales" },
    { name: "Silvia Bechir", role: "Vocal Suplente 3°", company: "HB Productos de Seguridad", level: "vocales" },
    { name: "Danilo Brizuela", role: "Vocal Suplente 4°", company: "Uomo Libre", level: "vocales" },
    { name: "David Bresler", role: "Revisor de Cuentas 1°", company: "Sentir lo Nuestro", level: "revisores" },
    { name: "Esteban A. Enrique", role: "Revisor de Cuentas 2°", company: "Diseñarte Creaciones", level: "revisores" },
  ],

  comisionesDeTrabajo: [
    {
      nombre: "Comisión de Comercio Minorista (Centros Comerciales a Cielo Abierto)",
      objetivo: "Dinamización de los corredores peatonales y arterias comerciales de Paraná, seguridad y promociones.",
    },
    {
      nombre: "Comisión de Parques Industriales y Logística",
      objetivo: "Gestión de tarifas energéticas competitivas, provisión de gas natural y desarrollo del Parque Industrial Paraná.",
    },
    {
      nombre: "Comisión de Capacitaciones y Extensión Gremial",
      objetivo: "Formación continua para empresarios, mandos medios y empleados de comercio en nuevas tecnologías y gestión.",
    },
    {
      nombre: "Comisión de Mujeres y Diversidad Empresaria",
      objetivo: "Visibilización, formación y liderazgo de empresarias y emprendedoras de la capital entrerriana.",
    },
    {
      nombre: "Comisión de Jóvenes Emprendedores de Paraná (Jóvenes CeCIP)",
      objetivo: "Fomento del espíritu emprendedor sub-40, relevo generacional en empresas familiares y rondas de negocios.",
    },
  ],

  camarasSectoriales: [
    {
      nombre: "Cámara de Comercio",
      alcance: "Comercios minoristas y mayoristas de Paraná.",
      acciones: "Organización de campañas de compras masivas (Día del Padre, Día de la Madre, Navidad, 'Comprá en tu Ciudad'), coordinación de peatonalización temporal de calle San Martín y avenidas comerciales, mesas de seguridad comercial con la Policía de Entre Ríos y seguimiento de índices de ventas.",
    },
    {
      nombre: "Cámara de Industria",
      alcance: "Establecimientos manufactureros, metalúrgicos, alimenticios y radicados en el Parque Industrial Paraná.",
      acciones: "Gestiones para provisión de gas y potencia eléctrica, tarifas de estímulo a la producción, vinculación con el INTI y universidades, y misiones comerciales.",
    },
    {
      nombre: "Cámara de Servicios",
      alcance: "Empresas de tecnología, software, consultoría, logística, gastronomía y hotelería.",
      acciones: "Digitalización de pymes, fomento del turismo corporativo y recreativo, convenios con facultades para pasantías profesionales.",
    },
    {
      nombre: "Jóvenes Empresarios (Jóvenes CeCIP)",
      alcance: "Empresarios y emprendedores menores de 40 años.",
      acciones: "Talleres de liderazgo, mentorías directivas brindadas por empresarios de trayectoria, foros provinciales y coordinación local del Premio Joven Empresario Entrerriano.",
    },
  ],

  entidadesAdheridas: [
    {
      sigla: "CAME",
      nombre: "Confederación Argentina de la Mediana Empresa",
      alcance: "Red gremial empresaria nacional con más de 1.500 entidades.",
      beneficiosSocios: "Cursos virtuales gratuitos y certificados en CAME Educativa, líneas de créditos subsidiados para pymes, estadísticas nacionales del comercio minorista y programas de Centros Comerciales a Cielo Abierto.",
    },
    {
      sigla: "CAC",
      nombre: "Cámara Argentina de Comercio y Servicios",
      alcance: "Cámara representativa del sector comercial y de servicios a nivel nacional e internacional.",
      beneficiosSocios: "Becas académicas universitarias y de posgrado, asesoramiento técnico en comercio exterior (importaciones/exportaciones), informes de coyuntura macroeconómica.",
    },
    {
      sigla: "FEDER",
      nombre: "Federación Económica de Entre Ríos",
      alcance: "Entidad madre provincial del empresariado entrerriano.",
      beneficiosSocios: "Defensa conjunta ante el gobierno de Entre Ríos, debate por tarifas eléctricas comerciales ante Enersa, propuestas sobre leyes impositivas provinciales (ATER).",
    },
    {
      sigla: "Bolsa de Comercio de Entre Ríos",
      nombre: "Bolsa de Comercio de Entre Ríos",
      alcance: "Mercado de capitales e instrumentos financieros regionales.",
      beneficiosSocios: "Asesoramiento gratuito para colocación de pagarés pyme, descuento de cheques de pago diferido con avales de Sociedades de Garantía Recíproca (SGR) a tasas muy inferiores a las bancarias tradicionales.",
    },
  ],

  beneficiosParaSocios: [
    {
      titulo: "Acceso a Informes Comerciales (Veraz, Fidelitas, Nosis)",
      descripcion: "Consultas de solvencia crediticia y antecedentes financieros de clientes y contratistas a tarifas corporativas bonificadas, minimizando el riesgo comercial de ventas a plazo.",
    },
    {
      titulo: "Asesoramiento Legal, Laboral, Contable e Impositivo Gratuito",
      descripcion: "Gabinete de profesionales especializados para evacuar dudas sobre derecho laboral, liquidación de la Tasa de Higiene y Profilaxis de Paraná, habilitaciones comerciales, normativas de AFIP y ATER.",
    },
    {
      titulo: "Plan Integral de Capacitaciones Gratuitas o Bonificadas",
      descripcion: "Talleres prácticos anuales presenciales y virtuales con certificación oficial: Inteligencia Artificial aplicada a comercios, Marketing Digital, Ventas y Fidelización, Gestión de Flujo de Caja y Excel para pymes.",
    },
    {
      titulo: "Uso Bonificado de las Instalaciones en la Sede Central",
      descripcion: "Salón de Actos histórico con capacidad para más de 80 personas (equipado con proyector HD, sonido, micrófonos y climatización) y salas privadas para reuniones ejecutivas y firmas comerciales de los socios sin costo adicional (sujeto a disponibilidad y reserva).",
    },
    {
      titulo: "Bolsa de Empleo y Preselección de Personal",
      descripcion: "Acceso preferencial y exclusivo para consultar la base de datos de currículums y postulantes laborales calificados de Paraná para cubrir vacantes comerciales, administrativas y técnicas sin costo de agencia.",
    },
    {
      titulo: "Convenios Comerciales y Descuentos Cruzados",
      descripcion: "Descuentos en telefonía corporativa, servicios de seguridad, hotelería, servicios médicos laborales y promociones bancarias para compras con tarjeta.",
    },
  ],

  noticiasYComunicados: [
    {
      titulo: "CeCIP expresa su profundo descontento por el tratamiento de las propuestas del comercio ante las Comisiones de Hacienda",
      categoria: "Gremial Empresaria",
      resumen: "Reclamo firme ante el Honorable Concejo Deliberante de Paraná solicitando alivio de la carga tributaria municipal sobre los comercios formales, revisión urgente de las alícuotas de la Tasa de Higiene y Profilaxis, y establecimiento de incentivos para la generación de empleo registrado.",
    },
    {
      titulo: "Índice Autoponderado de Precios: en agosto de 2026, la variación general en Paraná fue del 2,84%",
      categoria: "Estadística e Indicadores",
      resumen: "Relevamiento mensual técnico en más de 80 comercios locales testigos. Los alimentos y bebidas tuvieron una desaceleración ubicándose en el 2,1%, mientras indumentaria y servicios experimentaron variaciones estacionales de cambio de temporada.",
    },
    {
      titulo: "CeCIP y CCSF se reunieron para impulsar el desarrollo comercial regional",
      categoria: "Integración Regional",
      resumen: "Encuentro de trabajo binodal con el Centro Comercial de Santa Fe para articular el turismo de compras regional, conectividad metropolitana y campañas comerciales conjuntas.",
    },
    {
      titulo: "Día del Padre 2026: Las ventas mostraron un ticket promedio de $32.500",
      categoria: "Informe de Prensa",
      resumen: "Leve retracción de ventas del 0,3% anual con buena respuesta en indumentaria, calzado y tecnología gracias a promociones bancarias y cuotas.",
    },
    {
      titulo: "El turismo generó más de $869 millones para la economía de Paraná durante el último fin de semana largo",
      categoria: "Economía Local",
      resumen: "Impacto transversal de la afluencia turística en hotelería (más del 85% de ocupación), gastronomía, comercio céntrico y paseos de compras de Paraná.",
    },
    {
      titulo: "CeCIP acompaña la propuesta de Fan Zone para alentar a la Selección Argentina",
      categoria: "Eventos y Comercio",
      resumen: "Instalación de pantallas gigantes y articulación con locales gastronómicos y de esparcimiento para potenciar las ventas de locales nocturnos y familiares.",
    },
  ],

  eventosPublicosWeb: [
    {
      titulo: "Expo-Muestra PyME de Entre Ríos 2026",
      fecha: "18/07/2026",
      hora: "10:00 h",
      lugar: "Pabellón de Exposiciones CeCIP Paraná",
      descripcion: "Exposición abierta donde más de 45 empresas de la red exhiben innovaciones, servicios y productos al público en general.",
    },
    {
      titulo: "Taller: Inteligencia Artificial para Comercios",
      fecha: "22/07/2026",
      hora: "19:00 h",
      lugar: "Salón de Usos Múltiples CeCIP",
      orador: "Mg. Esteban Garmendia (Especialista en IA)",
      descripcion: "Automatización de atención al cliente con IA, redacción de copys publicitarios y flujos de inventario para pymes de cercanía.",
    },
    {
      titulo: "Seminario de Liderazgo de Ventas y Fidelización",
      fecha: "28/07/2026",
      hora: "18:30 h",
      lugar: "Auditorio Principal CeCIP",
      orador: "Lic. Clara Medina (Consultora de Negocios)",
      descripcion: "Motivación de equipos de venta, metas medibles y retención de clientes en entornos comerciales dinámicos.",
    },
    {
      titulo: "Muestra Anual de Jóvenes Emprendedores",
      fecha: "05/08/2026",
      hora: "14:00 h",
      lugar: "Plaza Primero de Mayo, Paraná",
      orador: "Comisión de Jóvenes CeCIP",
      descripcion: "Encuentro al aire libre en la plaza central de la ciudad con stands de marcas y startups de jóvenes entrerrianos.",
    },
  ],

  portalesSitioWeb: [
    {
      nombre: "Portal Público Principal",
      descripcion: "Información institucional, noticias de prensa, agenda de eventos, beneficios, cámaras y solicitud de adhesión.",
    },
    {
      nombre: "Portal de Autogestión para Socios",
      descripcion: "Acceso exclusivo para asociados donde pueden descargar cupones de pago con código de barras, consultar estado de deuda, abonar online y gestionar su carnet digital de afiliado.",
    },
    {
      nombre: "Portal de la Bolsa de Empleo (Público)",
      descripcion: "Módulo abierto donde cualquier ciudadano puede cargar su currículum vitae, detallar experiencia, pretensión salarial y postularse a las búsquedas de las empresas socias.",
    },
    {
      nombre: "Portal de Administración Web",
      descripcion: "Panel de control para que el equipo de prensa edite noticias, suba comunicados, configure eventos y gestione solicitudes.",
    },
    {
      nombre: "Sistema ERP CeCIP",
      descripcion: "Plataforma integral de gestión institucional con padrón de 231 socios, facturación de cuotas, cobranzas, auditoría de morosidad, tesorería, CRM, bolsa interna de CVs y mesa de ayuda.",
    },
  ],
};
