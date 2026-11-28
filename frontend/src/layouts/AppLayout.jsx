import { useEffect, useRef, useState } from 'react';

import {
    NavLink,
    Outlet
} from 'react-router-dom';

import {
    Menu,
    X,
    CircleUserRound,
    LogOut,
    CircleAlert
} from 'lucide-react';

import { APP_CONFIG } from '../config/app.config';
import { MODULOS } from '../config/modulos.config';

import {
    obtenerIconoModulo
} from '../config/iconos.config';

import './AppLayout.css';

/* ESTRUCTURA PRINCIPAL */

export default function AppLayout({
    usuario,
    onLogout,
    cerrandoSesion,
    error
}) {

    const [menuAbierto, setMenuAbierto] =
        useState(false);

    const botonMenu = useRef(null);

    /* CERRAR MENÚ */

    function cerrarMenu() {

        setMenuAbierto(false);

    }

    function cerrarMenuConFoco() {

        setMenuAbierto(false);

        botonMenu.current?.focus();

    }

    /* CIERRE MEDIANTE ESCAPE */

    useEffect(() => {

        if (!menuAbierto) {
            return;
        }

        function controlarTeclado(evento) {

            if (evento.key === 'Escape') {

                setMenuAbierto(false);

                botonMenu.current?.focus();

            }

        }

        window.addEventListener(
            'keydown',
            controlarTeclado
        );

        return () => {

            window.removeEventListener(
                'keydown',
                controlarTeclado
            );

        };

    }, [menuAbierto]);

    /* INTERFAZ */

    return (

        <div className="app-layout">

            {/* CABECERA PRINCIPAL */}

            <header className="app-header">

                <div className="app-header-marca">

                    <button
                        ref={botonMenu}
                        type="button"
                        className="as-button as-button-secondary as-button-icon app-menu-toggle"
                        onClick={() =>
                            setMenuAbierto(
                                (anterior) => !anterior
                            )
                        }
                        aria-label={
                            menuAbierto
                                ? 'Cerrar menú'
                                : 'Abrir menú'
                        }
                        aria-expanded={menuAbierto}
                        aria-controls="menu-principal"
                    >

                        {menuAbierto
                            ? <X aria-hidden="true" />
                            : <Menu aria-hidden="true" />}

                    </button>

                    <NavLink
                        to="/"
                        className="app-marca"
                        onClick={cerrarMenu}
                        aria-label="ALTO-SISTEMA — Inicio"
                    >

                        <span className="app-marca-nombre">

                            {APP_CONFIG.nombre}

                        </span>

                        <span className="app-marca-subtitulo">

                            GESTIÓN DEPORTIVA

                        </span>

                    </NavLink>

                </div>

                {/* USUARIO AUTENTICADO */}

                <div className="app-header-usuario">

                    <div className="app-usuario-icono">

                        <CircleUserRound
                            aria-hidden="true"
                        />

                    </div>

                    <div className="app-usuario-datos">

                        <span
                            className="app-usuario-nombre"
                            title={usuario.usuario}
                        >

                            {usuario.usuario.toUpperCase()}

                        </span>

                        <span className="app-usuario-rol">

                            ADMINISTRADOR

                        </span>

                    </div>

                </div>

            </header>

            {/* FONDO DEL MENÚ MÓVIL */}

            {menuAbierto && (

                <button
                    type="button"
                    className="app-overlay"
                    onClick={cerrarMenuConFoco}
                    aria-label="Cerrar menú lateral"
                />

            )}

            <div className="app-cuerpo">

                {/* MENÚ LATERAL */}

                <aside
                    id="menu-principal"
                    className={
                        menuAbierto
                            ? 'app-sidebar app-sidebar-abierto'
                            : 'app-sidebar'
                    }
                >

                    <div className="app-sidebar-titulo">

                        MENÚ PRINCIPAL

                    </div>

                    <nav
                        className="app-navegacion"
                        aria-label="Navegación principal"
                    >

                        {MODULOS.map((modulo) => {

                            const Icono =
                                obtenerIconoModulo(
                                    modulo.id
                                );

                            return (

                                <NavLink
                                    key={modulo.id}
                                    to={modulo.ruta}
                                    end={modulo.id === 'inicio'}
                                    onClick={cerrarMenu}
                                    className={({ isActive }) =>
                                        isActive
                                            ? 'app-nav-link app-nav-activo'
                                            : 'app-nav-link'
                                    }
                                >

                                    <Icono
                                        className="app-nav-icono"
                                        aria-hidden="true"
                                    />

                                    <span className="app-nav-texto">

                                        {modulo.titulo}

                                    </span>

                                </NavLink>

                            );

                        })}

                    </nav>

                    {/* PIE DEL MENÚ */}

                    <div className="app-sidebar-pie">

                        {error && (

                            <div
                                className="as-alert as-alert-danger app-error"
                                role="alert"
                            >

                                <CircleAlert
                                    aria-hidden="true"
                                />

                                <span className="as-alert-content">

                                    {error}

                                </span>

                            </div>

                        )}

                        <button
                            type="button"
                            className="as-button as-button-danger as-button-block app-logout"
                            onClick={onLogout}
                            disabled={cerrandoSesion}
                        >

                            {cerrandoSesion ? (

                                <span
                                    className="as-spinner"
                                    aria-hidden="true"
                                />

                            ) : (

                                <LogOut aria-hidden="true" />

                            )}

                            {cerrandoSesion
                                ? 'CERRANDO SESIÓN...'
                                : 'CERRAR SESIÓN'}

                        </button>

                        <span className="app-version">

                            {APP_CONFIG.nombre} · v{APP_CONFIG.version}

                        </span>

                    </div>

                </aside>

                {/* CONTENIDO DINÁMICO */}

                <main
                    id="contenido-principal"
                    className="app-contenido"
                >

                    <Outlet />

                </main>

            </div>

        </div>

    );

}