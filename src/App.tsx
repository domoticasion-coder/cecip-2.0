import { useState, useEffect, useRef, ChangeEvent, FormEvent } from "react";
import { 
  Phone, 
  Mail, 
  Search, 
  ChevronDown, 
  User, 
  FileText, 
  Files,
  Scale, 
  GraduationCap, 
  Building, 
  Building2,
  Home,
  Instagram, 
  MapPin, 
  CheckCircle, 
  X,
  Briefcase,
  Lock,
  Calendar,
  Award,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { CVSubmission, WebNewsItem, ContactMessage } from "./types";
import ResumePortal from "./components/ResumePortal";
import BannerBolsaEmpleo from "./components/BannerBolsaEmpleo";
import BannerPortalSocios from "./components/BannerPortalSocios";
import BotonTema from "./components/BotonTema";
import { contenidoWeb, ERP_URL, type EventoErp, type GrupoErp, type NoticiaErp, type NovedadErp } from "./lib/erp";
import SociosPortal from "./components/SociosPortal";
import PrivateAdminPortal from "./components/PrivateAdminPortal";
import ErpPortal from "./components/erp/ErpPortal";
import SubPageView from "./components/SubPageView";
import CecipCopilotWidget from "./components/CecipCopilotWidget";
import ComercIASeccion from "./components/ComercIASeccion";
import IntroWeb from "./components/IntroWeb";
import HeroScroll from "./components/HeroScroll";
import { ALL_CECIP_SOCIOS } from "./data/sociosData";
import { Database } from "lucide-react";

// Image constants pointing to the assets
const IMAGE_FACADE = "https://i.postimg.cc/WpC996c2/cecip-fachada-r8rfoy7572gdw9e5kbngeimw58imq1bl0s153k6uq8.jpg";
const IMAGE_MEETING = "/images/collaboration_meeting_1782854725514.jpg";
const IMAGE_NEWS_PADRE = "/images/dia_del_padre_1782854741068.jpg";
const IMAGE_NEWS_TURISMO = "/images/turismo_parana_1782854754924.jpg";
const IMAGE_NEWS_SELECCION = "/images/cecip_representatives_1782854765721.jpg";

interface ContentDetail {
  title: string;
  categoryName: string;
  badge: string;
  description: string;
  additionalInfo?: string;
  itemsList?: string[];
  membersList?: { role: string, name: string }[];
}

const contentData: Record<string, ContentDetail> = {
  // Institucional
  "quiénes somos": {
    title: "Quiénes Somos",
    categoryName: "Institucional",
    badge: "Sobre CeCIP",
    description: "El Centro Comercial e Industrial de Paraná (CeCIP) es una organización no gubernamental de carácter gremial empresario, fundada el 18 de octubre de 1898. Agrupamos a comerciantes, industriales y proveedores de servicios de Paraná y zonas de influencia, articulando esfuerzos para potenciar la actividad productiva de la región.",
    additionalInfo: "Nuestra misión principal es representar con firmeza a las pymes locales, defender la legalidad comercial y fomentar un entorno económico y competitivo adecuado. Promovemos el crecimiento de nuestros socios a través de herramientas de capacitación, redes de contacto y convenios de mutuo beneficio.",
    itemsList: [
      "Representación activa ante organismos municipales, provinciales y nacionales.",
      "Defensa gremial del comercio minorista y las pymes locales.",
      "Vinculación con las mayores confederaciones empresarias del país.",
      "Compromiso con el empleo genuino y el desarrollo social de Paraná."
    ]
  },
  "autoridades": {
    title: "Autoridades",
    categoryName: "Institucional",
    badge: "Comisión Directiva",
    description: "La conducción de nuestra institución está conformada por empresarios y comerciantes de amplia trayectoria en nuestra ciudad, elegidos democráticamente para representar las distintas ramas de actividad comercial, industrial y de servicios.",
    additionalInfo: "La Comisión Directiva actual sesiona regularmente para diseñar las políticas institucionales, analizar la coyuntura del sector y llevar los reclamos y propuestas de nuestros asociados ante los poderes del Estado."
  },
  "estatuto": {
    title: "Estatuto Social",
    categoryName: "Institucional",
    badge: "Marco Normativo",
    description: "Nuestra institución se rige estrictamente por su Estatuto Social oficial, el cual garantiza el funcionamiento democrático, la alternancia de autoridades, la transparencia en la administración de recursos y el enfoque en la defensa gremial empresaria sin fines de lucro.",
    additionalInfo: "El Estatuto establece que el CeCIP tiene por objeto fomentar la unión de los sectores comerciales e industriales, propiciar un clima favorable para las inversiones legítimas y actuar como mediador legítimo ante las normativas municipales y provinciales.",
    itemsList: [
      "Fomentar la cooperación mutua entre todos los sectores económicos.",
      "Prestar servicios asistenciales, informativos y de consultoría a los asociados.",
      "Organizar actividades formativas para los empleadores y sus equipos.",
      "Fijar pautas éticas en el ejercicio de la actividad comercial e industrial."
    ]
  },
  "historia": {
    title: "Nuestra Historia",
    categoryName: "Institucional",
    badge: "Desde 1898",
    description: "Fundado el 18 de octubre de 1898, el Centro Comercial e Industrial de Paraná es una de las instituciones más antiguas de la provincia de Entre Ríos y del país. Nació en una época de pujanza y necesidad de organización gremial para los inmigrantes y comerciantes pioneros que forjaban el destino de la capital entrerriana.",
    additionalInfo: "A lo largo de más de 125 años de trayectoria ininterrumpida, el CeCIP ha liderado gestiones fundamentales como la defensa del descanso dominical, el ordenamiento de las tasas comerciales locales, la peatonalización de la calle San Martín y el desarrollo conjunto del Parque Industrial de Paraná.",
    itemsList: [
      "1898: Fundación de la Sociedad de Comerciantes, hoy CeCIP.",
      "1930: Inauguración de la sede propia frente a la plaza 1° de Mayo.",
      "1952: Fusión con la Asociación Industrial de Paraná: nace el Centro Comercial e Industrial.",
      "Actualidad: Más de 120 años acompañando al comercio y la industria con soluciones del siglo XXI."
    ]
  },
  "comisiones": {
    title: "Comisiones de Trabajo",
    categoryName: "Institucional",
    badge: "Participación Activa",
    description: "Para dar respuesta especializada a cada sector de la economía de Paraná, contamos con comisiones internas integradas por asociados que abordan de manera pormenorizada las problemáticas y desafíos específicos de cada área.",
    additionalInfo: "Cualquier socio de CeCIP tiene la oportunidad de sumarse a nuestras comisiones para enriquecer las iniciativas colectivas con su experiencia y visión particular.",
    itemsList: [
      "Comisión de Comercio Minorista (Centros Comerciales a Cielo Abierto)",
      "Comisión de Parques Industriales y Logística",
      "Comisión de Capacitaciones y Extensión Gremial",
      "Comisión de Mujeres y Diversidad Empresaria",
      "Comisión de Jóvenes Emprendedores de Paraná"
    ]
  },

  // Cámaras
  "cámara de comercio": {
    title: "Cámara de Comercio",
    categoryName: "Cámaras Sectoriales",
    badge: "Comercio Local",
    description: "La Cámara de Comercio de CeCIP agrupa a los comerciantes minoristas y mayoristas de Paraná, sirviendo de nexo directo con las autoridades locales para coordinar estrategias de fomento del consumo local.",
    additionalInfo: "Impulsamos activamente campañas de gran escala que dinamizan las ventas de calle San Martín y avenidas comerciales en fechas clave, coordinando promociones con entidades bancarias locales y regulando las tasas y controles comerciales.",
    itemsList: [
      "Campañas del Día del Padre, Día de la Madre y Navidad.",
      "Articulación de peatonalización temporal de zonas comerciales.",
      "Seguimiento de estadísticas e índices de ventas minoristas locales.",
      "Mesas de trabajo sobre seguridad comercial y ordenamiento urbano."
    ]
  },
  "cámara de industria": {
    title: "Cámara de Industria",
    categoryName: "Cámaras Sectoriales",
    badge: "Sector Productivo",
    description: "Agrupa a los establecimientos manufactureros, metalúrgicos, alimenticios y de producción industrial radicados en Paraná, especialmente en el área del Parque Industrial de la ciudad.",
    additionalInfo: "Nuestra labor se enfoca en gestionar mejoras constantes de infraestructura, tarifas energéticas promocionales y de incentivo, reducción de cargas tributarias provinciales, y la articulación con centros tecnológicos de la región.",
    itemsList: [
      "Gestiones para la ampliación de servicios de red de gas y electricidad en el Parque Industrial.",
      "Promoción de la transferencia tecnológica y la economía del conocimiento.",
      "Asesoramiento técnico en programas de fomento de la producción nacional.",
      "Coordinación de misiones comerciales industriales."
    ]
  },
  "cámara de servicios": {
    title: "Cámara de Servicios",
    categoryName: "Cámaras Sectoriales",
    badge: "Servicios y Tecnología",
    description: "La Cámara de Servicios representa el sector de mayor crecimiento relativo en Paraná, englobando a empresas de logística, desarrollo de software, gastronomía, hotelería y consultorías profesionales.",
    additionalInfo: "Buscamos profesionalizar los servicios locales e integrar tecnologías avanzadas en los comercios tradicionales de la región, posicionando a Paraná como un polo moderno de servicios.",
    itemsList: [
      "Digitalización y comercio electrónico para pymes.",
      "Estrategias de promoción del turismo corporativo y recreativo.",
      "Convenios con centros universitarios locales para pasantías profesionales.",
      "Consultas y redes sobre metodologías ágiles de gestión."
    ]
  },
  "mujeres empresarias": {
    title: "Mujeres Empresarias",
    categoryName: "Cámaras Sectoriales",
    badge: "Mujeres CeCIP",
    description: "Es el espacio del CeCIP que reúne a empresarias, emprendedoras y profesionales de Paraná para potenciar el liderazgo femenino en el comercio, la industria y los servicios.",
    additionalInfo: "Organizamos encuentros, capacitaciones y actividades de networking para que más mujeres lideren, hagan crecer sus empresas y participen en la vida institucional del Centro Comercial.",
    itemsList: [
      "Encuentros y networking entre empresarias de la ciudad.",
      "Capacitaciones en gestión, finanzas, ventas y herramientas digitales.",
      "Charlas con referentes y experiencias de liderazgo.",
      "Participación en la Comisión de Mujeres y Diversidad Empresaria."
    ]
  },
  "jóvenes empresarios": {
    title: "Jóvenes Empresarios (Jóvenes CeCIP)",
    categoryName: "Cámaras Sectoriales",
    badge: "Emprendedores <40",
    description: "Es el espacio de articulación, formación y liderazgo dedicado a los jóvenes emprendedores y empresarios menores de 40 años que inician o lideran empresas en Paraná.",
    additionalInfo: "Promovemos el espíritu emprendedor, la mentoría empresarial para el relevo generacional en empresas familiares, y facilitamos la participación de jóvenes locales en foros nacionales.",
    itemsList: [
      "Talleres prácticos de liderazgo y habilidades directivas.",
      "Rondas de negocios de jóvenes emprendedores entrerrianos.",
      "Mentorías gratuitas brindadas por directivos históricos de CeCIP.",
      "Premio Joven Empresario Entrerriano (coordinación local)."
    ]
  },

  // Entidades
  "came": {
    title: "CAME (Confederación Argentina de la Mediana Empresa)",
    categoryName: "Entidades Adheridas",
    badge: "Red Nacional",
    description: "La CAME es la institución gremial empresaria de segundo grado más representativa del país, nucleando a más de 1.500 federaciones y centros comerciales, de los cuales CeCIP forma parte fundamental.",
    additionalInfo: "A través de nuestra filiación con CAME, podemos ofrecer a nuestros socios programas nacionales de formación a distancia, créditos promocionales, financiamiento y voz en las negociaciones colectivas de convenios laborales.",
    itemsList: [
      "Acceso a la plataforma de cursos CAME Educativa con certificaciones oficiales.",
      "Programas conjuntos de Centros Comerciales a Cielo Abierto.",
      "Líneas de financiamiento blandas subsidiadas por el gobierno nacional.",
      "Estadísticas nacionales en tiempo real del comercio minorista y pymes."
    ]
  },
  "cac": {
    title: "CAC (Cámara Argentina de Comercio y Servicios)",
    categoryName: "Entidades Adheridas",
    badge: "Liderazgo Comercial",
    description: "La Cámara Argentina de Comercio y Servicios representa al sector de servicios y comercio a nivel nacional e internacional, defendiendo las libertades económicas y promoviendo el comercio exterior.",
    additionalInfo: "Nuestra vinculación con la CAC abre las puertas a nuestros socios para becas universitarias, diplomaturas de alto nivel, asesoramiento técnico en comercio exterior y análisis macroeconómico sectorial.",
    itemsList: [
      "Becas completas y parciales para diplomaturas y maestrías de la CAC.",
      "Asesoramiento y soporte técnico para exportaciones e importaciones de pymes.",
      "Acceso a la red internacional de Cámaras de Comercio.",
      "Informes periódicos de coyuntura comercial argentina."
    ]
  },
  "federación económica de entre ríos": {
    title: "FEDER (Federación Económica de Entre Ríos)",
    categoryName: "Entidades Adheridas",
    badge: "Red Provincial",
    description: "La FEDER es la entidad madre del empresariado entrerriano, nucleando a los centros comerciales e industriales de todos los departamentos y ciudades de la provincia de Entre Ríos.",
    additionalInfo: "CeCIP es uno de los pilares de la FEDER, participando activamente de sus asambleas para coordinar la postura del sector frente a las leyes de presupuesto provincial, tarifas de energía y tasas provinciales ante la ATER.",
    itemsList: [
      "Defensa unificada del sector comercial frente al gobierno provincial.",
      "Debates regulares sobre tarifas eléctricas comerciales.",
      "Convenios marcos para incentivos del turismo entrerriano.",
      "Articulación de reclamos sectoriales regionales ante la legislatura de Entre Ríos."
    ]
  },
  "bolsa de comercio": {
    title: "Bolsa de Comercio de Entre Ríos",
    categoryName: "Entidades Adheridas",
    badge: "Financiamiento Pyme",
    description: "La Bolsa de Comercio de Entre Ríos promueve el desarrollo del mercado de capitales local, proveyendo a las empresas entrerrianas de alternativas de financiamiento no tradicionales.",
    additionalInfo: "Mediante el convenio permanente de CeCIP con la Bolsa, facilitamos a nuestros socios el acceso a Sociedades de Garantía Recíproca (SGR) para avalar créditos bursátiles, negociar pagarés o descontar cheques con tasas significativamente inferiores al mercado financiero bancario convencional.",
    itemsList: [
      "Asesoramiento gratuito sobre colocación de pagarés pyme.",
      "Talleres prácticos sobre instrumentos financieros y SGRs.",
      "Informes mensuales del índice de precios y canasta básica de Paraná.",
      "Oportunidades de inversión productiva regional."
    ]
  },

  // Beneficios
  "acceso a informes comerciales": {
    title: "Acceso a Informes Comerciales",
    categoryName: "Beneficios de Socio",
    badge: "Seguridad Comercial",
    description: "Protegemos tus ventas y transacciones. Brindamos a nuestros socios herramientas exclusivas para verificar la solvencia financiera de nuevos clientes, contratistas o socios comerciales.",
    additionalInfo: "Ofrecemos acceso directo a bases de datos nacionales (como Veraz, Fidelitas, Nosis) con tarifas corporativas preferenciales, permitiéndote tomar decisiones informadas y minimizar el riesgo crediticio de tu pyme.",
    itemsList: [
      "Consultas express de historial crediticio nacional.",
      "Tarifas especiales muy por debajo del costo de contratación individual.",
      "Soporte inmediato y asesoramiento para interpretar informes de deudas.",
      "Monitoreo constante de carteras de clientes habituales."
    ]
  },
  "asesoramiento legal e impositivo": {
    title: "Asesoramiento Legal e Impositivo",
    categoryName: "Beneficios de Socio",
    badge: "Gabinete Consultor",
    description: "Resuelve tus dudas con el respaldo de profesionales idóneos. CeCIP pone a tu disposición un equipo de asesores legales y contables especializados en pymes y normativas comerciales locales.",
    additionalInfo: "Nuestro gabinete atiende consultas gratuitas para socios sobre derecho laboral, liquidación de tasas municipales de Paraná, de higiene y profilaxis, convenios colectivos del comercio, defensa del consumidor y resoluciones de AFIP y ATER.",
    itemsList: [
      "Consultas periódicas presenciales o virtuales gratuitas.",
      "Asistencia en habilitaciones comerciales complejas.",
      "Actualizaciones constantes sobre cambios impositivos y laborales.",
      "Mediación y arbitraje comercial voluntario."
    ]
  },
  "plan integral de capacitaciones": {
    title: "Plan Integral de Capacitaciones",
    categoryName: "Beneficios de Socio",
    badge: "Formación Profesional",
    description: "El capital más valioso de tu empresa es tu equipo. Ofrecemos un calendario anual de capacitaciones dictadas por expertos nacionales e internacionales, enfocadas en las necesidades reales del mercado laboral actual.",
    additionalInfo: "Todas nuestras capacitaciones y cursos presenciales o virtuales son sin cargo o con importantes descuentos para asociados de CeCIP, incluyendo material didáctico y certificación avalada institucionalmente.",
    itemsList: [
      "Cursos de Inteligencia Artificial aplicada, Marketing Digital y E-commerce.",
      "Talleres de Ventas, Excel Avanzado y Gestión de Caja para Pymes.",
      "Programas ejecutivos presenciales dictados en nuestra sede.",
      "Acceso directo a la plataforma virtual de CAME y la CAC."
    ]
  },
  "uso de nuestras instalaciones": {
    title: "Uso de Nuestras Instalaciones",
    categoryName: "Beneficios de Socio",
    badge: "Espacios de Encuentro",
    description: "Tu empresa tiene un lugar reservado en el centro de la ciudad. Facilitamos a nuestros asociados los espacios de nuestra prestigiosa sede histórica para sus eventos, capacitaciones internas o firmas de contratos.",
    additionalInfo: "Nuestra sede ubicada en calle 25 de Mayo 28, 1º piso, cuenta con oficinas ejecutivas, salas de reuniones privadas y un imponente salón de conferencias principal con equipamiento tecnológico completo.",
    itemsList: [
      "Salón de actos con capacidad para más de 80 personas.",
      "Equipamiento de sonido, micrófonos, proyectores HD y climatización.",
      "Salas de firmas y reuniones ejecutivas privadas de alta calidad.",
      "Tarifa totalmente bonificada para socios (sujeto a disponibilidad y reserva)."
    ]
  },

  // Beneficios
  "plan integral de capacitaciónes": {
    title: "Plan Integral de Capacitaciones",
    categoryName: "Beneficios de Socio",
    badge: "Formación Profesional",
    description: "El capital más valioso de tu empresa es tu equipo. Ofrecemos un calendario anual de capacitaciones dictadas por expertos nacionales e internacionales, enfocadas en las necesidades reales del mercado laboral actual.",
    additionalInfo: "Todas nuestras capacitaciones y cursos presenciales o virtuales son sin cargo o con importantes descuentos para asociados de CeCIP, incluyendo material didáctico y certificación avalada institucionalmente.",
    itemsList: [
      "Cursos de Inteligencia Artificial aplicada, Marketing Digital y E-commerce.",
      "Talleres de Ventas, Excel Avanzado y Gestión de Caja para Pymes.",
      "Programas ejecutivos presenciales dictados en nuestra sede.",
      "Acceso directo a la plataforma virtual de CAME y la CAC."
    ]
  },
  "objetivos": {
    title: "Nuestros Objetivos",
    categoryName: "Institucional",
    badge: "Misión y Visión",
    description: "Trabajamos incansablemente en incrementar y sostener el comercio, la industria y los servicios para fomentar mayor inserción laboral y mejorar la calidad de vida en la ciudad de Paraná.",
    additionalInfo: "Promovemos el libre desenvolvimiento de las actividades económicas legítimas, la erradicación del comercio clandestino o ilegal, y la facilitación de herramientas modernas para la competitividad de las pequeñas y medianas empresas entrerrianas.",
    itemsList: [
      "Defender y consolidar los derechos del comercio y la industria local.",
      "Fomentar la cooperación estrecha entre el sector público y privado.",
      "Propiciar la creación de empleo genuino, formal y de calidad.",
      "Impulsar la capacitación continua de empresarios y colaboradores."
    ]
  },
  "nuestros objetivos": {
    title: "Nuestros Objetivos",
    categoryName: "Institucional",
    badge: "Misión y Visión",
    description: "Trabajamos incansablemente en incrementar y sostener el comercio, la industria y los servicios para fomentar mayor inserción laboral y mejorar la calidad de vida en la ciudad de Paraná.",
    additionalInfo: "Promovemos el libre desenvolvimiento de las actividades económicas legítimas, la erradicación del comercio clandestino o ilegal, y la facilitación de herramientas modernas para la competitividad de las pequeñas y medianas empresas entrerrianas.",
    itemsList: [
      "Defender y consolidar los derechos del comercio y la industria local.",
      "Fomentar la cooperación estrecha entre el sector público y privado.",
      "Propiciar la creación de empleo genuino, formal y de calidad.",
      "Impulsar la capacitación continua de empresarios y colaboradores."
    ]
  },
  "contacto": {
    title: "Contacto Institucional",
    categoryName: "Atención al Socio",
    badge: "Sede Central",
    description: "Nuestra sede central se encuentra ubicada en calle 25 de Mayo 28, 1º piso, Paraná, Entre Ríos. Estamos a disposición de lunes a viernes de 09:00 a 17:00 hs.",
    additionalInfo: "Comunícate telefónicamente al 0343 4312785, vía WhatsApp al 343 4575070 o por correo electrónico a info@centrocomercialparana.com.ar.",
    itemsList: [
      "Teléfono: 0343 4312785",
      "WhatsApp: 343 4575070",
      "E-mail: info@centrocomercialparana.com.ar",
      "Horario: Lunes a viernes de 09:00 a 17:00 hs"
    ]
  },

  // Noticias Exactas de la Portada
  "cecip expresa su profundo descontento por el tratamiento de las propuestas del comercio ante las comisiones de hacienda": {
    title: "CeCIP Expresa su Profundo Descontento",
    categoryName: "Gremial Empresaria",
    badge: "Comunicado Oficial",
    description: "El Centro Comercial e Industrial de Paraná manifestó su firme postura respecto a la falta de consideración de las iniciativas presentadas por el sector mercantil ante las Comisiones de Hacienda del Honorable Concejo Deliberante.",
    additionalInfo: "Desde la entidad se reiteró la urgencia de aliviar la carga tributaria local sobre el comercio formal, revisar las tasas de higiene y profilaxis y establecer incentivos reales para la generación de empleo registrado en la ciudad de Paraná.",
    itemsList: [
      "Solicitud de revisión urgente de alícuotas municipales y tasas de comercio.",
      "Defensa irrestricta de la competitividad frente a distritos vecinos.",
      "Propuesta de mesa de trabajo permanente con legisladores comunales.",
      "Compromiso irrenunciable con la formalidad y el comercio paranaense."
    ]
  },
  "índice autoponderado de precios: en agosto de 2026, la variación general registrada en paraná fue del 2,84%": {
    title: "Índice Autoponderado de Precios: Agosto 2026",
    categoryName: "Estadística e Indicadores",
    badge: "Informe Económico",
    description: "El relevamiento mensual de precios elaborado por el departamento técnico de CeCIP indicó un incremento del 2,84% en la canasta testigo relevada en comercios minoristas de la ciudad de Paraná.",
    additionalInfo: "Los rubros de alimentos frescos y artículos de limpieza mostraron la mayor estabilidad, mientras que indumentaria y servicios registraron variaciones moderadas con motivo del cambio de temporada comercial.",
    itemsList: [
      "Variación general registrada en Paraná: 2,84% mensual.",
      "Canasta de alimentos y bebidas: desaceleración al 2,1%.",
      "Monitoreo permanente en más de 80 comercios locales.",
      "Herramienta técnica de referencia para la toma de decisiones pymes."
    ]
  },
  "cecip y ccsf se reunieron para impulsar el desarrollo comercial regional": {
    title: "CeCIP y CCSF Impulsan el Desarrollo Comercial Regional",
    categoryName: "Integración Regional",
    badge: "Acuerdo Interprovincial",
    description: "Representantes del Centro Comercial e Industrial de Paraná y del Centro Comercial de Santa Fe mantuvieron una fructífera reunión de trabajo con el fin de articular estrategias conjuntas para el área metropolitana Paraná - Santa Fe.",
    additionalInfo: "El encuentro abordó temas claves como la conectividad interurbana, promociones cruzadas para el turismo de compras regional, y gestiones conjuntas ante entidades nacionales como CAME y CAC.",
    itemsList: [
      "Articulación binodal Paraná - Santa Fe para compras y turismo.",
      "Campañas comerciales conjuntas para temporadas festivas.",
      "Defensa unificada de los intereses productivos de la región litoral.",
      "Fortalecimiento de la red de jóvenes empresarios y capacitaciones compartidas."
    ]
  },

  // Noticias
  "día del padre 2026: las ventas bajaron 0,3% anual": {
    title: "Día del Padre 2026: Ventas Minoristas",
    categoryName: "Informe de Prensa",
    badge: "Estadística Local",
    description: "El departamento de estadísticas de CeCIP relevó la actividad comercial durante el fin de semana del Día del Padre 2026 en Paraná. Las ventas minoristas sufrieron una leve caída del 0,3% anual en términos reales.",
    additionalInfo: "A pesar del contexto, los rubros de tecnología, calzado y marroquinería mantuvieron buenos niveles debido a las promociones exclusivas y las opciones de cuotas sin interés brindadas por bancos locales adheridos. El ticket promedio de los comercios de Paraná ascendió a $32.500.",
    itemsList: [
      "Leve retracción nacional y local del 0,3% frente al 2025.",
      "Indumentaria y tecnología fueron los rubros con mayor resistencia.",
      "Excelente impacto de promociones locales 'Comprá en tu Ciudad'.",
      "Ticket promedio de compra: $32.500 pesos argentinos."
    ]
  },
  "el turismo generó más de $869 millones para la economía de paraná durante el fin de semana largo.": {
    title: "Gran Impacto Económico Turístico",
    categoryName: "Economía Local",
    badge: "Fin de Semana Largo",
    description: "Nuestra capital entrerriana se consolidó como uno de los centros preferidos durante el último receso, inyectando de forma directa e indirecta más de $869 millones a los comercios de Paraná.",
    additionalInfo: "Los sectores de hotelería, gastronomía y transporte reportaron altos niveles de demanda comercial. Desde CeCIP Paraná promovemos permanentemente que el turismo se integre con ofertas de compras locales, ferias gastronómicas y beneficios exclusivos en comercios del centro.",
    itemsList: [
      "Inyección de más de $869 millones directos a Paraná.",
      "Ocupación hotelera superior al 85% de plazas activas.",
      "Beneficio transversal en gastronomía, comercios céntricos y logística.",
      "Gran afluencia de turistas provenientes de Buenos Aires, Santa Fe y Córdoba."
    ]
  },
  "el cecip acompaña la propuesta de fan zone para alentar a la selección argentina": {
    title: "Fan Zone en Paraná",
    categoryName: "Institucional / Eventos",
    badge: "Apoyo Comercial",
    description: "Acompañamos activamente la propuesta del municipio de Paraná de implementar un 'Fan Zone' público para alentar a la Selección Argentina de Fútbol en sus certámenes continentales.",
    additionalInfo: "Esta iniciativa dinamiza la facturación comercial de cafés, bares y restaurantes locales. Además, genera un polo seguro y festivo de gran atractivo familiar para el esparcimiento comunitario y el fomento de actividades afines.",
    itemsList: [
      "Instalación de pantallas gigantes en puntos estratégicos de Paraná.",
      "Potenciación del sector gastronómico y de locales nocturnos.",
      "Espectáculos complementarios con artesanos locales y food trucks.",
      "Seguridad comercial coordinada con las fuerzas provinciales."
    ]
  }
};

// -----------------------------------------------------------------------------
// Contenido que llega del ERP del CeCIP (eventos, capacitaciones y comunicados publicados)
const MESES_ES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DIAS_ES = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
const BANNER_DEFECTO = "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80";
const pesosAr = (n: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

function eventoDesdeErp(e: EventoErp) {
  const d = new Date(e.fecha_inicio);
  const capacitacion = e.tipo === "capacitacion";
  const clases = e.cantidad_clases && e.cantidad_clases > 1
    ? `\n\n${e.cantidad_clases} clases${e.dias_semana?.length ? `, los ${e.dias_semana.map((x) => DIAS_ES[x - 1]).join(" y ")}` : ""}${e.hora_inicio ? ` de ${e.hora_inicio.slice(0, 5)} a ${(e.hora_fin || "").slice(0, 5)} h` : ""}.`
    : "";
  const costo = Number(e.costo) || 0;
  const noSocio = e.precio_no_socio !== null && e.precio_no_socio !== undefined ? Number(e.precio_no_socio) : null;
  return {
    id: e.id,
    fecha: d.toLocaleDateString("es-AR"),
    day: d.getDate(),
    month: MESES_ES[d.getMonth()],
    monthIndex: d.getMonth(),
    year: d.getFullYear(),
    titulo: e.titulo,
    type: capacitacion ? "Capacitación" : "Evento",
    hora: `${e.hora_inicio ? e.hora_inicio.slice(0, 5) : d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false })} h`,
    lugar: e.modalidad === "virtual" ? "Virtual" : e.lugar || "Sede CeCIP",
    orador: e.docente || "Centro Comercial e Industrial de Paraná",
    description: `${e.descripcion || ""}${clases}`.trim(),
    banner: e.imagen_url || BANNER_DEFECTO,
    color: capacitacion ? "bg-rose-500" : "bg-[#00a3e0]",
    precio: costo
      ? `Socios ${pesosAr(costo)}${noSocio !== null && noSocio !== costo ? ` · No socios ${noSocio ? pesosAr(noSocio) : "sin cargo"}` : ""}`
      : noSocio ? `Sin costo para socios · No socios ${pesosAr(noSocio)}` : "Actividad sin costo",
    inscripcionUrl: e.slug_inscripcion ? `${ERP_URL}/portal/inscripcion/${e.slug_inscripcion}` : null,
    abierta: e.inscripcion_abierta,
  };
}

/** Noticia cargada en ERP → Comunicación → Noticias de la web */
function noticiaDesdeErp(n: NoticiaErp): WebNewsItem {
  const cuerpo = (n.cuerpo || "").trim();
  return {
    id: `erp-n-${n.id}`,
    title: n.titulo,
    date: new Date(n.fecha).toLocaleDateString("es-AR"),
    category: n.categoria || "Institucional",
    badge: n.destacado ? "Destacado" : n.categoria || "CeCIP Paraná",
    description: (n.bajada || "").trim() || (cuerpo.length > 320 ? `${cuerpo.slice(0, cuerpo.lastIndexOf(" ", 320))}…` : cuerpo),
    additionalInfo: n.bajada ? cuerpo : cuerpo.length > 320 ? cuerpo.slice(cuerpo.lastIndexOf(" ", 320)).trim() : "",
    imageUrl: n.imagen_url || BANNER_DEFECTO,
    publicada: true,
  };
}

function novedadDesdeErp(n: NovedadErp): WebNewsItem {
  const cuerpo = (n.cuerpo || "").trim();
  const corte = cuerpo.length > 320 ? cuerpo.lastIndexOf(" ", 320) : -1;
  return {
    id: `erp-${n.id}`,
    title: n.titulo,
    date: new Date(n.fecha).toLocaleDateString("es-AR"),
    category: "Comunicado",
    badge: n.destacado ? "Destacado" : "CeCIP Paraná",
    description: corte > 0 ? `${cuerpo.slice(0, corte)}…` : cuerpo,
    additionalInfo: corte > 0 ? cuerpo.slice(corte).trim() : "",
    imageUrl: n.imagen_url || BANNER_DEFECTO,
    publicada: true,
  };
}

const publicEvents = [
  {
    id: "web-ev-1",
    fecha: "18/07/2026",
    day: 18,
    month: "Julio",
    titulo: "Expo-Muestra PyME de Entre Ríos 2026",
    type: "Muestra",
    hora: "10:00 h",
    lugar: "Pabellón de Exposiciones CeCIP Paraná",
    orador: "Coordinadora de Emprendimientos Locales",
    description: "Una gran exposición abierta donde más de 45 empresas de nuestra red exhiben sus productos, innovaciones y servicios al público general. Excelente oportunidad de vinculación, stands interactivos y rondas comerciales directas.",
    banner: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=500&q=80",
    color: "bg-emerald-500",
    borderColor: "border-emerald-500",
    textColor: "text-emerald-600 dark:text-emerald-400"
  },
  {
    id: "web-ev-2",
    fecha: "22/07/2026",
    day: 22,
    month: "Julio",
    titulo: "Taller: Inteligencia Artificial para Comercios",
    type: "Capacitación",
    hora: "19:00 h",
    lugar: "Salón de Usos Múltiples CeCIP",
    orador: "Mg. Esteban Garmendia (Especialista en IA)",
    description: "Taller teórico-práctico de nivel inicial a intermedio sobre el uso de herramientas de IA generativa para la automatización de atención al cliente, redacción de textos publicitarios y optimización de flujos de inventario en comercios de cercanía.",
    banner: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=500&q=80",
    color: "bg-rose-500",
    borderColor: "border-rose-500",
    textColor: "text-rose-600 dark:text-rose-400"
  },
  {
    id: "web-ev-3",
    fecha: "28/07/2026",
    day: 28,
    month: "Julio",
    titulo: "Seminario de Liderazgo de Ventas y Fidelización",
    type: "Capacitación",
    hora: "18:30 h",
    lugar: "Auditorio Principal CeCIP",
    orador: "Lic. Clara Medina (Consultora de Negocios)",
    description: "Herramientas esenciales para motivar equipos comerciales, establecer metas medibles y diseñar planes de retención de clientes en entornos altamente cambiantes.",
    banner: "https://images.unsplash.com/photo-1552581230-2641474dd514?auto=format&fit=crop&w=500&q=80",
    color: "bg-indigo-600",
    borderColor: "border-indigo-600",
    textColor: "text-indigo-600 dark:text-indigo-400"
  },
  {
    id: "web-ev-4",
    fecha: "05/08/2026",
    day: 5,
    month: "Agosto",
    titulo: "Muestra Anual de Jóvenes Emprendedores",
    type: "Muestra",
    hora: "14:00 h",
    lugar: "Plaza Primero de Mayo, Paraná",
    orador: "Comisión de Jóvenes CeCIP",
    description: "Encuentro abierto al aire libre para que los nuevos talentos, startups y marcas de jóvenes entrerrianos presenten sus innovaciones y emprendimientos creativos en stands dedicados.",
    banner: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=500&q=80",
    color: "bg-sky-500",
    borderColor: "border-sky-500",
    textColor: "text-sky-600 dark:text-sky-400"
  }
];

export default function App() {
  // Public Events Calendar states
  const [selectedWebEventId, setSelectedWebEventId] = useState<string>("");
  const [mesCal, setMesCal] = useState(() => ({ y: new Date().getFullYear(), m: new Date().getMonth() }));
  const [enrolledWebEvents, setEnrolledWebEvents] = useState<string[]>([]);
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [heroInfo, setHeroInfo] = useState(() => {
    const storedHero = localStorage.getItem("cecip_hero");
    if (storedHero) {
      try {
        return JSON.parse(storedHero);
      } catch {}
    }
    return {
      title: "Nos honra ser la institución más antigua de Paraná",
      subtitle: "¡Bienvenidos!",
      description: "Representando Pymes de la cuidad hace mas de 120 años, valorando la producción local, el comercio legal y la libertad de desarrollar una actividad económica independiente. Trabajemos en incrementar y sostener el comercio, la industria, los servicios para fomentar mayor inserción laboral y mejorar la calidad de vida en la cuidad.",
      imageUrl: IMAGE_FACADE
    };
  });
  const [asociarseImage, setAsociarseImage] = useState(() => {
    // rutas viejas a /src/assets no existen en la web publicada
    return (localStorage.getItem("cecip_asociarse_img") || IMAGE_MEETING).replace("/src/assets/images/", "/images/");
  });

  // Navigation states
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  // los menús desplegables se cierran con una pequeña demora, así no se cierran al bajar el mouse hacia la lista
  const cierreMenu = useRef<number>(0);
  const abrirMenu = (m: string) => { clearTimeout(cierreMenu.current); setActiveMenu(m); };
  const cerrarMenu = () => { clearTimeout(cierreMenu.current); cierreMenu.current = window.setTimeout(() => setActiveMenu(null), 220); };
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentView, setCurrentView] = useState<"home" | "subpage">("home");
  const [activeSubPage, setActiveSubPage] = useState<{
    title: string;
    categoryName?: string;
    badge?: string;
    description?: string;
    additionalInfo?: string;
    itemsList?: string[];
    newsItem?: WebNewsItem | null;
  } | null>(null);

  // Portals visible state
  const [showSocioPortal, setShowSocioPortal] = useState(false);
  const [showAdminPortal, setShowAdminPortal] = useState(false);
  const [showBolsaModal, setShowBolsaModal] = useState(false);
  const [showErpPortal, setShowErpPortal] = useState(false);
  const [cvsUpdatedCounter, setCvsUpdatedCounter] = useState(0);
  const [proximamenteNotice, setProximamenteNotice] = useState<string | null>(null);

  // Dynamic news state
  const [news, setNews] = useState<WebNewsItem[]>([]);
  const [gruposErp, setGruposErp] = useState<GrupoErp[]>([]);

  // Form submission states
  const [formData, setFormData] = useState({
    nombre: "",
    empresa: "",
    telefono: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showError, setShowError] = useState(false);

  // Scrolled state for dynamic sticky header shadows
  const [scrolled, setScrolled] = useState(false);

  // Initialize News and handle Scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);

    // Initialize News in localStorage matching exact cover
    const defaultNews: WebNewsItem[] = [
      {
        id: "news-1",
        title: "CeCIP expresa su profundo descontento por el tratamiento de las propuestas del comercio ante las Comisiones de Hacienda",
        date: "14/08/2026",
        category: "Gremial Empresaria",
        badge: "Comunicado Oficial",
        description: "El Centro Comercial e Industrial de Paraná manifestó su firme postura respecto a la falta de consideración de las iniciativas presentadas por el sector mercantil ante las Comisiones de Hacienda del Honorable Concejo Deliberante.",
        additionalInfo: "Desde la entidad se reiteró la urgencia de aliviar la carga tributaria local sobre el comercio formal, revisar las tasas de higiene y profilaxis y establecer incentivos reales para la generación de empleo registrado en la ciudad de Paraná.",
        imageUrl: IMAGE_NEWS_PADRE,
        itemsList: [
          "Solicitud de revisión urgente de alícuotas municipales y tasas de comercio.",
          "Defensa irrestricta de la competitividad frente a distritos vecinos.",
          "Propuesta de mesa de trabajo permanente con legisladores comunales.",
          "Compromiso irrenunciable con la formalidad y el comercio paranaense."
        ]
      },
      {
        id: "news-2",
        title: "Índice Autoponderado de Precios: En agosto de 2026, la variación general registrada en Paraná fue del 2,84%",
        date: "28/08/2026",
        category: "Estadística e Indicadores",
        badge: "Informe Económico",
        description: "El relevamiento mensual de precios elaborado por el departamento técnico de CeCIP indicó un incremento del 2,84% en la canasta testigo relevada en comercios minoristas de la ciudad de Paraná.",
        additionalInfo: "Los rubros de alimentos frescos y artículos de limpieza mostraron la mayor estabilidad, mientras que indumentaria y servicios registraron variaciones moderadas con motivo del cambio de temporada comercial.",
        imageUrl: IMAGE_NEWS_TURISMO,
        itemsList: [
          "Variación general registrada en Paraná: 2,84% mensual.",
          "Canasta de alimentos y bebidas: desaceleración al 2,1%.",
          "Monitoreo permanente en más de 80 comercios locales.",
          "Herramienta técnica de referencia para la toma de decisiones pymes."
        ]
      },
      {
        id: "news-3",
        title: "CECIP y CCSF se reunieron para impulsar el desarrollo comercial regional",
        date: "02/09/2026",
        category: "Integración Regional",
        badge: "Acuerdo Interprovincial",
        description: "Representantes del Centro Comercial e Industrial de Paraná y del Centro Comercial de Santa Fe mantuvieron una fructífera reunión de trabajo con el fin de articular estrategias conjuntas para el área metropolitana Paraná - Santa Fe.",
        additionalInfo: "El encuentro abordó temas claves como la conectividad interurbana, promociones cruzadas para el turismo de compras regional, y gestiones conjuntas ante entidades nacionales como CAME y CAC.",
        imageUrl: IMAGE_NEWS_SELECCION,
        itemsList: [
          "Articulación binodal Paraná - Santa Fe para compras y turismo.",
          "Campañas comerciales conjuntas para temporadas festivas.",
          "Defensa unificada de los intereses productivos de la región litoral.",
          "Fortalecimiento de la red de jóvenes empresarios y capacitaciones compartidas."
        ]
      }
    ];

    const storedNews = localStorage.getItem("cecip_news");
    if (!storedNews || !storedNews.includes("descontento")) {
      localStorage.setItem("cecip_news", JSON.stringify(defaultNews));
      setNews(defaultNews);
    } else {
      setNews(JSON.parse(storedNews));
    }

    // Eventos, capacitaciones y comunicados publicados en el ERP del CeCIP
    contenidoWeb()
      .then(({ eventos, novedades, noticias, grupos }) => {
        setGruposErp(grupos);
        const evs = eventos.map(eventoDesdeErp);
        setEventsList(evs);
        if (evs.length) {
          setSelectedWebEventId(evs[0].id);
          setMesCal({ y: evs[0].year, m: evs[0].monthIndex });
        }
        if (novedades.length || noticias.length) {
          // primero las noticias destacadas, después el resto por fecha (las del ERP antes que las de ejemplo)
          const orden = [...noticias].sort((a, b) => Number(b.destacado) - Number(a.destacado) || +new Date(b.fecha) - +new Date(a.fecha));
          const deErp = [...orden.map(noticiaDesdeErp), ...novedades.map(novedadDesdeErp)];
          setNews((prev) => [...deErp, ...prev.filter((x) => !String(x.id).startsWith("erp-"))]);
        }
      })
      .catch((err) => console.warn("No se pudo leer el contenido del ERP:", err));

    // Initialize Hero in localStorage matching exact cover
    const defaultHero = {
      title: "Nos honra ser la institución más antigua de Paraná",
      subtitle: "¡Bienvenidos!",
      description: "Representando Pymes de la cuidad hace mas de 120 años, valorando la producción local, el comercio legal y la libertad de desarrollar una actividad económica independiente. Trabajemos en incrementar y sostener el comercio, la industria, los servicios para fomentar mayor inserción laboral y mejorar la calidad de vida en la cuidad.",
      imageUrl: IMAGE_FACADE
    };

    const storedHero = localStorage.getItem("cecip_hero");
    if (!storedHero || storedHero.includes("and la libertad")) {
      localStorage.setItem("cecip_hero", JSON.stringify(defaultHero));
      setHeroInfo(defaultHero);
    } else {
      try {
        const parsedHero = JSON.parse(storedHero);
        if (!parsedHero.imageUrl) {
          parsedHero.imageUrl = IMAGE_FACADE;
          localStorage.setItem("cecip_hero", JSON.stringify(parsedHero));
        }
        setHeroInfo(parsedHero);
      } catch {
        setHeroInfo(defaultHero);
      }
    }
    // URL Route and Hash detection for hidden /admincecip and #comercios tab
    const handleLocationChange = () => {
      const pathname = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();

      // Protected admin section accessible behind /admincecip
      if (pathname.includes("/admincecip") || hash.includes("admincecip")) {
        // Direct testing shortcut: /admincecip/login or /admincecip#socios or /admincecip#erp or /admincecip?test=socios
        if (
          pathname.includes("socio") || 
          pathname.includes("erp") || 
          pathname.includes("login") ||
          hash.includes("socio") || 
          hash.includes("erp") || 
          hash.includes("login") ||
          search.includes("socio") ||
          search.includes("erp")
        ) {
          setShowErpPortal(true);
        } else {
          setShowAdminPortal(true);
        }
      }

      if (hash === "#comercia" || hash === "#conoce-comercia" || pathname.includes("/conoce-comercia")) {
        setActiveSubPage({ title: "Conocé ComercIA", categoryName: "ComercIA", badge: "ComercIA Inteligente" });
        setCurrentView("subpage");
      }

      if (hash === "#bolsa-de-empleo" || hash === "#bolsa" || pathname.includes("/bolsa-de-empleo")) {
        setActiveSubPage({ title: "Bolsa de Empleo", categoryName: "Servicios", badge: "Bolsa de Empleo CeCIP" });
        setCurrentView("subpage");
      }

      // Comercios tab accessible directly via URL
      if (hash === "#comercios" || hash === "#comercios-asociados" || pathname.includes("/comercios")) {
        setActiveSubPage({
          title: "Comercios Asociados",
          categoryName: "Institucional",
          badge: "Padrón Oficial"
        });
        setCurrentView("subpage");
      }
    };

    handleLocationChange();
    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("hashchange", handleLocationChange);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("hashchange", handleLocationChange);
    };
  }, []);

  const handleCloseAdminPortal = () => {
    setShowAdminPortal(false);
    if (window.location.pathname.toLowerCase().includes("/admincecip") || window.location.hash.toLowerCase().includes("admincecip")) {
      window.history.pushState(null, "", window.location.pathname.toLowerCase().includes("/admincecip") ? "/" : window.location.pathname);
    }
  };

  const handleNewsUpdated = () => {
    const storedNews = localStorage.getItem("cecip_news");
    if (storedNews) {
      setNews(JSON.parse(storedNews));
    }
  };

  const handleEventsUpdated = () => {
    const storedEvents = localStorage.getItem("cecip_events");
    if (storedEvents) {
      setEventsList(JSON.parse(storedEvents));
    }
  };

  const handleHeroUpdated = () => {
    const storedHero = localStorage.getItem("cecip_hero");
    if (storedHero) {
      try {
        setHeroInfo(JSON.parse(storedHero));
      } catch {}
    }
    const storedAsociarse = localStorage.getItem("cecip_asociarse_img");
    if (storedAsociarse) {
      setAsociarseImage(storedAsociarse);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.empresa || !formData.telefono) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    // Save contact message to local storage so the admin panel can read it
    const newMsg: ContactMessage = {
      id: "msg-" + Date.now(),
      nombre: formData.nombre,
      empresa: formData.empresa,
      telefono: formData.telefono,
      email: `${formData.nombre.toLowerCase().replace(/\s/g, "")}@simulado.com`,
      mensaje: `Solicitud de asociación de la empresa ${formData.empresa}. Teléfono de contacto: ${formData.telefono}.`,
      fecha: new Date().toLocaleDateString("es-AR"),
      respondido: false
    };

    const existingMsgs = JSON.parse(localStorage.getItem("cecip_messages") || "[]");
    localStorage.setItem("cecip_messages", JSON.stringify([newMsg, ...existingMsgs]));

    setIsSubmitted(true);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(true);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const navigateToPage = (title: string, newsArticle?: WebNewsItem) => {
    const key = title.toLowerCase().trim();
    setIsSearchOpen(false);

    window.scrollTo({ top: 0, behavior: "smooth" });

    if (newsArticle) {
      setActiveSubPage({
        title: newsArticle.title,
        categoryName: newsArticle.category,
        badge: newsArticle.badge,
        description: newsArticle.description,
        additionalInfo: newsArticle.additionalInfo,
        itemsList: newsArticle.itemsList,
        newsItem: newsArticle
      });
      setCurrentView("subpage");
      return;
    }

    if (key === "comercia" || key === "conocé comercia" || key === "conoce comercia") {
      setActiveSubPage({ title: "Conocé ComercIA", categoryName: "ComercIA", badge: "ComercIA Inteligente" });
      setCurrentView("subpage");
      return;
    }

    if (key.includes("bolsa de empleo") || key === "bolsa" || key.includes("currículum") || key.includes("curriculum") || key === "cv") {
      setActiveSubPage({ title: "Bolsa de Empleo", categoryName: "Servicios", badge: "Bolsa de Empleo CeCIP" });
      setCurrentView("subpage");
      return;
    }

    if ((key.includes("comercio") && key.includes("asociado")) || key.includes("padrón") || key.includes("padron")) {
      setActiveSubPage({
        title: "Comercios Asociados",
        categoryName: "Institucional",
        badge: "Padrón Oficial"
      });
      setCurrentView("subpage");
      return;
    }

    // Check dynamic news list first
    const matchedNews = news.find(n => n.title.toLowerCase().trim() === key || n.id === title);
    if (matchedNews) {
      setActiveSubPage({
        title: matchedNews.title,
        categoryName: matchedNews.category,
        badge: matchedNews.badge,
        description: matchedNews.description,
        additionalInfo: matchedNews.additionalInfo,
        itemsList: matchedNews.itemsList,
        newsItem: matchedNews
      });
      setCurrentView("subpage");
      return;
    }

    // Custom fuzzy lookup to prevent key mismatch
    const matchedKey = Object.keys(contentData).find(k => k === key || k.includes(key) || key.includes(k));
    const data = matchedKey ? contentData[matchedKey] : null;

    if (data) {
      setActiveSubPage({
        title: data.title,
        categoryName: data.categoryName,
        badge: data.badge,
        description: data.description,
        additionalInfo: data.additionalInfo,
        itemsList: data.itemsList
      });
    } else {
      setActiveSubPage({
        title: title,
        categoryName: "Institucional",
        badge: "CeCIP Paraná",
        description: `Detalles completos sobre ${title}. Desde el Centro Comercial e Industrial de Paraná articulamos acciones para potenciar la actividad productiva de la región.`,
        additionalInfo: "Si deseas conocer más, ponte en contacto directo con nuestras oficinas de atención o asóciate a la red CeCIP."
      });
    }

    setCurrentView("subpage");
  };

  const openContentModal = navigateToPage;

  const navigateToHome = (targetId?: string) => {
    setCurrentView("home");
    setActiveSubPage(null);
    if (targetId) {
      setTimeout(() => {
        scrollToSection(targetId);
      }, 80);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Dropdown options
  const dropdownMenus: { [key: string]: string[] } = {
    institucional: ["Quiénes Somos", "Autoridades", "Estatuto", "Historia", "Comisiones", "Comercios Asociados"],
    camaras: ["Cámara de Comercio", "Cámara de Industria", "Cámara de Servicios", "Jóvenes Empresarios", "Mujeres Empresarias"],
    entidades: ["CAME", "CAC", "Federación Económica de Entre Ríos", "Bolsa de Comercio"]
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 antialiased selection:bg-cecip-blue selection:text-white">
      <IntroWeb />
      
      {/* 1. TOP UTILITY BAR */}
      <div className="w-full bg-[#f8fafc] border-b border-slate-200/70 text-[13px] text-slate-600 py-2 px-3 sm:px-6 lg:px-8">
        <div className="max-w-[1440px] w-full mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-6 gap-y-1">
            <span className="flex items-center gap-1.5">
              <span className="text-[#00a3e0] font-semibold">Teléfono:</span> 
              <a href="tel:03434312785" className="hover:text-[#00a3e0] transition-colors text-slate-600">0343 4312785</a>
            </span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="flex items-center gap-1.5">
              <span className="text-[#00a3e0] font-semibold">E-mail:</span> 
              <a href="mailto:info@centrocomercialparana.com.ar" className="hover:text-[#00a3e0] transition-colors text-slate-600">info@centrocomercialparana.com.ar</a>
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigateToPage("Bolsa de Empleo")}
              className="text-xs font-semibold text-white bg-[#00a3e0] hover:bg-[#0c2356] rounded-lg px-2.5 py-1 transition-all flex items-center gap-1.5 cursor-pointer select-none"
              title="Subí tu CV a la Bolsa de Empleo del CeCIP"
            >
              <Briefcase size={12} /> Bolsa de Empleo
            </button>

            <BotonTema />

            {/* Login de socios: lleva al Portal de Socios del ERP */}
            <a
              href={`${ERP_URL}/portal`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-slate-600 hover:text-white bg-slate-50/90 hover:bg-[#0c2356] border border-slate-200/90 hover:border-[#0c2356] rounded-lg px-2.5 py-1 transition-all flex items-center gap-1.5 cursor-pointer select-none shadow-2xs"
              title="Ingresar al Portal de Socios"
            >
              <span className="w-5 h-5 rounded-full bg-sky-100 text-[#0c2356] flex items-center justify-center">
                <User size={12} />
              </span>
              <span>Login Socios</span>
            </a>

            {/* Search form bar */}
            <form onSubmit={handleSearch} className="relative w-44 sm:w-52">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-1 text-xs text-slate-700 focus:outline-none focus:border-[#00a3e0] transition-all placeholder:text-slate-400"
              />
              <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00a3e0] transition-colors">
                <Search size={13} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAV BAR */}
      <header className={`sticky top-0 z-50 w-full bg-white transition-all duration-200 ${scrolled ? "shadow-md py-2.5" : "border-b border-slate-100 py-3.5"}`}>
        <div className="max-w-[1440px] w-full mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => navigateToHome()}>
            <div className="flex flex-col">
              <div className="text-3xl sm:text-4xl font-black tracking-tight leading-none flex items-baseline">
                <span className="text-[#00a3e0]">Ce</span>
                <span className="text-[#0c2356]">CI</span>
                <span className="text-[#00a3e0]">P</span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#0c2356] tracking-tight mt-1 whitespace-nowrap">
                Centro Comercial e Industrial de Paraná
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-x-4 xl:gap-x-5">
            
            <button 
              onClick={() => navigateToHome()} 
              className={`text-sm font-semibold transition-colors cursor-pointer ${currentView === "home" ? "text-[#00a3e0]" : "text-slate-700 hover:text-[#00a3e0]"}`}
            >
              Inicio
            </button>

            {/* Dropdown 1: Institucional */}
            <div 
              className="relative"
              onMouseEnter={() => abrirMenu("institucional")}
              onMouseLeave={cerrarMenu}
            >
              <button className={`text-sm font-medium flex items-center gap-1 transition-colors cursor-pointer ${activeMenu === "institucional" || (currentView === "subpage" && activeSubPage?.categoryName === "Institucional" && activeSubPage?.title !== "Comercios Asociados") ? "text-[#00a3e0]" : "text-slate-700 hover:text-[#00a3e0]"}`}>
                Institucional <ChevronDown size={14} className={`transition-transform duration-200 ${activeMenu === "institucional" ? "rotate-180" : ""}`} />
              </button>
              
              {activeMenu === "institucional" && (
                <div 
                  className="absolute left-0 mt-1 w-56 bg-white border border-slate-100 rounded-xl shadow-xl py-2 z-50 transition-all duration-150 before:absolute before:inset-x-0 before:-top-3 before:h-3 before:content-['']"
                >
                  {dropdownMenus.institucional.map((item, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => { navigateToPage(item); setActiveMenu(null); }}
                      className="w-full text-left block px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 hover:text-[#00a3e0] transition-colors font-medium cursor-pointer"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pestaña: Comercios Asociados (como las demás pestañas) */}
            <button 
              onClick={() => {
                setActiveSubPage({
                  title: "Comercios Asociados",
                  categoryName: "Institucional",
                  badge: "Padrón Oficial"
                });
                setCurrentView("subpage");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`text-sm font-medium transition-colors cursor-pointer ${
                currentView === "subpage" && activeSubPage?.title === "Comercios Asociados" 
                  ? "text-[#00a3e0] font-bold" 
                  : "text-slate-700 hover:text-[#00a3e0]"
              }`}
            >
              Comercios Asociados
            </button>

            {/* Dropdown 2: Camaras */}
            <div 
              className="relative"
              onMouseEnter={() => abrirMenu("camaras")}
              onMouseLeave={cerrarMenu}
            >
              <button className={`text-sm font-medium flex items-center gap-1 transition-colors cursor-pointer ${activeMenu === "camaras" || (currentView === "subpage" && activeSubPage?.categoryName === "Cámaras Sectoriales") ? "text-[#00a3e0]" : "text-slate-700 hover:text-[#00a3e0]"}`}>
                Camaras <ChevronDown size={14} className={`transition-transform duration-200 ${activeMenu === "camaras" ? "rotate-180" : ""}`} />
              </button>

              {activeMenu === "camaras" && (
                <div 
                  className="absolute left-0 mt-1 w-56 bg-white border border-slate-100 rounded-xl shadow-xl py-2 z-50 transition-all duration-150 before:absolute before:inset-x-0 before:-top-3 before:h-3 before:content-['']"
                >
                  {dropdownMenus.camaras.map((item, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => { navigateToPage(item); setActiveMenu(null); }}
                      className="w-full text-left block px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 hover:text-[#00a3e0] transition-colors font-medium cursor-pointer"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={() => {
                if (currentView === "home") {
                  scrollToSection("noticias-section");
                } else {
                  navigateToHome("noticias-section");
                }
              }}
              className="text-sm font-medium text-slate-700 hover:text-[#00a3e0] transition-colors cursor-pointer"
            >
              Noticias
            </button>

            {/* Dropdown 3: Entidades */}
            <div 
              className="relative"
              onMouseEnter={() => abrirMenu("entidades")}
              onMouseLeave={cerrarMenu}
            >
              <button className={`text-sm font-medium flex items-center gap-1 transition-colors cursor-pointer ${activeMenu === "entidades" || (currentView === "subpage" && activeSubPage?.categoryName === "Entidades Adheridas") ? "text-[#00a3e0]" : "text-slate-700 hover:text-[#00a3e0]"}`}>
                Entidades <ChevronDown size={14} className={`transition-transform duration-200 ${activeMenu === "entidades" ? "rotate-180" : ""}`} />
              </button>

              {activeMenu === "entidades" && (
                <div 
                  className="absolute left-0 mt-1 w-64 bg-white border border-slate-100 rounded-xl shadow-xl py-2 z-50 transition-all duration-150 before:absolute before:inset-x-0 before:-top-3 before:h-3 before:content-['']"
                >
                  {dropdownMenus.entidades.map((item, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => { navigateToPage(item); setActiveMenu(null); }}
                      className="w-full text-left block px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 hover:text-[#00a3e0] transition-colors font-medium cursor-pointer"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={() => {
                if (currentView === "home") {
                  scrollToSection("calendario-publico");
                } else {
                  navigateToHome("calendario-publico");
                }
              }}
              className="text-sm font-medium text-slate-700 hover:text-[#00a3e0] transition-colors cursor-pointer"
            >
              Capacitaciones
            </button>

            <button
              onClick={() => navigateToPage("Conocé ComercIA")}
              className={`text-sm font-bold flex items-center gap-1 rounded-full px-3 py-1 transition-all cursor-pointer ${currentView === "subpage" && activeSubPage?.title === "Conocé ComercIA" ? "bg-gradient-to-r from-[#00a3e0] to-violet-500 text-white" : "bg-gradient-to-r from-[#00a3e0]/10 to-violet-500/10 text-[#0c2356] hover:from-[#00a3e0] hover:to-violet-500 hover:text-white"}`}
            >
              <Sparkles size={14} className="text-current" /> Conocé ComercIA
            </button>

            <button 
              onClick={() => scrollToSection("footer-section")}
              className="hidden xl:inline text-sm font-medium text-slate-700 hover:text-[#00a3e0] transition-colors cursor-pointer"
            >
              Contacto
            </button>

            <button 
              onClick={() => {
                if (currentView === "home") {
                  scrollToSection("asociarse-section");
                } else {
                  navigateToHome("asociarse-section");
                }
              }}
              className="text-sm font-medium text-[#00a3e0] hover:text-[#0c2356] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <User size={15} />
              <span>Asociate</span>
            </button>

          </nav>

          {/* Mobile Actions */}
          <div className="lg:hidden flex items-center gap-1.5 sm:gap-2">
            <button 
              onClick={() => {
                setActiveSubPage({
                  title: "Comercios Asociados",
                  categoryName: "Institucional",
                  badge: "Padrón Oficial"
                });
                setCurrentView("subpage");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`px-2.5 py-1 rounded text-xs font-semibold border transition-colors ${
                currentView === "subpage" && activeSubPage?.title === "Comercios Asociados"
                  ? "bg-[#00a3e0] text-white border-[#00a3e0]"
                  : "bg-sky-50 text-[#00a3e0] border-sky-200"
              }`}
            >
              Comercios
            </button>
            {/* Login de socios (celular): lleva al Portal de Socios del ERP */}
            <a
              href={`${ERP_URL}/portal`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 text-slate-600 text-xs font-semibold bg-slate-50 hover:bg-[#0c2356] hover:border-[#0c2356] hover:text-white transition-colors cursor-pointer select-none"
              title="Ingresar al Portal de Socios"
            >
              <User size={12} />
              <span>Login</span>
            </a>
            <button 
              onClick={() => {
                if (currentView === "home") {
                  scrollToSection("asociarse-section");
                } else {
                  navigateToHome("asociarse-section");
                }
              }}
              className="px-2.5 py-1 rounded bg-[#00a3e0] hover:bg-[#0c2356] text-white text-xs font-medium transition-colors"
            >
              Asociate
            </button>
          </div>
        </div>
      </header>

      {/* VIEW SWITCHER: HOME SECTIONS OR SUBPAGE TAB */}
      {currentView === "home" ? (
        <main id="main-home-content">
          {/* 3. HERO: historia con scroll (la fachada, los años, los sectores y la red de socios) */}
          <HeroScroll
            info={heroInfo}
            socios={ALL_CECIP_SOCIOS.length}
            entidades={dropdownMenus.entidades}
            onSumate={() => scrollToSection("asociarse-section")}
            onObjetivos={() => openContentModal("nuestros objetivos")}
            onBeneficios={() => scrollToSection("beneficios-section")}
          />

      {/* Publicidad del nuevo Portal de Socios (arriba de la Agenda) */}
      <BannerPortalSocios />

      {/* 3.5 PUBLIC CALENDAR SECTION */}
      <section 
        id="calendario-publico" 
        className="py-20 px-3 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-slate-50/60 border-t border-slate-100"
      >
        <div className="max-w-[1440px] w-full mx-auto space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-[#00a3e0] uppercase tracking-widest bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-100 inline-block">
              Agenda de Actividades
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Próximos Eventos, Muestras y Capacitaciones
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Explora e inscríbete a nuestras próximas actividades. Haz clic en las fechas destacadas del calendario para ver el detalle.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Interactive July 2026 Calendar Grid */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Calendar className="text-[#00a3e0]" size={20} />
                  <button type="button" aria-label="Mes anterior" className="p-1 rounded hover:bg-slate-100 cursor-pointer"
                    onClick={() => setMesCal(({ y, m }) => (m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 }))}>
                    <ChevronLeft size={16} />
                  </button>
                  <span className="font-extrabold text-slate-800 text-base min-w-[8.5rem] text-center">{MESES_ES[mesCal.m]} {mesCal.y}</span>
                  <button type="button" aria-label="Mes siguiente" className="p-1 rounded hover:bg-slate-100 cursor-pointer"
                    onClick={() => setMesCal(({ y, m }) => (m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 }))}>
                    <ChevronRight size={16} />
                  </button>
                </div>
                <span className="text-xs font-semibold text-[#0c2356] bg-sky-50 px-2.5 py-0.5 rounded border border-sky-100">
                  CeCIP Institucional
                </span>
              </div>

              {/* Weekdays header */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <span>Lun</span>
                <span>Mar</span>
                <span>Mié</span>
                <span>Jue</span>
                <span>Vie</span>
                <span>Sáb</span>
                <span>Dom</span>
              </div>

              {/* Calendario del mes elegido (lunes a domingo) */}
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: (new Date(mesCal.y, mesCal.m, 1).getDay() + 6) % 7 }, (_, i) => (
                  <div key={`v${i}`} className="h-10 rounded bg-slate-50/40" />
                ))}
                {Array.from({ length: new Date(mesCal.y, mesCal.m + 1, 0).getDate() }, (_, i) => {
                  const day = i + 1;
                  const dayEvent = eventsList.find((e) => e.day === day && e.monthIndex === mesCal.m && e.year === mesCal.y);
                  const isEvent = !!dayEvent;
                  const eventId = dayEvent?.id || "";
                  const themeClass = `${dayEvent?.color || "bg-[#00a3e0]"} text-white font-black hover:scale-105 shadow-sm`;
                  const isSelected = selectedWebEventId === eventId;

                  return (
                    <button
                      key={day}
                      onClick={() => isEvent && setSelectedWebEventId(eventId)}
                      className={`h-10 flex flex-col items-center justify-center rounded text-xs transition-all relative select-none ${
                        isEvent
                          ? `${themeClass} cursor-pointer ${isSelected ? "ring-2 ring-[#0c2356] ring-offset-1" : ""}`
                          : "text-slate-700 hover:bg-slate-50 cursor-default font-semibold"
                      }`}
                    >
                      <span>{day}</span>
                      {isEvent && (
                        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-white" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legends */}
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                  Referencias de Actividades:
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block" />
                    <span>Capacitaciones</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <span className="w-2.5 h-2.5 rounded bg-[#00a3e0] inline-block" />
                    <span>Eventos</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Selected Event Display Details */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              {(() => {
                const event = eventsList.find(e => e.id === selectedWebEventId) || eventsList[0];
                if (!event) {
                  return (
                    <div className="p-10 text-center text-sm text-slate-500 flex flex-col items-center justify-center h-full gap-2">
                      <Calendar className="text-slate-300" size={36} />
                      <p>No hay actividades programadas por el momento.</p>
                      <p className="text-xs">Las nuevas capacitaciones y eventos del CeCIP aparecen acá apenas se publican.</p>
                    </div>
                  );
                }
                const isEnrolled = enrolledWebEvents.includes(event.id);

                return (
                  <div className="flex flex-col h-full text-left">
                    <div className="h-48 w-full relative overflow-hidden bg-slate-100">
                      <img 
                        src={event.banner || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=500&q=80"} 
                        alt={event.titulo} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <span className="text-xs font-semibold uppercase tracking-widest text-slate-200">
                          {event.fecha} &bull; {event.hora}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold mt-1 text-white">
                          {event.titulo}
                        </h3>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {event.description}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="p-3 bg-[#f8fafc] rounded-xl border border-slate-100 text-xs">
                          <span className="block text-[10px] text-slate-400 font-bold uppercase">Lugar</span>
                          <span className="font-semibold text-slate-700">{event.lugar}</span>
                        </div>
                        <div className="p-3 bg-[#f8fafc] rounded-xl border border-slate-100 text-xs">
                          <span className="block text-[10px] text-slate-400 font-bold uppercase">Disertante</span>
                          <span className="font-semibold text-slate-700">{event.orador}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#00a3e0]">{event.precio || "Sin Costo para Asociados"}</span>
                        {isEnrolled ? (
                          <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded font-semibold text-xs flex items-center gap-1.5 border border-emerald-200">
                            <CheckCircle size={14} />
                            <span>¡Inscripto con Éxito!</span>
                          </div>
                        ) : (
                          event.inscripcionUrl ? (
                            <a
                              href={event.inscripcionUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setEnrolledWebEvents([...enrolledWebEvents, event.id])}
                              className="px-5 py-2.5 bg-[#00a3e0] hover:bg-[#0c2356] text-white rounded-lg font-medium text-xs shadow-sm transition-all cursor-pointer"
                            >
                              Inscribirme
                            </a>
                          ) : (
                            <button
                              onClick={() => scrollToSection("asociarse-section")}
                              className="px-5 py-2.5 bg-[#00a3e0] hover:bg-[#0c2356] text-white rounded-lg font-medium text-xs shadow-sm transition-all cursor-pointer"
                            >
                              Consultar
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>

        </div>
      </section>

      {/* Banner comercial de la Bolsa de Empleo (lleva directo a subir el CV) */}
      <BannerBolsaEmpleo empresas={ALL_CECIP_SOCIOS.length} onSubirCv={() => { try { sessionStorage.setItem("cecip-ir-a-cv", "1"); } catch { /* sin storage */ } window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }); navigateToPage("Bolsa de Empleo"); }} />

      {/* 4. BENEFICIOS SECTION */}
      <section id="beneficios-section" className="py-20 px-3 sm:px-6 lg:px-8 bg-white border-t border-slate-50">
        <div className="max-w-[1440px] w-full mx-auto text-center">
          
          <h2 className="text-xl sm:text-2xl font-semibold text-[#00a3e0] tracking-wide mb-12">
            Beneficios
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Informes comerciales */}
            <div className="bg-white rounded-xl border border-slate-100 p-8 shadow-[0_4px_25px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 flex flex-col justify-between items-center text-center group min-h-[310px]">
              <div className="mt-2 text-[#00a3e0]">
                <Files size={38} strokeWidth={1.75} />
              </div>
              <h3 className="text-slate-800 font-normal text-base sm:text-lg leading-snug my-6 min-h-[52px] flex items-center justify-center">
                Acceso a informes comerciales
              </h3>
              <button 
                onClick={() => openContentModal("Acceso a informes comerciales")}
                className="px-5 py-2 bg-[#0c2356] hover:bg-[#00a3e0] text-white rounded-lg text-xs font-semibold tracking-wide shadow-sm transition-all duration-300 cursor-pointer"
              >
                Leer más
              </button>
            </div>

            {/* Card 2: Asesoramiento */}
            <div className="bg-white rounded-xl border border-slate-100 p-8 shadow-[0_4px_25px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 flex flex-col justify-between items-center text-center group min-h-[310px]">
              <div className="mt-2 text-[#00a3e0]">
                <Scale size={38} strokeWidth={1.75} />
              </div>
              <h3 className="text-slate-800 font-normal text-base sm:text-lg leading-snug my-6 min-h-[52px] flex items-center justify-center">
                Asesoramiento legal e impositivo
              </h3>
              <button 
                onClick={() => openContentModal("Asesoramiento legal e impositivo")}
                className="px-5 py-2 bg-[#0c2356] hover:bg-[#00a3e0] text-white rounded-lg text-xs font-semibold tracking-wide shadow-sm transition-all duration-300 cursor-pointer"
              >
                Leer más
              </button>
            </div>

            {/* Card 3: Capacitaciones */}
            <div className="bg-white rounded-xl border border-slate-100 p-8 shadow-[0_4px_25px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 flex flex-col justify-between items-center text-center group min-h-[310px]">
              <div className="mt-2 text-[#00a3e0]">
                <GraduationCap size={40} strokeWidth={1.75} />
              </div>
              <h3 className="text-slate-800 font-normal text-base sm:text-lg leading-snug my-6 min-h-[52px] flex items-center justify-center">
                Plan integral de capacitaciónes
              </h3>
              <button 
                onClick={() => openContentModal("Plan integral de capacitaciones")}
                className="px-5 py-2 bg-[#0c2356] hover:bg-[#00a3e0] text-white rounded-lg text-xs font-semibold tracking-wide shadow-sm transition-all duration-300 cursor-pointer"
              >
                Leer más
              </button>
            </div>

            {/* Card 4: Instalaciones */}
            <div className="bg-white rounded-xl border border-slate-100 p-8 shadow-[0_4px_25px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 flex flex-col justify-between items-center text-center group min-h-[310px]">
              <div className="mt-2 text-[#00a3e0]">
                <Home size={38} strokeWidth={1.75} />
              </div>
              <h3 className="text-slate-800 font-normal text-base sm:text-lg leading-snug my-6 min-h-[52px] flex items-center justify-center">
                Uso de nuestras instalaciones
              </h3>
              <button 
                onClick={() => openContentModal("Uso de nuestras instalaciones")}
                className="px-5 py-2 bg-[#0c2356] hover:bg-[#00a3e0] text-white rounded-lg text-xs font-semibold tracking-wide shadow-sm transition-all duration-300 cursor-pointer"
              >
                Leer más
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ComercIA Inteligente: historia con scroll */}
      <ComercIASeccion onConocer={() => navigateToPage("Conocé ComercIA")} />

      {/* 5. ASOCIARSE SECTION */}
      <section id="asociarse-section" className="py-20 px-3 sm:px-6 lg:px-8 bg-[#fafcff] overflow-hidden border-t border-slate-100">
        <div className="max-w-[1440px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Organic Circular Collage Image (Left) */}
          <div className="lg:col-span-5 flex justify-center relative py-6">
            
            {/* Cyan background fluid blob */}
            <div 
              className="absolute -top-6 -left-6 sm:-top-8 sm:-left-8 w-64 h-64 sm:w-72 sm:h-72 bg-[#bae6fd]/55 pointer-events-none transition-all"
              style={{ borderRadius: "50% 60% 40% 60% / 60% 40% 60% 40%" }}
            />

            {/* Foreground CeCIP navy accent blob */}
            <div 
              className="absolute -bottom-4 -right-2 w-32 h-40 bg-[#0c2356]/85 pointer-events-none z-20 mix-blend-multiply transition-all"
              style={{ borderRadius: "55% 45% 60% 40% / 50% 50% 50% 50%" }}
            />

            {/* Central blob container with meeting photo */}
            <div 
              className="w-[280px] h-[320px] sm:w-[350px] sm:h-[400px] overflow-hidden shadow-2xl relative z-10 bg-slate-100 transition-transform duration-500 hover:scale-[1.01]"
              style={{ borderRadius: "50% 50% 45% 55% / 55% 45% 55% 45%" }}
            >
              <img 
                src={asociarseImage} 
                alt="Colaboración de Pymes" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Interactive Membership Form (Right) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <h2 className="text-3xl sm:text-4xl font-normal text-slate-900 tracking-tight mb-4">
              Asociarse
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8 max-w-xl">
              Como institución entendemos que, para mejorar la calidad del comercio, la industria y los servicios, debemos trabajar de manera conjunta con todos los protagonistas del sector.
            </p>

            <div className="w-full max-w-lg bg-white border border-slate-200/70 shadow-lg rounded-xl p-6 sm:p-8 relative">
              {!isSubmitted ? (
                <form 
                  key="form"
                  onSubmit={handleSubmit} 
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                      Nombre y Apellido <span className="text-[#00a3e0]">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      placeholder="Ej. Juan Pérez"
                      className="w-full bg-[#f8fafc] border border-slate-200 rounded px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#00a3e0] focus:bg-white transition-all placeholder:text-slate-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                      Empresa <span className="text-[#00a3e0]">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="empresa"
                      value={formData.empresa}
                      onChange={handleInputChange}
                      placeholder="Ej. Mi Pyme S.R.L."
                      className="w-full bg-[#f8fafc] border border-slate-200 rounded px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#00a3e0] focus:bg-white transition-all placeholder:text-slate-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                      Teléfono <span className="text-[#00a3e0]">*</span>
                    </label>
                    <input 
                      type="tel" 
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      placeholder="Ej. +54 343 154575070"
                      className="w-full bg-[#f8fafc] border border-slate-200 rounded px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#00a3e0] focus:bg-white transition-all placeholder:text-slate-400"
                      required
                    />
                  </div>

                  {showError && (
                    <div className="text-red-500 text-xs font-medium bg-red-50 p-2.5 rounded border border-red-100">
                      Por favor completa todos los campos requeridos (*).
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="w-full py-3 bg-[#00a3e0] hover:bg-[#0c2356] text-white rounded-lg font-bold text-sm shadow-md shadow-[#00a3e0]/20 transition-all duration-300 cursor-pointer"
                  >
                    Enviar
                  </button>
                </form>
              ) : (
                <div 
                  key="success"
                  className="py-8 flex flex-col items-center text-center transition-all duration-300"
                >
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4 border border-emerald-100">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    ¡Solicitud Recibida!
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed max-w-sm mb-6">
                    Gracias, <strong className="text-slate-800">{formData.nombre}</strong>. Nos pondremos en contacto para coordinar la incorporación de <strong className="text-slate-800">{formData.empresa}</strong> a CeCIP a la brevedad.
                  </p>
                  <button 
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({ nombre: "", empresa: "", telefono: "" });
                    }}
                    className="px-5 py-2 border border-slate-200 rounded text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-all text-xs font-medium cursor-pointer"
                  >
                    Enviar otra solicitud
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* 6. NOTICIAS SECTION */}
      <section id="noticias-section" className="py-20 px-3 sm:px-6 lg:px-8 bg-white border-t border-slate-100">
        <div className="max-w-[1440px] w-full mx-auto text-center">
          
          <h2 className="text-xl sm:text-2xl font-semibold text-[#00a3e0] tracking-wide mb-12">
            Noticias
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {news.slice(0, 3).map((item) => (
              <div 
                key={item.id}
                onClick={() => openContentModal(item.title)}
                className="bg-white rounded-xl border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col justify-between cursor-pointer hover:shadow-lg transition-all text-left group"
              >
                {/* Upper Image / Placeholder Area */}
                <div className="h-48 sm:h-52 bg-[#f1f5f9] flex items-center justify-center relative overflow-hidden border-b border-slate-100">
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full border border-slate-300 opacity-60 flex items-center justify-center text-slate-400">
                      <span className="text-xs">●</span>
                    </div>
                  )}
                </div>

                {/* Lower Content Box */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <h3 className="font-medium sm:font-semibold text-slate-800 text-sm sm:text-base leading-snug group-hover:text-[#00a3e0] transition-colors line-clamp-3">
                    {item.title}
                  </h3>
                  <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
                    <span>{item.date}</span>
                    <span className="text-[#00a3e0] font-semibold group-hover:underline">Leer más →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </main>
  ) : (
    <SubPageView
      pageTitle={activeSubPage?.title || "Información"}
      categoryName={activeSubPage?.categoryName}
      badge={activeSubPage?.badge}
      description={activeSubPage?.description}
      additionalInfo={activeSubPage?.additionalInfo}
      itemsList={activeSubPage?.itemsList}
      newsItem={activeSubPage?.newsItem}
      gruposErp={gruposErp}
      onBuscarComercios={() => navigateToPage("Comercios Asociados")}
      totalSocios={ALL_CECIP_SOCIOS.length}
      onBackToHome={() => navigateToHome()}
      onOpenAsociateModal={() => navigateToHome("asociarse-section")}
    />
  )}

      {/* 7. FOOTER SECTION */}
      <footer id="footer-section" className="bg-[#071738] text-white pt-20 pb-8 px-3 sm:px-6 lg:px-8 relative overflow-hidden">
        
        {/* Soft background wave glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00a3e0]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1440px] w-full mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 pb-16 border-b border-white/10 relative z-10">
          
          {/* Footer Column 1: Brand & Desc */}
          <div className="md:col-span-5 flex flex-col items-start text-left">
            <div className="flex flex-col mb-6 select-none">
              <div className="text-4xl sm:text-5xl font-black tracking-tight leading-none flex items-baseline">
                <span className="text-[#00a3e0]">Ce</span>
                <span className="text-white">CI</span>
                <span className="text-[#00a3e0]">P</span>
              </div>
              <span className="text-xs font-semibold text-slate-300 tracking-tight mt-2">
                Centro Comercial e Industrial de Paraná
              </span>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-8 max-w-sm">
              Como institución entendemos que, para mejorar la calidad del comercio, la industria y los servicios, debemos trabajar de manera conjunta con todos los protagonistas del sector.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://www.instagram.com/centrocomercialparana/" target="_blank" rel="noopener noreferrer" aria-label="Instagram del CeCIP" className="w-10 h-10 rounded-full bg-[#00a3e0] hover:bg-white hover:text-[#0c2356] text-white flex items-center justify-center transition-colors shadow-sm">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Footer Column 2: Navigation Links */}
          <div className="md:col-span-3 flex flex-col items-start text-left">
            <h4 className="text-[#00a3e0] font-semibold text-sm mb-6">
              Menú
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm font-normal text-white/85">
              <li>
                <button onClick={() => navigateToPage("Autoridades")} className="hover:text-[#00a3e0] transition-colors cursor-pointer">
                  Autoridades
                </button>
              </li>
              <li>
                <button onClick={() => navigateToPage("Comercios Asociados")} className="hover:text-[#00a3e0] transition-colors cursor-pointer text-[#00a3e0] font-medium flex items-center gap-1.5">
                  <span>Comercios Asociados (231)</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    if (currentView === "home") scrollToSection("beneficios-section");
                    else navigateToHome("beneficios-section");
                  }} 
                  className="hover:text-[#00a3e0] transition-colors cursor-pointer"
                >
                  Beneficios
                </button>
              </li>
              <li>
                <button onClick={() => navigateToPage("Historia")} className="hover:text-[#00a3e0] transition-colors cursor-pointer">
                  Historia
                </button>
              </li>
              <li>
                <button onClick={() => navigateToPage("Nuestros objetivos")} className="hover:text-[#00a3e0] transition-colors cursor-pointer">
                  Objetivos
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    if (currentView === "home") scrollToSection("calendario-publico");
                    else navigateToHome("calendario-publico");
                  }} 
                  className="hover:text-[#00a3e0] transition-colors cursor-pointer"
                >
                  Capacitaciones
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    if (currentView === "home") scrollToSection("noticias-section");
                    else navigateToHome("noticias-section");
                  }} 
                  className="hover:text-[#00a3e0] transition-colors cursor-pointer"
                >
                  Noticias
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection("footer-section")} className="hover:text-[#00a3e0] transition-colors cursor-pointer">
                  Contacto
                </button>
              </li>
            </ul>
          </div>

          {/* Footer Column 3: Contact Info */}
          <div className="md:col-span-4 flex flex-col items-start text-left space-y-6">
            <h4 className="text-[#00a3e0] font-semibold text-sm mb-2">
              Contacto
            </h4>
            
            <div className="flex items-start gap-3">
              <div className="mt-1 text-[#00a3e0]">
                <Phone size={18} />
              </div>
              <div className="flex flex-col">
                <a href="tel:03434312785" className="text-xs sm:text-sm font-normal hover:text-[#00a3e0] transition-colors">
                  0343 4312785/ WSP 343 4575070
                </a>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  Lunes a viernes de 09:00 a 17:00 hs
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 text-[#00a3e0]">
                <Mail size={18} />
              </div>
              <div className="flex flex-col">
                <a href="mailto:info@centrocomercialparana.com.ar" className="text-xs sm:text-sm font-normal hover:text-[#00a3e0] transition-colors">
                  info@centrocomercialparana.com.ar
                </a>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  Consultas
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 text-[#00a3e0]">
                <MapPin size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-normal">
                  25 de Mayo 28 – 1º piso
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  Paraná, Entre Ríos.
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="max-w-[1440px] w-full mx-auto pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10 text-[11px] font-normal text-slate-400">
          <span>© {new Date().getFullYear()} Centro Comercial e Industrial de Paraná. Todos los derechos reservados.</span>

          {/* firma de quienes desarrollaron la web */}
          <div className="tema-fijo flex items-center gap-2.5 text-slate-400">
            <span>Sitio desarrollado por</span>
            <span className="flex items-center gap-2 rounded-full bg-white/[.06] py-1 pl-1 pr-3 ring-1 ring-white/10">
              <img src="/images/comercia/logo-iec.webp" alt="Instituto IEC" className="h-7 w-7 rounded-full bg-white object-contain p-0.5" />
              <span className="font-semibold text-white">Instituto IEC</span>
            </span>
          </div>
        </div>

      </footer>

      {/* Dynamic search view overlay */}
      {isSearchOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 transition-all duration-150"
        >
          <div 
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative"
          >
            <button 
              onClick={() => setIsSearchOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 transition-all"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 text-cecip-blue mb-4">
              <Search size={22} />
              <h3 className="text-lg font-bold text-slate-800">Resultados para "{searchQuery}"</h3>
            </div>

            <div className="space-y-3.5 mt-2 max-h-[350px] overflow-y-auto pr-2">
              
              {/* Search in 231 Comercios Asociados */}
              {(() => {
                const q = searchQuery.toLowerCase().trim();
                const matchingSocios = ALL_CECIP_SOCIOS.filter(s => 
                  s.nombreComercial?.toLowerCase().includes(q) ||
                  s.razonSocial?.toLowerCase().includes(q) ||
                  s.rubro?.toLowerCase().includes(q) ||
                  s.direccion?.toLowerCase().includes(q)
                ).slice(0, 4);

                if (matchingSocios.length > 0) {
                  return (
                    <div className="p-3.5 bg-sky-50/70 rounded-xl border border-sky-100">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold text-[#00a3e0] uppercase tracking-wider flex items-center gap-1.5">
                          <Building2 size={13} />
                          <span>Comercios Asociados ({matchingSocios.length})</span>
                        </h4>
                        <button 
                          onClick={() => { setIsSearchOpen(false); navigateToPage("Comercios Asociados"); }}
                          className="text-[11px] font-bold text-[#00a3e0] hover:underline cursor-pointer"
                        >
                          Ver todos →
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {matchingSocios.map(socio => (
                          <div 
                            key={socio.id}
                            onClick={() => { setIsSearchOpen(false); navigateToPage("Comercios Asociados"); }}
                            className="p-2 bg-white rounded-lg border border-slate-100 hover:border-sky-300 transition-colors cursor-pointer text-left"
                          >
                            <p className="text-xs font-bold text-slate-800">{socio.nombreComercial || socio.razonSocial}</p>
                            <p className="text-[10px] text-slate-500">{socio.rubro} &bull; {socio.direccion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Dynamically search standard news headers */}
              {["ventas", "turismo", "seleccion", "padre", "millones", "institucion", "cecip", "parana"].some(key => searchQuery.toLowerCase().includes(key)) ? (
                <div 
                  className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100/80 transition-all border border-slate-100 cursor-pointer" 
                  onClick={() => { 
                    setIsSearchOpen(false); 
                    if (currentView === "home") scrollToSection("noticias-section");
                    else navigateToHome("noticias-section");
                  }} 
                >
                  <h4 className="text-xs font-bold text-cecip-blue mb-1 uppercase tracking-wider">Noticias y Comunicados</h4>
                  <p className="text-slate-700 text-xs font-medium">Ver las últimas novedades relacionadas con "{searchQuery}" en la sección de Noticias.</p>
                </div>
              ) : null}

              <div 
                onClick={() => { setIsSearchOpen(false); navigateToPage("Comercios Asociados"); }}
                className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all border border-slate-100 cursor-pointer flex items-center justify-between text-xs text-slate-600 font-medium"
              >
                <span className="flex items-center gap-2">
                  <Building2 size={14} className="text-[#00a3e0]" />
                  <span>Explorar los 231 comercios asociados al CeCIP</span>
                </span>
                <span className="text-[#00a3e0] font-bold">Ver padrón →</span>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Partner Companies (Socios) Portal Overlay Modal */}
      {showSocioPortal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="relative bg-white w-full max-w-6xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
          >
            <div className="flex justify-between items-center bg-cecip-blue text-white px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏢</span>
                <h3 className="text-lg font-bold">Portal de Empresas Socias</h3>
              </div>
              <button 
                onClick={() => setShowSocioPortal(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-1 bg-slate-50">
              <SociosPortal cvsUpdatedCounter={cvsUpdatedCounter} />
            </div>
          </div>
        </div>
      )}

      {/* Website Private Admin Portal Overlay Modal */}
      {showAdminPortal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="relative bg-white w-full max-w-6xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
          >
            <div className="flex justify-between items-center bg-slate-800 text-white px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚙️</span>
                <h3 className="text-lg font-bold">Consola de Gestión Privada (Administración)</h3>
              </div>
              <button 
                onClick={() => setShowAdminPortal(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-1 bg-slate-50">
              <PrivateAdminPortal 
                onNewsUpdated={handleNewsUpdated} 
                onEventsUpdated={handleEventsUpdated}
                onHeroUpdated={handleHeroUpdated}
                onOpenErp={() => setShowErpPortal(true)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ERP (Área de Gestión) Fullscreen View */}
      {showErpPortal && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-950 text-white w-screen h-screen flex flex-col overflow-hidden"
        >
          <ErpPortal onClose={() => setShowErpPortal(false)} />
        </div>
      )}

      {/* Bolsa de Empleo Overlay Modal */}
      {showBolsaModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="relative bg-white w-full max-w-4xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
          >
            <div className="flex justify-between items-center bg-cecip-blue text-white px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">💼</span>
                <h3 className="text-lg font-bold">Bolsa de Empleo</h3>
              </div>
              <button 
                onClick={() => setShowBolsaModal(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-50">
              <div className="max-w-3xl mx-auto space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
                    Carga tu Currículum Vitae
                  </h2>
                  <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
                    Carga tu currículum de forma gratuita. Los comercios, industrias y pymes socias de CeCIP Paraná podrán visualizar tu perfil y contactarte si están interesados en tu perfil profesional.
                  </p>
                </div>
                
                <ResumePortal onCVSubmitted={() => setCvsUpdatedCounter(prev => prev + 1)} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating CeCIP Copilot AI Assistant Bubble */}
      <CecipCopilotWidget />

      {/* Floating toast notification when user clicks on blocked Login button */}
      {proximamenteNotice && (
        <div className="fixed bottom-6 right-6 z-[9999] max-w-sm bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
            <Clock size={16} />
          </div>
          <div className="text-xs">
            <p className="font-bold text-amber-300">Próximamente disponible</p>
            <p className="text-slate-300">{proximamenteNotice}</p>
          </div>
          <button 
            type="button"
            onClick={() => setProximamenteNotice(null)}
            className="text-slate-400 hover:text-white p-1 ml-auto cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

    </div>
  );
}
