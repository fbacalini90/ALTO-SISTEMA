import { APP_CONFIG } from '../config/app.config';

export class ApiError extends Error {
  constructor(mensaje, status, datos = null) {
    super(mensaje);

    this.name = 'ApiError';
    this.status = status;
    this.datos = datos;
  }
}

async function solicitud(ruta, opciones = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    signal
  } = opciones;

  const rutaNormalizada = ruta.startsWith('/')
    ? ruta
    : `/${ruta}`;

  const configuracion = {
    method,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...headers
    },
    signal
  };

  if (body !== undefined) {
    configuracion.headers['Content-Type'] = 'application/json';
    configuracion.body = JSON.stringify(body);
  }

  let respuesta;

  try {
    respuesta = await fetch(
      `${APP_CONFIG.apiUrl}${rutaNormalizada}`,
      configuracion
    );
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }

    throw new ApiError(
      'No se pudo establecer conexión con el servidor.',
      0
    );
  }

  let datos = null;

  if (respuesta.status !== 204) {
    const tipoContenido =
      respuesta.headers.get('content-type') || '';

    if (tipoContenido.includes('application/json')) {
      datos = await respuesta.json();
    } else {
      datos = await respuesta.text();
    }
  }

  if (!respuesta.ok) {
    throw new ApiError(
      datos?.mensaje ||
        `Error en la solicitud (${respuesta.status}).`,
      respuesta.status,
      datos
    );
  }

  return datos;
}

export const api = Object.freeze({
  get(ruta, opciones = {}) {
    return solicitud(ruta, {
      ...opciones,
      method: 'GET'
    });
  },

  post(ruta, body, opciones = {}) {
    return solicitud(ruta, {
      ...opciones,
      method: 'POST',
      body
    });
  },

  put(ruta, body, opciones = {}) {
    return solicitud(ruta, {
      ...opciones,
      method: 'PUT',
      body
    });
  },

  patch(ruta, body, opciones = {}) {
    return solicitud(ruta, {
      ...opciones,
      method: 'PATCH',
      body
    });
  },

  delete(ruta, opciones = {}) {
    return solicitud(ruta, {
      ...opciones,
      method: 'DELETE'
    });
  }
});