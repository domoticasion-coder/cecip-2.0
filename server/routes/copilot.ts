import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import { db, supabase } from "../db";
import { WEBSITE_KNOWLEDGE } from "../data/websiteKnowledge";

const router = Router();

// Lazy Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// POST /api/copilot/tools -> Specialized operational intelligence
router.post("/copilot/tools", async (req, res) => {
  try {
    const { tool, params = {} } = req.body;
    const state = db.getState();

    switch (tool) {
      case "get_socio_salud": {
        const { socioId } = params;
        const historiales = state.socioSaludHistorial.filter(h => h.socioId === socioId);
        if (historiales.length === 0) return res.status(404).json({ error: "Salud no calculada para este socio." });
        const actual = historiales.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0];
        return res.json({ salud: actual });
      }

      case "get_alertas_urgentes": {
        const urgentes = state.alertas.filter(a => (a.prioridad === "Crítica" || a.prioridad === "Alta") && a.estado !== "Resuelta" && a.estado !== "Descartada");
        return res.json({ alertas: urgentes });
      }

      case "get_oportunidades": {
        return res.json({ oportunidades: state.oportunidades.filter(o => o.estado === "Detectada" || o.estado === "En contacto") });
      }

      case "get_deudores": {
        const debtBills = state.facturas.filter(
          (b) => b.estado === "Pendiente" || b.estado === "Mora" || b.estado === "Vencido"
        );
        const sociosMap: Record<string, { socioId: string; socioNombre: string; facturas: any[]; totalDeuda: number }> = {};
        for (const bill of debtBills) {
          if (!sociosMap[bill.socioId]) {
            sociosMap[bill.socioId] = {
              socioId: bill.socioId,
              socioNombre: bill.socioNombre,
              facturas: [],
              totalDeuda: 0,
            };
          }
          sociosMap[bill.socioId].facturas.push(bill);
          sociosMap[bill.socioId].totalDeuda += bill.monto + (bill.intereses || 0);
        }
        return res.json({ deudores: Object.values(sociosMap) });
      }

      case "get_socio_info": {
        const { idOrCuit } = params;
        const socio = state.socios.find(
          (s) => s.id === idOrCuit || s.cuit === idOrCuit || s.nombreComercial.toLowerCase().includes(String(idOrCuit).toLowerCase())
        );
        if (!socio) return res.status(404).json({ error: "Socio no encontrado." });
        const facturas = state.facturas.filter((b) => b.socioId === socio.id);
        const crm = state.crm.filter((c) => c.socioId === socio.id);
        const tickets = state.tickets.filter((t) => t.socioId === socio.id);
        return res.json({ socio, facturas, crm, tickets });
      }

      case "get_financial_summary": {
        const totalCaja = state.tesoreria
          .filter((t) => t.banco === "Caja Efectiva")
          .reduce((s, t) => s + (t.tipo === "Ingreso" ? t.monto : -t.monto), 0);
        const totalEntreRios = state.tesoreria
          .filter((t) => t.banco === "Banco Entre Ríos")
          .reduce((s, t) => s + (t.tipo === "Ingreso" ? t.monto : -t.monto), 0);
        const totalMercadoPago = state.tesoreria
          .filter((t) => t.banco === "Mercado Pago Cuenta")
          .reduce((s, t) => s + (t.tipo === "Ingreso" ? t.monto : -t.monto), 0);
        const totalBancoNacion = state.tesoreria
          .filter((t) => t.banco === "Banco Nación")
          .reduce((s, t) => s + (t.tipo === "Ingreso" ? t.monto : -t.monto), 0);
        return res.json({
          totalCaja,
          totalEntreRios,
          totalMercadoPago,
          totalBancoNacion,
          saldoTotal: totalCaja + totalEntreRios + totalMercadoPago + totalBancoNacion,
          movimientosCount: state.tesoreria.length,
        });
      }

      case "get_eventos_proximos": {
        return res.json({ eventos: state.eventos });
      }

      case "search_cvs": {
        const { area, query } = params;
        let results = state.cvs;
        if (area && area !== "Todos") {
          results = results.filter((c) => c.areaBusqueda.toLowerCase() === area.toLowerCase());
        }
        if (query) {
          const q = query.toLowerCase();
          results = results.filter(
            (c) =>
              c.nombre.toLowerCase().includes(q) ||
              c.comentarios?.toLowerCase().includes(q) ||
              c.tipoProfesional.toLowerCase().includes(q)
          );
        }
        return res.json({ cvs: results });
      }

      default:
        return res.status(400).json({ error: `Herramienta ${tool} no reconocida.` });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Helper: Normalize incoming chat history
interface NormalizedTurn {
  role: "user" | "model";
  text: string;
}

function normalizeChatHistory(rawHistory: any[]): NormalizedTurn[] {
  if (!Array.isArray(rawHistory)) return [];
  const normalized: NormalizedTurn[] = [];

  for (const h of rawHistory) {
    if (!h) continue;
    const role: "user" | "model" = (h.role === "user" || h.sender === "user") ? "user" : "model";
    let text = "";
    if (typeof h.text === "string") {
      text = h.text;
    } else if (Array.isArray(h.parts) && h.parts[0]?.text) {
      text = h.parts[0].text;
    }
    if (text && text.trim()) {
      normalized.push({ role, text: text.trim() });
    }
  }

  return normalized;
}

// Helper: Contextual conversational AI reasoning engine for CeCIP Copilot
function generateContextualCopilotAnswer(
  message: string,
  history: NormalizedTurn[],
  ctx: any,
  userRole: string
): string {
  const {
    socios = [],
    bills = [],
    events = [],
    cvs = [],
  } = ctx;

  const q = message.toLowerCase().trim();
  const rawQ = message.trim();

  // Detect previous conversation topics from history
  const recentHistory = history.slice(-5);
  const historyText = recentHistory.map((h) => h.text.toLowerCase()).join(" ");

  const wasDiscussingCursos = historyText.includes("curso") || historyText.includes("capacita") || historyText.includes("taller") || historyText.includes("seminario");
  const wasDiscussingCuotas = historyText.includes("cuota") || historyText.includes("asociar") || historyText.includes("afiliar") || historyText.includes("arancel");
  const wasDiscussingBolsa = historyText.includes("empleo") || historyText.includes("cv") || historyText.includes("trabajo") || historyText.includes("curriculum");
  const wasDiscussingComercios = historyText.includes("comercio") || historyText.includes("empresa") || historyText.includes("asociad") || historyText.includes("rubro");

  // ==========================================
  // 1. GREETINGS & SMALL TALK
  // ==========================================
  const isGreetingOnly =
    /^(hola|buen d[ií]a|buenos d[ií]as|buenas tardes|buenas noches|buenas|hola qué tal|hola que tal|qué tal|que tal|cómo estás|como estas|cómo te va|como te va|hola copilot|hola cecip)\b/i.test(q) &&
    q.length < 35;

  if (isGreetingOnly) {
    if (recentHistory.length > 0) {
      return `¡Hola de nuevo! 👋 ¿En qué más puedo orientarte sobre **CeCIP**? Puedo responderte sobre comercios asociados, cuotas de afiliación, capacitaciones, la bolsa de empleo o nuestros canales de atención.`;
    }
    return `¡Hola! 👋 Bienvenido/a a **CeCIP Copilot**, el asistente oficial del **Centro Comercial e Industrial de Paraná**.

Estoy para ayudarte en todo lo relacionado con la institución y sus servicios:
- 🏢 **Comercios e industrias asociadas**: búsqueda de rubros o empresas en Paraná.
- 📝 **Asociarse**: requisitos, categorías arancelarias y valores de cuotas.
- 🌟 **Beneficios**: asesoría legal y contable sin costo, informes Veraz/Nosis, salón de actos.
- 📅 **Capacitaciones y eventos**: agenda de cursos y seminarios bonificados.
- 💼 **Bolsa de Empleo**: carga de CVs y búsqueda de perfiles laborales para pymes.
- 📍 **Sede y contacto**: horarios de atención, teléfonos y ubicación.

¿Sobre qué tema te gustaría consultar hoy?`;
  }

  // ==========================================
  // 2. GRATITUDE & FAREWELLS
  // ==========================================
  const isGratitude = /^(gracias|muchas gracias|mil gracias|joya|perfecto|genial|excelente|impecable|buen[ií]simo|muchas gracias por la ayuda)\b/i.test(q) && q.length < 40;
  if (isGratitude) {
    return `¡Con mucho gusto! Me alegra haberte podido ayudar. 😊

Si te surge alguna otra consulta sobre el **CeCIP**, gestiones comerciales o trámites gremiales, aquí estoy a tu disposición. ¡Que tengas un excelente día!`;
  }

  const isFarewell = /^(chau|adi[oó]s|hasta luego|nos vemos|hasta pronto)\b/i.test(q) && q.length < 30;
  if (isFarewell) {
    return `¡Hasta luego! Quedo disponible cuando lo necesites. ¡Muchos éxitos con tu comercio o actividad productiva! 👋`;
  }

  // ==========================================
  // 3. ADMIN, LOGIN, PESTAÑAS Y ACCESOS AL SISTEMA
  // ==========================================
  const isAdminOrLoginQuery =
    (q.includes("admin") ||
    q.includes("administra") ||
    q.includes("erp") ||
    q.includes("login") ||
    q.includes("clave") ||
    q.includes("contraseña") ||
    q.includes("contrasena") ||
    q.includes("iniciar sesión") ||
    q.includes("iniciar sesion") ||
    q.includes("consola") ||
    q.includes("admincecip") ||
    ((q.includes("pestaña") || q.includes("pestana") || q.includes("botón") || q.includes("boton") || q.includes("donde entro") || q.includes("dónde entro") || q.includes("cómo entro") || q.includes("como entro") || q.includes("cómo ingresar") || q.includes("como ingresar")) && (q.includes("admin") || q.includes("sistema") || q.includes("gestión") || q.includes("gestion") || q.includes("panel") || /\b(socio|socios)\b/.test(q)))) &&
    !q.includes("asociar") && !q.includes("asocio") && !q.includes("asociate") && !q.includes("asociarme");

  if (isAdminOrLoginQuery) {
    return `### 🔐 Acceso al Panel de Administración y ERP · CeCIP

Por motivos de seguridad institucional y privacidad:

1. **No hay ninguna pestaña pública visible para Admin en el menú:** La consola de administración se mantiene resguardada y oculta de la navegación general.
2. **El botón "Login Socios" en la barra superior:** Se encuentra actualmente bloqueado con aviso de *"Próximamente"*.
3. **Cómo ingresar al Panel de Administración:** Se accede directamente desde el navegador agregando **/admincecip** al final de la dirección web (ejemplo: \`https://.../admincecip\`).

---

#### 🔑 Credenciales de Acceso:
- **Administrador General:** \`admin@cecip.org\` | Clave: \`cecip2026\`
- **Tesorería y Cobranzas:** \`tesorero@cecip.org\` | Clave: \`caja123\`
- **Atención al Socio:** \`atencion@cecip.org\` | Clave: \`soporte123\``;
  }

  // ==========================================
  // 4. MAPA Y NAVEGACIÓN DE PESTAÑAS DE LA WEB
  // ==========================================
  if (q.includes("pestaña") || q.includes("pestana") || q.includes("sección") || q.includes("seccion") || q.includes("menú") || q.includes("menu")) {
    if (q.includes("asociar") || q.includes("afiliar") || q.includes("asocio") || q.includes("asociate") || q.includes("unirme")) {
      return `### 📝 Dónde asociarse

Puedes acceder al formulario de afiliación desde la pestaña **"Asociate"** destacada en celeste en la barra de navegación principal, o bajando hasta la sección **"Asociarse a CeCIP"** de la portada.`;
    }
    if (q.includes("noticia") || q.includes("novedad") || q.includes("comunicado")) {
      return `### 📰 Dónde ver las Noticias y Comunicados

Las noticias e informes de CeCIP se encuentran en la sección **"Noticias"** de la página de inicio (scroll hasta la sección de novedades) o haciendo clic en el enlace **"Noticias"** del pie de página.`;
    }
    if (q.includes("comercio") || q.includes("padrón") || q.includes("padron") || q.includes("directorio") || /\b(socio|socios)\b/.test(q)) {
      return `### 🏢 Dónde ver los Comercios Asociados

Puedes explorar los 231 comercios e industrias directamente desde la pestaña **"Comercios Asociados"** de la barra de navegación principal (o haciendo clic en **"Comercios"** en el móvil).`;
    }
    if (q.includes("curso") || q.includes("capacita") || q.includes("taller") || q.includes("evento")) {
      return `### 📅 Dónde ver las Capacitaciones y Cursos

La agenda completa de cursos y talleres se encuentra en la pestaña **"Capacitaciones"** de la barra principal, con el calendario de fechas y formulario de inscripción directa.`;
    }
    if (q.includes("contacto") || q.includes("mensaje") || q.includes("consulta")) {
      return `### 📞 Dónde contactarnos

En la pestaña **"Contacto"** de la barra de navegación accedes al formulario de mensajes directos, teléfonos, WhatsApp y ubicación geográfica de la Sede Central.`;
    }
  }

  // ==========================================
  // 5. CONTEXTUAL FOLLOW-UP RESOLUTION
  // ==========================================
  // A. "¿Cuánto cuesta?", "¿Cuánto sale?", "¿Es gratis?"
  if (q.includes("cuánto cuesta") || q.includes("cuanto cuesta") || q.includes("cuánto sale") || q.includes("cuanto sale") || q.includes("cuánto es") || q.includes("cuanto es") || q.includes("es gratis") || q.includes("es gratuita") || q.includes("precio") || q.includes("arancel") || q.includes("costo")) {
    if (wasDiscussingCursos || q.includes("curso") || q.includes("capacita") || q.includes("taller")) {
      return `### 🎓 Costos de Capacitaciones y Cursos CeCIP

- **Socios Activos de CeCIP:** **100% bonificado (totalmente gratuito)** para titulares y personal de comercios o empresas asociadas.
- **Público General / No Socios:** Algunos talleres específicos pueden requerir un arancel mínimo de inscripción para certificación oficial.

> Puedes consultar la agenda completa e inscribirte en la sección **Capacitaciones** de nuestra web.`;
    }

    if (wasDiscussingBolsa || q.includes("cv") || q.includes("empleo")) {
      return `### 💼 Costo de la Bolsa de Empleo CeCIP

- **Para Postulantes:** La carga y publicación de tu currículum es **100% gratuita**. Puedes registrarte y postularte sin ningún arancel.
- **Para Comercios Asociados:** El acceso a los perfiles y CVs de candidatos es un **beneficio exclusivo incluido en la cuota social** de CeCIP.`;
    }

    // Default to membership fees
    return `### 💳 Valores de la Cuota Social de Afiliación CeCIP

El arancel mensual varía según la envergadura y categoría de tu comercio o empresa:

| Categoría Empresaria | Cuota Mensual | Beneficios Incluidos |
| :--- | :--- | :--- |
| **Pequeño Comercio** | **$3.500 / mes** | Informes Veraz/Nosis + Asesoría Legal/Contable + Capacitaciones |
| **Servicios** | **$4.500 / mes** | Informes comerciales + Asesoría técnica + Red de convenios |
| **Mediana Empresa** | **$6.000 / mes** | Paquete integral + Descuentos en alquiler de Salón de Actos |
| **Gran Industria** | **$12.000 / mes** | Representación gremial de 1° nivel (CAME/CAC/FEDER) + Bolsa |

*La cuota se amortiza con el uso de informes comerciales Veraz/Nosis bonificados y las horas de consultoría.*`;
  }

  // B. "¿Dónde es?", "¿Dónde queda?", "¿Cómo llego?"
  if (q.includes("dónde es") || q.includes("donde es") || q.includes("dónde se hace") || q.includes("donde se hace") || q.includes("dónde se dicta") || q.includes("donde se dicta") || q.includes("dónde queda") || q.includes("donde queda") || q.includes("cómo llego") || q.includes("como llego") || q.includes("ubicación") || q.includes("ubicacion") || q.includes("dirección") || q.includes("direccion") || q.includes("sede")) {
    if (wasDiscussingCursos) {
      return `### 📍 Lugar de Dictado de las Capacitaciones

Las actividades presenciales se realizan en:
- **Salón Auditorio CeCIP:** Calle 25 de Mayo 28, 1º Piso (microcentro de Paraná, Entre Ríos).
- **Modalidad Virtual:** Para talleres híbridos o remotos, se envía el enlace de acceso por correo y WhatsApp tras la inscripción.`;
    }

    const s = WEBSITE_KNOWLEDGE.institucion.sedeCentral;
    return `### 📍 Sede Central y Canales de Contacto · CeCIP Paraná

- **Dirección:** **${s.direccion}**
- **Referencia Urbana:** ${s.referencia}
- **Horario de Atención:** ⏰ **${s.horario}**
- **Teléfono Fijo:** 📞 **${s.telefono}**
- **WhatsApp Oficial:** 📱 **${s.whatsapp}**
- **Correo Electrónico:** 📧 \`${s.email}\`
- **Sitio Web Oficial:** 🌐 [centrocomercialparana.com.ar](${s.web})

*Nuestra sede cuenta con recepción presencial, secretaría administrativa y salón de conferencias en el primer piso.*`;
  }

  // C. "¿Cómo me anoto?", "¿Cómo me inscribo?", "¿Cómo me asocio?"
  if (q.includes("cómo me anoto") || q.includes("como me anoto") || q.includes("cómo me inscribo") || q.includes("como me inscribo") || q.includes("cómo me asocio") || q.includes("como me asocio") || q.includes("cómo participar") || q.includes("como participar") || q.includes("requisito") || q.includes("asociarme") || q.includes("afiliarme") || q.includes("asociarse")) {
    if (wasDiscussingCursos) {
      return `### 📝 Cómo inscribirte a un Curso o Taller en CeCIP

1. Dirígete a la sección **Capacitaciones** en el menú de la web.
2. Selecciona el taller de tu interés y haz clic en **"Inscribirme"**.
3. Completa tus datos (Nombre, Empresa/Comercio, Teléfono y Correo).
4. O contáctanos directamente por WhatsApp al **343 4575070** indicando el curso que deseas realizar.`;
    }

    if (wasDiscussingBolsa) {
      return `### 💼 Cómo postularte en la Bolsa de Empleo

1. Haz clic en el botón **"Bolsa de Empleo"** en la barra de navegación o en el pie de página.
2. Elige tu área de interés (Comercio, Ventas, Administración, Logística, etc.).
3. Carga tus datos de contacto y adjunta tu CV en formato PDF.
4. Tu perfil quedará a disposición de las más de 230 empresas y comercios socios de Paraná.`;
    }

    return `### 📝 Cómo Asociar tu Comercio o Empresa a CeCIP

El trámite es sencillo y ágil:

#### 📋 Requisitos Básicos:
1. Poseer CUIT comercial, industrial o de servicios en Paraná o zona de influencia.
2. Contar con habilitación o actividad económica comprobable.

#### 🚀 Pasos para la Afiliación:
1. **Formulario Online:** Ingresa a la sección **"Asociarse"** en nuestra web y completa los datos de tu empresa.
2. **Atención Presencial:** Puedes acercarte a la Sede Central en **Calle 25 de Mayo 28, 1° Piso** (Lun a Vie 09:00 a 17:00 hs).
3. **Contacto Inmediato:** Envíanos un WhatsApp al **343 4575070** o llámanos al **(0343) 4312785** para que un asesor te asista.

*Una vez confirmada la adhesión, accedes de inmediato a informes Veraz/Nosis, asesoría profesional y todos los beneficios gremiales.*`;
  }

  // ==========================================
  // 4. DIRECTORY & BUSINESS SEARCH (PADRÓN DE SOCIOS)
  // ==========================================
  const rubroKeywords = [
    "ferreter", "pintur", "farmac", "indumentaria", "ropa", "calzado", "zapater",
    "óptica", "optica", "gastronom", "restauran", "bar", "comida", "inmobiliari",
    "seguro", "construc", "material", "auto", "concesionar", "estacion de servicio",
    "combustible", "imprent", "metalurgic", "carpinter", "hotel", "turism", "supermercad",
    "almacen", "almacén", "tecnolog", "computac", "salud", "sanator", "veterinari",
    "viaje", "limpieza", "seguridad", "vidrier", "muebler", "estetica", "belleza"
  ];

  const matchedRubroKey = rubroKeywords.find((k) => q.includes(k));
  const isDirectoryQuery =
    matchedRubroKey ||
    q.includes("comercio") ||
    q.includes("empresa") ||
    q.includes("socio") ||
    q.includes("negocio") ||
    q.includes("local") ||
    q.includes("quién vende") ||
    q.includes("quien vende") ||
    q.includes("dónde comprar") ||
    q.includes("donde comprar") ||
    q.includes("está asociado") ||
    q.includes("esta asociado") ||
    q.includes("directorio") ||
    q.includes("guía comercial");

  if (isDirectoryQuery) {
    // Search in socios database
    const matchingSocios = socios.filter((s: any) => {
      const name = (s.nombreComercial || s.razonSocial || "").toLowerCase();
      const rub = (s.rubro || "").toLowerCase();
      const cat = (s.categoria || "").toLowerCase();
      const dir = (s.direccion || "").toLowerCase();
      const cuit = (s.cuit || "").replace(/-/g, "");

      if (matchedRubroKey && (rub.includes(matchedRubroKey) || name.includes(matchedRubroKey))) {
        return true;
      }
      // Specific stop words that shouldn't match generically across categories
      const stopWords = [
        "quien", "quién", "donde", "dónde", "tienen", "vende", "algún", "algun", "alguna",
        "comercios", "comercio", "socios", "socio", "empresa", "empresas", "negocio", "negocios",
        "local", "locales", "asociado", "asociada", "asociados", "asociadas", "buscar", "está",
        "esta", "padrón", "padron", "guía", "guia", "directorio", "sobre", "hola", "para", "como", "cómo"
      ];
      const words = q.split(/[\s,?.!¡¿]+/).filter((w: string) => w.length > 2 && !stopWords.includes(w));
      if (words.length === 0 && !matchedRubroKey) return false;
      return words.some((w: string) => name.includes(w) || rub.includes(w) || dir.includes(w) || cuit.includes(w));
    });

    if (matchingSocios.length > 0) {
      return `### 🏢 Comercios e Industrias Asociadas · CeCIP Paraná

Encontramos **${matchingSocios.length} empresas asociadas** afines a tu búsqueda:

${matchingSocios.slice(0, 6).map((s: any) => `* **${s.nombreComercial || s.razonSocial}**
  - **Rubro:** ${s.rubro} (${s.categoria})
  - **Dirección:** ${s.direccion || "Paraná, Entre Ríos"}
  - **Contacto:** ${s.whatsapp ? `📱 WhatsApp: ${s.whatsapp}` : `📧 ${s.email || "Sede CeCIP"}`}`).join("\n\n")}

${matchingSocios.length > 6 ? `*(Y ${matchingSocios.length - 6} empresas más registradas en el padrón oficial)*\n` : ""}
> 💡 Puedes consultar el directorio interactivo completo de las **231 empresas asociadas** con filtros en la pestaña **"Comercios Asociados"** de la barra principal.`;
    }
  }

  // ==========================================
  // 5. BENEFITS (BENEFICIOS)
  // ==========================================
  if (q.includes("beneficio") || q.includes("ventaja") || q.includes("servicio") || q.includes("veraz") || q.includes("nosis") || q.includes("informe comercial") || q.includes("asesoría") || q.includes("asesoria") || q.includes("salón") || q.includes("salon")) {
    const b = WEBSITE_KNOWLEDGE.beneficiosParaSocios;
    return `### 🌟 Beneficios Exclusivos para Socios del CeCIP

Asociarte a CeCIP potencia la seguridad y rentabilidad de tu comercio con servicios concretos:

1. **Informes Comerciales Bonificados (Veraz / Nosis):** Evalúa la solvencia crediticia de clientes y proveedores antes de otorgar financiamiento o cuentas corrientes.
2. **Asesoría Jurídica y Contable Gratuita:** Consultas sin costo con profesionales especializados en derecho laboral, convenios de comercio y normativas tributarias.
3. **Capacitaciones 100% Bonificadas:** Cursos con certificación oficial CAME y CAC en ventas, marketing digital, liderazgo y costos.
4. **Alquiler de Salón de Actos con Descuento:** Sala climatizada y equipada para hasta 80 personas en calle 25 de Mayo 28 para conferencias o presentaciones de productos.
5. **Bolsa de Empleo Exclusiva:** Acceso directo a postulantes y legajos laborales para cubrir vacantes sin gastos de intermediación.
6. **Defensa Gremial Representativa:** Negociación y presencia activa ante la Municipalidad de Paraná, Gobierno Provincial y entidades nacionales (CAME, CAC, FEDER).

*Para comenzar a disfrutar de estos beneficios, puedes iniciar tu afiliación en la pestaña "Asociarse".*`;
  }

  // ==========================================
  // 6. AUTHORITIES & DIRECTIVE BOARD
  // ==========================================
  if (q.includes("autoridad") || q.includes("presidente") || q.includes("comisión") || q.includes("comision") || q.includes("directivo") || q.includes("benitende") || q.includes("bejar") || q.includes("quién dirige") || q.includes("quien dirige")) {
    const p = WEBSITE_KNOWLEDGE.autoridades;
    return `### 🏛️ Autoridades de la Comisión Directiva · CeCIP Paraná

Conforme al estatuto institucional, los cargos directivos son ejercidos ad-honorem por empresarios y comerciantes de la ciudad:

- **Presidente:** **${p.find((a) => a.role === "PRESIDENTE")?.name}** (${p.find((a) => a.role === "PRESIDENTE")?.company})
- **Vicepresidente:** **${p.find((a) => a.role === "VICEPRESIDENTE")?.name}** (${p.find((a) => a.role === "VICEPRESIDENTE")?.company})
- **Secretario:** **${p.find((a) => a.role === "SECRETARIO")?.name}** (${p.find((a) => a.role === "SECRETARIO")?.company})
- **Prosecretario:** **${p.find((a) => a.role === "PROSECRETARIO")?.name}** (${p.find((a) => a.role === "PROSECRETARIO")?.company})
- **Tesorero:** **${p.find((a) => a.role === "TESORERO")?.name}** (${p.find((a) => a.role === "TESORERO")?.company})
- **Protesorero:** **${p.find((a) => a.role === "PROTESORERO")?.name}** (${p.find((a) => a.role === "PROTESORERO")?.company})

*La Mesa Directiva se reúne periódicamente en la sede central para evaluar gestiones ante los poderes públicos.*`;
  }

  // ==========================================
  // 7. TRAINING & COURSES AGENDA
  // ==========================================
  if (q.includes("curso") || q.includes("capacita") || q.includes("taller") || q.includes("evento") || q.includes("agenda") || q.includes("charla") || q.includes("seminario")) {
    return `### 📅 Agenda de Capacitaciones y Eventos CeCIP 2026

Próximas actividades y seminarios programados:

${events.map((e: any, i: number) => `#### ${i + 1}. ${e.titulo}
- **Fecha y Hora:** 📆 ${e.fecha} a las ${e.hora} hs
- **Modalidad y Sede:** ${e.lugar} (${e.modalidad || "Presencial"})
- **Disertante:** ${e.orador || "Especialistas invitados"}
- **Cupos:** **${e.cuposInscriptos || 0} / ${e.cuposMax}** inscriptos (${Math.round(((e.cuposInscriptos || 0) / e.cuposMax) * 100)}% ocupación)
`).join("\n")}

> *Recuerda que todas las capacitaciones son 100% bonificadas para socios de CeCIP.* Puedes inscribirte en la pestaña **Capacitaciones** o por WhatsApp al **343 4575070**.`;
  }

  // ==========================================
  // 8. BOLSA DE EMPLEO / CVS
  // ==========================================
  if (q.includes("empleo") || q.includes("trabajo") || q.includes("cv") || q.includes("curriculum") || q.includes("postulant") || q.includes("candidato") || q.includes("contratar")) {
    return `### 💼 Bolsa de Empleo CeCIP Paraná

La plataforma de empleo conecta el talento local con el comercio y la industria:

#### 👤 Para Quienes Buscan Trabajo:
- Carga tu currículum sin cargo desde la sección **"Bolsa de Empleo"** en la web.
- Tu perfil será visualizado por más de 230 empresas y pymes de Paraná que buscan incorporar personal en áreas de ventas, administración, logística, oficios y servicios.

#### 🏢 Para Empresas y Comercios Socios:
- Disponemos de una base actualizada de postulantes evaluados.
- Puedes solicitar legajos específicos comunicándote con la Secretaría de Empleo al **(0343) 4312785** o a través del Portal ERP.`;
  }

  // ==========================================
  // 9. HISTORY & FOUNDATION (HISTORIA)
  // ==========================================
  if (q.includes("historia") || q.includes("fundación") || q.includes("fundacion") || q.includes("1898") || q.includes("origen") || q.includes("años") || q.includes("trayectoria")) {
    const i = WEBSITE_KNOWLEDGE.institucion;
    return `### 📜 Historia y Trayectoria del CeCIP

El **Centro Comercial e Industrial de Paraná** es una de las instituciones gremiales más representativas de Entre Ríos y el país:

- **Fundación:** **18 de octubre de 1898** (más de 125 años de trayectoria ininterrumpida).
- **Origen:** Creado como *Sociedad de Comerciantes* por pioneros mercaderes e inmigrantes que forjaban el crecimiento de la capital provincial.
- **Hitos destacados:** Liderazgo en la implementación del descanso dominical mercantil (1905), adquisición de la sede histórica propia en calle 25 de Mayo (1920), impulso a la creación del Parque Industrial Paraná (1970) y desarrollo del Centro Comercial a Cielo Abierto en Peatonal San Martín.`;
  }

  // ==========================================
  // 10. ERP OPERATIONAL INQUIRIES (FOR LOGGED USERS/ADMIN)
  // ==========================================
  if (userRole.includes("Admin") && (q.includes("mora") || q.includes("deuda") || q.includes("tesor") || q.includes("caja") || q.includes("cobranza"))) {
    const totalDebt = bills
      .filter((b: any) => b.estado === "Pendiente" || b.estado === "Mora" || b.estado === "Vencido")
      .reduce((sum: number, b: any) => sum + (b.monto || 0), 0);
    const julioBills = bills.filter((b: any) => b.mes === "Julio");
    const facturado = julioBills.reduce((acc: number, b: any) => acc + (b.monto || 0), 0);
    const cobrado = julioBills.filter((b: any) => b.estado === "Pagado").reduce((acc: number, b: any) => acc + (b.monto || 0), 0);

    return `### 📊 Resumen Operativo de Cobranzas y Tesorería

- **Facturación Mensual (Julio 2026):** **$${facturado.toLocaleString("es-AR")}**
- **Cobranza Efectivizada:** **$${cobrado.toLocaleString("es-AR")}** (${facturado > 0 ? ((cobrado / facturado) * 100).toFixed(1) : 0}% recaudado)
- **Deuda Exigible Global:** **$${totalDebt.toLocaleString("es-AR")}**

*Para gestionar cuotas individuales, emitir recibos o contactar socios en mora, puedes ingresar al módulo de **Facturación** en el panel ERP.*`;
  }

  // ==========================================
  // 11. GENERAL CONTEXTUAL ANSWER
  // ==========================================
  return `Respecto a tu consulta sobre **"${rawQ.slice(0, 60)}"**:

En **CeCIP (Centro Comercial e Industrial de Paraná)** representamos y brindamos servicios a comerciantes, industriales y prestadores de servicios de la ciudad desde 1898.

Si buscas información específica, puedo orientarte en:
- **Directorio de socios**: ¿Qué rubro o empresa estás buscando en Paraná?
- **Asociarte**: ¿Te gustaría conocer los valores de las cuotas y requisitos?
- **Beneficios**: Informes Veraz/Nosis, asesoría jurídica/contable o salón de actos.
- **Capacitaciones y Empleo**: Cursos disponibles y postulación de CVs.

También puedes comunicarte directamente con nuestro equipo de atención:
📞 **Teléfono:** (0343) 4312785
📱 **WhatsApp:** 343 4575070
📍 **Sede:** Calle 25 de Mayo 28, 1º Piso (Lun a Vie 09:00 a 17:00 hs).`;
}

// POST /api/copilot/chat
router.post("/copilot/chat", async (req, res) => {
  try {
    const { message, history = [], erpContext, userRole = "Visitante Web Pública" } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "El mensaje no puede estar vacío." });
    }

    // Clean and normalize chat history
    const normalizedHistory = normalizeChatHistory(history);

    // Use current database state if erpContext is not supplied
    const currentDb = db.getState();
    const ctx = erpContext || {
      socios: currentDb.socios,
      bills: currentDb.facturas,
      crm: currentDb.crm,
      tesoreria: currentDb.tesoreria,
      events: currentDb.eventos,
      enrollments: currentDb.inscripciones,
      convenios: currentDb.convenios,
      docs: currentDb.documentos,
      tickets: currentDb.tickets,
      cvs: currentDb.cvs,
    };

    // Generate contextual intelligent answer
    let responseText = "";
    let usedModel = "CeCIP Copilot IA Contextual";

    // Attempt Gemini call if API key is active
    const ai = getGeminiClient();
    if (ai) {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 6000)
        );

        const geminiHistory = normalizedHistory.slice(-6).map((h) => ({
          role: h.role,
          parts: [{ text: h.text.slice(0, 500) }],
        }));

        const systemInstruction = `Eres "CeCIP Copilot", el Asistente de Inteligencia Artificial del Centro Comercial e Industrial de Paraná (CeCIP), Entre Ríos, Argentina.
Respondé de manera concisa, cordial y útil, con exactitud institucional y enfoque directo a lo que el usuario pregunta.
Datos clave:
- Sede: Calle 25 de Mayo 28, 1º Piso, Paraná. Lunes a viernes 09:00 a 17:00 hs. Tel 0343 4312785, WhatsApp 343 4575070.
- Autoridades: Presidente Mauricio Benitende (Perseo SRL), Vicepresidente Victor E. Bejar (Tienda El Mago).
- Padrón: 231 comercios e industrias socias.
- Cuotas de socios: Pequeño Comercio $3.500/mes, Servicios $4.500/mes, Mediana Empresa $6.000/mes, Gran Industria $12.000/mes.
- Beneficios: Informes comerciales Veraz/Nosis bonificados, asesoría contable y legal gratuita para pymes, capacitaciones bonificadas, alquiler de salón de actos.
- Bolsa de Empleo: Postulación gratuita de CVs para postulantes; acceso para comercios asociados.
Responde SIEMPRE en español rioplatense cordial, con formato Markdown limpio y evitando textos robóticos prefabricados.`;

        const generatePromise = ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: [
            ...geminiHistory,
            {
              role: "user" as const,
              parts: [{ text: message }],
            },
          ],
          config: {
            systemInstruction,
            temperature: 0.3,
          },
        });

        const response: any = await Promise.race([generatePromise, timeoutPromise]);
        if (response && response.text && response.text.trim()) {
          responseText = response.text.trim();
          usedModel = "gemini-3.8-flash";
        }
      } catch (err: any) {
        // Fallback to our contextual conversational engine on 403/429/timeout
      }
    }

    // If Gemini did not return a response, run our rich contextual conversational engine
    if (!responseText) {
      responseText = generateContextualCopilotAnswer(message, normalizedHistory, ctx, userRole);
      usedModel = "CeCIP Copilot IA Contextual";
    }

    // Registrar en bitácora de IA
    try {
      db.logIaActividad({
        usuarioNombre: userRole || "Visitante CeCIP",
        tipo: "consulta_copilot",
        accion: "Consulta operativa a CeCIP Copilot",
        inputResumen: message.slice(0, 150),
        outputResumen: responseText.slice(0, 200),
        modelo: usedModel,
        resultado: "Exitoso",
      });
    } catch {
      // Bitácora opcional
    }

    return res.json({
      reply: responseText,
      timestamp: new Date().toISOString(),
      model: usedModel,
    });
  } catch (err: any) {
    const state = db.getState();
    const fallback = generateContextualCopilotAnswer(
      req.body?.message || "",
      [],
      {
        socios: state.socios,
        bills: state.facturas,
        crm: state.crm,
        tesoreria: state.tesoreria,
        events: state.eventos,
        enrollments: state.inscripciones,
        convenios: state.convenios,
        docs: state.documentos,
        tickets: state.tickets,
        cvs: state.cvs,
      },
      req.body?.userRole || "Visitante Web"
    );
    return res.json({
      reply: fallback,
      timestamp: new Date().toISOString(),
      model: "CeCIP Copilot IA Contextual",
    });
  }
});

export default router;
