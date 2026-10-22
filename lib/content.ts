/**
 * All texts and project data for the site, in English and Spanish.
 *
 * To change wording, edit the strings here. To add a project, add an entry to
 * PROJECTS and drop its picture (16:10, e.g. 1200x750) in public/projects/.
 */

export type Lang = "en" | "es";

export const SITE_URL = "https://cesarsalgado.dev";
export const EMAIL = "hello@cesarsalgado.dev";
export const LINKEDIN = "https://www.linkedin.com/in/cesar-salgado-274a2329/";
export const GITHUB = "https://github.com/kaezar22";

export const CV_FILES: Record<Lang, string> = {
  en: "/cv/CV_Cesar_Salgado_EN.pdf",
  es: "/cv/CV_Cesar_Salgado_ES.pdf",
};

export const T = {
  en: {
    meta_title: "César Salgado | AI, Data Science & RPA Consultant",
    meta_description:
      "I build AI tools, data pipelines and RPA automations that turn manual processes into automated ones and data into decisions.",
    nav_services: "Services",
    nav_projects: "Projects",
    nav_demos: "Live demos",
    nav_chat: "Ask my AI",
    nav_contact: "Contact",
    other_lang: "Español",
    eyebrow: "RPA · Data Analytics · AI Architecture",
    h1: "I turn manual processes into automated ones, and data into decisions.",
    lead:
      "I'm César Salgado, an industrial engineer and consultant with more than seven years in finance, the public sector, e-commerce and international trade. I design and build automation, analytics and AI systems, and I work in Spanish, English and Mandarin.",
    cta_mail: "Start a conversation",
    cta_linkedin: "LinkedIn",
    cv: "Download CV",
    stats: [
      ["7+", "years in data, automation and AI"],
      ["53,000", "corporate clients profiled by an LLM engine I built at StoneX"],
      ["4 days", "for a process that took a five-person team weeks to months"],
      ["3", "working languages: Spanish, English and Mandarin"],
    ],
    services_kicker: "Consulting",
    services_title: "What I can do for your company",
    services: [
      {
        title: "RPA & process automation",
        text: "Repetitive work in spreadsheets, reports and web portals, handed over to software.",
        items: [
          "Automation of manual processes with Python",
          "Scheduled workflows and alerts",
          "API integrations and web scraping",
          "Automated reporting",
        ],
      },
      {
        title: "Data analytics",
        text: "One reliable view of the business, built from data that is scattered today.",
        items: [
          "SQL models and data pipelines",
          "Power BI and Streamlit dashboards",
          "Data quality and migration checks",
          "Forecasting and machine learning",
        ],
      },
      {
        title: "AI architecture",
        text: "Language models applied where they pay for themselves, from pilot to daily use.",
        items: [
          "LLM data enrichment at scale",
          "Chatbots that answer from your own documents (RAG)",
          "Model, cost and architecture decisions",
          "Sentiment and text analysis",
        ],
      },
    ],
    testimonials_kicker: "Client results",
    testimonials_title: "What clients say about working with me",
    projects_kicker: "Selected work",
    projects_title: "Projects you can open and try",
    projects_note:
      "Some live demos run on a free tier, so a demo may take up to a minute to wake up.",
    demos_kicker: "Live demos",
    demos_title: "Try the systems, not just the screenshots",
    demos_lead:
      "Working versions of automations I built for real companies, running on a fictional dairy company (Lácteos Agua Clara) with invented data. Click around: nothing you do affects anyone else.",
    demos_open: "Open the demo",
    demos_soon: "Coming next: an AI invoice reader.",
    problem: "The problem",
    solution: "What it does",
    open: "Open project",
    open_chat: "Try it below",
    watch: "Watch the video",
    video_badge: "Video showcase",
    fun_title: "Other fun projects",
    music_kicker: "Beyond work",
    music_title: "My music",
    music_lead: "I produce and play electronic music. These are my channels and playlists.",
    listen: "Listen on YouTube",
    chat_kicker: "Cesar-Bot",
    chat_title: "Ask my AI about my background",
    chat_lead:
      "A chatbot that answers from my CV and profile. Ask about my experience, skills or projects.",
    chat_placeholder: "Ask me a question…",
    chat_send: "Ask",
    chat_suggestions: [
      "What was your biggest automation win?",
      "Which AI projects have you built?",
      "What tools do you use for data pipelines?",
    ],
    chat_error: "Something went wrong. Please try again, or email me directly.",
    contact_title: "Have a process that should run by itself?",
    contact_lead:
      "Tell me what your team does by hand today. I'll reply with how I would approach it.",
    footer: "Bogotá, Colombia · Available for remote projects",
  },
  es: {
    meta_title: "César Salgado | Consultor en IA, ciencia de datos y RPA",
    meta_description:
      "Construyo herramientas de IA, pipelines de datos y automatizaciones RPA que convierten procesos manuales en automáticos y datos en decisiones.",
    nav_services: "Servicios",
    nav_projects: "Proyectos",
    nav_demos: "Demos",
    nav_chat: "Pregúntale a mi IA",
    nav_contact: "Contacto",
    other_lang: "English",
    eyebrow: "RPA · Analítica de datos · Arquitectura de IA",
    h1: "Convierto procesos manuales en procesos automatizados, y datos en decisiones.",
    lead:
      "Soy César Salgado, ingeniero industrial y consultor con más de siete años en finanzas, sector público, comercio electrónico y comercio internacional. Diseño y construyo sistemas de automatización, analítica e IA, y trabajo en español, inglés y mandarín.",
    cta_mail: "Conversemos",
    cta_linkedin: "LinkedIn",
    cv: "Descargar CV",
    stats: [
      ["7+", "años en datos, automatización e IA"],
      ["53.000", "clientes corporativos perfilados por un motor LLM que construí en StoneX"],
      ["4 días", "para un proceso que a un equipo de cinco personas le tomaba de semanas a meses"],
      ["3", "idiomas de trabajo: español, inglés y mandarín"],
    ],
    services_kicker: "Consultoría",
    services_title: "Lo que puedo hacer por su empresa",
    services: [
      {
        title: "RPA y automatización de procesos",
        text: "El trabajo repetitivo en hojas de cálculo, reportes y portales web, en manos del software.",
        items: [
          "Automatización de procesos manuales con Python",
          "Flujos programados y alertas",
          "Integraciones por API y web scraping",
          "Reportes automatizados",
        ],
      },
      {
        title: "Analítica de datos",
        text: "Una vista confiable del negocio, construida con datos que hoy están dispersos.",
        items: [
          "Modelos SQL y pipelines de datos",
          "Tableros en Power BI y Streamlit",
          "Calidad de datos y control de migraciones",
          "Pronósticos y machine learning",
        ],
      },
      {
        title: "Arquitectura de IA",
        text: "Modelos de lenguaje aplicados donde se pagan solos, del piloto al uso diario.",
        items: [
          "Enriquecimiento de datos con LLM a gran escala",
          "Chatbots que responden con sus propios documentos (RAG)",
          "Decisiones de modelo, costo y arquitectura",
          "Análisis de sentimiento y de texto",
        ],
      },
    ],
    testimonials_kicker: "Resultados con clientes",
    testimonials_title: "Lo que dicen mis clientes de trabajar conmigo",
    projects_kicker: "Trabajo seleccionado",
    projects_title: "Proyectos que puede abrir y probar",
    projects_note:
      "Algunas demos están en un plan gratuito, así que pueden tardar hasta un minuto en despertar.",
    demos_kicker: "Demos en vivo",
    demos_title: "Pruebe los sistemas, no solo las capturas",
    demos_lead:
      "Versiones funcionales de automatizaciones que construí para empresas reales, montadas sobre una empresa láctea ficticia (Lácteos Agua Clara) con datos inventados. Explore con libertad: nada de lo que haga afecta a nadie más.",
    demos_open: "Abrir la demo",
    demos_soon: "Próximamente: lector de facturas con IA.",
    problem: "El problema",
    solution: "Qué hace",
    open: "Abrir proyecto",
    open_chat: "Pruébelo abajo",
    watch: "Ver el video",
    video_badge: "Demostración en video",
    fun_title: "Otros proyectos por gusto",
    music_kicker: "Más allá del trabajo",
    music_title: "Mi música",
    music_lead: "Produzco y toco música electrónica. Estos son mis canales y listas de reproducción.",
    listen: "Escuchar en YouTube",
    chat_kicker: "Cesar-Bot",
    chat_title: "Pregúntale a mi IA sobre mi trayectoria",
    chat_lead:
      "Un chatbot que responde con base en mi CV y mi perfil. Pregunte por mi experiencia, habilidades o proyectos.",
    chat_placeholder: "Hazme una pregunta…",
    chat_send: "Preguntar",
    chat_suggestions: [
      "¿Cuál ha sido tu mayor logro en automatización?",
      "¿Qué proyectos de IA has construido?",
      "¿Qué herramientas usas para pipelines de datos?",
    ],
    chat_error: "Algo salió mal. Intente de nuevo o escríbame directamente.",
    contact_title: "¿Tiene un proceso que debería funcionar solo?",
    contact_lead:
      "Cuénteme qué hace hoy su equipo a mano. Le respondo con la forma en que lo abordaría.",
    footer: "Bogotá, Colombia · Disponible para proyectos remotos",
  },
} as const;

export type Texts = (typeof T)[Lang];

type ProjectText = {
  tag: string;
  title: string;
  problem?: string;
  solution?: string;
  body?: string;
  note?: string;
};

export type Project = {
  image: string;
  url: string | null;
  video?: boolean;
  en: ProjectText;
  es: ProjectText;
};

export const PROJECTS: Project[] = [
  {
    image: "nutrienti.jpg",
    url: "https://prediccion-hort.streamlit.app/",
    en: {
      tag: "Predictive analytics",
      title: "Vegetable price forecast",
      problem:
        "Wholesale vegetable prices swing sharply from one month to the next, so buyers plan purchases and promotions without knowing where prices are heading.",
      solution:
        "Forecasts next month's price per kilo at Corabastos from official SIPSA-DANE data, with a likely range and a plain signal for each product: likely drop, likely rise or no clear signal.",
    },
    es: {
      tag: "Analítica predictiva",
      title: "Predicción de precios de hortalizas",
      problem:
        "Los precios mayoristas de las hortalizas cambian con fuerza de un mes a otro, y los compradores planean compras y ofertas sin saber hacia dónde van.",
      solution:
        "Pronostica el precio por kilo del próximo mes en Corabastos con datos oficiales de SIPSA-DANE, con un rango probable y una señal clara por producto: baja probable, alza probable o sin señal clara.",
    },
  },
  {
    image: "tradex.jpg",
    url: "https://tradexgit-kmwf9rlefbrvroiq7ukzrn.streamlit.app/",
    en: {
      tag: "Finance · AI",
      title: "Tradex: market analyzer",
      problem:
        "Reviewing dozens of instruments by hand, across charts, indicators and news, takes hours before any decision is made.",
      solution:
        "Screens up to 30 Yahoo Finance tickers, charts technical indicators, forecasts prices with ARIMA and scores news sentiment with a language model.",
    },
    es: {
      tag: "Finanzas · IA",
      title: "Tradex: analizador de mercados",
      problem:
        "Revisar a mano decenas de instrumentos, entre gráficos, indicadores y noticias, toma horas antes de decidir cualquier cosa.",
      solution:
        "Evalúa hasta 30 tickers de Yahoo Finance, grafica indicadores técnicos, pronostica precios con ARIMA y califica el sentimiento de las noticias con un modelo de lenguaje.",
    },
  },
  {
    image: "analyzer.jpg",
    url: "https://finan-analysis22.streamlit.app/",
    en: {
      tag: "AI · Business intelligence",
      title: "AI financial analyzer",
      problem:
        "Income and expenses end up in a spreadsheet that nobody analyzes, and every answer means building formulas or asking an analyst.",
      solution:
        "Record each movement in a form, follow income and spending in a dashboard, and ask questions in a chat that answers with a chart. The data lives in Google Sheets.",
      note: "Demo with fictional numbers",
    },
    es: {
      tag: "IA · Inteligencia de negocios",
      title: "Analizador financiero con IA",
      problem:
        "Los ingresos y gastos terminan en una hoja de cálculo que nadie analiza, y cada respuesta exige armar fórmulas o pedírsela a un analista.",
      solution:
        "Registre cada movimiento en un formulario, siga ingresos y gastos en un tablero y haga preguntas en un chat que responde con un gráfico. Los datos viven en Google Sheets.",
      note: "Demo con cifras ficticias",
    },
  },
  {
    image: "mandarin.jpg",
    url: "https://teaich-delta.vercel.app/",
    en: {
      tag: "AI · Education",
      title: "Mandarin Assistant",
      problem:
        "Generic translators answer with words a beginner has not studied yet, which confuses students more than it helps them.",
      solution:
        "Students pick their level and the vocabulary lists to review, then practice translations, grammar, listening and mock exams built only from the words of their course.",
    },
    es: {
      tag: "IA · Educación",
      title: "Asistente de Mandarín",
      problem:
        "Los traductores genéricos responden con palabras que un principiante todavía no ha estudiado, y eso confunde más de lo que ayuda.",
      solution:
        "El estudiante elige su nivel y los vocabularios que quiere repasar, y practica traducciones, gramática, listening y exámenes de prueba armados solo con las palabras de su curso.",
    },
  },
  {
    image: "music.jpg",
    url: "https://www.youtube.com/watch?v=5pa0DTHWSxY",
    video: true,
    en: {
      tag: "Machine learning · Music",
      title: "Music automation",
      body: "An app that automates music creation with machine learning. The training set is made only of my own compositions. The video shows how it works; the app itself is not open to the public because the music is my own work.",
    },
    es: {
      tag: "Machine learning · Música",
      title: "Automatización musical",
      body: "Una aplicación que automatiza la creación de música con machine learning. El conjunto de entrenamiento está formado únicamente por mis propias composiciones. El video muestra cómo funciona; la aplicación no está abierta al público porque la música es obra mía.",
    },
  },
  {
    image: "cesarbot.jpg",
    url: "#chat",
    en: {
      tag: "AI chatbot",
      title: "Cesar-Bot",
      problem: "A CV cannot answer follow-up questions, and recruiters and clients always have them.",
      solution:
        "A chatbot that answers questions about my background from my own documents, streaming its answer in real time. It runs on this page.",
    },
    es: {
      tag: "Chatbot de IA",
      title: "Cesar-Bot",
      problem:
        "Un CV no puede responder preguntas de seguimiento, y los reclutadores y clientes siempre las tienen.",
      solution:
        "Un chatbot que responde preguntas sobre mi trayectoria a partir de mis propios documentos, con la respuesta en tiempo real. Funciona en esta página.",
    },
  },
];

export type MusicItem = {
  url: string;
  style: "techno" | "moombahton" | "lofi";
  en: [string, string, string];
  es: [string, string, string];
};

export const MUSIC: MusicItem[] = [
  {
    url: "https://youtube.com/playlist?list=PLHQPPWTfjs1c&si=CGduQuCdvgCtxKbx",
    style: "techno",
    en: ["Techno live sets", "Live sets I play and record with my own hardware.", "Playlist · YouTube"],
    es: ["Live sets de techno", "Sets en vivo que toco y grabo con mis propios equipos.", "Lista de reproducción · YouTube"],
  },
  {
    url: "https://youtube.com/playlist?list=PLu6Srx39DksgbieLwZfEEdEGH6Od_NnIW&si=4V_7bzl5YubwmWOv",
    style: "moombahton",
    en: ["Moombahton tracks", "My own moombahton productions.", "Playlist · YouTube"],
    es: ["Tracks de moombahton", "Mis propias producciones de moombahton.", "Lista de reproducción · YouTube"],
  },
  {
    url: "https://www.youtube.com/@StillWaterLo-fi_music",
    style: "lofi",
    en: ["Still Water Lo-fi", "My lo-fi channel: calm music for sleeping and unwinding.", "Channel · YouTube"],
    es: ["Still Water Lo-fi", "Mi canal de lo-fi: música tranquila para dormir y relajarse.", "Canal · YouTube"],
  },
];

export const FUN = [
  {
    url: "https://vimeo.com/user83238836",
    en: ["Emerald Portfolio Designing", "Video · Vimeo"],
    es: ["Diseño de portafolio de esmeraldas", "Video · Vimeo"],
  },
] as const;

export const TESTIMONIALS = [
  {
    logo: "/clients/nutrienti.png",
    client: "Nutrienti",
    en: {
      quote:
        "César helped us get much more out of the AI tools we already had. He also automated tasks that used to take hours to complete and deliver: with a custom tool he built for us, they now take seconds.",
      role: "Client · AI setup and automation",
      stat: "Hours → seconds",
      stat_label: "for tasks now handled by a custom tool",
    },
    es: {
      quote:
        "César nos ayudó a sacarle mucho más provecho a las herramientas de IA que ya teníamos. Además, automatizó tareas que antes tomaban horas en completarse y entregarse: con una herramienta a la medida que desarrolló para nosotros, ahora toman segundos.",
      role: "Cliente · Configuración de IA y automatización",
      stat: "Horas → segundos",
      stat_label: "en tareas que ahora resuelve una herramienta a la medida",
    },
  },
];
