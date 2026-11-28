import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
    ArrowLeft,
    Layers,
    Plus,
    Search,
    Pencil,
    Archive,
    ArchiveRestore,
    Trash2,
    CircleCheck,
    CircleAlert,
    RefreshCw,
    Save,
    X
} from 'lucide-react';

import { api, ApiError } from '../services/api';

import './Categorias.css';


/* CONSTANTES */

const ESTADOS = Object.freeze({
    ACTIVA: 'ACTIVA',
    ARCHIVADA: 'ARCHIVADA'
});

const FILTROS = [
    { valor: 'TODAS', etiqueta: 'TODAS' },
    { valor: 'ACTIVA', etiqueta: 'ACTIVAS' },
    { valor: 'ARCHIVADA', etiqueta: 'ARCHIVADAS' }
];

const LIMITE_NOMBRE = 100;
const LIMITE_DESCRIPCION = 500;


/* FUNCIONES AUXILIARES */

function contarCaracteres(valor) {
    return Array.from(valor).length;
}

function normalizarNombre(valor) {
    return valor
        .normalize('NFC')
        .trim()
        .replace(/\s+/gu, ' ');
}

function normalizarBusqueda(valor) {
    return String(valor ?? '')
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .trim()
        .replace(/\s+/gu, ' ')
        .toLocaleLowerCase('es-AR');
}

function ordenarCategorias(categorias) {
    return [...categorias].sort((a, b) => {
        if (a.estado !== b.estado) {
            return a.estado === ESTADOS.ACTIVA ? -1 : 1;
        }

        return a.nombre.localeCompare(
            b.nombre,
            'es-AR',
            {
                sensitivity: 'base',
                numeric: true
            }
        ) || a.id - b.id;
    });
}

function obtenerMensajeError(error) {
    if (error instanceof ApiError) {
        return error.message;
    }

    return 'No se pudo completar la operación. Intentá nuevamente.';
}


/* COMPONENTE DE GESTION */

function GestionCategorias({ torneoId, edicionId }) {

    const navigate = useNavigate();

    const rutaEdiciones =
        `/torneos/${encodeURIComponent(torneoId)}/ediciones`;

    const rutaBase =
        `${rutaEdiciones}/${encodeURIComponent(edicionId)}/categorias`;

    const [contexto, setContexto] = useState(null);
    const [categorias, setCategorias] = useState([]);

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [revision, setRevision] = useState(0);

    const [busqueda, setBusqueda] = useState('');
    const [filtro, setFiltro] = useState('TODAS');

    const [formulario, setFormulario] = useState(null);

    const [mensaje, setMensaje] = useState('');
    const [errorCarga, setErrorCarga] = useState('');
    const [errorOperacion, setErrorOperacion] = useState('');
    const [errorFormulario, setErrorFormulario] = useState('');


    /* CARGA INICIAL */

    useEffect(() => {

        const controlador = new AbortController();

        async function cargarCategorias() {
            try {
                const datos = await api.get(
                    rutaBase,
                    {
                        signal: controlador.signal
                    }
                );

                if (controlador.signal.aborted) {
                    return;
                }

                setContexto({
                    torneo: datos.torneo,
                    edicion: datos.edicion
                });

                setCategorias(
                    ordenarCategorias(datos.categorias)
                );

                setErrorCarga('');

            } catch (error) {
                if (
                    controlador.signal.aborted ||
                    error.name === 'AbortError'
                ) {
                    return;
                }

                setErrorCarga(
                    obtenerMensajeError(error)
                );

            } finally {
                if (!controlador.signal.aborted) {
                    setCargando(false);
                }
            }
        }

        cargarCategorias();

        return () => controlador.abort();

    }, [rutaBase, revision]);


    /* CONTEXTO ADMINISTRATIVO */

    const torneoArchivado =
        contexto?.torneo.estado === 'ARCHIVADO';

    const edicionFinalizada =
        contexto?.edicion.estado === 'FINALIZADA';

    const contextoRestringido =
        torneoArchivado || edicionFinalizada;

    const contextoHabilitado =
        Boolean(contexto) &&
        contexto.torneo.estado === 'ACTIVO' &&
        ['PLANIFICADA', 'EN_CURSO'].includes(
            contexto.edicion.estado
        );

    const ocupado = cargando || guardando;

    let advertenciaContexto = '';

    if (torneoArchivado) {
        advertenciaContexto =
            'Este torneo está archivado. Podés consultar, editar, archivar y eliminar sus categorías sin dependencias, pero no crear ni reactivar categorías.';
    } else if (edicionFinalizada) {
        advertenciaContexto =
            'Esta edición está finalizada. Podés consultar, editar, archivar y eliminar sus categorías sin dependencias, pero no crear ni reactivar categorías.';
    }


    /* INDICADORES */

    const indicadores = [
        {
            etiqueta: 'TOTAL DE CATEGORÍAS',
            valor: categorias.length,
            Icono: Layers,
            clase: ''
        },
        {
            etiqueta: 'ACTIVAS',
            valor: categorias.filter(
                categoria => categoria.estado === ESTADOS.ACTIVA
            ).length,
            Icono: CircleCheck,
            clase: 'as-text-success'
        },
        {
            etiqueta: 'ARCHIVADAS',
            valor: categorias.filter(
                categoria => categoria.estado === ESTADOS.ARCHIVADA
            ).length,
            Icono: Archive,
            clase: 'as-text-muted'
        }
    ];


    /* BUSQUEDA Y FILTROS */

    const textoBusqueda = normalizarBusqueda(busqueda);

    const categoriasFiltradas = categorias.filter(categoria => {

        const coincideEstado =
            filtro === 'TODAS' ||
            categoria.estado === filtro;

        const coincideBusqueda =
            !textoBusqueda ||
            normalizarBusqueda(categoria.nombre)
                .includes(textoBusqueda) ||
            normalizarBusqueda(categoria.descripcion)
                .includes(textoBusqueda);

        return coincideEstado && coincideBusqueda;
    });

    function limpiarFiltros() {
        setBusqueda('');
        setFiltro('TODAS');
    }


    /* NAVEGACION */

    function volverEdiciones() {
        if (guardando) {
            return;
        }

        if (
            formulario &&
            !window.confirm(
                '¿Volver a ediciones? Los cambios no guardados se perderán.'
            )
        ) {
            return;
        }

        navigate(rutaEdiciones);
    }


    /* MENSAJES */

    function limpiarMensajes() {
        setMensaje('');
        setErrorOperacion('');
        setErrorFormulario('');
    }


    /* ACTUALIZACION DEL LISTADO */

    function actualizarListado(categoria) {

        setCategorias(anteriores => {

            const existe = anteriores.some(
                registro => registro.id === categoria.id
            );

            const resultado = existe
                ? anteriores.map(registro =>
                    registro.id === categoria.id
                        ? categoria
                        : registro
                )
                : [...anteriores, categoria];

            return ordenarCategorias(resultado);
        });
    }

    function recargarCategorias() {
        if (ocupado || formulario) {
            return;
        }

        limpiarMensajes();

        setErrorCarga('');
        setCargando(true);

        setRevision(anterior => anterior + 1);
    }


    /* FORMULARIO DE CREACION */

    function abrirNuevaCategoria() {

        if (
            ocupado ||
            formulario ||
            errorCarga ||
            !contextoHabilitado
        ) {
            return;
        }

        limpiarMensajes();

        setFormulario({
            id: null,
            nombre: '',
            descripcion: ''
        });
    }


    /* FORMULARIO DE EDICION */

    function abrirEdicion(categoria) {

        if (ocupado || formulario || errorCarga) {
            return;
        }

        limpiarMensajes();

        setFormulario({
            id: categoria.id,
            nombre: categoria.nombre,
            descripcion: categoria.descripcion ?? ''
        });
    }

    function cancelarFormulario() {

        if (guardando) {
            return;
        }

        setFormulario(null);
        setErrorFormulario('');
    }

    function modificarCampo(campo, valor) {

        setFormulario(anterior => ({
            ...anterior,
            [campo]: valor
        }));

        setErrorFormulario('');
    }


    /* GUARDAR CATEGORIA */

    async function guardarCategoria(evento) {

        evento.preventDefault();

        if (guardando || !formulario) {
            return;
        }

        setErrorFormulario('');
        setErrorOperacion('');
        setMensaje('');

        const nombre = normalizarNombre(
            formulario.nombre
        );

        const descripcion = formulario.descripcion
            .normalize('NFC')
            .trim();

        if (!nombre) {
            setErrorFormulario(
                'El nombre de la categoría es obligatorio.'
            );
            return;
        }

        if (contarCaracteres(nombre) > LIMITE_NOMBRE) {
            setErrorFormulario(
                `El nombre no puede superar los ${LIMITE_NOMBRE} caracteres.`
            );
            return;
        }

        if (
            contarCaracteres(descripcion) >
            LIMITE_DESCRIPCION
        ) {
            setErrorFormulario(
                `La descripción no puede superar los ${LIMITE_DESCRIPCION} caracteres.`
            );
            return;
        }

        const esNueva = formulario.id === null;

        if (esNueva && !contextoHabilitado) {
            setErrorFormulario(
                'El contexto actual no permite crear categorías.'
            );
            return;
        }

        const datos = {
            nombre,
            descripcion: descripcion || null
        };

        setGuardando(true);

        try {

            const respuesta = esNueva
                ? await api.post(rutaBase, datos)
                : await api.put(
                    `${rutaBase}/${formulario.id}`,
                    datos
                );

            actualizarListado(respuesta.categoria);

            limpiarFiltros();

            setFormulario(null);

            setMensaje(
                respuesta.mensaje ||
                'Categoría guardada correctamente.'
            );

        } catch (error) {

            setErrorFormulario(
                obtenerMensajeError(error)
            );

        } finally {

            setGuardando(false);

        }
    }


    /* ARCHIVAR Y REACTIVAR */

    async function cambiarEstado(categoria) {

        if (ocupado || formulario || errorCarga) {
            return;
        }

        const estaActiva =
            categoria.estado === ESTADOS.ACTIVA;

        const nuevoEstado = estaActiva
            ? ESTADOS.ARCHIVADA
            : ESTADOS.ACTIVA;

        if (!estaActiva && !contextoHabilitado) {
            return;
        }

        const accion = estaActiva
            ? 'archivar'
            : 'reactivar';

        const texto = estaActiva
            ? 'Sus datos permanecerán conservados.'
            : 'La categoría volverá a estar activa.';

        const confirmado = window.confirm(
            `¿Confirmás ${accion} la categoría "${categoria.nombre}"?\n\n${texto}`
        );

        if (!confirmado) {
            return;
        }

        limpiarMensajes();
        setGuardando(true);

        try {

            const respuesta = await api.patch(
                `${rutaBase}/${categoria.id}/estado`,
                {
                    estado: nuevoEstado
                }
            );

            actualizarListado(respuesta.categoria);

            limpiarFiltros();

            setMensaje(
                respuesta.mensaje ||
                'Estado actualizado correctamente.'
            );

        } catch (error) {

            setErrorOperacion(
                obtenerMensajeError(error)
            );

        } finally {

            setGuardando(false);

        }
    }


    /* ELIMINACION DEFINITIVA */

    async function eliminarCategoria(categoria) {

        if (ocupado || formulario || errorCarga) {
            return;
        }

        const confirmado = window.confirm(
            `¿Confirmás eliminar definitivamente la categoría "${categoria.nombre}"?\n\nEsta operación es irreversible.`
        );

        if (!confirmado) {
            return;
        }

        limpiarMensajes();
        setGuardando(true);

        try {

            const respuesta = await api.delete(
                `${rutaBase}/${categoria.id}`
            );

            setCategorias(anteriores =>
                anteriores.filter(
                    registro => registro.id !== categoria.id
                )
            );

            limpiarFiltros();

            setMensaje(
                respuesta.mensaje ||
                'Categoría eliminada correctamente.'
            );

        } catch (error) {

            setErrorOperacion(
                obtenerMensajeError(error)
            );

        } finally {

            setGuardando(false);

        }
    }


    /* PROTECCION DE CAMBIOS NO GUARDADOS */

    const formularioAbierto = Boolean(formulario);

    useEffect(() => {

        if (!formularioAbierto) {
            return undefined;
        }

        function advertirSalida(evento) {
            evento.preventDefault();
            evento.returnValue = '';
        }

        window.addEventListener(
            'beforeunload',
            advertirSalida
        );

        return () => {
            window.removeEventListener(
                'beforeunload',
                advertirSalida
            );
        };

    }, [formularioAbierto]);


    /* RENDERIZADO */

    return (

        <main className="categorias-pagina">

            {/* NAVEGACION */}

            <nav
                className="categorias-navegacion"
                aria-label="Contexto de categorías"
            >

                <button
                    type="button"
                    className="as-button as-button-secondary"
                    onClick={volverEdiciones}
                    disabled={guardando}
                >
                    <ArrowLeft aria-hidden="true" />
                    VOLVER A EDICIONES
                </button>

                {contexto && (
                    <span className="categorias-ruta">
                        TORNEOS / {contexto.torneo.nombre} /
                        {' '}{contexto.edicion.nombre} / CATEGORÍAS
                    </span>
                )}

            </nav>


            {/* CABECERA */}

            <header className="categorias-cabecera">

                <div>
                    <h1>CATEGORÍAS</h1>
                    <p>
                        Administración de categorías de la edición
                    </p>
                </div>

                <div className="categorias-cabecera-acciones">

                    <button
                        type="button"
                        className="as-button as-button-secondary as-button-icon"
                        onClick={recargarCategorias}
                        disabled={ocupado || formularioAbierto}
                        aria-label="Actualizar categorías"
                        title="Actualizar categorías"
                    >
                        {cargando
                            ? (
                                <span
                                    className="as-spinner"
                                    aria-hidden="true"
                                />
                            )
                            : <RefreshCw aria-hidden="true" />
                        }
                    </button>

                    <button
                        type="button"
                        className="as-button as-button-primary"
                        onClick={abrirNuevaCategoria}
                        disabled={
                            ocupado ||
                            formularioAbierto ||
                            Boolean(errorCarga) ||
                            !contextoHabilitado
                        }
                    >
                        <Plus aria-hidden="true" />
                        NUEVA CATEGORÍA
                    </button>

                </div>

            </header>


            {/* CONTEXTO ACTUAL */}

            {contexto && (

                <section className="categorias-contexto">

                    <div className="categorias-contexto-dato">

                        <span>TORNEO</span>

                        <strong>
                            {contexto.torneo.nombre}
                        </strong>

                        <span
                            className={
                                torneoArchivado
                                    ? 'as-status as-status-archived'
                                    : 'as-status as-status-active'
                            }
                        >
                            {contexto.torneo.estado}
                        </span>

                    </div>

                    <div className="categorias-contexto-dato">

                        <span>EDICIÓN</span>

                        <strong>
                            {contexto.edicion.nombre}
                        </strong>

                        <span
                            className={
                                `categorias-estado-edicion categorias-estado-${contexto.edicion.estado.toLowerCase()}`
                            }
                        >
                            {
                                contexto.edicion.estado
                                    .replaceAll('_', ' ')
                            }
                        </span>

                    </div>

                </section>
            )}


            {/* ADVERTENCIAS DEL CONTEXTO */}

            {contextoRestringido && (

                <div
                    className="as-alert as-alert-warning"
                    role="status"
                >
                    <CircleAlert aria-hidden="true" />

                    <span className="as-alert-content">
                        {advertenciaContexto}
                    </span>
                </div>
            )}


            {/* INDICADORES */}

            <section
                className="categorias-indicadores"
                aria-label="Resumen de categorías"
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


            {/* MENSAJE DE EXITO */}

            {mensaje && (

                <div
                    className="as-alert as-alert-success"
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


            {/* ERROR DE OPERACION */}

            {errorOperacion && (

                <div
                    className="as-alert as-alert-danger"
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
                        aria-label="Cerrar error"
                    >
                        <X aria-hidden="true" />
                    </button>

                </div>
            )}


            {/* FORMULARIO */}

            {formulario && (

                <section className="categorias-formulario-panel">

                    <header className="categorias-formulario-cabecera">

                        <div>
                            <h2>
                                {formulario.id === null
                                    ? 'NUEVA CATEGORÍA'
                                    : 'EDITAR CATEGORÍA'}
                            </h2>

                            <p>
                                Completá los datos de la categoría.
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

                    </header>

                    <form
                        className="categorias-formulario"
                        onSubmit={guardarCategoria}
                    >

                        <div className="categorias-campo">

                            <label htmlFor="categoria-nombre">
                                NOMBRE *
                            </label>

                            <input
                                id="categoria-nombre"
                                className="as-input"
                                type="text"
                                value={formulario.nombre}
                                onChange={evento =>
                                    modificarCampo(
                                        'nombre',
                                        evento.target.value
                                    )
                                }
                                placeholder="Ej.: LIBRE, SENIOR, FEMENINO"
                                disabled={guardando}
                                required
                            />

                            <span className="categorias-contador">
                                {
                                    contarCaracteres(
                                        formulario.nombre
                                    )
                                } / {LIMITE_NOMBRE}
                            </span>

                        </div>

                        <div className="categorias-campo">

                            <label htmlFor="categoria-descripcion">
                                DESCRIPCIÓN
                            </label>

                            <textarea
                                id="categoria-descripcion"
                                className="as-input"
                                value={formulario.descripcion}
                                onChange={evento =>
                                    modificarCampo(
                                        'descripcion',
                                        evento.target.value
                                    )
                                }
                                placeholder="Descripción opcional de la categoría"
                                rows={4}
                                disabled={guardando}
                            />

                            <span className="categorias-contador">
                                {
                                    contarCaracteres(
                                        formulario.descripcion
                                    )
                                } / {LIMITE_DESCRIPCION}
                            </span>

                        </div>

                        {formulario.id === null && (

                            <p className="categorias-ayuda">
                                La categoría se creará en estado ACTIVA.
                            </p>
                        )}

                        {errorFormulario && (

                            <div
                                className="as-alert as-alert-danger"
                                role="alert"
                            >
                                <CircleAlert aria-hidden="true" />

                                <span className="as-alert-content">
                                    {errorFormulario}
                                </span>
                            </div>
                        )}

                        <footer className="categorias-formulario-acciones">

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
                                    ? (
                                        <span
                                            className="as-spinner"
                                            aria-hidden="true"
                                        />
                                    )
                                    : <Save aria-hidden="true" />
                                }

                                {guardando
                                    ? 'GUARDANDO...'
                                    : 'GUARDAR CATEGORÍA'}
                            </button>

                        </footer>

                    </form>

                </section>
            )}


            {/* BUSCADOR Y FILTROS */}

            <section className="categorias-herramientas">

                <div className="categorias-buscador">

                    <Search aria-hidden="true" />

                    <input
                        type="search"
                        value={busqueda}
                        onChange={evento =>
                            setBusqueda(evento.target.value)
                        }
                        placeholder="Buscar categoría..."
                        aria-label="Buscar categoría"
                        disabled={
                            ocupado ||
                            formularioAbierto ||
                            Boolean(errorCarga)
                        }
                    />

                </div>

                <div
                    className="categorias-filtros"
                    aria-label="Filtrar categorías por estado"
                >

                    {FILTROS.map(({ valor, etiqueta }) => (

                        <button
                            key={valor}
                            type="button"
                            className={
                                filtro === valor
                                    ? 'categorias-filtro categorias-filtro-activo'
                                    : 'categorias-filtro'
                            }
                            aria-pressed={filtro === valor}
                            onClick={() => setFiltro(valor)}
                            disabled={
                                ocupado ||
                                formularioAbierto ||
                                Boolean(errorCarga)
                            }
                        >
                            {etiqueta}
                        </button>

                    ))}

                </div>

            </section>


            {/* ESTADO DE CARGA */}

            {cargando && (

                <section
                    className="categorias-estado-vacio"
                    role="status"
                >

                    <span
                        className="as-spinner"
                        aria-hidden="true"
                    />

                    <h2>CARGANDO CATEGORÍAS</h2>

                    <p>
                        Obteniendo información de la edición...
                    </p>

                </section>
            )}


            {/* ERROR DE CARGA */}

            {!cargando && errorCarga && (

                <section
                    className="categorias-estado-vacio"
                    role="alert"
                >

                    <CircleAlert aria-hidden="true" />

                    <h2>NO SE PUDIERON CARGAR LAS CATEGORÍAS</h2>

                    <p>{errorCarga}</p>

                    <button
                        type="button"
                        className="as-button as-button-secondary"
                        onClick={recargarCategorias}
                    >
                        <RefreshCw aria-hidden="true" />
                        REINTENTAR
                    </button>

                </section>
            )}


            {/* EDICION SIN CATEGORIAS */}

            {
                !cargando &&
                !errorCarga &&
                categorias.length === 0 && (

                    <section className="categorias-estado-vacio">

                        <Layers aria-hidden="true" />

                        <h2>NO HAY CATEGORÍAS REGISTRADAS</h2>

                        <p>
                            {contextoHabilitado
                                ? 'Creá la primera categoría de esta edición.'
                                : 'Esta edición no tiene categorías y su contexto actual no permite crearlas.'}
                        </p>

                        {contextoHabilitado && (

                            <button
                                type="button"
                                className="as-button as-button-primary"
                                onClick={abrirNuevaCategoria}
                                disabled={
                                    ocupado ||
                                    formularioAbierto
                                }
                            >
                                <Plus aria-hidden="true" />
                                NUEVA CATEGORÍA
                            </button>
                        )}

                    </section>
                )
            }


            {/* BUSQUEDA SIN RESULTADOS */}

            {
                !cargando &&
                !errorCarga &&
                categorias.length > 0 &&
                categoriasFiltradas.length === 0 && (

                    <section className="categorias-estado-vacio">

                        <Search aria-hidden="true" />

                        <h2>SIN RESULTADOS</h2>

                        <p>
                            No se encontraron categorías
                            que coincidan con los filtros.
                        </p>

                        <button
                            type="button"
                            className="as-button as-button-secondary"
                            onClick={limpiarFiltros}
                            disabled={
                                ocupado ||
                                formularioAbierto
                            }
                        >
                            LIMPIAR FILTROS
                        </button>

                    </section>
                )
            }


            {/* LISTADO DE CATEGORIAS */}

            {
                !cargando &&
                !errorCarga &&
                categoriasFiltradas.length > 0 && (

                    <section
                        className="categorias-listado"
                        aria-label="Categorías registradas"
                    >

                        <div className="categorias-resultados">

                            {categoriasFiltradas.length} de{' '}
                            {categorias.length}{' '}
                            {categorias.length === 1
                                ? 'categoría'
                                : 'categorías'}

                        </div>

                        <div className="categorias-grilla">

                            {categoriasFiltradas.map(categoria => {

                                const estaActiva =
                                    categoria.estado === ESTADOS.ACTIVA;

                                const deshabilitarAcciones =
                                    ocupado || formularioAbierto;

                                return (

                                    <article
                                        key={categoria.id}
                                        className={
                                            estaActiva
                                                ? 'categorias-tarjeta categorias-tarjeta-activa'
                                                : 'categorias-tarjeta categorias-tarjeta-archivada'
                                        }
                                    >

                                        <header className="categorias-tarjeta-cabecera">

                                            <div className="categorias-tarjeta-identidad">

                                                <div className="categorias-tarjeta-icono">
                                                    <Layers aria-hidden="true" />
                                                </div>

                                                <h2>
                                                    {categoria.nombre}
                                                </h2>

                                            </div>

                                            <span
                                                className={
                                                    estaActiva
                                                        ? 'as-status as-status-active'
                                                        : 'as-status as-status-archived'
                                                }
                                            >
                                                {estaActiva
                                                    ? <CircleCheck aria-hidden="true" />
                                                    : <Archive aria-hidden="true" />
                                                }

                                                {categoria.estado}

                                            </span>

                                        </header>

                                        <div className="categorias-tarjeta-descripcion">

                                            {categoria.descripcion ||
                                                'Sin descripción.'}

                                        </div>

                                        <footer className="categorias-tarjeta-acciones">

                                            <button
                                                type="button"
                                                className="as-button as-button-secondary"
                                                onClick={() =>
                                                    abrirEdicion(categoria)
                                                }
                                                disabled={deshabilitarAcciones}
                                            >
                                                <Pencil aria-hidden="true" />
                                                EDITAR
                                            </button>

                                            <button
                                                type="button"
                                                className={
                                                    estaActiva
                                                        ? 'as-button as-button-warning'
                                                        : 'as-button as-button-success'
                                                }
                                                onClick={() =>
                                                    cambiarEstado(categoria)
                                                }
                                                disabled={
                                                    deshabilitarAcciones ||
                                                    (
                                                        !estaActiva &&
                                                        !contextoHabilitado
                                                    )
                                                }
                                            >
                                                {estaActiva
                                                    ? <Archive aria-hidden="true" />
                                                    : <ArchiveRestore aria-hidden="true" />
                                                }

                                                {estaActiva
                                                    ? 'ARCHIVAR'
                                                    : 'REACTIVAR'}

                                            </button>

                                            <button
                                                type="button"
                                                className="as-button as-button-danger"
                                                onClick={() =>
                                                    eliminarCategoria(categoria)
                                                }
                                                disabled={deshabilitarAcciones}
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
                )
            }

        </main>
    );
}


/* COMPONENTE PRINCIPAL */

export default function Categorias() {

    const { torneoId, edicionId } = useParams();

    return (
        <GestionCategorias
            key={`${torneoId}:${edicionId}`}
            torneoId={torneoId}
            edicionId={edicionId}
        />
    );
}