
import { useEffect, useState } from 'react';

import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from 'react-router-dom';

import { APP_CONFIG } from './config/app.config';

import {
    MODULOS_SECUNDARIOS
} from './config/modulos.config';

import { api } from './services/api';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Torneos from './pages/Torneos';
import Ediciones from './pages/Ediciones';
import ModuloPendiente from './pages/ModuloPendiente';

import AppLayout from './layouts/AppLayout';

import './App.css';


/* ==================================================
   REGISTRO DE MÓDULOS IMPLEMENTADOS
   ================================================== */

const COMPONENTES_MODULOS = Object.freeze({
    torneos: Torneos
});


/* ==================================================
   APLICACIÓN PRINCIPAL
   ================================================== */

function App() {

    const [usuario, setUsuario] = useState(null);

    const [verificando, setVerificando] =
        useState(true);

    const [cerrandoSesion, setCerrandoSesion] =
        useState(false);

    const [error, setError] = useState('');


    /* VERIFICACIÓN DE SESIÓN */

    useEffect(() => {

        const controller = new AbortController();

        async function verificarSesion() {

            try {

                const datos = await api.get(
                    '/auth/me',
                    {
                        signal: controller.signal
                    }
                );

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


    /* INICIO DE SESIÓN */

    function iniciarSesion(usuarioAutenticado) {

        setError('');

        setUsuario(usuarioAutenticado);

    }


    /* CIERRE DE SESIÓN */

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

            <main
                className="app-carga-inicial"
                aria-busy="true"
            >

                <h1>{APP_CONFIG.nombre}</h1>

                <div
                    className="app-carga-estado"
                    role="status"
                >

                    <span
                        className="as-spinner"
                        aria-hidden="true"
                    />

                    <p>Verificando sesión...</p>

                </div>

            </main>

        );

    }


    /* ACCESO PRIVADO */

    if (!usuario) {

        return (

            <Login onLogin={iniciarSesion} />

        );

    }


    /* APLICACIÓN AUTENTICADA */

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

                    {/* PANEL PRINCIPAL */}

                    <Route
                        index
                        element={<Dashboard />}
                    />


                    {/* MÓDULOS DEL SISTEMA */}

                    {MODULOS_SECUNDARIOS.map((modulo) => {

                        const Componente =
                            COMPONENTES_MODULOS[modulo.id];

                        return (

                            <Route
                                key={modulo.id}
                                path={modulo.ruta}
                                element={
                                    Componente

                                        ? <Componente />

                                        : <ModuloPendiente
                                            id={modulo.id}
                                            titulo={modulo.titulo}
                                            descripcion={modulo.descripcion}
                                        />
                                }
                            />

                        );

                    })}


                    {/* EDICIONES DE UN TORNEO */}

                    <Route
                        path="torneos/:torneoId/ediciones"
                        element={<Ediciones />}
                    />


                    {/* RUTAS INEXISTENTES */}

                    <Route
                        path="*"
                        element={
                            <Navigate
                                to="/"
                                replace
                            />
                        }
                    />

                </Route>

            </Routes>

        </BrowserRouter>

    );

}


export default App;
