
const edicionRepository =
    require('../repositories/edicion.repository');


/* CONSTANTES */

const ESTADOS = Object.freeze({
    PLANIFICADA: 'PLANIFICADA',
    EN_CURSO: 'EN_CURSO',
    FINALIZADA: 'FINALIZADA'
});

const LIMITES = Object.freeze({
    NOMBRE: 100,
    DESCRIPCION: 500,
    BUSQUEDA: 500,
    ID: 2147483647
});

const TRANSICIONES = Object.freeze({
    PLANIFICADA: Object.freeze([
        ESTADOS.EN_CURSO
    ]),

    EN_CURSO: Object.freeze([
        ESTADOS.FINALIZADA
    ]),

    FINALIZADA: Object.freeze([
        ESTADOS.EN_CURSO
    ])
});

const CAMPOS_EDICION = Object.freeze([
    'nombre',
    'descripcion',
    'fecha_inicio',
    'fecha_finalizacion'
]);


/* ERROR DE NEGOCIO */

class EdicionError extends Error {
    constructor(mensaje, status = 400) {
        super(mensaje);

        this.name = 'EdicionError';
        this.status = status;
    }
}


/* VALIDACION DE IDENTIFICADORES */

function validarId(valor, entidad) {
    const tipoValido =
        typeof valor === 'number' ||
        (
            typeof valor === 'string' &&
            /^\d+$/.test(valor)
        );

    if (!tipoValido) {
        throw new EdicionError(
            `El identificador de ${entidad} es inválido.`
        );
    }

    const id = Number(valor);

    if (
        !Number.isSafeInteger(id) ||
        id < 1 ||
        id > LIMITES.ID
    ) {
        throw new EdicionError(
            `El identificador de ${entidad} es inválido.`
        );
    }

    return id;
}


/* VALIDACION DE OBJETOS */

function validarObjeto(
    datos,
    camposPermitidos
) {
    if (
        datos === null ||
        typeof datos !== 'object' ||
        Array.isArray(datos)
    ) {
        throw new EdicionError(
            'Los datos enviados son inválidos.'
        );
    }

    const camposInvalidos = Object.keys(datos)
        .filter(
            (campo) =>
                !camposPermitidos.includes(campo)
        );

    if (camposInvalidos.length > 0) {
        throw new EdicionError(
            'Se enviaron campos no permitidos: ' +
            camposInvalidos.join(', ') +
            '.'
        );
    }
}


function tieneCampo(datos, campo) {
    return Object.prototype.hasOwnProperty.call(
        datos,
        campo
    );
}


/* NORMALIZACION DEL NOMBRE */

function normalizarNombre(valor) {
    if (typeof valor !== 'string') {
        throw new EdicionError(
            'El nombre de la edición es obligatorio.'
        );
    }

    const nombre = valor
        .normalize('NFC')
        .trim()
        .replace(/\s+/g, ' ');

    if (!nombre) {
        throw new EdicionError(
            'El nombre de la edición es obligatorio.'
        );
    }

    if (
        Array.from(nombre).length >
        LIMITES.NOMBRE
    ) {
        throw new EdicionError(
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
        throw new EdicionError(
            'La descripción debe ser un texto.'
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
        throw new EdicionError(
            `La descripción no puede superar los ${LIMITES.DESCRIPCION} caracteres.`
        );
    }

    return descripcion;
}


/* VALIDACION DE FECHAS */

function normalizarFecha(
    valor,
    nombreCampo
) {
    if (
        valor === undefined ||
        valor === null
    ) {
        return null;
    }

    if (typeof valor !== 'string') {
        throw new EdicionError(
            `La ${nombreCampo} es inválida.`
        );
    }

    const fecha = valor.trim();

    if (!fecha) {
        return null;
    }

    const coincidencia = fecha.match(
        /^(\d{4})-(\d{2})-(\d{2})$/
    );

    if (!coincidencia) {
        throw new EdicionError(
            `La ${nombreCampo} debe tener el formato YYYY-MM-DD.`
        );
    }

    const anio = Number(coincidencia[1]);
    const mes = Number(coincidencia[2]);
    const dia = Number(coincidencia[3]);

    if (
        anio < 1000 ||
        anio > 9999 ||
        mes < 1 ||
        mes > 12 ||
        dia < 1 ||
        dia > 31
    ) {
        throw new EdicionError(
            `La ${nombreCampo} es inválida.`
        );
    }

    const fechaValidacion = new Date(
        Date.UTC(
            anio,
            mes - 1,
            dia
        )
    );

    const fechaValida =
        fechaValidacion.getUTCFullYear() === anio &&
        fechaValidacion.getUTCMonth() === mes - 1 &&
        fechaValidacion.getUTCDate() === dia;

    if (!fechaValida) {
        throw new EdicionError(
            `La ${nombreCampo} no corresponde a una fecha existente.`
        );
    }

    return fecha;
}


function validarCoherenciaFechas(
    fechaInicio,
    fechaFinalizacion
) {
    if (
        fechaInicio &&
        fechaFinalizacion &&
        fechaFinalizacion < fechaInicio
    ) {
        throw new EdicionError(
            'La fecha de finalización no puede ser anterior a la fecha de inicio.'
        );
    }
}


/* NORMALIZACION DEL ESTADO */

function normalizarEstado(valor) {
    if (typeof valor !== 'string') {
        throw new EdicionError(
            'El estado de la edición es inválido.'
        );
    }

    const estado = valor
        .trim()
        .toUpperCase();

    if (
        !Object.values(ESTADOS).includes(estado)
    ) {
        throw new EdicionError(
            'El estado de la edición es inválido.'
        );
    }

    return estado;
}


/* NORMALIZACION DE FILTROS */

function normalizarFiltros(filtros = {}) {
    validarObjeto(
        filtros,
        [
            'busqueda',
            'estado'
        ]
    );

    const filtrosNormalizados = {};

    if (
        filtros.busqueda !== undefined &&
        filtros.busqueda !== null
    ) {
        if (
            typeof filtros.busqueda !== 'string'
        ) {
            throw new EdicionError(
                'El término de búsqueda es inválido.'
            );
        }

        const busqueda = filtros.busqueda
            .normalize('NFC')
            .trim()
            .replace(/\s+/g, ' ');

        if (
            Array.from(busqueda).length >
            LIMITES.BUSQUEDA
        ) {
            throw new EdicionError(
                `La búsqueda no puede superar los ${LIMITES.BUSQUEDA} caracteres.`
            );
        }

        if (busqueda) {
            filtrosNormalizados.busqueda = busqueda;
        }
    }

    if (
        filtros.estado !== undefined &&
        filtros.estado !== null &&
        filtros.estado !== ''
    ) {
        filtrosNormalizados.estado =
            normalizarEstado(filtros.estado);
    }

    return filtrosNormalizados;
}


/* VALIDACION DE DATOS DE CREACION */

function normalizarDatosCreacion(datos) {
    validarObjeto(
        datos,
        CAMPOS_EDICION
    );

    const datosNormalizados = {
        nombre: normalizarNombre(
            datos.nombre
        ),

        descripcion: normalizarDescripcion(
            datos.descripcion
        ),

        fecha_inicio: normalizarFecha(
            datos.fecha_inicio,
            'fecha de inicio'
        ),

        fecha_finalizacion: normalizarFecha(
            datos.fecha_finalizacion,
            'fecha de finalización'
        )
    };

    validarCoherenciaFechas(
        datosNormalizados.fecha_inicio,
        datosNormalizados.fecha_finalizacion
    );

    return datosNormalizados;
}


/* VALIDACION DE DATOS DE ACTUALIZACION */

function normalizarDatosActualizacion(
    datos,
    edicionActual
) {
    validarObjeto(
        datos,
        CAMPOS_EDICION
    );

    const datosNormalizados = {
        nombre: tieneCampo(datos, 'nombre')
            ? normalizarNombre(datos.nombre)
            : edicionActual.nombre,

        descripcion: tieneCampo(
            datos,
            'descripcion'
        )
            ? normalizarDescripcion(
                datos.descripcion
            )
            : edicionActual.descripcion,

        fecha_inicio: tieneCampo(
            datos,
            'fecha_inicio'
        )
            ? normalizarFecha(
                datos.fecha_inicio,
                'fecha de inicio'
            )
            : edicionActual.fecha_inicio,

        fecha_finalizacion: tieneCampo(
            datos,
            'fecha_finalizacion'
        )
            ? normalizarFecha(
                datos.fecha_finalizacion,
                'fecha de finalización'
            )
            : edicionActual.fecha_finalizacion
    };

    validarCoherenciaFechas(
        datosNormalizados.fecha_inicio,
        datosNormalizados.fecha_finalizacion
    );

    return datosNormalizados;
}


/* VALIDACIONES DE ENTIDADES */

function verificarExistenciaTorneo(torneo) {
    if (!torneo) {
        throw new EdicionError(
            'El torneo solicitado no existe.',
            404
        );
    }

    return torneo;
}


function verificarExistenciaEdicion(edicion) {
    if (!edicion) {
        throw new EdicionError(
            'La edición solicitada no existe en este torneo.',
            404
        );
    }

    return edicion;
}


function verificarTorneoActivo(
    torneo,
    operacion
) {
    if (torneo.estado !== 'ACTIVO') {
        throw new EdicionError(
            `No se puede ${operacion} una edición de un torneo archivado.`,
            409
        );
    }
}


/* VALIDACION DE TRANSICIONES */

function verificarTransicion(
    estadoActual,
    estadoNuevo
) {
    if (estadoActual === estadoNuevo) {
        return;
    }

    const permitidas =
        TRANSICIONES[estadoActual] || [];

    if (!permitidas.includes(estadoNuevo)) {
        throw new EdicionError(
            `No se puede cambiar una edición de ${estadoActual} a ${estadoNuevo}.`,
            409
        );
    }
}


/* ERRORES DE PERSISTENCIA */

function procesarErrorPersistencia(error) {
    if (error instanceof EdicionError) {
        throw error;
    }

    switch (error?.code) {
        case 'ER_DUP_ENTRY':
            throw new EdicionError(
                'Ya existe una edición con ese nombre dentro de este torneo.',
                409
            );

        case 'ER_ROW_IS_REFERENCED':
        case 'ER_ROW_IS_REFERENCED_2':
            throw new EdicionError(
                'No se puede eliminar la edición porque tiene información asociada.',
                409
            );

        case 'ER_NO_REFERENCED_ROW':
        case 'ER_NO_REFERENCED_ROW_2':
            throw new EdicionError(
                'El torneo asociado no se encuentra disponible.',
                409
            );

        case 'ER_CHECK_CONSTRAINT_VIOLATED':
            throw new EdicionError(
                'Los datos de la edición incumplen una restricción de integridad.',
                400
            );

        case 'ER_LOCK_DEADLOCK':
        case 'ER_LOCK_WAIT_TIMEOUT':
            throw new EdicionError(
                'La operación no pudo completarse porque existe otra modificación en curso. Intentá nuevamente.',
                409
            );

        default:
            throw error;
    }
}


/* OPERACIONES TRANSACCIONALES */

async function operarEnTorneo(
    torneoId,
    operacion
) {
    try {
        return await edicionRepository.conTransaccion(
            async (conexion) => {
                const torneo =
                    verificarExistenciaTorneo(
                        await edicionRepository.bloquearTorneo(
                            torneoId,
                            conexion
                        )
                    );

                return await operacion(
                    torneo,
                    conexion
                );
            }
        );

    } catch (error) {
        procesarErrorPersistencia(error);
    }
}


/* LISTADO DE EDICIONES */

async function listarEdiciones(
    torneoId,
    filtros = {}
) {
    const idTorneo = validarId(
        torneoId,
        'torneo'
    );

    const filtrosNormalizados =
        normalizarFiltros(filtros);

    return await edicionRepository.conTransaccion(
        async (conexion) => {
            const torneo =
                verificarExistenciaTorneo(
                    await edicionRepository.obtenerTorneo(
                        idTorneo,
                        conexion
                    )
                );

            const ediciones =
                await edicionRepository.listar(
                    idTorneo,
                    filtrosNormalizados,
                    conexion
                );

            const indicadores =
                await edicionRepository.obtenerIndicadores(
                    idTorneo,
                    conexion
                );

            return {
                torneo,
                ediciones,
                total: ediciones.length,
                indicadores
            };
        }
    );
}


/* CONSULTA INDIVIDUAL */

async function obtenerEdicion(
    torneoId,
    edicionId
) {
    const idTorneo = validarId(
        torneoId,
        'torneo'
    );

    const idEdicion = validarId(
        edicionId,
        'edición'
    );

    const torneo =
        await edicionRepository.obtenerTorneo(
            idTorneo
        );

    verificarExistenciaTorneo(torneo);

    const edicion =
        await edicionRepository.obtenerPorId(
            idTorneo,
            idEdicion
        );

    return verificarExistenciaEdicion(
        edicion
    );
}


/* CREACION DE EDICIONES */

async function crearEdicion(
    torneoId,
    datos
) {
    const idTorneo = validarId(
        torneoId,
        'torneo'
    );

    const datosNormalizados =
        normalizarDatosCreacion(datos);

    return await operarEnTorneo(
        idTorneo,

        async (torneo, conexion) => {
            verificarTorneoActivo(
                torneo,
                'crear'
            );

            const idEdicion =
                await edicionRepository.crear(
                    idTorneo,
                    datosNormalizados,
                    conexion
                );

            const edicion =
                await edicionRepository.obtenerPorId(
                    idTorneo,
                    idEdicion,
                    conexion
                );

            return verificarExistenciaEdicion(
                edicion
            );
        }
    );
}


/* ACTUALIZACION DE EDICIONES */

async function actualizarEdicion(
    torneoId,
    edicionId,
    datos
) {
    const idTorneo = validarId(
        torneoId,
        'torneo'
    );

    const idEdicion = validarId(
        edicionId,
        'edición'
    );

    validarObjeto(
        datos,
        CAMPOS_EDICION
    );

    return await operarEnTorneo(
        idTorneo,

        async (torneo, conexion) => {
            const edicionActual =
                verificarExistenciaEdicion(
                    await edicionRepository.obtenerPorId(
                        idTorneo,
                        idEdicion,
                        conexion
                    )
                );

            const datosNormalizados =
                normalizarDatosActualizacion(
                    datos,
                    edicionActual
                );

            const existenCambios =
                CAMPOS_EDICION.some(
                    (campo) =>
                        datosNormalizados[campo] !==
                        edicionActual[campo]
                );

            if (!existenCambios) {
                return edicionActual;
            }

            await edicionRepository.actualizar(
                idTorneo,
                idEdicion,
                datosNormalizados,
                conexion
            );

            const edicionActualizada =
                await edicionRepository.obtenerPorId(
                    idTorneo,
                    idEdicion,
                    conexion
                );

            return verificarExistenciaEdicion(
                edicionActualizada
            );
        }
    );
}


/* CAMBIO DE ESTADO DE EDICIONES */

async function cambiarEstadoEdicion(
    torneoId,
    edicionId,
    datos
) {
    const idTorneo = validarId(
        torneoId,
        'torneo'
    );

    const idEdicion = validarId(
        edicionId,
        'edición'
    );

    validarObjeto(
        datos,
        ['estado']
    );

    const estadoNuevo =
        normalizarEstado(datos.estado);

    return await operarEnTorneo(
        idTorneo,

        async (torneo, conexion) => {
            const edicionActual =
                verificarExistenciaEdicion(
                    await edicionRepository.obtenerPorId(
                        idTorneo,
                        idEdicion,
                        conexion
                    )
                );

            const estadoActual =
                edicionActual.estado;

            if (estadoActual === estadoNuevo) {
                return edicionActual;
            }

            verificarTransicion(
                estadoActual,
                estadoNuevo
            );

            if (estadoNuevo === ESTADOS.EN_CURSO) {
                const operacion =
                    estadoActual === ESTADOS.FINALIZADA
                        ? 'reabrir'
                        : 'iniciar';

                verificarTorneoActivo(
                    torneo,
                    operacion
                );
            }

            await edicionRepository.cambiarEstado(
                idTorneo,
                idEdicion,
                estadoNuevo,
                conexion
            );

            const edicionActualizada =
                await edicionRepository.obtenerPorId(
                    idTorneo,
                    idEdicion,
                    conexion
                );

            return verificarExistenciaEdicion(
                edicionActualizada
            );
        }
    );
}


/* ELIMINACION DEFINITIVA */

async function eliminarEdicion(
    torneoId,
    edicionId
) {
    const idTorneo = validarId(
        torneoId,
        'torneo'
    );

    const idEdicion = validarId(
        edicionId,
        'edición'
    );

    return await operarEnTorneo(
        idTorneo,

        async (torneo, conexion) => {
            const filasAfectadas =
                await edicionRepository.eliminar(
                    idTorneo,
                    idEdicion,
                    conexion
                );

            if (filasAfectadas === 0) {
                throw new EdicionError(
                    'La edición solicitada no existe en este torneo.',
                    404
                );
            }

            return {
                id: idEdicion,
                torneo_id: idTorneo
            };
        }
    );
}


/* EXPORTACIONES */

module.exports = {
    EdicionError,
    ESTADOS,
    listarEdiciones,
    obtenerEdicion,
    crearEdicion,
    actualizarEdicion,
    cambiarEstadoEdicion,
    eliminarEdicion
};
