const torneoRepository =
    require('../repositories/torneo.repository');

/* CONSTANTES */

const ESTADOS_TORNEO = Object.freeze({
    ACTIVO: 'ACTIVO',
    ARCHIVADO: 'ARCHIVADO'
});

const LIMITES = Object.freeze({
    NOMBRE: 100,
    DESCRIPCION: 500,
    BUSQUEDA: 500,
    ID: 2147483647
});

/* ERROR DE NEGOCIO */

class TorneoError extends Error {
    constructor(mensaje, status = 400) {
        super(mensaje);

        this.name = 'TorneoError';
        this.status = status;
    }
}

/* VALIDACION DE OBJETOS */

function validarObjeto(datos) {
    if (
        !datos ||
        typeof datos !== 'object' ||
        Array.isArray(datos)
    ) {
        throw new TorneoError(
            'Los datos enviados no son válidos.'
        );
    }
}

/* VALIDACION DE IDENTIFICADORES */

function validarId(valor) {
    let id;

    if (typeof valor === 'number') {
        id = valor;
    } else if (
        typeof valor === 'string' &&
        /^\d+$/.test(valor)
    ) {
        id = Number(valor);
    } else {
        throw new TorneoError(
            'El identificador del torneo no es válido.'
        );
    }

    if (
        !Number.isSafeInteger(id) ||
        id < 1 ||
        id > LIMITES.ID
    ) {
        throw new TorneoError(
            'El identificador del torneo no es válido.'
        );
    }

    return id;
}

/* NORMALIZACION DEL NOMBRE */

function normalizarNombre(valor) {
    if (typeof valor !== 'string') {
        throw new TorneoError(
            'El nombre del torneo es obligatorio.'
        );
    }

    const nombre = valor
        .normalize('NFC')
        .trim()
        .replace(/\s+/g, ' ');

    if (!nombre) {
        throw new TorneoError(
            'El nombre del torneo es obligatorio.'
        );
    }

    if (
        Array.from(nombre).length >
        LIMITES.NOMBRE
    ) {
        throw new TorneoError(
            `El nombre no puede superar los ${LIMITES.NOMBRE} caracteres.`
        );
    }

    return nombre;
}

/* NORMALIZACION DE LA DESCRIPCION */

function normalizarDescripcion(valor) {
    if (
        valor === undefined ||
        valor === null
    ) {
        return null;
    }

    if (typeof valor !== 'string') {
        throw new TorneoError(
            'La descripción del torneo no es válida.'
        );
    }

    const descripcion = valor
        .normalize('NFC')
        .trim();

    if (!descripcion) {
        return null;
    }

    if (
        Array.from(descripcion).length >
        LIMITES.DESCRIPCION
    ) {
        throw new TorneoError(
            `La descripción no puede superar los ${LIMITES.DESCRIPCION} caracteres.`
        );
    }

    return descripcion;
}

/* VALIDACION DE ESTADOS */

function validarEstado(valor) {
    if (typeof valor !== 'string') {
        throw new TorneoError(
            'El estado del torneo no es válido.'
        );
    }

    const estado = valor
        .trim()
        .toUpperCase();

    if (
        !Object.values(ESTADOS_TORNEO)
            .includes(estado)
    ) {
        throw new TorneoError(
            'El estado debe ser ACTIVO o ARCHIVADO.'
        );
    }

    return estado;
}

/* VALIDACION DE DATOS DEL TORNEO */

function validarDatosTorneo(datos) {
    validarObjeto(datos);

    const camposPermitidos = [
        'nombre',
        'descripcion'
    ];

    const camposInvalidos = Object.keys(datos)
        .filter(
            (campo) =>
                !camposPermitidos.includes(campo)
        );

    if (camposInvalidos.length > 0) {
        throw new TorneoError(
            'Se enviaron campos no permitidos.'
        );
    }

    return {
        nombre: normalizarNombre(datos.nombre),

        descripcion: normalizarDescripcion(
            datos.descripcion
        )
    };
}

/* VALIDACION DE FILTROS */

function validarFiltros(filtros = {}) {
    validarObjeto(filtros);

    const camposPermitidos = [
        'busqueda',
        'estado'
    ];

    const camposInvalidos = Object.keys(filtros)
        .filter(
            (campo) =>
                !camposPermitidos.includes(campo)
        );

    if (camposInvalidos.length > 0) {
        throw new TorneoError(
            'Se enviaron filtros no permitidos.'
        );
    }

    let busqueda = '';
    let estado = null;

    if (filtros.busqueda !== undefined) {
        if (
            typeof filtros.busqueda !== 'string'
        ) {
            throw new TorneoError(
                'El término de búsqueda no es válido.'
            );
        }

        busqueda = filtros.busqueda
            .normalize('NFC')
            .trim()
            .replace(/\s+/g, ' ');

        if (
            Array.from(busqueda).length >
            LIMITES.BUSQUEDA
        ) {
            throw new TorneoError(
                'El término de búsqueda es demasiado largo.'
            );
        }
    }

    if (
        filtros.estado !== undefined &&
        filtros.estado !== null &&
        filtros.estado !== ''
    ) {
        estado = validarEstado(
            filtros.estado
        );
    }

    return {
        busqueda,
        estado
    };
}

/* CONTROL DE ERRORES DE PERSISTENCIA */

function procesarErrorPersistencia(error) {
    if (error?.code === 'ER_DUP_ENTRY') {
        throw new TorneoError(
            'Ya existe un torneo con ese nombre.',
            409
        );
    }

    throw error;
}

/* LISTAR TORNEOS */

async function listarTorneos(filtros = {}) {
    const filtrosValidados =
        validarFiltros(filtros);

    return torneoRepository.listar(
        filtrosValidados
    );
}

/* OBTENER TORNEO */

async function obtenerTorneo(valorId) {
    const id = validarId(valorId);

    const torneo =
        await torneoRepository.buscarPorId(id);

    if (!torneo) {
        throw new TorneoError(
            'El torneo solicitado no existe.',
            404
        );
    }

    return torneo;
}

/* CREAR TORNEO */

async function crearTorneo(datos) {
    const datosValidados =
        validarDatosTorneo(datos);

    let id;

    try {
        id = await torneoRepository.crear(
            datosValidados
        );

    } catch (error) {
        procesarErrorPersistencia(error);
    }

    return obtenerTorneo(id);
}

/* EDITAR TORNEO */

async function actualizarTorneo(
    valorId,
    datos
) {
    const id = validarId(valorId);

    const datosValidados =
        validarDatosTorneo(datos);

    const torneo = await obtenerTorneo(id);

    const sinCambios =
        torneo.nombre === datosValidados.nombre &&
        torneo.descripcion ===
            datosValidados.descripcion;

    if (sinCambios) {
        return torneo;
    }

    try {
        await torneoRepository.actualizar(
            id,
            datosValidados
        );

    } catch (error) {
        procesarErrorPersistencia(error);
    }

    return obtenerTorneo(id);
}

/* ARCHIVAR O REACTIVAR TORNEO */

async function cambiarEstadoTorneo(
    valorId,
    datos
) {
    const id = validarId(valorId);

    validarObjeto(datos);

    const campos = Object.keys(datos);

    if (
        campos.length !== 1 ||
        campos[0] !== 'estado'
    ) {
        throw new TorneoError(
            'Debe enviarse únicamente el nuevo estado.'
        );
    }

    const estado = validarEstado(
        datos.estado
    );

    const torneo = await obtenerTorneo(id);

    if (torneo.estado === estado) {
        return torneo;
    }

    await torneoRepository.actualizarEstado(
        id,
        estado
    );

    return obtenerTorneo(id);
}

/* ELIMINAR TORNEO */

async function eliminarTorneo(valorId) {
    const id = validarId(valorId);

    let filasAfectadas;

    try {
        filasAfectadas = await torneoRepository.eliminar(id);

    } catch (error) {
        if (
            error?.code === 'ER_ROW_IS_REFERENCED_2' ||
            error?.code === 'ER_ROW_IS_REFERENCED'
        ) {
            throw new TorneoError(
                'No se puede eliminar el torneo porque tiene registros asociados. Podés archivarlo.',
                409
            );
        }

        throw error;
    }

    if (filasAfectadas === 0) {
        throw new TorneoError(
            'El torneo solicitado no existe.',
            404
        );
    }
}

/* EXPORTACIONES */

module.exports = {
    TorneoError,
    ESTADOS_TORNEO,
    validarId,
    validarEstado,
    validarDatosTorneo,
    validarFiltros,
    listarTorneos,
    obtenerTorneo,
    crearTorneo,
    actualizarTorneo,
    cambiarEstadoTorneo,
    eliminarTorneo
};
