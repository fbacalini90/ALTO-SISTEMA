'use strict';

const categoriaRepository = require('../repositories/categoria.repository');

/* CONSTANTES */

const ESTADOS = Object.freeze({
    ACTIVA: 'ACTIVA',
    ARCHIVADA: 'ARCHIVADA'
});

const LIMITES = Object.freeze({
    NOMBRE: 100,
    DESCRIPCION: 500,
    BUSQUEDA: 500,
    ID: 2147483647
});

/* ERROR DE NEGOCIO */

class CategoriaError extends Error {
    constructor(mensaje, status = 400) {
        super(mensaje);

        this.name = 'CategoriaError';
        this.status = status;
    }
}

/* VALIDACIONES GENERALES */

function validarId(valor, campo) {
    if (
        typeof valor !== 'number' &&
        typeof valor !== 'string'
    ) {
        throw new CategoriaError(
            `El identificador de ${campo} es inválido.`
        );
    }

    if (
        typeof valor === 'string' &&
        !/^\d+$/.test(valor)
    ) {
        throw new CategoriaError(
            `El identificador de ${campo} es inválido.`
        );
    }

    const id = Number(valor);

    if (
        !Number.isSafeInteger(id) ||
        id <= 0 ||
        id > LIMITES.ID
    ) {
        throw new CategoriaError(
            `El identificador de ${campo} es inválido.`
        );
    }

    return id;
}

function validarObjeto(datos, camposPermitidos) {
    if (
        datos === null ||
        typeof datos !== 'object' ||
        Array.isArray(datos)
    ) {
        throw new CategoriaError(
            'Los datos proporcionados son inválidos.'
        );
    }

    for (const campo of Object.keys(datos)) {
        if (!camposPermitidos.includes(campo)) {
            throw new CategoriaError(
                `El campo ${campo} no está permitido.`
            );
        }
    }
}

function longitudTexto(valor) {
    return Array.from(valor).length;
}

/* NORMALIZACION DE CAMPOS */

function normalizarNombre(valor) {
    if (typeof valor !== 'string') {
        throw new CategoriaError(
            'El nombre de la categoría es obligatorio.'
        );
    }

    const nombre = valor
        .normalize('NFC')
        .trim()
        .replace(/\s+/gu, ' ');

    if (!nombre) {
        throw new CategoriaError(
            'El nombre de la categoría es obligatorio.'
        );
    }

    if (longitudTexto(nombre) > LIMITES.NOMBRE) {
        throw new CategoriaError(
            `El nombre no puede superar los ${LIMITES.NOMBRE} caracteres.`
        );
    }

    return nombre;
}

function normalizarDescripcion(valor) {
    if (
        valor === undefined ||
        valor === null
    ) {
        return null;
    }

    if (typeof valor !== 'string') {
        throw new CategoriaError(
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
        longitudTexto(descripcion) >
        LIMITES.DESCRIPCION
    ) {
        throw new CategoriaError(
            `La descripción no puede superar los ${LIMITES.DESCRIPCION} caracteres.`
        );
    }

    return descripcion;
}

function normalizarEstado(valor) {
    if (typeof valor !== 'string') {
        throw new CategoriaError(
            'El estado de la categoría es inválido.'
        );
    }

    const estado = valor.trim().toUpperCase();

    if (!Object.values(ESTADOS).includes(estado)) {
        throw new CategoriaError(
            'El estado debe ser ACTIVA o ARCHIVADA.'
        );
    }

    return estado;
}

/* FILTROS */

function normalizarFiltros(filtros = {}) {
    validarObjeto(filtros, [
        'busqueda',
        'estado'
    ]);

    const resultado = {};

    if (filtros.busqueda !== undefined) {
        if (typeof filtros.busqueda !== 'string') {
            throw new CategoriaError(
                'La búsqueda debe ser un texto.'
            );
        }

        const busqueda = filtros.busqueda
            .normalize('NFC')
            .trim()
            .replace(/\s+/gu, ' ');

        if (
            longitudTexto(busqueda) >
            LIMITES.BUSQUEDA
        ) {
            throw new CategoriaError(
                `La búsqueda no puede superar los ${LIMITES.BUSQUEDA} caracteres.`
            );
        }

        if (busqueda) {
            resultado.busqueda = busqueda;
        }
    }

    if (filtros.estado !== undefined) {
        resultado.estado = normalizarEstado(
            filtros.estado
        );
    }

    return resultado;
}

/* DATOS DE CREACION */

function normalizarDatosCreacion(datos) {
    validarObjeto(datos, [
        'nombre',
        'descripcion'
    ]);

    return {
        nombre: normalizarNombre(datos.nombre),
        descripcion: normalizarDescripcion(
            datos.descripcion
        )
    };
}

/* DATOS DE ACTUALIZACION */

function normalizarDatosActualizacion(
    datos,
    categoriaActual
) {
    validarObjeto(datos, [
        'nombre',
        'descripcion'
    ]);

    return {
        nombre: Object.hasOwn(datos, 'nombre')
            ? normalizarNombre(datos.nombre)
            : categoriaActual.nombre,

        descripcion: Object.hasOwn(datos, 'descripcion')
            ? normalizarDescripcion(datos.descripcion)
            : categoriaActual.descripcion
    };
}

/* TRATAMIENTO DE ERRORES DE PERSISTENCIA */

function procesarErrorPersistencia(error) {
    if (error instanceof CategoriaError) {
        throw error;
    }

    switch (error.code) {
        case 'ER_DUP_ENTRY':
            throw new CategoriaError(
                'Ya existe una categoría con ese nombre en esta edición.',
                409
            );

        case 'ER_ROW_IS_REFERENCED':
        case 'ER_ROW_IS_REFERENCED_2':
            throw new CategoriaError(
                'No se puede eliminar la categoría porque tiene registros asociados. Podés archivarla.',
                409
            );

        case 'ER_NO_REFERENCED_ROW':
        case 'ER_NO_REFERENCED_ROW_2':
            throw new CategoriaError(
                'El contexto de la categoría ya no se encuentra disponible.',
                409
            );

        case 'ER_LOCK_DEADLOCK':
        case 'ER_LOCK_WAIT_TIMEOUT':
            throw new CategoriaError(
                'La operación entró en conflicto con otra modificación. Intentá nuevamente.',
                409
            );

        default:
            throw error;
    }
}

/* VALIDACION DEL CONTEXTO JERARQUICO */

async function obtenerContexto(
    torneoId,
    edicionId,
    conexion
) {
    const contexto =
        await categoriaRepository.obtenerContexto(
            torneoId,
            edicionId,
            conexion
        );

    if (!contexto) {
        throw new CategoriaError(
            'La edición no existe o no pertenece al torneo indicado.',
            404
        );
    }

    return contexto;
}

async function bloquearContexto(
    torneoId,
    edicionId,
    conexion
) {
    const contexto =
        await categoriaRepository.bloquearContexto(
            torneoId,
            edicionId,
            conexion
        );

    if (!contexto) {
        throw new CategoriaError(
            'La edición no existe o no pertenece al torneo indicado.',
            404
        );
    }

    return contexto;
}

function validarContextoHabilitado(
    contexto,
    accion
) {
    if (contexto.torneo_estado !== 'ACTIVO') {
        throw new CategoriaError(
            `No se puede ${accion} una categoría de un torneo archivado.`,
            409
        );
    }

    if (
        !['PLANIFICADA', 'EN_CURSO'].includes(
            contexto.edicion_estado
        )
    ) {
        throw new CategoriaError(
            `No se puede ${accion} una categoría de una edición finalizada.`,
            409
        );
    }
}

/* VALIDACION DE EXISTENCIA */

async function buscarCategoria(
    edicionId,
    categoriaId,
    conexion
) {
    const categoria =
        await categoriaRepository.obtenerPorId(
            edicionId,
            categoriaId,
            conexion
        );

    if (!categoria) {
        throw new CategoriaError(
            'La categoría no existe en la edición indicada.',
            404
        );
    }

    return categoria;
}

/* OPERACIONES TRANSACCIONALES */

async function operarEnContexto(
    torneoId,
    edicionId,
    operacion,
    escritura = false
) {
    try {
        return await categoriaRepository.conTransaccion(
            async (conexion) => {
                const contexto = escritura
                    ? await bloquearContexto(
                        torneoId,
                        edicionId,
                        conexion
                    )
                    : await obtenerContexto(
                        torneoId,
                        edicionId,
                        conexion
                    );

                return await operacion(
                    conexion,
                    contexto
                );
            }
        );
    } catch (error) {
        procesarErrorPersistencia(error);
    }
}

/* LISTAR CATEGORIAS */

async function listarCategorias(
    torneoId,
    edicionId,
    filtros = {}
) {
    const torneo = validarId(
        torneoId,
        'torneo'
    );

    const edicion = validarId(
        edicionId,
        'edición'
    );

    const filtrosNormalizados =
        normalizarFiltros(filtros);

    return operarEnContexto(
        torneo,
        edicion,
        async (conexion, contexto) => {
            const categorias =
                await categoriaRepository.listar(
                    edicion,
                    filtrosNormalizados,
                    conexion
                );

            const indicadores =
                await categoriaRepository.obtenerIndicadores(
                    edicion,
                    conexion
                );

            return {
                torneo: {
                    id: contexto.torneo_id,
                    nombre: contexto.torneo_nombre,
                    estado: contexto.torneo_estado
                },
                edicion: {
                    id: contexto.edicion_id,
                    torneo_id: contexto.torneo_id,
                    nombre: contexto.edicion_nombre,
                    estado: contexto.edicion_estado
                },
                categorias,
                total: categorias.length,
                indicadores
            };
        }
    );
}

/* OBTENER CATEGORIA */

async function obtenerCategoria(
    torneoId,
    edicionId,
    categoriaId
) {
    const torneo = validarId(
        torneoId,
        'torneo'
    );

    const edicion = validarId(
        edicionId,
        'edición'
    );

    const categoria = validarId(
        categoriaId,
        'categoría'
    );

    return operarEnContexto(
        torneo,
        edicion,
        async (conexion) => {
            return buscarCategoria(
                edicion,
                categoria,
                conexion
            );
        }
    );
}

/* CREAR CATEGORIA */

async function crearCategoria(
    torneoId,
    edicionId,
    datos
) {
    const torneo = validarId(
        torneoId,
        'torneo'
    );

    const edicion = validarId(
        edicionId,
        'edición'
    );

    const datosNormalizados =
        normalizarDatosCreacion(datos);

    return operarEnContexto(
        torneo,
        edicion,
        async (conexion, contexto) => {
            validarContextoHabilitado(
                contexto,
                'crear'
            );

            const categoriaId =
                await categoriaRepository.crear(
                    edicion,
                    datosNormalizados,
                    conexion
                );

            return buscarCategoria(
                edicion,
                categoriaId,
                conexion
            );
        },
        true
    );
}

/* ACTUALIZAR CATEGORIA */

async function actualizarCategoria(
    torneoId,
    edicionId,
    categoriaId,
    datos
) {
    const torneo = validarId(
        torneoId,
        'torneo'
    );

    const edicion = validarId(
        edicionId,
        'edición'
    );

    const categoria = validarId(
        categoriaId,
        'categoría'
    );

    validarObjeto(datos, [
        'nombre',
        'descripcion'
    ]);

    return operarEnContexto(
        torneo,
        edicion,
        async (conexion) => {
            const categoriaActual =
                await buscarCategoria(
                    edicion,
                    categoria,
                    conexion
                );

            const datosNormalizados =
                normalizarDatosActualizacion(
                    datos,
                    categoriaActual
                );

            const sinCambios =
                datosNormalizados.nombre ===
                    categoriaActual.nombre &&
                datosNormalizados.descripcion ===
                    categoriaActual.descripcion;

            if (sinCambios) {
                return categoriaActual;
            }

            await categoriaRepository.actualizar(
                edicion,
                categoria,
                datosNormalizados,
                conexion
            );

            return buscarCategoria(
                edicion,
                categoria,
                conexion
            );
        },
        true
    );
}

/* CAMBIAR ESTADO */

async function cambiarEstadoCategoria(
    torneoId,
    edicionId,
    categoriaId,
    datos
) {
    const torneo = validarId(
        torneoId,
        'torneo'
    );

    const edicion = validarId(
        edicionId,
        'edición'
    );

    const categoria = validarId(
        categoriaId,
        'categoría'
    );

    validarObjeto(datos, ['estado']);

    const nuevoEstado = normalizarEstado(
        datos.estado
    );

    return operarEnContexto(
        torneo,
        edicion,
        async (conexion, contexto) => {
            const categoriaActual =
                await buscarCategoria(
                    edicion,
                    categoria,
                    conexion
                );

            if (
                categoriaActual.estado === nuevoEstado
            ) {
                return categoriaActual;
            }

            if (nuevoEstado === ESTADOS.ACTIVA) {
                validarContextoHabilitado(
                    contexto,
                    'reactivar'
                );
            }

            await categoriaRepository.cambiarEstado(
                edicion,
                categoria,
                nuevoEstado,
                conexion
            );

            return buscarCategoria(
                edicion,
                categoria,
                conexion
            );
        },
        true
    );
}

/* ELIMINAR CATEGORIA */

async function eliminarCategoria(
    torneoId,
    edicionId,
    categoriaId
) {
    const torneo = validarId(
        torneoId,
        'torneo'
    );

    const edicion = validarId(
        edicionId,
        'edición'
    );

    const categoria = validarId(
        categoriaId,
        'categoría'
    );

    return operarEnContexto(
        torneo,
        edicion,
        async (conexion) => {
            await buscarCategoria(
                edicion,
                categoria,
                conexion
            );

            const eliminadas =
                await categoriaRepository.eliminar(
                    edicion,
                    categoria,
                    conexion
                );

            if (eliminadas === 0) {
                throw new CategoriaError(
                    'La categoría no existe en la edición indicada.',
                    404
                );
            }
        },
        true
    );
}

/* EXPORTACIONES */

module.exports = {
    CategoriaError,
    ESTADOS,
    listarCategorias,
    obtenerCategoria,
    crearCategoria,
    actualizarCategoria,
    cambiarEstadoCategoria,
    eliminarCategoria
};