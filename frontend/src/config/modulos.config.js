/* ==================================================
   ALTO-SISTEMA
   CONFIGURACIÓN DE MÓDULOS
   ================================================== */

const modulos = [
    {
        id: 'inicio',
        ruta: '/',
        titulo: 'Inicio',
        descripcion: 'Panel principal del sistema.',
        accesoRapido: false
    },
    {
        id: 'torneos',
        ruta: '/torneos',
        titulo: 'Torneos',
        descripcion: 'Gestión de torneos, ediciones y categorías.',
        accesoRapido: true,
        descripcionRapida: 'Administración de competiciones.'
    },
    {
        id: 'equipos',
        ruta: '/equipos',
        titulo: 'Equipos',
        descripcion: 'Administración de equipos e inscripciones.',
        accesoRapido: true,
        descripcionRapida: 'Inscripciones y participantes.'
    },
    {
        id: 'listas',
        ruta: '/listas',
        titulo: 'Listas de buena fe',
        descripcion: 'Registro y control de jugadores habilitados.',
        accesoRapido: false
    },
    {
        id: 'partidos',
        ruta: '/partidos',
        titulo: 'Partidos',
        descripcion: 'Programación de jornadas y carga de resultados.',
        accesoRapido: true,
        descripcionRapida: 'Carga de resultados en vivo.'
    },
    {
        id: 'posiciones',
        ruta: '/posiciones',
        titulo: 'Posiciones',
        descripcion: 'Tablas de posiciones y clasificación deportiva.',
        accesoRapido: false
    },
    {
        id: 'goleadores',
        ruta: '/goleadores',
        titulo: 'Goleadores',
        descripcion: 'Clasificación individual de goleadores.',
        accesoRapido: false
    },
    {
        id: 'valla',
        ruta: '/valla',
        titulo: 'Valla menos vencida',
        descripcion: 'Clasificación del rendimiento defensivo.',
        accesoRapido: false
    },
    {
        id: 'playoffs',
        ruta: '/playoffs',
        titulo: 'Playoffs',
        descripcion: 'Gestión de copas, llaves y fases eliminatorias.',
        accesoRapido: false
    },
    {
        id: 'disciplina',
        ruta: '/disciplina',
        titulo: 'Disciplina',
        descripcion: 'Administración de expulsiones, sanciones y habilitaciones.',
        accesoRapido: false
    },
    {
        id: 'publicaciones',
        ruta: '/publicaciones',
        titulo: 'Publicaciones',
        descripcion: 'Generación y exportación de placas deportivas.',
        accesoRapido: true,
        descripcionRapida: 'Generación de placas para WhatsApp.'
    },
    {
        id: 'historial',
        ruta: '/historial',
        titulo: 'Historial',
        descripcion: 'Consulta de ediciones y registros históricos.',
        accesoRapido: false
    },
    {
        id: 'configuracion',
        ruta: '/configuracion',
        titulo: 'Configuración',
        descripcion: 'Configuración general y preferencias del sistema.',
        accesoRapido: false
    }
];

/* CATÁLOGO GENERAL */

export const MODULOS = Object.freeze(
    modulos.map(
        (modulo) => Object.freeze(modulo)
    )
);

/* MÓDULOS SECUNDARIOS */

export const MODULOS_SECUNDARIOS = Object.freeze(
    MODULOS.filter(
        (modulo) => modulo.id !== 'inicio'
    )
);

/* ACCESOS RÁPIDOS */

export const ACCESOS_RAPIDOS = Object.freeze(
    MODULOS.filter(
        (modulo) => modulo.accesoRapido
    )
);