import { useState } from 'react';

import {
    UserRound,
    Lock,
    LockKeyhole,
    Eye,
    EyeOff,
    LogIn,
    CircleAlert
} from 'lucide-react';

import { APP_CONFIG } from '../config/app.config';
import { api, ApiError } from '../services/api';

import './Login.css';

/* COMPONENTE DE AUTENTICACIÓN */

export default function Login({ onLogin }) {

    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');

    const [mostrarPassword, setMostrarPassword] =
        useState(false);

    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    /* INICIO DE SESIÓN */

    async function iniciarSesion(evento) {

        evento.preventDefault();

        if (cargando) {
            return;
        }

        setError('');
        setCargando(true);

        try {

            const datos = await api.post(
                '/auth/login',
                {
                    usuario: usuario.trim(),
                    password
                }
            );

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

    /* INTERFAZ */

    return (

        <main className="login-contenedor">

            <section className="login-panel">

                {/* IDENTIDAD INSTITUCIONAL */}

                <header className="login-cabecera">

                    <h1>{APP_CONFIG.nombre}</h1>

                    <p>
                        Gestión de torneos amateurs
                    </p>

                </header>

                {/* FORMULARIO */}

                <form
                    className="as-panel as-form login-formulario"
                    onSubmit={iniciarSesion}
                    aria-labelledby="login-titulo"
                    aria-busy={cargando}
                >

                    <div className="login-formulario-cabecera">

                        <div className="login-icono-principal">

                            <LockKeyhole
                                aria-hidden="true"
                            />

                        </div>

                        <h2 id="login-titulo">

                            ACCESO PRIVADO

                        </h2>

                        <p className="as-text-description">

                            Ingresá tus credenciales

                        </p>

                    </div>

                    <hr className="as-divider" />

                    {/* USUARIO */}

                    <div className="as-field">

                        <label
                            className="as-label"
                            htmlFor="usuario"
                        >

                            Usuario

                        </label>

                        <div className="login-control">

                            <UserRound
                                className="login-control-icono"
                                aria-hidden="true"
                            />

                            <input
                                id="usuario"
                                className="as-input"
                                type="text"
                                value={usuario}
                                onChange={(evento) =>
                                    setUsuario(
                                        evento.target.value
                                    )
                                }
                                placeholder="Ingresá tu usuario"
                                autoComplete="username"
                                maxLength={50}
                                disabled={cargando}
                                required
                            />

                        </div>

                    </div>

                    {/* CONTRASEÑA */}

                    <div className="as-field">

                        <label
                            className="as-label"
                            htmlFor="password"
                        >

                            Contraseña

                        </label>

                        <div className="login-control login-password">

                            <Lock
                                className="login-control-icono"
                                aria-hidden="true"
                            />

                            <input
                                id="password"
                                className="as-input"
                                type={
                                    mostrarPassword
                                        ? 'text'
                                        : 'password'
                                }
                                value={password}
                                onChange={(evento) =>
                                    setPassword(
                                        evento.target.value
                                    )
                                }
                                placeholder="Ingresá tu contraseña"
                                autoComplete="current-password"
                                disabled={cargando}
                                required
                            />

                            <button
                                type="button"
                                className="as-button as-button-ghost as-button-icon login-mostrar"
                                onClick={() =>
                                    setMostrarPassword(
                                        (actual) => !actual
                                    )
                                }
                                aria-label={
                                    mostrarPassword
                                        ? 'Ocultar contraseña'
                                        : 'Mostrar contraseña'
                                }
                                title={
                                    mostrarPassword
                                        ? 'Ocultar contraseña'
                                        : 'Mostrar contraseña'
                                }
                                aria-controls="password"
                                disabled={cargando}
                            >

                                {mostrarPassword
                                    ? <EyeOff aria-hidden="true" />
                                    : <Eye aria-hidden="true" />}

                            </button>

                        </div>

                    </div>

                    {/* MENSAJE DE ERROR */}

                    {error && (

                        <div
                            className="as-alert as-alert-danger"
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

                    {/* BOTÓN DE INGRESO */}

                    <button
                        type="submit"
                        className="as-button as-button-primary as-button-block login-ingresar"
                        disabled={cargando}
                    >

                        {cargando ? (

                            <span
                                className="as-spinner"
                                aria-hidden="true"
                            />

                        ) : (

                            <LogIn aria-hidden="true" />

                        )}

                        {cargando
                            ? 'INGRESANDO...'
                            : 'INICIAR SESIÓN'}

                    </button>

                </form>

                {/* VERSIÓN DEL SISTEMA */}

                <footer className="login-pie">

                    {APP_CONFIG.nombre} · v{APP_CONFIG.version}

                </footer>

            </section>

        </main>

    );

}