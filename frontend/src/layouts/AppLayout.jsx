import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './AppLayout.css';

const modulos = [
  { ruta: '/', nombre: 'Inicio', icono: '⌂' },
  { ruta: '/torneos', nombre: 'Torneos', icono: '🏆' },
  { ruta: '/equipos', nombre: 'Equipos', icono: '🛡' },
  { ruta: '/listas', nombre: 'Listas de buena fe', icono: '📋' },
  { ruta: '/partidos', nombre: 'Partidos', icono: '⚽' },
  { ruta: '/posiciones', nombre: 'Posiciones', icono: '📊' },
  { ruta: '/goleadores', nombre: 'Goleadores', icono: '🥇' },
  { ruta: '/valla', nombre: 'Valla menos vencida', icono: '🧤' },
  { ruta: '/playoffs', nombre: 'Playoffs', icono: '🏅' },
  { ruta: '/disciplina', nombre: 'Disciplina', icono: '🟥' },
  { ruta: '/publicaciones', nombre: 'Publicaciones', icono: '🖼' },
  { ruta: '/historial', nombre: 'Historial', icono: '📁' },
  { ruta: '/configuracion', nombre: 'Configuración', icono: '⚙' }
];

function AppLayout({
  usuario,
  onLogout,
  cerrandoSesion,
  error
}) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  function cerrarMenu() {
    setMenuAbierto(false);
  }

  return (
    <div className="app-layout">

      {/* Cabecera principal */}

      <header className="app-header">

        <div className="app-header-marca">

          <button
            type="button"
            className="app-menu-toggle"
            onClick={() => setMenuAbierto(!menuAbierto)}
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuAbierto}
            aria-controls="menu-principal"
          >
            {menuAbierto ? '✕' : '☰'}
          </button>

          <div className="app-marca">
            <h1>ALTO-SISTEMA</h1>
            <span>GESTIÓN DEPORTIVA</span>
          </div>

        </div>

        <div className="app-header-usuario">
          <span className="app-usuario-nombre">
            {usuario.usuario.toUpperCase()}
          </span>

          <span className="app-usuario-rol">
            ADMINISTRADOR
          </span>
        </div>

      </header>

      {/* Fondo del menú móvil */}

      {menuAbierto && (
        <button
          type="button"
          className="app-overlay"
          onClick={cerrarMenu}
          aria-label="Cerrar menú lateral"
        />
      )}

      <div className="app-cuerpo">

        {/* Menú lateral */}

        <aside
          id="menu-principal"
          className={
            `app-sidebar ${menuAbierto ? 'app-sidebar-abierto' : ''}`
          }
        >

          <div className="app-sidebar-titulo">
            MENÚ PRINCIPAL
          </div>

          <nav
            className="app-navegacion"
            aria-label="Navegación principal"
          >

            {modulos.map((modulo) => (
              <NavLink
                key={modulo.ruta}
                to={modulo.ruta}
                end={modulo.ruta === '/'}
                onClick={cerrarMenu}
                className={({ isActive }) =>
                  `app-nav-link ${isActive ? 'app-nav-activo' : ''}`
                }
              >
                <span
                  className="app-nav-icono"
                  aria-hidden="true"
                >
                  {modulo.icono}
                </span>

                <span className="app-nav-texto">
                  {modulo.nombre}
                </span>

              </NavLink>
            ))}

          </nav>

          <div className="app-sidebar-pie">

            {error && (
              <p className="app-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="button"
              className="app-logout"
              onClick={onLogout}
              disabled={cerrandoSesion}
            >
              {cerrandoSesion
                ? 'CERRANDO SESIÓN...'
                : 'CERRAR SESIÓN'}
            </button>

            <span className="app-version">
              ALTO-SISTEMA · v0.1.2
            </span>

          </div>

        </aside>

        {/* Contenido dinámico */}

        <main className="app-contenido">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default AppLayout;