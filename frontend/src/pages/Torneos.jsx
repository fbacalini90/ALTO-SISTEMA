import { useEffect, useState } from 'react';

import {
    Trophy,
    Plus,
    Search,
    Pencil,
    Archive,
    ArchiveRestore,
    Trash2,
    CircleCheck,
    CircleAlert,
    CalendarDays,
    Clock,
    RefreshCw,
    Save,
    X
} from 'lucide-react';

import { APP_CONFIG } from '../config/app.config';
import { api, ApiError } from '../services/api';

import './Torneos.css';

/* CONSTANTES */

const ESTADOS = Object.freeze({
    ACTIVO: 'ACTIVO',
    ARCHIVADO: 'ARCHIVADO'
});

const FILTROS = [
    { valor: 'TODOS', etiqueta: 'TODOS' },
    { valor: 'ACTIVO', etiqueta: 'ACTIVOS' },
    { valor: 'ARCHIVADO', etiqueta: 'ARCHIVADOS' }
];

const LIMITE_NOMBRE = 100;
const LIMITE_DESCRIPCION = 500;

/* FUNCIONES AUXILIARES */

function normalizarNombre(valor) {

    return valor
        .normalize('NFC')
        .trim()
        .replace(/\s+/g, ' ');

}

function normalizarBusqueda(valor) {

    return String(valor ?? '')
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .trim()
        .replace(/\s+/g, ' ')
        .toLocaleLowerCase('es-AR');

}

function contarCaracteres(valor) {

    return Array.from(valor).length;

}

function ordenarTorneos(torneos) {

    return [...torneos].sort((a, b) => {

        if (a.estado !== b.estado) {

            return a.estado === ESTADOS.ACTIVO
                ? -1
                : 1;

        }

        return a.nombre.localeCompare(
            b.nombre,
            APP_CONFIG.idioma,
            { sensitivity: 'base' }
        ) || a.id - b.id;

    });

}

function formatearFecha(valor) {

    if (!valor) {
        return 'No disponible';
    }

    const fecha = new Date(valor);

    if (Number.isNaN(fecha.getTime())) {
        return 'No disponible';
    }

    return new Intl.DateTimeFormat(
        APP_CONFIG.idioma,
        {
            dateStyle: 'short',
            timeZone: APP_CONFIG.zonaHoraria
        }
    ).format(fecha);

}

function obtenerMensajeError(error, mensajeAlternativo) {

    return error instanceof ApiError
        ? error.message
        : mensajeAlternativo;

}

/* COMPONENTE PRINCIPAL */

export default function Torneos() {

    const [torneos, setTorneos] = useState([]);

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('TODOS');

    const [formulario, setFormulario] = useState(null);

    const [errorCarga, setErrorCarga] = useState('');
    const [errorOperacion, setErrorOperacion] = useState('');
    const [mensaje, setMensaje] = useState('');

    const [recarga, setRecarga] = useState(0);

    const ocupado = cargando || guardando;

    /* CARGA INICIAL */

    useEffect(() => {

        const controlador = new AbortController();

        async function cargarTorneos() {

            try {

                const datos = await api.get(
                    '/torneos',
                    {
                        signal: controlador.signal
                    }
                );

                if (!controlador.signal.aborted) {

                    setTorneos(
                        ordenarTorneos(datos.torneos)
                    );

                    setErrorCarga('');

                }

            } catch (error) {

                if (!controlador.signal.aborted) {

                    setErrorCarga(
                        obtenerMensajeError(
                            error,
                            'No se pudieron cargar los torneos.'
                        )
                    );

                }

            } finally {

                if (!controlador.signal.aborted) {

                    setCargando(false);

                }

            }

        }

        cargarTorneos();

        return () => controlador.abort();

    }, [recarga]);

    /* RECARGA MANUAL */

    function recargarTorneos() {

        if (ocupado || formulario) {
            return;
        }

        setCargando(true);
        setErrorCarga('');
        setErrorOperacion('');
        setMensaje('');

        setRecarga(
            (anterior) => anterior + 1
        );

    }

    /* INDICADORES */

    const totalTorneos = torneos.length;

    const totalActivos = torneos.filter(
        (torneo) => torneo.estado === ESTADOS.ACTIVO
    ).length;

    const totalArchivados = torneos.filter(
        (torneo) => torneo.estado === ESTADOS.ARCHIVADO
    ).length;

    const indicadores = [
        {
            etiqueta: 'Total de torneos',
            valor: totalTorneos,
            Icono: Trophy,
            clase: ''
        },
        {
            etiqueta: 'Activos',
            valor: totalActivos,
            Icono: CircleCheck,
            clase: 'as-text-success'
        },
        {
            etiqueta: 'Archivados',
            valor: totalArchivados,
            Icono: Archive,
            clase: 'as-text-secondary'
        }
    ];

    /* BÚSQUEDA Y FILTROS */

    const textoBuscado = normalizarBusqueda(busqueda);

    const torneosFiltrados = torneos.filter((torneo) => {

        const coincideEstado =
            filtroEstado === 'TODOS' ||
            torneo.estado === filtroEstado;

        const coincideBusqueda =
            normalizarBusqueda(torneo.nombre)
                .includes(textoBuscado) ||
            normalizarBusqueda(torneo.descripcion)
                .includes(textoBuscado);

        return coincideEstado && coincideBusqueda;

    });

    function limpiarFiltros() {

        setBusqueda('');
        setFiltroEstado('TODOS');

    }

    /* ACTUALIZACIÓN DEL LISTADO LOCAL */

    function actualizarListado(torneoActualizado) {

        setTorneos((anteriores) => {

            const restantes = anteriores.filter(
                (torneo) =>
                    torneo.id !== torneoActualizado.id
            );

            return ordenarTorneos([
                ...restantes,
                torneoActualizado
            ]);

        });

    }

    /* NUEVO TORNEO */

    function abrirNuevoTorneo() {

        if (ocupado || formulario || errorCarga) {
            return;
        }

        setMensaje('');
        setErrorOperacion('');

        setFormulario({
            id: null,
            nombre: '',
            descripcion: ''
        });

    }

    /* EDICIÓN */

    function abrirEdicion(torneo) {

        if (ocupado || formulario || errorCarga) {
            return;
        }

        setMensaje('');
        setErrorOperacion('');

        setFormulario({
            id: torneo.id,
            nombre: torneo.nombre,
            descripcion: torneo.descripcion ?? ''
        });

    }

    function actualizarCampo(campo, valor) {

        setFormulario((anterior) => ({
            ...anterior,
            [campo]: valor
        }));

        setErrorOperacion('');

    }

    function cancelarFormulario() {

        if (guardando) {
            return;
        }

        setFormulario(null);
        setErrorOperacion('');

    }

    /* GUARDAR TORNEO */

    async function guardarTorneo(evento) {

        evento.preventDefault();

        if (!formulario || ocupado) {
            return;
        }

        const nombre = normalizarNombre(
            formulario.nombre
        );

        const descripcion = formulario.descripcion
            .normalize('NFC')
            .trim();

        setErrorOperacion('');
        setMensaje('');

        /* VALIDACIÓN */

        if (!nombre) {

            setErrorOperacion(
                'El nombre del torneo es obligatorio.'
            );

            return;

        }

        if (contarCaracteres(nombre) > LIMITE_NOMBRE) {

            setErrorOperacion(
                'El nombre no puede superar los 100 caracteres.'
            );

            return;

        }

        if (
            contarCaracteres(descripcion) >
            LIMITE_DESCRIPCION
        ) {

            setErrorOperacion(
                'La descripción no puede superar los 500 caracteres.'
            );

            return;

        }

        const datos = {
            nombre,
            descripcion: descripcion || null
        };

        const esNuevo = formulario.id === null;

        setGuardando(true);

        try {

            const respuesta = esNuevo

                ? await api.post(
                    '/torneos',
                    datos
                )

                : await api.put(
                    `/torneos/${formulario.id}`,
                    datos
                );

            actualizarListado(respuesta.torneo);

            limpiarFiltros();

            setFormulario(null);

            setMensaje(
                respuesta.mensaje ||
                (
                    esNuevo
                        ? 'Torneo creado correctamente.'
                        : 'Torneo actualizado correctamente.'
                )
            );

        } catch (error) {

            setErrorOperacion(
                obtenerMensajeError(
                    error,
                    'No se pudo guardar el torneo.'
                )
            );

        } finally {

            setGuardando(false);

        }

    }

    /* ARCHIVAR Y REACTIVAR */

    async function cambiarEstado(torneo) {

        if (ocupado || formulario || errorCarga) {
            return;
        }

        const archivar =
            torneo.estado === ESTADOS.ACTIVO;

        const nuevoEstado = archivar
            ? ESTADOS.ARCHIVADO
            : ESTADOS.ACTIVO;

        const confirmacion = archivar

            ? `¿Archivar el torneo "${torneo.nombre}"?\n\n` +
              'Sus datos se conservarán y podrás reactivarlo.'

            : `¿Reactivar el torneo "${torneo.nombre}"?`;

        if (!window.confirm(confirmacion)) {
            return;
        }

        setGuardando(true);
        setErrorOperacion('');
        setMensaje('');

        try {

            const respuesta = await api.patch(
                `/torneos/${torneo.id}/estado`,
                {
                    estado: nuevoEstado
                }
            );

            actualizarListado(respuesta.torneo);

            limpiarFiltros();

            setMensaje(
                respuesta.mensaje ||
                (
                    archivar
                        ? 'Torneo archivado correctamente.'
                        : 'Torneo reactivado correctamente.'
                )
            );

        } catch (error) {

            setErrorOperacion(
                obtenerMensajeError(
                    error,
                    'No se pudo cambiar el estado del torneo.'
                )
            );

        } finally {

            setGuardando(false);

        }

    }

    /* ELIMINAR TORNEO */

    async function eliminarTorneo(torneo) {

        if (ocupado || formulario || errorCarga) {
            return;
        }

        const confirmacion =
            `¿Eliminar definitivamente el torneo "${torneo.nombre}"?\n\n` +
            'Esta operación no se puede deshacer.';

        if (!window.confirm(confirmacion)) {
            return;
        }

        setGuardando(true);
        setErrorOperacion('');
        setMensaje('');

        try {

            const respuesta = await api.delete(
                `/torneos/${torneo.id}`
            );

            setTorneos((anteriores) => anteriores.filter(
                (registro) => registro.id !== torneo.id
            ));

            limpiarFiltros();

            setMensaje(
                respuesta.mensaje || 'Torneo eliminado correctamente.'
            );

        } catch (error) {

            setErrorOperacion(
                obtenerMensajeError(
                    error,
                    'No se pudo eliminar el torneo. Actualizá el listado antes de reintentar.'
                )
            );

        } finally {

            setGuardando(false);

        }

    }

    /* INTERFAZ */

    return (

        <div className="as-page torneos-pagina">

            {/* CABECERA */}

            <header className="as-page-header">

                <div>

                    <h1>TORNEOS</h1>

                    <p>
                        Administración de competiciones deportivas
                    </p>

                </div>

                <div className="torneos-cabecera-acciones">

                    <button
                        type="button"
                        className="as-button as-button-secondary as-button-icon"
                        onClick={recargarTorneos}
                        disabled={ocupado || Boolean(formulario)}
                        aria-label="Actualizar torneos"
                        title="Actualizar torneos"
                    >

                        {cargando
                            ? <span className="as-spinner" aria-hidden="true" />
                            : <RefreshCw aria-hidden="true" />}

                    </button>

                    <button
                        type="button"
                        className="as-button as-button-primary"
                        onClick={abrirNuevoTorneo}
                        disabled={
                            ocupado ||
                            Boolean(formulario) ||
                            Boolean(errorCarga)
                        }
                    >

                        <Plus aria-hidden="true" />

                        NUEVO TORNEO

                    </button>

                </div>

            </header>

            {/* INDICADORES */}

            <section
                className="torneos-indicadores"
                aria-label="Resumen de torneos"
            >

                {indicadores.map(
                    ({ etiqueta, valor, Icono, clase }) => (

                        <article
                            key={etiqueta}
                            className="as-stat-card"
                        >

                            <Icono aria-hidden="true" />

                            <span className="as-stat-label">

                                {etiqueta}

                            </span>

                            <strong
                                className={`as-stat-value ${clase}`}
                            >

                                {cargando || errorCarga
                                    ? '—'
                                    : valor}

                            </strong>

                        </article>

                    )
                )}

            </section>

            {/* MENSAJES */}

            {mensaje && (

                <div
                    className="as-alert as-alert-success torneos-alerta"
                    role="status"
                >

                    <CircleCheck aria-hidden="true" />

                    <span className="as-alert-content">

                        {mensaje}

                    </span>

                    <button
                        type="button"
                        className="as-button as-button-ghost as-button-icon"
                        onClick={() => setMensaje('')}
                        aria-label="Cerrar mensaje"
                    >

                        <X aria-hidden="true" />

                    </button>

                </div>

            )}

            {errorOperacion && !formulario && (

                <div
                    className="as-alert as-alert-danger torneos-alerta"
                    role="alert"
                >

                    <CircleAlert aria-hidden="true" />

                    <span className="as-alert-content">

                        {errorOperacion}

                    </span>

                    <button
                        type="button"
                        className="as-button as-button-ghost as-button-icon"
                        onClick={() => setErrorOperacion('')}
                        aria-label="Cerrar mensaje de error"
                    >

                        <X aria-hidden="true" />

                    </button>

                </div>

            )}

            {/* FORMULARIO DE ALTA Y EDICIÓN */}

            {formulario && (

                <section
                    className="as-panel torneos-formulario-panel"
                    aria-labelledby="torneos-formulario-titulo"
                >

                    <div className="torneos-formulario-cabecera">

                        <div>

                            <h2 id="torneos-formulario-titulo">

                                {formulario.id === null
                                    ? 'NUEVO TORNEO'
                                    : 'EDITAR TORNEO'}

                            </h2>

                            <p className="as-text-description">

                                {formulario.id === null
                                    ? 'Registrá una nueva competición deportiva.'
                                    : 'Modificá los datos de la competición.'}

                            </p>

                        </div>

                        <button
                            type="button"
                            className="as-button as-button-ghost as-button-icon"
                            onClick={cancelarFormulario}
                            disabled={guardando}
                            aria-label="Cerrar formulario"
                        >

                            <X aria-hidden="true" />

                        </button>

                    </div>

                    <hr className="as-divider" />

                    <form
                        className="as-form"
                        onSubmit={guardarTorneo}
                        aria-busy={guardando}
                    >

                        {/* NOMBRE */}

                        <div className="as-field">

                            <label
                                className="as-label"
                                htmlFor="torneo-nombre"
                            >

                                Nombre del torneo

                                {' '}

                                <span className="as-field-required">

                                    *

                                </span>

                            </label>

                            <input
                                id="torneo-nombre"
                                type="text"
                                className="as-input"
                                value={formulario.nombre}
                                onChange={(evento) =>
                                    actualizarCampo(
                                        'nombre',
                                        evento.target.value
                                    )
                                }
                                placeholder="Ingresá el nombre del torneo"
                                aria-describedby="torneo-nombre-contador"
                                aria-invalid={
                                    contarCaracteres(
                                        normalizarNombre(formulario.nombre)
                                    ) > LIMITE_NOMBRE
                                }
                                disabled={guardando}
                                required
                            />

                            <span
                                id="torneo-nombre-contador"
                                className={
                                    contarCaracteres(
                                        normalizarNombre(formulario.nombre)
                                    ) > LIMITE_NOMBRE
                                        ? 'as-field-counter as-text-danger'
                                        : 'as-field-counter'
                                }
                            >

                                {contarCaracteres(
                                    normalizarNombre(formulario.nombre)
                                )}

                                /{LIMITE_NOMBRE}

                            </span>

                        </div>

                        {/* DESCRIPCIÓN */}

                        <div className="as-field">

                            <label
                                className="as-label"
                                htmlFor="torneo-descripcion"
                            >

                                Descripción (opcional)

                            </label>

                            <textarea
                                id="torneo-descripcion"
                                className="as-textarea"
                                value={formulario.descripcion}
                                onChange={(evento) =>
                                    actualizarCampo(
                                        'descripcion',
                                        evento.target.value
                                    )
                                }
                                placeholder="Descripción general de la competición..."
                                rows={4}
                                aria-describedby="torneo-descripcion-contador"
                                aria-invalid={
                                    contarCaracteres(
                                        formulario.descripcion
                                            .normalize('NFC')
                                            .trim()
                                    ) > LIMITE_DESCRIPCION
                                }
                                disabled={guardando}
                            />

                            <span
                                id="torneo-descripcion-contador"
                                className={
                                    contarCaracteres(
                                        formulario.descripcion
                                            .normalize('NFC')
                                            .trim()
                                    ) > LIMITE_DESCRIPCION
                                        ? 'as-field-counter as-text-danger'
                                        : 'as-field-counter'
                                }
                            >

                                {contarCaracteres(
                                    formulario.descripcion
                                        .normalize('NFC')
                                        .trim()
                                )}

                                /{LIMITE_DESCRIPCION}

                            </span>

                        </div>

                        {/* ERROR DEL FORMULARIO */}

                        {errorOperacion && (

                            <div
                                className="as-alert as-alert-danger"
                                role="alert"
                            >

                                <CircleAlert aria-hidden="true" />

                                <span className="as-alert-content">

                                    {errorOperacion}

                                </span>

                            </div>

                        )}

                        {/* ACCIONES */}

                        <div className="as-form-actions">

                            <button
                                type="button"
                                className="as-button as-button-secondary"
                                onClick={cancelarFormulario}
                                disabled={guardando}
                            >

                                <X aria-hidden="true" />

                                CANCELAR

                            </button>

                            <button
                                type="submit"
                                className="as-button as-button-primary"
                                disabled={guardando}
                            >

                                {guardando
                                    ? <span className="as-spinner" aria-hidden="true" />
                                    : <Save aria-hidden="true" />}

                                {guardando
                                    ? 'GUARDANDO...'
                                    : formulario.id === null
                                        ? 'CREAR TORNEO'
                                        : 'GUARDAR CAMBIOS'}

                            </button>

                        </div>

                    </form>

                </section>

            )}

            {/* BÚSQUEDA Y FILTROS */}

            <section
                className="as-toolbar torneos-herramientas"
                aria-label="Búsqueda y filtros"
            >

                <div className="as-search">

                    <Search aria-hidden="true" />

                    <label
                        htmlFor="torneos-busqueda"
                        className="as-sr-only"
                    >

                        Buscar torneo

                    </label>

                    <input
                        id="torneos-busqueda"
                        type="search"
                        className="as-input"
                        placeholder="Buscar torneo..."
                        value={busqueda}
                        onChange={(evento) =>
                            setBusqueda(evento.target.value)
                        }
                        disabled={cargando || Boolean(errorCarga)}
                    />

                </div>

                <div
                    className="as-filters"
                    role="group"
                    aria-label="Filtrar por estado"
                >

                    {FILTROS.map((filtro) => (

                        <button
                            key={filtro.valor}
                            type="button"
                            className="as-filter"
                            aria-pressed={
                                filtroEstado === filtro.valor
                            }
                            onClick={() =>
                                setFiltroEstado(filtro.valor)
                            }
                            disabled={
                                cargando ||
                                Boolean(errorCarga)
                            }
                        >

                            {filtro.etiqueta}

                        </button>

                    ))}

                </div>

            </section>

            {/* ESTADO DE CARGA */}

            {cargando && (

                <div
                    className="as-empty"
                    role="status"
                >

                    <span
                        className="as-spinner"
                        aria-hidden="true"
                    />

                    <h2>CARGANDO TORNEOS</h2>

                    <p>
                        Consultando las competiciones registradas.
                    </p>

                </div>

            )}

            {/* ERROR DE CARGA */}

            {!cargando && errorCarga && (

                <section className="as-empty">

                    <CircleAlert
                        className="as-empty-icon as-text-danger"
                        aria-hidden="true"
                    />

                    <h2>NO SE PUDIERON CARGAR LOS TORNEOS</h2>

                    <p role="alert">{errorCarga}</p>

                    <button
                        type="button"
                        className="as-button as-button-secondary"
                        onClick={recargarTorneos}
                    >

                        <RefreshCw aria-hidden="true" />

                        REINTENTAR

                    </button>

                </section>

            )}

            {/* ESTADO VACÍO */}

            {!cargando &&
                !errorCarga &&
                totalTorneos === 0 && (

                <section className="as-empty">

                    <Trophy
                        className="as-empty-icon"
                        aria-hidden="true"
                    />

                    <h2>TODAVÍA NO HAY TORNEOS</h2>

                    <p>

                        Creá tu primera competición para
                        comenzar a organizar la actividad deportiva.

                    </p>

                    {!formulario && (

                        <button
                            type="button"
                            className="as-button as-button-primary"
                            onClick={abrirNuevoTorneo}
                            disabled={ocupado}
                        >

                            <Plus aria-hidden="true" />

                            CREAR PRIMER TORNEO

                        </button>

                    )}

                </section>

            )}

            {/* BÚSQUEDA SIN RESULTADOS */}

            {!cargando &&
                !errorCarga &&
                totalTorneos > 0 &&
                torneosFiltrados.length === 0 && (

                <section className="as-empty">

                    <Search
                        className="as-empty-icon"
                        aria-hidden="true"
                    />

                    <h2>SIN RESULTADOS</h2>

                    <p>

                        No hay torneos que coincidan
                        con los filtros seleccionados.

                    </p>

                    <button
                        type="button"
                        className="as-button as-button-secondary"
                        onClick={limpiarFiltros}
                    >

                        <X aria-hidden="true" />

                        LIMPIAR FILTROS

                    </button>

                </section>

            )}

            {/* LISTADO DE TORNEOS */}

            {!cargando &&
                !errorCarga &&
                torneosFiltrados.length > 0 && (

                <section
                    className="torneos-listado"
                    aria-label="Torneos registrados"
                    aria-busy={guardando}
                >

                    <p
                        className="torneos-resultados"
                        aria-live="polite"
                    >

                        {torneosFiltrados.length}

                        {torneosFiltrados.length === 1
                            ? ' torneo encontrado'
                            : ' torneos encontrados'}

                    </p>

                    <div className="torneos-grid">

                        {torneosFiltrados.map((torneo) => {

                            const activo =
                                torneo.estado === ESTADOS.ACTIVO;

                            return (

                                <article
                                    key={torneo.id}
                                    className={
                                        activo
                                            ? 'as-card torneos-tarjeta'
                                            : 'as-card torneos-tarjeta torneos-tarjeta-archivada'
                                    }
                                >

                                    {/* IDENTIDAD */}

                                    <div className="torneos-tarjeta-cabecera">

                                        <div className="torneos-identidad">

                                            <div className="torneos-icono">

                                                <Trophy aria-hidden="true" />

                                            </div>

                                            <h2>{torneo.nombre}</h2>

                                        </div>

                                        <span
                                            className={
                                                activo
                                                    ? 'as-status as-status-active'
                                                    : 'as-status as-status-archived'
                                            }
                                        >

                                            {torneo.estado}

                                        </span>

                                    </div>

                                    {/* DESCRIPCIÓN */}

                                    <p className="torneos-descripcion">

                                        {torneo.descripcion ||
                                            'Sin descripción.'}

                                    </p>

                                    {/* METADATOS */}

                                    <div className="torneos-metadatos">

                                        <span>

                                            <CalendarDays aria-hidden="true" />

                                            Creado: {' '}

                                            {formatearFecha(
                                                torneo.fecha_creacion
                                            )}

                                        </span>

                                        <span>

                                            <Clock aria-hidden="true" />

                                            Actualizado: {' '}

                                            {formatearFecha(
                                                torneo.fecha_actualizacion
                                            )}

                                        </span>

                                    </div>

                                    {/* ACCIONES */}

                                    <footer className="as-card-footer torneos-tarjeta-acciones">

                                        <button
                                            type="button"
                                            className="as-button as-button-secondary"
                                            onClick={() =>
                                                abrirEdicion(torneo)
                                            }
                                            disabled={
                                                ocupado ||
                                                Boolean(formulario)
                                            }
                                            aria-label={
                                                `Editar ${torneo.nombre}`
                                            }
                                        >

                                            <Pencil aria-hidden="true" />

                                            EDITAR

                                        </button>

                                        <button
                                            type="button"
                                            className={
                                                activo
                                                    ? 'as-button as-button-warning'
                                                    : 'as-button as-button-success'
                                            }
                                            onClick={() =>
                                                cambiarEstado(torneo)
                                            }
                                            disabled={
                                                ocupado ||
                                                Boolean(formulario)
                                            }
                                            aria-label={
                                                activo
                                                    ? `Archivar ${torneo.nombre}`
                                                    : `Reactivar ${torneo.nombre}`
                                            }
                                        >

                                            {activo
                                                ? <Archive aria-hidden="true" />
                                                : <ArchiveRestore aria-hidden="true" />}

                                            {activo
                                                ? 'ARCHIVAR'
                                                : 'REACTIVAR'}

                                        </button>

                                        <button
                                            type="button"
                                            className="as-button as-button-danger"
                                            onClick={() =>
                                                eliminarTorneo(torneo)
                                            }
                                            disabled={
                                                ocupado ||
                                                Boolean(formulario)
                                            }
                                            aria-label={
                                                `Eliminar ${torneo.nombre}`
                                            }
                                        >

                                            <Trash2 aria-hidden="true" />

                                            ELIMINAR

                                        </button>

                                    </footer>

                                </article>

                            );

                        })}

                    </div>

                </section>

            )}

        </div>

    );

}