export const APP_CONFIG = Object.freeze({
  nombre: 'ALTO-SISTEMA',
  version: '0.1.3',
  descripcion: 'Sistema integral de gestión deportiva',
  apiUrl: (
    import.meta.env.VITE_API_URL ||
    'http://localhost:3000/api'
  ).replace(/\/+$/, ''),
  idioma: 'es-AR',
  zonaHoraria: 'America/Argentina/Cordoba'
});