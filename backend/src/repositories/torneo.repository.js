const { pool } = require('../config/database');

const CAMPOS_TORNEO = `
    id,
    nombre,
    descripcion,
    estado,
    fecha_creacion,
    fecha_actualizacion
`;

/* LISTAR TORNEOS */

async function listar({
    busqueda = '',
    estado = null
} = {}) {
    const condiciones = [];
    const parametros = [];

    if (busqueda) {
        condiciones.push(`
            (
                LOCATE(?, nombre) > 0
                OR LOCATE(?, COALESCE(descripcion, '')) > 0
            )
        `);

        parametros.push(busqueda, busqueda);
    }

    if (estado) {
        condiciones.push('estado = ?');
        parametros.push(estado);
    }

    const where = condiciones.length > 0
        ? `WHERE ${condiciones.join(' AND ')}`
        : '';

    const [filas] = await pool.execute(
        `
            SELECT ${CAMPOS_TORNEO}
            FROM torneos
            ${where}
            ORDER BY estado ASC, nombre ASC, id ASC
        `,
        parametros
    );

    return filas;
}

/* BUSCAR TORNEO POR ID */

async function buscarPorId(id) {
    const [filas] = await pool.execute(
        `
            SELECT ${CAMPOS_TORNEO}
            FROM torneos
            WHERE id = ?
            LIMIT 1
        `,
        [id]
    );

    return filas[0] || null;
}

/* CREAR TORNEO */

async function crear({
    nombre,
    descripcion = null
}) {
    const [resultado] = await pool.execute(
        `
            INSERT INTO torneos (
                nombre,
                descripcion
            )
            VALUES (?, ?)
        `,
        [nombre, descripcion]
    );

    return resultado.insertId;
}

/* ACTUALIZAR TORNEO */

async function actualizar(
    id,
    {
        nombre,
        descripcion = null
    }
) {
    const [resultado] = await pool.execute(
        `
            UPDATE torneos
            SET
                nombre = ?,
                descripcion = ?
            WHERE id = ?
        `,
        [nombre, descripcion, id]
    );

    return resultado.affectedRows;
}

/* ARCHIVAR O REACTIVAR TORNEO */

async function actualizarEstado(id, estado) {
    const [resultado] = await pool.execute(
        `
            UPDATE torneos
            SET estado = ?
            WHERE id = ?
        `,
        [estado, id]
    );

    return resultado.affectedRows;
}

/* ELIMINAR TORNEO */

async function eliminar(id) {
    const [resultado] = await pool.execute(
        `
            DELETE FROM torneos
            WHERE id = ?
        `,
        [id]
    );

    return resultado.affectedRows;
}

/* EXPORTACIONES */

module.exports = {
    listar,
    buscarPorId,
    crear,
    actualizar,
    actualizarEstado,
    eliminar
};
