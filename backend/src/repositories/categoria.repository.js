'use strict';

const { pool } = require('../config/database');

const COLUMNAS_CATEGORIA = `
    id,
    edicion_id,
    nombre,
    descripcion,
    estado,
    fecha_creacion,
    fecha_actualizacion
`;


/* TRANSACCIONES */

async function conTransaccion(operacion) {

    const conexion = await pool.getConnection();

    try {

        await conexion.beginTransaction();

        const resultado = await operacion(conexion);

        await conexion.commit();

        return resultado;

    } catch (error) {

        try {

            await conexion.rollback();

        } catch (errorRollback) {

            console.error(
                'Error al revertir la transacción de categorías:',
                errorRollback
            );

        }

        throw error;

    } finally {

        conexion.release();

    }
}


/* CONTEXTO JERARQUICO */

async function obtenerContexto(
    torneoId,
    edicionId,
    conexion = pool
) {

    const [filas] = await conexion.execute(`
        SELECT
            t.id AS torneo_id,
            t.nombre AS torneo_nombre,
            t.estado AS torneo_estado,
            e.id AS edicion_id,
            e.nombre AS edicion_nombre,
            e.estado AS edicion_estado
        FROM torneos AS t
        INNER JOIN ediciones AS e
            ON e.torneo_id = t.id
        WHERE t.id = ?
          AND e.id = ?
        LIMIT 1
    `, [
        torneoId,
        edicionId
    ]);

    return filas[0] ?? null;
}


// Usar exclusivamente dentro de conTransaccion.
// Orden de bloqueo: torneo -> edición -> categoría.

async function bloquearContexto(
    torneoId,
    edicionId,
    conexion
) {

    const [torneos] = await conexion.execute(`
        SELECT id, nombre, estado
        FROM torneos
        WHERE id = ?
        FOR UPDATE
    `, [
        torneoId
    ]);

    const torneo = torneos[0];

    if (!torneo) {
        return null;
    }

    const [ediciones] = await conexion.execute(`
        SELECT id, nombre, estado
        FROM ediciones
        WHERE torneo_id = ?
          AND id = ?
        FOR UPDATE
    `, [
        torneoId,
        edicionId
    ]);

    const edicion = ediciones[0];

    if (!edicion) {
        return null;
    }

    return {
        torneo_id: torneo.id,
        torneo_nombre: torneo.nombre,
        torneo_estado: torneo.estado,
        edicion_id: edicion.id,
        edicion_nombre: edicion.nombre,
        edicion_estado: edicion.estado
    };
}


/* BUSQUEDA DE TEXTO */

// Escapa los caracteres especiales de LIKE.
// Se utiliza ! como carácter de escape explícito.
// Los caracteres %, _ y ! se buscan literalmente.

function construirPatronBusqueda(valor) {

    const texto = String(valor)
        .replace(/[!%_]/g, caracter => `!${caracter}`);

    return `%${texto}%`;
}


/* CONSULTAS */

async function listar(
    edicionId,
    filtros = {},
    conexion = pool
) {

    const condiciones = [
        'edicion_id = ?'
    ];

    const parametros = [
        edicionId
    ];


    /* BUSQUEDA INSENSIBLE A MAYUSCULAS Y ACENTOS */

    if (filtros.busqueda) {

        const patron = construirPatronBusqueda(
            filtros.busqueda
        );

        condiciones.push(`(
            nombre COLLATE utf8mb4_unicode_ci
                LIKE (
                    CONVERT(? USING utf8mb4)
                    COLLATE utf8mb4_unicode_ci
                ) ESCAPE '!'
            OR
            descripcion COLLATE utf8mb4_unicode_ci
                LIKE (
                    CONVERT(? USING utf8mb4)
                    COLLATE utf8mb4_unicode_ci
                ) ESCAPE '!'
        )`);

        parametros.push(
            patron,
            patron
        );
    }


    /* FILTRO POR ESTADO */

    if (filtros.estado) {

        condiciones.push(
            'estado = ?'
        );

        parametros.push(
            filtros.estado
        );
    }


    /* CONSULTA PARAMETRIZADA */

    const [filas] = await conexion.execute(`
        SELECT ${COLUMNAS_CATEGORIA}
        FROM categorias
        WHERE ${condiciones.join(' AND ')}
        ORDER BY estado ASC, nombre ASC, id ASC
    `, parametros);

    return filas;
}


async function obtenerPorId(
    edicionId,
    categoriaId,
    conexion = pool
) {

    const [filas] = await conexion.execute(`
        SELECT ${COLUMNAS_CATEGORIA}
        FROM categorias
        WHERE edicion_id = ?
          AND id = ?
        LIMIT 1
    `, [
        edicionId,
        categoriaId
    ]);

    return filas[0] ?? null;
}


/* ESCRITURAS */

// El servicio valida y bloquea el contexto
// antes de cada escritura.

async function crear(
    edicionId,
    datos,
    conexion = pool
) {

    const [resultado] = await conexion.execute(`
        INSERT INTO categorias (
            edicion_id,
            nombre,
            descripcion
        )
        VALUES (?, ?, ?)
    `, [
        edicionId,
        datos.nombre,
        datos.descripcion
    ]);

    return resultado.insertId;
}


async function actualizar(
    edicionId,
    categoriaId,
    datos,
    conexion = pool
) {

    const [resultado] = await conexion.execute(`
        UPDATE categorias
        SET nombre = ?,
            descripcion = ?
        WHERE edicion_id = ?
          AND id = ?
    `, [
        datos.nombre,
        datos.descripcion,
        edicionId,
        categoriaId
    ]);

    return resultado.affectedRows;
}


async function cambiarEstado(
    edicionId,
    categoriaId,
    estado,
    conexion = pool
) {

    const [resultado] = await conexion.execute(`
        UPDATE categorias
        SET estado = ?
        WHERE edicion_id = ?
          AND id = ?
    `, [
        estado,
        edicionId,
        categoriaId
    ]);

    return resultado.affectedRows;
}


async function eliminar(
    edicionId,
    categoriaId,
    conexion = pool
) {

    const [resultado] = await conexion.execute(`
        DELETE FROM categorias
        WHERE edicion_id = ?
          AND id = ?
    `, [
        edicionId,
        categoriaId
    ]);

    return resultado.affectedRows;
}


/* INDICADORES */

async function obtenerIndicadores(
    edicionId,
    conexion = pool
) {

    const [filas] = await conexion.execute(`
        SELECT
            COUNT(*) AS total,
            COALESCE(
                SUM(estado = 'ACTIVA'),
                0
            ) AS activas,
            COALESCE(
                SUM(estado = 'ARCHIVADA'),
                0
            ) AS archivadas
        FROM categorias
        WHERE edicion_id = ?
    `, [
        edicionId
    ]);

    const indicadores = filas[0];

    return {
        total: Number(indicadores.total),
        activas: Number(indicadores.activas),
        archivadas: Number(indicadores.archivadas)
    };
}


/* EXPORTACIONES */

module.exports = {
    conTransaccion,
    obtenerContexto,
    bloquearContexto,
    listar,
    obtenerPorId,
    crear,
    actualizar,
    cambiarEstado,
    eliminar,
    obtenerIndicadores
};