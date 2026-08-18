/**
 * Static site content.
 *
 * What lives here and what lives in the API is a deliberate split: anything the
 * studio might edit between projects (services, portfolio, testimonials, FAQ,
 * metrics) is served by the backend; anything that only changes when the brand
 * itself changes (the hero copy, the four process steps, contact details, the
 * footer) stays a typed constant. Putting those behind an HTTP request would add
 * a loading state to the very first thing the visitor sees, for content that
 * never varies.
 *
 * Keys are English; values are the Spanish copy shown to visitors.
 */

/** Studio identity, reused by the header, the footer and the JSON-LD block. */
export const SITE = {
  name: 'Ferez Soluciones',
  /* Rendered run together in the logo ("FerezSoluciones"), with the second half
     accented. `name` keeps the space for prose, aria-labels and structured data. */
  nameParts: { first: 'Ferez', second: 'Soluciones' },
  email: 'ferezsoluciones@gmail.com',
  phoneDisplay: '+54 9 11 3264-5016',
  /* wa.me wants digits only: country (54) + mobile marker (9) + area (11) + number. */
  whatsappUrl: 'https://wa.me/5491132645016',
  instagramUrl: 'https://www.instagram.com/',
  linkedinUrl: 'https://www.linkedin.com/',
  scheduleLabel: 'Lunes a viernes, 9 a 18 h (ART)'
} as const;

/** Primary navigation. `id` doubles as the anchor target and the scroll-spy key. */
export const NAV_LINKS = [
  { id: 'servicios', label: 'Servicios' },
  { id: 'proceso', label: 'Proceso' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'testimonios', label: 'Testimonios' },
  { id: 'faq', label: 'FAQ' }
] as const;

export const HERO = {
  eyebrow: 'Estudio de diseño web · Buenos Aires',
  /* The title is split so "venda" can carry the gradient span. */
  titleBefore: 'Tu negocio merece una web que ',
  titleHighlight: 'venda',
  titleAfter: ', no solo que exista.',
  lead: 'Diseñamos y desarrollamos landing pages de alta conversión para pequeños negocios y PyMEs. Rápidas, responsivas, optimizadas para Google y listas en 15 días hábiles.',
  primaryCta: 'Pedir presupuesto gratis',
  secondaryCta: 'Ver trabajos',
  badges: ['Entrega en 15 días', 'Google PageSpeed 95+', 'Sin costos ocultos'],
  mockupUrl: 'tunegocio.com.ar',
  floatingStats: [
    { value: '+38%', label: 'consultas web' },
    { value: '1.2s', label: 'tiempo de carga' }
  ]
} as const;

/** The three delivery steps. Static: they describe how the studio works, not data. */
export const PROCESS_STEPS = [
  {
    number: '01',
    title: 'Brief y estrategia',
    text: 'Una charla de 40 minutos para entender tu negocio, tu cliente ideal y qué acción querés provocar. De ahí sale la estructura de la página.',
    meta: 'Día 1 · 40 min de tu tiempo'
  },
  {
    number: '02',
    title: 'Diseño y copy',
    text: 'Te mostramos el diseño completo con los textos reales antes de escribir una línea de código. Dos rondas de ajustes incluidas.',
    meta: 'Días 2 a 7'
  },
  {
    number: '03',
    title: 'Desarrollo y optimización',
    text: 'Código limpio, accesible y rápido. Probamos en celular, tablet y escritorio, y en los navegadores que usan tus clientes.',
    meta: 'Días 8 a 15 · + 30 días de soporte'
  }
] as const;

/** Section headings. Grouped so every eyebrow/title/lead trio is edited in one place. */
export const SECTION_HEADINGS = {
  services: {
    eyebrow: 'Qué hacemos',
    title: 'Todo lo que tu negocio necesita para estar online',
    lead: 'No vendemos plantillas: diseñamos cada proyecto alrededor de un objetivo concreto. Que te llamen, que te escriban, que te compren.'
  },
  process: {
    eyebrow: 'Cómo trabajamos',
    title: 'Tres pasos, quince días, cero sorpresas',
    lead: 'Un proceso claro: siempre sabés en qué etapa está tu proyecto y qué esperamos de vos.'
  },
  portfolio: {
    eyebrow: 'Trabajos recientes',
    title: 'Negocios reales, resultados medibles',
    lead: 'Filtrá por rubro para ver proyectos parecidos al tuyo.'
  },
  testimonials: {
    eyebrow: 'Lo que dicen',
    title: 'Clientes que ya no dependen de las redes'
  },
  faq: {
    eyebrow: 'Preguntas frecuentes',
    title: 'Lo que más nos preguntan antes de empezar'
  },
  contact: {
    eyebrow: 'Siguiente paso',
    title: 'Contanos de tu negocio',
    lead: 'Te respondemos en menos de 24 horas hábiles con una propuesta concreta y un rango de precio. Sin compromiso y sin llamadas de venta.'
  }
} as const;

/** Options of the contact form's business-type select. Mirrors BUSINESS_TYPES on the server. */
export const BUSINESS_TYPE_OPTIONS = [
  { value: 'gastronomia', label: 'Gastronomía' },
  { value: 'salud', label: 'Salud y bienestar' },
  { value: 'servicios', label: 'Servicios profesionales' },
  { value: 'retail', label: 'Comercio y retail' },
  { value: 'otro', label: 'Otro' }
] as const;

export const FOOTER = {
  text: 'Diseño y desarrollo de landing pages de alta conversión para pequeños negocios y PyMEs en Argentina.',
  navHeading: 'Navegación',
  contactHeading: 'Contacto',
  navLinks: [
    { href: '#servicios', label: 'Servicios' },
    { href: '#proceso', label: 'Proceso' },
    { href: '#portfolio', label: 'Portfolio' },
    { href: '#faq', label: 'Preguntas frecuentes' }
  ],
  madeIn: 'Hecho en Buenos Aires con código propio.'
} as const;
