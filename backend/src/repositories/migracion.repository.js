async function crearRegistro(conexion) {
    await conexion.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            version INT UNSIGNED NOT NULL,
            archivo VARCHAR(255) NOT NULL,
            checksum CHAR(64) NOT NULL,

            estado ENUM(
                'EN_PROCESO',
                'APLICADA'
            ) NOT NULL DEFAULT 'EN_PROCESO',

            fecha_inicio TIMESTAMP NOT NULL
                DEFAULT CURRENT_TIMESTAMP,

            fecha_aplicacion TIMESTAMP NULL
                DEFAULT NULL,

            PRIMARY KEY (version),
            UNIQUE KEY uk_migracion_archivo (archivo)

        ) ENGINE = InnoDB
          DEFAULT CHARSET = utf8mb4
          COLLATE = utf8mb4_unicode_ci
    `);
}

async function listarMigraciones(conexion) {
    const [migraciones] = await conexion.query(`
        SELECT
            version,
            archivo,
            checksum,
            estado,
            fecha_inicio,
            fecha_aplicacion
        FROM schema_migrations
        ORDER BY version ASC
    `);

    return migraciones;
}

async function iniciarMigracion(
    conexion,
    version,
    archivo,
    checksum
) {
    await conexion.execute(
        `INSERT INTO schema_migrations (
            version,
            archivo,
            checksum,
            estado
        ) VALUES (?, ?, ?, 'EN_PROCESO')`,
        [
            version,
            archivo,
            checksum
        ]
    );
}

async function completarMigracion(conexion, version) {
    const [resultado] = await conexion.execute(
        `UPDATE schema_migrations
         SET estado = 'APLICADA',
             fecha_aplicacion = CURRENT_TIMESTAMP
         WHERE version = ?
           AND estado = 'EN_PROCESO'`,
        [version]
    );

    if (resultado.affectedRows !== 1) {
        throw new Error(
            `No se pudo completar la migración ${version}.`
        );
    }
}

module.exports = {
    crearRegistro,
    listarMigraciones,
    iniciarMigracion,
    completarMigracion
};