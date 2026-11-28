
const { pool } = require('../config/database');


/* COLUMNAS DE CONSULTA */

const COLUMNAS_EDICION = `
    id,
    torneo_id,
    nombre,
    descripcion,
    DATE_FORMAT(
        fecha_inicio,
        '%Y-%m-%d'
    ) AS fecha_inicio,
    DATE_FORMAT(
        fecha_finalizacion,
        '%Y-%m-%d'
    ) AS fecha_finalizacion,
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
                'Error al revertir la transacción de ediciones:',
                errorRollback.message
            );
        }

        throw error;

    } finally {
        conexion.release();
    }
}


/* CONSULTA DEL TORNEO */

async function obtenerTorneo(
    torneoId,
    conexion = pool
) {
    const [filas] = await conexion.execute(`
        SELECT
            id,
            nombre,
            estado
        FROM torneos
        WHERE id = ?
        LIMIT 1
    `, [
        torneoId
    ]);

    return filas[0] || null;
}


/* BLOQUEO TRANSACCIONAL DEL TORNEO */

async function bloquearTorneo(
    torneoId,
    conexion
) {
    const [filas] = await conexion.execute(`
        SELECT
            id,
            nombre,
            estado
        FROM torneos
        WHERE id = ?
        FOR UPDATE
    `, [
        torneoId
    ]);

    return filas[0] || null;
}


/* LISTADO DE EDICIONES */

async function listar(
    torneoId,
    filtros = {},
    conexion = pool
) {
    const {
        busqueda,
        estado
    } = filtros;

    const condiciones = [
        'torneo_id = ?'
    ];

    const parametros = [
        torneoId
    ];

    if (busqueda) {
        condiciones.push(`
            (
                LOCATE(?, nombre) > 0
                OR LOCATE(
                    ?,
                    COALESCE(descripcion, '')
                ) > 0
            )
        `);

        parametros.push(
            busqueda,
            busqueda
        );
    }

    if (estado) {
        condiciones.push('estado = ?');

        parametros.push(estado);
    }

    const [filas] = await conexion.execute(`
        SELECT
            ${COLUMNAS_EDICION}
        FROM ediciones
        WHERE ${condiciones.join(' AND ')}
        ORDER BY
            estado ASC,
            nombre ASC,
            id ASC
    `, parametros);

    return filas;
}


/* CONSULTA INDIVIDUAL */

async function obtenerPorId(
    torneoId,
    edicionId,
    conexion = pool
) {
    const [filas] = await conexion.execute(`
        SELECT
            ${COLUMNAS_EDICION}
        FROM ediciones
        WHERE torneo_id = ?
          AND id = ?
        LIMIT 1
    `, [
        torneoId,
        edicionId
    ]);

    return filas[0] || null;
}


/* CREACION */

async function crear(
    torneoId,
    datos,
    conexion = pool
) {
    const {
        nombre,
        descripcion,
        fecha_inicio,
        fecha_finalizacion
    } = datos;

    const [resultado] = await conexion.execute(`
        INSERT INTO ediciones (
            torneo_id,
            nombre,
            descripcion,
            fecha_inicio,
            fecha_finalizacion
        )
        VALUES (?, ?, ?, ?, ?)
    `, [
        torneoId,
        nombre,
        descripcion,
        fecha_inicio,
        fecha_finalizacion
    ]);

    return resultado.insertId;
}


/* ACTUALIZACION DE DATOS */

async function actualizar(
    torneoId,
    edicionId,
    datos,
    conexion = pool
) {
    const {
        nombre,
        descripcion,
        fecha_inicio,
        fecha_finalizacion
    } = datos;

    const [resultado] = await conexion.execute(`
        UPDATE ediciones
        SET
            nombre = ?,
            descripcion = ?,
            fecha_inicio = ?,
            fecha_finalizacion = ?
        WHERE torneo_id = ?
          AND id = ?
    `, [
        nombre,
        descripcion,
        fecha_inicio,
        fecha_finalizacion,
        torneoId,
        edicionId
    ]);

    return resultado.affectedRows;
}


/* CAMBIO DE ESTADO */

async function cambiarEstado(
    torneoId,
    edicionId,
    estado,
    conexion = pool
) {
    const [resultado] = await conexion.execute(`
        UPDATE ediciones
        SET estado = ?
        WHERE torneo_id = ?
          AND id = ?
    `, [
        estado,
        torneoId,
        edicionId
    ]);

    return resultado.affectedRows;
}


/* ELIMINACION DEFINITIVA */

async function eliminar(
    torneoId,
    edicionId,
    conexion = pool
) {
    const [resultado] = await conexion.execute(`
        DELETE FROM ediciones
        WHERE torneo_id = ?
          AND id = ?
    `, [
        torneoId,
        edicionId
    ]);

    return resultado.affectedRows;
}


/* INDICADORES DEL TORNEO */

async function obtenerIndicadores(
    torneoId,
    conexion = pool
) {
    const [filas] = await conexion.execute(`
        SELECT
            COUNT(*) AS total,

            COALESCE(
                SUM(estado = 'PLANIFICADA'),
                0
            ) AS planificadas,

            COALESCE(
                SUM(estado = 'EN_CURSO'),
                0
            ) AS en_curso,

            COALESCE(
                SUM(estado = 'FINALIZADA'),
                0
            ) AS finalizadas

        FROM ediciones
        WHERE torneo_id = ?
    `, [
        torneoId
    ]);

    const indicadores = filas[0];

    return {
        total: Number(indicadores.total),
        planificadas: Number(
            indicadores.planificadas
        ),
        en_curso: Number(
            indicadores.en_curso
        ),
        finalizadas: Number(
            indicadores.finalizadas
        )
    };
}


/* EXPORTACIONES */

module.exports = {
    conTransaccion,
    obtenerTorneo,
    bloquearTorneo,
    listar,
    obtenerPorId,
    crear,
    actualizar,
    cambiarEstado,
    eliminar,
    obtenerIndicadores
};
