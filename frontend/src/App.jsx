import { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import { APP_CONFIG } from './config/app.config';
import { MODULOS_SECUNDARIOS } from './config/modulos.config';
import { api } from './services/api';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ModuloPendiente from './pages/ModuloPendiente';
import AppLayout from './layouts/AppLayout';

import './App.css';

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
        const datos = await api.get('/auth/me', {
          signal: controller.signal
        });

        if (!controller.signal.aborted) {
          setUsuario(datos.usuario);
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
      await api.post('/auth/logout');

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
        <h1>{APP_CONFIG.nombre}</h1>
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

          {MODULOS_SECUNDARIOS.map((modulo) => (
            <Route
              key={modulo.id}
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