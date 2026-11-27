const modulos = [
  {
    id: 'inicio',
    ruta: '/',
    titulo: 'Inicio',
    descripcion: 'Panel principal del sistema.',
    icono: '⌂',
    accesoRapido: false
  },
  {
    id: 'torneos',
    ruta: '/torneos',
    titulo: 'Torneos',
    descripcion: 'Gestión de torneos, ediciones y categorías.',
    icono: '🏆',
    accesoRapido: true,
    descripcionRapida: 'Gestión de ediciones y categorías.'
  },
  {
    id: 'equipos',
    ruta: '/equipos',
    titulo: 'Equipos',
    descripcion: 'Administración de equipos e inscripciones.',
    icono: '🛡',
    accesoRapido: true,
    descripcionRapida: 'Inscripciones y participantes.'
  },
  {
    id: 'listas',
    ruta: '/listas',
    titulo: 'Listas de buena fe',
    descripcion: 'Registro y control de jugadores habilitados.',
    icono: '📋',
    accesoRapido: false
  },
  {
    id: 'partidos',
    ruta: '/partidos',
    titulo: 'Partidos',
    descripcion: 'Programación de jornadas y carga de resultados.',
    icono: '⚽',
    accesoRapido: true,
    descripcionRapida: 'Carga de resultados en vivo.'
  },
  {
    id: 'posiciones',
    ruta: '/posiciones',
    titulo: 'Posiciones',
    descripcion: 'Tablas de posiciones y clasificación deportiva.',
    icono: '📊',
    accesoRapido: false
  },
  {
    id: 'goleadores',
    ruta: '/goleadores',
    titulo: 'Goleadores',
    descripcion: 'Clasificación individual de goleadores.',
    icono: '🥇',
    accesoRapido: false
  },
  {
    id: 'valla',
    ruta: '/valla',
    titulo: 'Valla menos vencida',
    descripcion: 'Clasificación del rendimiento defensivo.',
    icono: '🧤',
    accesoRapido: false
  },
  {
    id: 'playoffs',
    ruta: '/playoffs',
    titulo: 'Playoffs',
    descripcion: 'Gestión de copas, llaves y fases eliminatorias.',
    icono: '🏅',
    accesoRapido: false
  },
  {
    id: 'disciplina',
    ruta: '/disciplina',
    titulo: 'Disciplina',
    descripcion: 'Administración de expulsiones, sanciones y habilitaciones.',
    icono: '🟥',
    accesoRapido: false
  },
  {
    id: 'publicaciones',
    ruta: '/publicaciones',
    titulo: 'Publicaciones',
    descripcion: 'Generación y exportación de placas deportivas.',
    icono: '🖼',
    accesoRapido: true,
    descripcionRapida: 'Generación de placas para WhatsApp.'
  },
  {
    id: 'historial',
    ruta: '/historial',
    titulo: 'Historial',
    descripcion: 'Consulta de ediciones y registros históricos.',
    icono: '📁',
    accesoRapido: false
  },
  {
    id: 'configuracion',
    ruta: '/configuracion',
    titulo: 'Configuración',
    descripcion: 'Configuración general y preferencias del sistema.',
    icono: '⚙',
    accesoRapido: false
  }
];

export const MODULOS = Object.freeze(
  modulos.map((modulo) => Object.freeze(modulo))
);

export const MODULOS_SECUNDARIOS = Object.freeze(
  MODULOS.filter((modulo) => modulo.id !== 'inicio')
);

export const ACCESOS_RAPIDOS = Object.freeze(
  MODULOS.filter((modulo) => modulo.accesoRapido)
);