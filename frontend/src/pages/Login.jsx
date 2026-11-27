import { useState } from 'react';
import { APP_CONFIG } from '../config/app.config';
import { api, ApiError } from '../services/api';
import './Login.css';

function Login({ onLogin }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  async function iniciarSesion(evento) {
    evento.preventDefault();

    if (cargando) return;

    setError('');
    setCargando(true);

    try {
      const datos = await api.post('/auth/login', {
        usuario: usuario.trim(),
        password
      });

      setPassword('');
      onLogin(datos.usuario);

    } catch (error) {
      setError(
        error instanceof ApiError
          ? error.message
          : 'No se pudo iniciar sesión.'
      );

    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="login-contenedor">

      <section className="login-panel">

        <header className="login-cabecera">
          <h1>{APP_CONFIG.nombre}</h1>
          <p>Gestión de torneos amateurs</p>
        </header>

        <form
          className="login-formulario"
          onSubmit={iniciarSesion}
        >
          <h2>ACCESO PRIVADO</h2>

          <div className="login-campo">
            <label htmlFor="usuario">Usuario</label>

            <input
              id="usuario"
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Ingresá tu usuario"
              autoComplete="username"
              maxLength={50}
              disabled={cargando}
              required
            />
          </div>

          <div className="login-campo">
            <label htmlFor="password">Contraseña</label>

            <div className="login-password">

              <input
                id="password"
                type={mostrarPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresá tu contraseña"
                autoComplete="current-password"
                disabled={cargando}
                required
              />

              <button
                type="button"
                className="login-mostrar"
                onClick={() => {
                  setMostrarPassword(!mostrarPassword);
                }}
                aria-pressed={mostrarPassword}
              >
                {mostrarPassword ? 'Ocultar' : 'Mostrar'}
              </button>

            </div>
          </div>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-ingresar"
            disabled={cargando}
          >
            {cargando ? 'INGRESANDO...' : 'INICIAR SESIÓN'}
          </button>

        </form>

        <footer className="login-pie">
          {APP_CONFIG.nombre} · v{APP_CONFIG.version}
        </footer>

      </section>

    </main>
  );
}

export default Login;