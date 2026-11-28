import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
    Trophy,
    Users,
    CalendarDays,
    Target,
    Monitor,
    Server,
    Database,
    ArrowRight,
    RefreshCw
} from 'lucide-react';

import { APP_CONFIG } from '../config/app.config';

import {
    ACCESOS_RAPIDOS
} from '../config/modulos.config';

import {
    obtenerIconoModulo
} from '../config/iconos.config';

import { api, ApiError } from '../services/api';

import './Dashboard.css';

/* COMPONENTE PRINCIPAL */

export default function Dashboard() {

    const [estado, setEstado] = useState(null);

    const [torneosActivos, setTorneosActivos] =
        useState(null);

    const [errorTorneos, setErrorTorneos] =
        useState(false);

    const [actualizando, setActualizando] =
        useState(true);

    const [recarga, setRecarga] =
        useState(0);

    /* CONSULTA DE INFRAESTRUCTURA Y ACTIVIDAD */

    useEffect(() => {

        const controlador = new AbortController();

        async function verificarEstado() {

            try {

                const datos = await api.get(
                    '/health',
                    {
                        signal: controlador.signal
                    }
                );

                if (!controlador.signal.aborted) {

                    setEstado(datos);

                }

            } catch (error) {

                if (controlador.signal.aborted) {
                    return;
                }

                if (
                    error instanceof ApiError &&
                    error.status === 503 &&
                    error.datos?.backend === 'ONLINE'
                ) {

                    setEstado(error.datos);

                } else {

                    setEstado({
                        backend: 'NO DISPONIBLE',
                        database: 'NO VERIFICADA'
                    });

                }

            }

        }

        async function consultarTorneos() {

            try {

                const datos = await api.get(
                    '/torneos?estado=ACTIVO',
                    {
                        signal: controlador.signal
                    }
                );

                if (!controlador.signal.aborted) {

                    setTorneosActivos(datos.total);

                    setErrorTorneos(false);

                }

            } catch {

                if (!controlador.signal.aborted) {

                    setTorneosActivos(null);

                    setErrorTorneos(true);

                }

            }

        }

        async function cargarDashboard() {

            await Promise.all([
                verificarEstado(),
                consultarTorneos()
            ]);

            if (!controlador.signal.aborted) {

                setActualizando(false);

            }

        }

        cargarDashboard();

        return () => {

            controlador.abort();

        };

    }, [recarga]);

    /* ACTUALIZACIÓN MANUAL */

    function actualizarDashboard() {

        setActualizando(true);

        setEstado(null);

        setTorneosActivos(null);

        setErrorTorneos(false);

        setRecarga(
            (anterior) => anterior + 1
        );

    }

    /* FECHA ACTUAL */

    const fechaActual = new Intl.DateTimeFormat(
        APP_CONFIG.idioma,
        {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: APP_CONFIG.zonaHoraria
        }
    ).format(new Date());

    /* INDICADORES DE INFRAESTRUCTURA */

    const servicios = [
        {
            nombre: 'Frontend',
            valor: 'ONLINE',
            Icono: Monitor
        },
        {
            nombre: 'Backend',
            valor: estado?.backend || 'VERIFICANDO',
            Icono: Server
        },
        {
            nombre: 'Base de datos',
            valor: estado?.database || 'VERIFICANDO',
            Icono: Database
        }
    ];

    /* INDICADORES DE ACTIVIDAD */

    const indicadores = [
        {
            nombre: 'Torneos activos',

            valor: torneosActivos ?? '—',

            descripcion: errorTorneos
                ? 'No disponible'
                : torneosActivos === null
                    ? 'Consultando datos...'
                    : 'Competiciones activas',

            Icono: Trophy,

            disponible: !errorTorneos &&
                torneosActivos !== null
        },
        {
            nombre: 'Equipos inscritos',

            valor: '—',

            descripcion: 'Pendiente de implementación',

            Icono: Users,

            disponible: false
        },
        {
            nombre: 'Partidos disputados',

            valor: '—',

            descripcion: 'Pendiente de implementación',

            Icono: CalendarDays,

            disponible: false
        },
        {
            nombre: 'Goles convertidos',

            valor: '—',

            descripcion: 'Pendiente de implementación',

            Icono: Target,

            disponible: false
        }
    ];

    /* ESTILOS DE ESTADO */

    function obtenerClaseEstado(valor) {

        if (valor === 'ONLINE') {

            return 'as-status as-status-active';

        }

        if (valor === 'VERIFICANDO') {

            return 'as-status as-status-pending';

        }

        return 'as-status dashboard-status-offline';

    }

    /* INTERFAZ */

    return (

        <div className="as-page dashboard">

            {/* CABECERA */}

            <header className="as-page-header dashboard-cabecera">

                <div>

                    <h1>PANEL PRINCIPAL</h1>

                    <p>{APP_CONFIG.descripcion}</p>

                </div>

                <div className="dashboard-cabecera-acciones">

                    <span className="dashboard-fecha">

                        <CalendarDays aria-hidden="true" />

                        {fechaActual}

                    </span>

                    <button
                        type="button"
                        className="as-button as-button-secondary as-button-icon"
                        onClick={actualizarDashboard}
                        disabled={actualizando}
                        aria-label="Actualizar panel principal"
                        title="Actualizar panel principal"
                    >

                        {actualizando ? (

                            <span
                                className="as-spinner"
                                aria-hidden="true"
                            />

                        ) : (

                            <RefreshCw aria-hidden="true" />

                        )}

                    </button>

                </div>

            </header>

            {/* BIENVENIDA */}

            <section className="as-panel dashboard-bienvenida">

                <div className="dashboard-bienvenida-texto">

                    <span className="as-text-label dashboard-etiqueta">

                        GESTIÓN DE TORNEOS AMATEURS

                    </span>

                    <h2>

                        Bienvenido a {APP_CONFIG.nombre}

                    </h2>

                    <p>

                        Administrá tus competiciones desde
                        un mismo lugar. Organizá tus torneos
                        y prepará la próxima jornada.

                    </p>

                </div>

                <Trophy
                    className="dashboard-bienvenida-icono"
                    aria-hidden="true"
                />

            </section>

            {/* ACCESOS RÁPIDOS */}

            <section
                className="dashboard-seccion"
                aria-labelledby="dashboard-accesos-titulo"
            >

                <h2 id="dashboard-accesos-titulo">

                    ACCESOS RÁPIDOS

                </h2>

                <div className="dashboard-accesos">

                    {ACCESOS_RAPIDOS.map((acceso) => {

                        const Icono =
                            obtenerIconoModulo(acceso.id);

                        return (

                            <Link
                                key={acceso.id}
                                to={acceso.ruta}
                                className="as-card dashboard-acceso"
                            >

                                <div className="dashboard-acceso-icono">

                                    <Icono aria-hidden="true" />

                                </div>

                                <h3>{acceso.titulo}</h3>

                                <p className="as-text-description">

                                    {acceso.descripcionRapida ||
                                        acceso.descripcion}

                                </p>

                                <span className="dashboard-acceso-accion">

                                    INGRESAR

                                    <ArrowRight aria-hidden="true" />

                                </span>

                            </Link>

                        );

                    })}

                </div>

            </section>

            {/* RESUMEN DE ACTIVIDAD */}

            <section
                className="dashboard-seccion"
                aria-labelledby="dashboard-actividad-titulo"
            >

                <h2 id="dashboard-actividad-titulo">

                    RESUMEN DE ACTIVIDAD

                </h2>

                <div className="dashboard-resumen">

                    {indicadores.map(
                        ({
                            nombre,
                            valor,
                            descripcion,
                            Icono,
                            disponible
                        }) => (

                            <article
                                key={nombre}
                                className="as-stat-card dashboard-indicador"
                            >

                                <Icono aria-hidden="true" />

                                <span className="as-stat-label">

                                    {nombre}

                                </span>

                                <strong
                                    className={
                                        disponible
                                            ? 'as-stat-value'
                                            : 'as-stat-value as-text-muted'
                                    }
                                >

                                    {valor}

                                </strong>

                                <small className="as-text-secondary">

                                    {descripcion}

                                </small>

                            </article>

                        )
                    )}

                </div>

            </section>

            {/* ESTADO DE INFRAESTRUCTURA */}

            <section
                className="dashboard-seccion"
                aria-labelledby="dashboard-sistema-titulo"
            >

                <h2 id="dashboard-sistema-titulo">

                    ESTADO DEL SISTEMA

                </h2>

                <div
                    className="dashboard-sistema"
                    aria-live="polite"
                >

                    {servicios.map(
                        ({
                            nombre,
                            valor,
                            Icono
                        }) => (

                            <article
                                key={nombre}
                                className="as-panel dashboard-servicio"
                            >

                                <div className="dashboard-servicio-identidad">

                                    <Icono aria-hidden="true" />

                                    <span>{nombre}</span>

                                </div>

                                <span
                                    className={
                                        obtenerClaseEstado(valor)
                                    }
                                >

                                    {valor}

                                </span>

                            </article>

                        )
                    )}

                </div>

            </section>

        </div>

    );

}