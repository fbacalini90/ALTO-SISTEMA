import { useEffect, useState } from 'react';

import {
    useNavigate,
    useParams
} from 'react-router-dom';

import {
    ArrowLeft,
    CalendarDays,
    CalendarClock,
    Trophy,
    Layers,
    Plus,
    Search,
    Pencil,
    Trash2,
    CircleCheck,
    CircleAlert,
    Play,
    Flag,
    RotateCcw,
    RefreshCw,
    Save,
    X
} from 'lucide-react';

import { APP_CONFIG } from '../config/app.config';
import { api, ApiError } from '../services/api';

import './Ediciones.css';


/* ==================================================
   CONSTANTES
   ================================================== */

const ESTADOS = Object.freeze({
    PLANIFICADA: 'PLANIFICADA',
    EN_CURSO: 'EN_CURSO',
    FINALIZADA: 'FINALIZADA'
});

const FILTROS = [
    { valor: 'TODAS', etiqueta: 'TODAS' },
    { valor: ESTADOS.PLANIFICADA, etiqueta: 'PLANIFICADAS' },
    { valor: ESTADOS.EN_CURSO, etiqueta: 'EN CURSO' },
    { valor: ESTADOS.FINALIZADA, etiqueta: 'FINALIZADAS' }
];

const ESTADOS_VISUALES = Object.freeze({
    PLANIFICADA: {
        etiqueta: 'PLANIFICADA',
        clase: 'ediciones-estado-planificada'
    },
    EN_CURSO: {
        etiqueta: 'EN CURSO',
        clase: 'ediciones-estado-en-curso'
    },
    FINALIZADA: {
        etiqueta: 'FINALIZADA',
        clase: 'ediciones-estado-finalizada'
    }
});

const ACCIONES_ESTADO = Object.freeze({
    PLANIFICADA: {
        etiqueta: 'INICIAR',
        verbo: 'iniciar',
        siguiente: ESTADOS.EN_CURSO,
        Icono: Play,
        clase: 'as-button-success'
    },
    EN_CURSO: {
        etiqueta: 'FINALIZAR',
        verbo: 'finalizar',
        siguiente: ESTADOS.FINALIZADA,
        Icono: Flag,
        clase: 'as-button-warning'
    },
    FINALIZADA: {
        etiqueta: 'REABRIR',
        verbo: 'reabrir',
        siguiente: ESTADOS.EN_CURSO,
        Icono: RotateCcw,
        clase: 'as-button-success'
    }
});

const ORDEN_ESTADOS = Object.freeze({
    PLANIFICADA: 0,
    EN_CURSO: 1,
    FINALIZADA: 2
});

const LIMITE_NOMBRE = 100;
const LIMITE_DESCRIPCION = 500;


/* ==================================================
   FUNCIONES AUXILIARES
   ================================================== */

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

function ordenarEdiciones(ediciones) {
    return [...ediciones].sort((a, b) => {
        if (a.estado !== b.estado) {
            return ORDEN_ESTADOS[a.estado] -
                ORDEN_ESTADOS[b.estado];
        }

        return b.nombre.localeCompare(
            a.nombre,
            APP_CONFIG.idioma,
            {
                sensitivity: 'base',
                numeric: true
            }
        ) || b.id - a.id;
    });
}

function formatearFecha(valor) {
    if (!valor) {
        return 'Sin definir';
    }

    const coincidencia = String(valor).match(
        /^(\d{4})-(\d{2})-(\d{2})$/
    );

    if (!coincidencia) {
        return 'No disponible';
    }

    const [, anio, mes, dia] = coincidencia;

    return `${dia}/${mes}/${anio}`;
}

function obtenerMensajeError(error, mensajeAlternativo) {
    return error instanceof ApiError
        ? error.message
        : mensajeAlternativo;
}


/* ==================================================
   COMPONENTE DE ENTRADA
   ================================================== */

export default function Ediciones() {
    const { torneoId } = useParams();

    return (
        <GestionEdiciones
            key={torneoId}
            torneoId={torneoId}
        />
    );
}


/* ==================================================
   INDICADORES Y ACCESO A CATEGORIAS
   ================================================== */

function CategoriasDeEdicion({
    ruta,
    nombre,
    onGestionar,
    bloqueado
}) {
    const [indicadores, setIndicadores] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        const controlador = new AbortController();

        async function cargarIndicadores() {
            try {
                const datos = await api.get(ruta, {
                    signal: controlador.signal
                });

                if (controlador.signal.aborted) {
                    return;
                }

                const { total, activas } =
                    datos.indicadores ?? {};

                if (
                    !Number.isSafeInteger(total) ||
                    !Number.isSafeInteger(activas) ||
                    total < 0 ||
                    activas < 0 ||
                    activas > total
                ) {
                    throw new Error(
                        'Indicadores inválidos.'
                    );
                }

                setIndicadores({
                    total,
                    activas
                });

                setError(false);

            } catch {
                if (!controlador.signal.aborted) {
                    setIndicadores(null);
                    setError(true);
                }
            }
        }

        cargarIndicadores();

        return () => controlador.abort();

    }, [ruta]);

    return (
        <div className="ediciones-categorias">

            <div
                className="ediciones-categorias-indicadores"
                aria-live="polite"
                title={
                    error
                        ? 'Indicadores no disponibles'
                        : undefined
                }
            >
                <div className="ediciones-categorias-indicador">
                    <span className="as-stat-label">
                        CATEGORÍAS
                    </span>

                    <strong>
                        {indicadores?.total ?? '—'}
                    </strong>
                </div>

                <div className="ediciones-categorias-indicador">
                    <span className="as-stat-label">
                        ACTIVAS
                    </span>

                    <strong className="as-text-success">
                        {indicadores?.activas ?? '—'}
                    </strong>
                </div>
            </div>

            <button
                type="button"
                className="as-button as-button-primary ediciones-categorias-acceso"
                onClick={onGestionar}
                disabled={bloqueado}
                aria-label={`Gestionar categorías de ${nombre}`}
            >
                <Layers aria-hidden="true" />
                GESTIONAR CATEGORÍAS
            </button>

        </div>
    );
}


/* ==================================================
   GESTION DE EDICIONES
   ================================================== */

function GestionEdiciones({ torneoId }) {
    const navigate = useNavigate();

    const rutaBase =
        `/torneos/${encodeURIComponent(torneoId)}/ediciones`;

    const [torneo, setTorneo] = useState(null);
    const [ediciones, setEdiciones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('TODAS');
    const [formulario, setFormulario] = useState(null);
    const [errorCarga, setErrorCarga] = useState('');
    const [errorOperacion, setErrorOperacion] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [recarga, setRecarga] = useState(0);

    const ocupado = cargando || guardando;

    const torneoActivo =
        torneo?.estado === 'ACTIVO';

    const accionesBloqueadas =
        ocupado ||
        Boolean(formulario) ||
        Boolean(errorCarga);


    /* CARGA INICIAL */

    useEffect(() => {
        const controlador = new AbortController();

        async function cargarEdiciones() {
            try {
                const datos = await api.get(
                    rutaBase,
                    {
                        signal: controlador.signal
                    }
                );

                if (!controlador.signal.aborted) {
                    setTorneo(datos.torneo);

                    setEdiciones(
                        ordenarEdiciones(datos.ediciones)
                    );

                    setErrorCarga('');
                }

            } catch (error) {
                if (!controlador.signal.aborted) {
                    setErrorCarga(
                        obtenerMensajeError(
                            error,
                            'No se pudieron cargar las ediciones.'
                        )
                    );
                }

            } finally {
                if (!controlador.signal.aborted) {
                    setCargando(false);
                }
            }
        }

        cargarEdiciones();

        return () => controlador.abort();

    }, [rutaBase, recarga]);


    /* NAVEGACION Y RECARGA */

    function volverATorneos() {
        if (guardando) {
            return;
        }

        if (
            formulario &&
            !window.confirm(
                '¿Salir del formulario sin guardar los cambios?'
            )
        ) {
            return;
        }

        navigate('/torneos');
    }

    function recargarEdiciones() {
        if (ocupado || formulario) {
            return;
        }

        setCargando(true);
        setErrorCarga('');
        setErrorOperacion('');
        setMensaje('');

        setRecarga(anterior => anterior + 1);
    }


    /* INDICADORES */

    const totalEdiciones = ediciones.length;

    const totalPlanificadas = ediciones.filter(
        edicion => edicion.estado === ESTADOS.PLANIFICADA
    ).length;

    const totalEnCurso = ediciones.filter(
        edicion => edicion.estado === ESTADOS.EN_CURSO
    ).length;

    const totalFinalizadas = ediciones.filter(
        edicion => edicion.estado === ESTADOS.FINALIZADA
    ).length;

    const indicadores = [
        {
            etiqueta: 'Total de ediciones',
            valor: totalEdiciones,
            Icono: CalendarDays,
            clase: ''
        },
        {
            etiqueta: 'Planificadas',
            valor: totalPlanificadas,
            Icono: CalendarClock,
            clase: 'ediciones-texto-planificada'
        },
        {
            etiqueta: 'En curso',
            valor: totalEnCurso,
            Icono: Play,
            clase: 'as-text-success'
        },
        {
            etiqueta: 'Finalizadas',
            valor: totalFinalizadas,
            Icono: Flag,
            clase: 'as-text-secondary'
        }
    ];


    /* BUSQUEDA Y FILTROS */

    const textoBuscado =
        normalizarBusqueda(busqueda);

    const edicionesFiltradas = ediciones.filter(
        edicion => {
            const coincideEstado =
                filtroEstado === 'TODAS' ||
                edicion.estado === filtroEstado;

            const coincideBusqueda =
                normalizarBusqueda(edicion.nombre)
                    .includes(textoBuscado) ||
                normalizarBusqueda(edicion.descripcion)
                    .includes(textoBuscado);

            return coincideEstado && coincideBusqueda;
        }
    );

    function limpiarFiltros() {
        setBusqueda('');
        setFiltroEstado('TODAS');
    }


    /* ACTUALIZACION DEL LISTADO LOCAL */

    function actualizarListado(edicionActualizada) {
        setEdiciones(anteriores => {
            const restantes = anteriores.filter(
                edicion =>
                    edicion.id !== edicionActualizada.id
            );

            return ordenarEdiciones([
                ...restantes,
                edicionActualizada
            ]);
        });
    }


    /* NUEVA EDICION */

    function abrirNuevaEdicion() {
        if (accionesBloqueadas || !torneoActivo) {
            return;
        }

        setMensaje('');
        setErrorOperacion('');

        setFormulario({
            id: null,
            nombre: '',
            descripcion: '',
            fecha_inicio: '',
            fecha_finalizacion: ''
        });
    }


    /* EDITAR EDICION */

    function abrirEdicion(edicion) {
        if (accionesBloqueadas) {
            return;
        }

        setMensaje('');
        setErrorOperacion('');

        setFormulario({
            id: edicion.id,
            nombre: edicion.nombre,
            descripcion: edicion.descripcion ?? '',
            fecha_inicio: edicion.fecha_inicio ?? '',
            fecha_finalizacion:
                edicion.fecha_finalizacion ?? ''
        });
    }

    function actualizarCampo(campo, valor) {
        setFormulario(anterior => ({
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


    /* GUARDAR EDICION */

    async function guardarEdicion(evento) {
        evento.preventDefault();

        if (!formulario || ocupado || errorCarga) {
            return;
        }

        const esNueva = formulario.id === null;

        if (esNueva && !torneoActivo) {
            return;
        }

        const nombre = normalizarNombre(
            formulario.nombre
        );

        const descripcion = formulario.descripcion
            .normalize('NFC')
            .trim();

        const fechaInicio =
            formulario.fecha_inicio || null;

        const fechaFinalizacion =
            formulario.fecha_finalizacion || null;

        setErrorOperacion('');
        setMensaje('');

        if (!nombre) {
            setErrorOperacion(
                'El nombre de la edición es obligatorio.'
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

        if (
            fechaInicio &&
            fechaFinalizacion &&
            fechaFinalizacion < fechaInicio
        ) {
            setErrorOperacion(
                'La fecha de finalización no puede ser anterior a la fecha de inicio.'
            );
            return;
        }

        const datos = {
            nombre,
            descripcion: descripcion || null,
            fecha_inicio: fechaInicio,
            fecha_finalizacion: fechaFinalizacion
        };

        setGuardando(true);

        try {
            const respuesta = esNueva
                ? await api.post(rutaBase, datos)
                : await api.put(
                    `${rutaBase}/${formulario.id}`,
                    datos
                );

            actualizarListado(respuesta.edicion);
            limpiarFiltros();
            setFormulario(null);

            setMensaje(
                respuesta.mensaje ||
                (
                    esNueva
                        ? 'Edición creada correctamente.'
                        : 'Edición actualizada correctamente.'
                )
            );

        } catch (error) {
            setErrorOperacion(
                obtenerMensajeError(
                    error,
                    'No se pudo guardar la edición.'
                )
            );

        } finally {
            setGuardando(false);
        }
    }


    /* CAMBIO DE ESTADO */

    async function cambiarEstado(edicion) {
        if (accionesBloqueadas) {
            return;
        }

        const accion = ACCIONES_ESTADO[edicion.estado];

        if (!accion) {
            return;
        }

        if (
            accion.siguiente === ESTADOS.EN_CURSO &&
            !torneoActivo
        ) {
            setErrorOperacion(
                'El torneo debe estar activo para iniciar o reabrir una edición.'
            );
            return;
        }

        const confirmacion =
            `¿Confirmás ${accion.verbo} la edición "${edicion.nombre}"?`;

        if (!window.confirm(confirmacion)) {
            return;
        }

        setGuardando(true);
        setErrorOperacion('');
        setMensaje('');

        try {
            const respuesta = await api.patch(
                `${rutaBase}/${edicion.id}/estado`,
                {
                    estado: accion.siguiente
                }
            );

            actualizarListado(respuesta.edicion);
            limpiarFiltros();

            setMensaje(
                respuesta.mensaje ||
                'Estado de la edición actualizado correctamente.'
            );

        } catch (error) {
            setErrorOperacion(
                obtenerMensajeError(
                    error,
                    'No se pudo cambiar el estado de la edición.'
                )
            );

        } finally {
            setGuardando(false);
        }
    }


    /* ELIMINAR EDICION */

    async function eliminarEdicion(edicion) {
        if (accionesBloqueadas) {
            return;
        }

        const confirmacion =
            `¿Eliminar definitivamente la edición "${edicion.nombre}"?\n\n` +
            'Esta operación no se puede deshacer.';

        if (!window.confirm(confirmacion)) {
            return;
        }

        setGuardando(true);
        setErrorOperacion('');
        setMensaje('');

        try {
            const respuesta = await api.delete(
                `${rutaBase}/${edicion.id}`
            );

            setEdiciones(anteriores =>
                anteriores.filter(
                    registro => registro.id !== edicion.id
                )
            );

            limpiarFiltros();

            setMensaje(
                respuesta.mensaje ||
                'Edición eliminada correctamente.'
            );

        } catch (error) {
            setErrorOperacion(
                obtenerMensajeError(
                    error,
                    'No se pudo eliminar la edición. Actualizá el listado antes de reintentar.'
                )
            );

        } finally {
            setGuardando(false);
        }
    }


    /* ==================================================
       INTERFAZ
       ================================================== */

    return (
        <div className="as-page ediciones-pagina">

            {/* NAVEGACION */}

            <nav
                className="ediciones-navegacion"
                aria-label="Ubicación actual"
            >
                <button
                    type="button"
                    className="as-button as-button-secondary"
                    onClick={volverATorneos}
                    disabled={guardando}
                >
                    <ArrowLeft aria-hidden="true" />
                    TORNEOS
                </button>

                {torneo && (
                    <span className="ediciones-torneo-actual">
                        <Trophy aria-hidden="true" />
                        {torneo.nombre}
                    </span>
                )}
            </nav>


            {/* CABECERA */}

            <header className="as-page-header">
                <div>
                    <h1>EDICIONES</h1>

                    <p>
                        Administración de las ediciones del torneo
                    </p>
                </div>

                <div className="ediciones-cabecera-acciones">
                    <button
                        type="button"
                        className="as-button as-button-secondary as-button-icon"
                        onClick={recargarEdiciones}
                        disabled={ocupado || Boolean(formulario)}
                        aria-label="Actualizar ediciones"
                        title="Actualizar ediciones"
                    >
                        {cargando
                            ? <span
                                className="as-spinner"
                                aria-hidden="true"
                            />
                            : <RefreshCw aria-hidden="true" />}
                    </button>

                    <button
                        type="button"
                        className="as-button as-button-primary"
                        onClick={abrirNuevaEdicion}
                        disabled={
                            accionesBloqueadas ||
                            !torneoActivo
                        }
                    >
                        <Plus aria-hidden="true" />
                        NUEVA EDICIÓN
                    </button>
                </div>
            </header>


            {/* IDENTIDAD DEL TORNEO */}

            {torneo && !errorCarga && (
                <section
                    className="as-panel ediciones-contexto"
                    aria-label="Torneo seleccionado"
                >
                    <div className="ediciones-contexto-identidad">
                        <div className="ediciones-icono">
                            <Trophy aria-hidden="true" />
                        </div>

                        <div>
                            <span className="as-stat-label">
                                TORNEO SELECCIONADO
                            </span>

                            <h2>{torneo.nombre}</h2>
                        </div>
                    </div>

                    <span
                        className={
                            torneoActivo
                                ? 'as-status as-status-active'
                                : 'as-status as-status-archived'
                        }
                    >
                        {torneo.estado}
                    </span>
                </section>
            )}


            {/* TORNEO ARCHIVADO */}

            {torneo && !torneoActivo && !errorCarga && (
                <div
                    className="as-alert as-alert-warning"
                    role="status"
                >
                    <CircleAlert aria-hidden="true" />

                    <span className="as-alert-content">
                        Este torneo está archivado.
                        Podés consultar, editar y finalizar
                        sus ediciones existentes, pero no
                        crear, iniciar ni reabrir ediciones.
                    </span>
                </div>
            )}


            {/* INDICADORES */}

            <section
                className="ediciones-indicadores"
                aria-label="Resumen de ediciones"
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
                    className="as-alert as-alert-success ediciones-alerta"
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
                    className="as-alert as-alert-danger ediciones-alerta"
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


            {/* FORMULARIO */}

            {formulario && (
                <section
                    className="as-panel ediciones-formulario-panel"
                    aria-labelledby="ediciones-formulario-titulo"
                >
                    <div className="ediciones-formulario-cabecera">
                        <div>
                            <h2 id="ediciones-formulario-titulo">
                                {formulario.id === null
                                    ? 'NUEVA EDICIÓN'
                                    : 'EDITAR EDICIÓN'}
                            </h2>

                            <p className="as-text-description">
                                {formulario.id === null
                                    ? 'Registrá una nueva edición del torneo.'
                                    : 'Modificá los datos de la edición.'}
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
                        onSubmit={guardarEdicion}
                        aria-busy={guardando}
                    >

                        {/* NOMBRE */}

                        <div className="as-field">
                            <label
                                className="as-label"
                                htmlFor="edicion-nombre"
                            >
                                Nombre de la edición{' '}

                                <span className="as-field-required">
                                    *
                                </span>
                            </label>

                            <input
                                id="edicion-nombre"
                                type="text"
                                className="as-input"
                                value={formulario.nombre}
                                onChange={evento =>
                                    actualizarCampo(
                                        'nombre',
                                        evento.target.value
                                    )
                                }
                                placeholder="Ej.: NOCTURNO 2027"
                                aria-describedby="edicion-nombre-contador"
                                aria-invalid={
                                    contarCaracteres(
                                        normalizarNombre(
                                            formulario.nombre
                                        )
                                    ) > LIMITE_NOMBRE
                                }
                                disabled={guardando}
                                required
                            />

                            <span
                                id="edicion-nombre-contador"
                                className={
                                    contarCaracteres(
                                        normalizarNombre(
                                            formulario.nombre
                                        )
                                    ) > LIMITE_NOMBRE
                                        ? 'as-field-counter as-text-danger'
                                        : 'as-field-counter'
                                }
                            >
                                {contarCaracteres(
                                    normalizarNombre(
                                        formulario.nombre
                                    )
                                )}
                                /{LIMITE_NOMBRE}
                            </span>
                        </div>


                        {/* DESCRIPCION */}

                        <div className="as-field">
                            <label
                                className="as-label"
                                htmlFor="edicion-descripcion"
                            >
                                Descripción (opcional)
                            </label>

                            <textarea
                                id="edicion-descripcion"
                                className="as-textarea"
                                value={formulario.descripcion}
                                onChange={evento =>
                                    actualizarCampo(
                                        'descripcion',
                                        evento.target.value
                                    )
                                }
                                placeholder="Descripción general de la edición..."
                                rows={4}
                                aria-describedby="edicion-descripcion-contador"
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
                                id="edicion-descripcion-contador"
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


                        {/* FECHAS OPCIONALES */}

                        <div className="ediciones-formulario-fechas">

                            <div className="as-field">
                                <label
                                    className="as-label"
                                    htmlFor="edicion-fecha-inicio"
                                >
                                    Fecha de inicio (opcional)
                                </label>

                                <input
                                    id="edicion-fecha-inicio"
                                    type="date"
                                    className="as-input"
                                    min="1000-01-01"
                                    max="9999-12-31"
                                    value={formulario.fecha_inicio}
                                    onChange={evento =>
                                        actualizarCampo(
                                            'fecha_inicio',
                                            evento.target.value
                                        )
                                    }
                                    disabled={guardando}
                                />

                                {formulario.fecha_inicio && (
                                    <button
                                        type="button"
                                        className="as-button as-button-ghost ediciones-quitar-fecha"
                                        onClick={() =>
                                            actualizarCampo(
                                                'fecha_inicio',
                                                ''
                                            )
                                        }
                                        disabled={guardando}
                                    >
                                        <X aria-hidden="true" />
                                        QUITAR FECHA
                                    </button>
                                )}
                            </div>

                            <div className="as-field">
                                <label
                                    className="as-label"
                                    htmlFor="edicion-fecha-finalizacion"
                                >
                                    Fecha de finalización (opcional)
                                </label>

                                <input
                                    id="edicion-fecha-finalizacion"
                                    type="date"
                                    className="as-input"
                                    min={
                                        formulario.fecha_inicio ||
                                        '1000-01-01'
                                    }
                                    max="9999-12-31"
                                    value={
                                        formulario.fecha_finalizacion
                                    }
                                    onChange={evento =>
                                        actualizarCampo(
                                            'fecha_finalizacion',
                                            evento.target.value
                                        )
                                    }
                                    disabled={guardando}
                                />

                                {formulario.fecha_finalizacion && (
                                    <button
                                        type="button"
                                        className="as-button as-button-ghost ediciones-quitar-fecha"
                                        onClick={() =>
                                            actualizarCampo(
                                                'fecha_finalizacion',
                                                ''
                                            )
                                        }
                                        disabled={guardando}
                                    >
                                        <X aria-hidden="true" />
                                        QUITAR FECHA
                                    </button>
                                )}
                            </div>

                        </div>

                        <p className="as-text-description">
                            Las fechas son informativas y pueden
                            modificarse posteriormente. El estado
                            de la edición se administra manualmente.
                        </p>


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


                        {/* ACCIONES DEL FORMULARIO */}

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
                                    ? <span
                                        className="as-spinner"
                                        aria-hidden="true"
                                    />
                                    : <Save aria-hidden="true" />}

                                {guardando
                                    ? 'GUARDANDO...'
                                    : formulario.id === null
                                        ? 'CREAR EDICIÓN'
                                        : 'GUARDAR CAMBIOS'}
                            </button>
                        </div>

                    </form>
                </section>
            )}


            {/* BUSQUEDA Y FILTROS */}

            <section
                className="as-toolbar ediciones-herramientas"
                aria-label="Búsqueda y filtros"
            >
                <div className="as-search">
                    <Search aria-hidden="true" />

                    <label
                        htmlFor="ediciones-busqueda"
                        className="as-sr-only"
                    >
                        Buscar edición
                    </label>

                    <input
                        id="ediciones-busqueda"
                        type="search"
                        className="as-input"
                        placeholder="Buscar edición..."
                        value={busqueda}
                        onChange={evento =>
                            setBusqueda(evento.target.value)
                        }
                        disabled={
                            cargando || Boolean(errorCarga)
                        }
                    />
                </div>

                <div
                    className="as-filters"
                    role="group"
                    aria-label="Filtrar por estado"
                >
                    {FILTROS.map(filtro => (
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

                    <h2>CARGANDO EDICIONES</h2>

                    <p>
                        Consultando las ediciones registradas.
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

                    <h2>NO SE PUDIERON CARGAR LAS EDICIONES</h2>

                    <p role="alert">{errorCarga}</p>

                    <button
                        type="button"
                        className="as-button as-button-secondary"
                        onClick={recargarEdiciones}
                    >
                        <RefreshCw aria-hidden="true" />
                        REINTENTAR
                    </button>
                </section>
            )}


            {/* ESTADO VACIO */}

            {!cargando &&
                !errorCarga &&
                totalEdiciones === 0 && (

                <section className="as-empty">
                    <CalendarDays
                        className="as-empty-icon"
                        aria-hidden="true"
                    />

                    <h2>TODAVÍA NO HAY EDICIONES</h2>

                    <p>
                        {torneoActivo
                            ? 'Creá la primera edición para comenzar a organizar la competición.'
                            : 'Este torneo está archivado y no tiene ediciones registradas.'}
                    </p>

                    {torneoActivo && !formulario && (
                        <button
                            type="button"
                            className="as-button as-button-primary"
                            onClick={abrirNuevaEdicion}
                            disabled={ocupado}
                        >
                            <Plus aria-hidden="true" />
                            CREAR PRIMERA EDICIÓN
                        </button>
                    )}
                </section>
            )}


            {/* BUSQUEDA SIN RESULTADOS */}

            {!cargando &&
                !errorCarga &&
                totalEdiciones > 0 &&
                edicionesFiltradas.length === 0 && (

                <section className="as-empty">
                    <Search
                        className="as-empty-icon"
                        aria-hidden="true"
                    />

                    <h2>SIN RESULTADOS</h2>

                    <p>
                        No hay ediciones que coincidan
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


            {/* LISTADO DE EDICIONES */}

            {!cargando &&
                !errorCarga &&
                edicionesFiltradas.length > 0 && (

                <section
                    className="ediciones-listado"
                    aria-label="Ediciones registradas"
                    aria-busy={guardando}
                >
                    <p
                        className="ediciones-resultados"
                        aria-live="polite"
                    >
                        {edicionesFiltradas.length}

                        {edicionesFiltradas.length === 1
                            ? ' edición encontrada'
                            : ' ediciones encontradas'}
                    </p>

                    <div className="ediciones-grid">

                        {edicionesFiltradas.map(edicion => {
                            const estadoVisual =
                                ESTADOS_VISUALES[edicion.estado];

                            const accion =
                                ACCIONES_ESTADO[edicion.estado];

                            const IconoAccion =
                                accion?.Icono;

                            const estadoBloqueado =
                                !torneoActivo &&
                                accion?.siguiente === ESTADOS.EN_CURSO;

                            return (
                                <article
                                    key={edicion.id}
                                    className={
                                        'as-card ediciones-tarjeta ' +
                                        (estadoVisual?.clase || '')
                                    }
                                >

                                    {/* IDENTIDAD */}

                                    <div className="ediciones-tarjeta-cabecera">
                                        <div className="ediciones-identidad">
                                            <div className="ediciones-icono">
                                                <CalendarDays aria-hidden="true" />
                                            </div>

                                            <h2>{edicion.nombre}</h2>
                                        </div>

                                        <span
                                            className={
                                                'as-status ediciones-estado ' +
                                                (estadoVisual?.clase || '')
                                            }
                                        >
                                            {estadoVisual?.etiqueta ||
                                                edicion.estado}
                                        </span>
                                    </div>


                                    {/* DESCRIPCION */}

                                    <p className="ediciones-descripcion">
                                        {edicion.descripcion ||
                                            'Sin descripción.'}
                                    </p>


                                    {/* FECHAS */}

                                    <div className="ediciones-fechas">
                                        <div>
                                            <span className="ediciones-fecha-etiqueta">
                                                <CalendarDays aria-hidden="true" />
                                                INICIO
                                            </span>

                                            <strong>
                                                {formatearFecha(
                                                    edicion.fecha_inicio
                                                )}
                                            </strong>
                                        </div>

                                        <div>
                                            <span className="ediciones-fecha-etiqueta">
                                                <Flag aria-hidden="true" />
                                                FINALIZACIÓN
                                            </span>

                                            <strong>
                                                {formatearFecha(
                                                    edicion.fecha_finalizacion
                                                )}
                                            </strong>
                                        </div>
                                    </div>


                                    {/* CATEGORIAS - HU-006 */}

                                    <CategoriasDeEdicion
                                        key={`${torneoId}:${edicion.id}`}
                                        ruta={`${rutaBase}/${edicion.id}/categorias`}
                                        nombre={edicion.nombre}
                                        bloqueado={accionesBloqueadas}
                                        onGestionar={() =>
                                            navigate(
                                                `${rutaBase}/${edicion.id}/categorias`
                                            )
                                        }
                                    />


                                    {/* ACCIONES */}

                                    <footer className="as-card-footer ediciones-tarjeta-acciones">

                                        <button
                                            type="button"
                                            className="as-button as-button-secondary"
                                            onClick={() =>
                                                abrirEdicion(edicion)
                                            }
                                            disabled={accionesBloqueadas}
                                            aria-label={
                                                `Editar ${edicion.nombre}`
                                            }
                                        >
                                            <Pencil aria-hidden="true" />
                                            EDITAR
                                        </button>

                                        {accion && IconoAccion && (
                                            <button
                                                type="button"
                                                className={`as-button ${accion.clase}`}
                                                onClick={() =>
                                                    cambiarEstado(edicion)
                                                }
                                                disabled={
                                                    accionesBloqueadas ||
                                                    estadoBloqueado
                                                }
                                                aria-label={
                                                    `${accion.etiqueta} ${edicion.nombre}`
                                                }
                                                title={
                                                    estadoBloqueado
                                                        ? 'Reactivá primero el torneo'
                                                        : accion.etiqueta
                                                }
                                            >
                                                <IconoAccion aria-hidden="true" />
                                                {accion.etiqueta}
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            className="as-button as-button-danger"
                                            onClick={() =>
                                                eliminarEdicion(edicion)
                                            }
                                            disabled={accionesBloqueadas}
                                            aria-label={
                                                `Eliminar ${edicion.nombre}`
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