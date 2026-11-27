import { useState } from 'react';
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
      const respuesta = await fetch(
        'http://localhost:3000/api/auth/login',
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            usuario: usuario.trim(),
            password
          })
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setError(
          datos.mensaje || 'No se pudo iniciar sesión.'
        );
        return;
      }

      setPassword('');
      onLogin(datos.usuario);

    } catch {
      setError(
        'No se pudo establecer conexión con el servidor.'
      );

    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="login-contenedor">

      <section className="login-panel">

        <header className="login-cabecera">
          <h1>ALTO-SISTEMA</h1>
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
          ALTO-SISTEMA · v0.1.1
        </footer>

      </section>

    </main>
  );
}

export default Login;