import { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ModuloPendiente from './pages/ModuloPendiente';
import AppLayout from './layouts/AppLayout';

import './App.css';

const API_URL = 'http://localhost:3000/api';

const modulos = [
  {
    ruta: 'torneos',
    titulo: 'Torneos',
    descripcion: 'Gestión de torneos, ediciones y categorías.',
    icono: '🏆'
  },
  {
    ruta: 'equipos',
    titulo: 'Equipos',
    descripcion: 'Administración de equipos e inscripciones.',
    icono: '🛡'
  },
  {
    ruta: 'listas',
    titulo: 'Listas de buena fe',
    descripcion: 'Registro y control de jugadores habilitados.',
    icono: '📋'
  },
  {
    ruta: 'partidos',
    titulo: 'Partidos',
    descripcion: 'Programación de jornadas y carga de resultados.',
    icono: '⚽'
  },
  {
    ruta: 'posiciones',
    titulo: 'Posiciones',
    descripcion: 'Tablas de posiciones y clasificación deportiva.',
    icono: '📊'
  },
  {
    ruta: 'goleadores',
    titulo: 'Goleadores',
    descripcion: 'Clasificación individual de goleadores.',
    icono: '🥇'
  },
  {
    ruta: 'valla',
    titulo: 'Valla menos vencida',
    descripcion: 'Clasificación del rendimiento defensivo.',
    icono: '🧤'
  },
  {
    ruta: 'playoffs',
    titulo: 'Playoffs',
    descripcion: 'Gestión de copas, llaves y fases eliminatorias.',
    icono: '🏅'
  },
  {
    ruta: 'disciplina',
    titulo: 'Disciplina',
    descripcion: 'Administración de expulsiones, sanciones y habilitaciones.',
    icono: '🟥'
  },
  {
    ruta: 'publicaciones',
    titulo: 'Publicaciones',
    descripcion: 'Generación y exportación de placas deportivas.',
    icono: '🖼'
  },
  {
    ruta: 'historial',
    titulo: 'Historial',
    descripcion: 'Consulta de ediciones y registros históricos.',
    icono: '📁'
  },
  {
    ruta: 'configuracion',
    titulo: 'Configuración',
    descripcion: 'Configuración general y preferencias del sistema.',
    icono: '⚙'
  }
];

function App() {
  const [usuario, setUsuario] = useState(null);
  const [verificando, setVerificando] = useState(true);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);
  const [error, setError] = useState('');

  /* VERIFICACION DE SESION */

  useEffect(() => {
    const controller = new AbortController();

    async function verificarSesion() {
      try {
        const respuesta = await fetch(
          `${API_URL}/auth/me`,
          {
            credentials: 'include',
            signal: controller.signal
          }
        );

        if (respuesta.ok) {
          const datos = await respuesta.json();

          if (!controller.signal.aborted) {
            setUsuario(datos.usuario);
          }
        } else {
          if (!controller.signal.aborted) {
            setUsuario(null);
          }
        }
      } catch {
        if (!controller.signal.aborted) {
          setUsuario(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setVerificando(false);
        }
      }
    }

    verificarSesion();

    return () => controller.abort();
  }, []);

  /* INICIO DE SESION */

  function iniciarSesion(usuarioAutenticado) {
    setError('');
    setUsuario(usuarioAutenticado);
  }

  /* CIERRE DE SESION */

  async function cerrarSesion() {
    if (cerrandoSesion) {
      return;
    }

    setCerrandoSesion(true);
    setError('');

    try {
      const respuesta = await fetch(
        `${API_URL}/auth/logout`,
        {
          method: 'POST',
          credentials: 'include'
        }
      );

      if (!respuesta.ok) {
        throw new Error('No se pudo cerrar la sesión.');
      }

      setUsuario(null);
    } catch {
      setError(
        'No se pudo cerrar la sesión. Intentá nuevamente.'
      );
    } finally {
      setCerrandoSesion(false);
    }
  }

  /* PANTALLA DE CARGA */

  if (verificando) {
    return (
      <main className="contenedor">
        <h1>ALTO-SISTEMA</h1>
        <p>Verificando sesión...</p>
      </main>
    );
  }

  /* ACCESO PRIVADO */

  if (!usuario) {
    return (
      <Login onLogin={iniciarSesion} />
    );
  }

  /* APLICACION AUTENTICADA */

  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={
            <AppLayout
              usuario={usuario}
              onLogout={cerrarSesion}
              cerrandoSesion={cerrandoSesion}
              error={error}
            />
          }
        >

          <Route
            index
            element={<Dashboard />}
          />

          {modulos.map((modulo) => (
            <Route
              key={modulo.ruta}
              path={modulo.ruta}
              element={
                <ModuloPendiente
                  titulo={modulo.titulo}
                  descripcion={modulo.descripcion}
                  icono={modulo.icono}
                />
              }
            />
          ))}

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;