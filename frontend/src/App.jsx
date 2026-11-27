import { useEffect, useState } from 'react';
import Login from './pages/Login';
import './App.css';

const API_URL = 'http://localhost:3000/api';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [verificando, setVerificando] = useState(true);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);
  const [estado, setEstado] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function verificarSesion() {
      try {
        const respuesta = await fetch(`${API_URL}/auth/me`, {
          credentials: 'include'
        });

        if (respuesta.ok) {
          const datos = await respuesta.json();
          setUsuario(datos.usuario);
        }
      } catch {
        setUsuario(null);
      } finally {
        setVerificando(false);
      }
    }

    verificarSesion();
  }, []);

  useEffect(() => {
    if (!usuario) return;

    async function verificarEstado() {
      try {
        const respuesta = await fetch(`${API_URL}/health`, {
          credentials: 'include'
        });

        const datos = await respuesta.json();
        setEstado(datos);
      } catch {
        setEstado({
          backend: 'OFFLINE',
          database: 'NO DISPONIBLE'
        });
      }
    }

    verificarEstado();
  }, [usuario]);

  function iniciarSesion(usuarioAutenticado) {
    setError('');
    setUsuario(usuarioAutenticado);
  }

  async function cerrarSesion() {
    if (cerrandoSesion) return;

    setCerrandoSesion(true);
    setError('');

    try {
      const respuesta = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!respuesta.ok) {
        throw new Error('No se pudo cerrar la sesión.');
      }

      setUsuario(null);
      setEstado(null);

    } catch {
      setError('No se pudo cerrar la sesión. Intentá nuevamente.');

    } finally {
      setCerrandoSesion(false);
    }
  }

  if (verificando) {
    return (
      <main className="contenedor">
        <h1>ALTO-SISTEMA</h1>
        <p>Verificando sesión...</p>
      </main>
    );
  }

  if (!usuario) {
    return <Login onLogin={iniciarSesion} />;
  }

  return (
    <main className="contenedor">

      <h1>ALTO-SISTEMA</h1>

      <h2>Gestión de torneos amateurs</h2>

      <p>Versión 0.1.1 - Autenticación</p>

      <section className="usuario-panel">
        <h3>BIENVENIDO, {usuario.usuario.toUpperCase()}</h3>

        <p>Sesión de administrador activa</p>

        <button
          className="boton-salir"
          onClick={cerrarSesion}
          disabled={cerrandoSesion}
        >
          {cerrandoSesion
            ? 'CERRANDO SESIÓN...'
            : 'CERRAR SESIÓN'}
        </button>

        {error && (
          <p className="mensaje-error" role="alert">
            {error}
          </p>
        )}
      </section>

      <section className="estado">
        <h3>Estado del sistema</h3>

        <p>Frontend: ONLINE</p>

        <p>
          Backend: {estado?.backend || 'CONECTANDO...'}
        </p>

        <p>
          Base de datos: {estado?.database || 'CONECTANDO...'}
        </p>
      </section>

    </main>
  );
}

export default App;