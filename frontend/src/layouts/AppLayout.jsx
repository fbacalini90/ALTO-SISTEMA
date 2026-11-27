import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { APP_CONFIG } from '../config/app.config';
import { MODULOS } from '../config/modulos.config';

import './AppLayout.css';

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
            onClick={() => setMenuAbierto((anterior) => !anterior)}
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuAbierto}
            aria-controls="menu-principal"
          >
            {menuAbierto ? '✕' : '☰'}
          </button>

          <div className="app-marca">
            <h1>{APP_CONFIG.nombre}</h1>
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

            {MODULOS.map((modulo) => (
              <NavLink
                key={modulo.id}
                to={modulo.ruta}
                end={modulo.id === 'inicio'}
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
                  {modulo.titulo}
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
              {APP_CONFIG.nombre} · v{APP_CONFIG.version}
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