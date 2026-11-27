const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const { APP_CONFIG } = require('./config/app.config');
const { pool } = require('./config/database');

const migracionRepository =
    require('./repositories/migracion.repository');

const DIRECTORIO_MIGRACIONES = path.resolve(
    __dirname,
    '../../database/migrations'
);

/* CARGA DE MIGRACIONES */

async function cargarMigraciones() {
    const archivos = await fs.readdir(
        DIRECTORIO_MIGRACIONES
    );

    const migraciones = [];

    for (const archivo of archivos) {
        if (!archivo.toLowerCase().endsWith('.sql')) {
            continue;
        }

        const coincidencia = archivo.match(
            /^(\d{3,})_[a-z0-9_]+\.sql$/
        );

        if (!coincidencia) {
            throw new Error(
                `Nombre de migración inválido: ${archivo}`
            );
        }

        const version = Number(coincidencia[1]);

        if (
            !Number.isSafeInteger(version) ||
            version < 1 ||
            version > 4294967295
        ) {
            throw new Error(
                `Versión de migración inválida: ${archivo}`
            );
        }

        const ruta = path.join(
            DIRECTORIO_MIGRACIONES,
            archivo
        );

        const contenido = (
            await fs.readFile(ruta, 'utf8')
        )
            .replace(/^\uFEFF/, '')
            .replace(/\r\n?/g, '\n');

        if (!contenido.trim()) {
            throw new Error(
                `Migración vacía: ${archivo}`
            );
        }

        const checksum = crypto
            .createHash('sha256')
            .update(contenido, 'utf8')
            .digest('hex');

        migraciones.push({
            version,
            archivo,
            contenido,
            checksum
        });
    }

    migraciones.sort(
        (a, b) => a.version - b.version
    );

    if (migraciones.length === 0) {
        throw new Error(
            'No se encontraron migraciones SQL.'
        );
    }

    for (let i = 0; i < migraciones.length; i++) {
        if (migraciones[i].version !== i + 1) {
            throw new Error(
                'Existen versiones duplicadas o faltantes.'
            );
        }
    }

    return migraciones;
}

/* VERIFICACION DEL HISTORIAL */

function verificarHistorial(
    migraciones,
    registradas
) {
    for (let i = 0; i < registradas.length; i++) {
        const registrada = registradas[i];
        const migracion = migraciones[i];

        if (!migracion) {
            throw new Error(
                `Falta el archivo de la migración ${registrada.version}.`
            );
        }

        if (
            registrada.version !== migracion.version ||
            registrada.archivo !== migracion.archivo
        ) {
            throw new Error(
                'El historial de migraciones no coincide con los archivos.'
            );
        }

        if (registrada.checksum !== migracion.checksum) {
            throw new Error(
                `La migración ${registrada.archivo} fue modificada.`
            );
        }

        if (registrada.estado !== 'APLICADA') {
            throw new Error(
                `La migración ${registrada.archivo} quedó incompleta. Se requiere revisión manual.`
            );
        }
    }
}

/* VERIFICACION ESTRUCTURAL DE USUARIOS */

async function verificarTablaUsuarios(conexion) {
    const [tablas] = await conexion.query(`
        SELECT
            ENGINE AS motor,
            TABLE_COLLATION AS collation
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'usuarios'
    `);

    if (
        tablas.length !== 1 ||
        tablas[0].motor !== 'InnoDB' ||
        tablas[0].collation !== 'utf8mb4_unicode_ci'
    ) {
        throw new Error(
            'La configuración de la tabla usuarios es incompatible.'
        );
    }

    const [columnas] = await conexion.query(
        'SHOW FULL COLUMNS FROM usuarios'
    );

    const campos = new Map(
        columnas.map(
            (columna) => [columna.Field, columna]
        )
    );

    const id = campos.get('id');
    const usuario = campos.get('usuario');
    const passwordHash = campos.get('password_hash');
    const activo = campos.get('activo');
    const fechaCreacion = campos.get('fecha_creacion');

    const estructuraCorrecta =
        columnas.length === 5 &&

        id?.Type === 'int' &&
        id?.Null === 'NO' &&
        id?.Extra.includes('auto_increment') &&

        usuario?.Type === 'varchar(50)' &&
        usuario?.Null === 'NO' &&
        usuario?.Collation === 'utf8mb4_unicode_ci' &&

        passwordHash?.Type === 'varchar(255)' &&
        passwordHash?.Null === 'NO' &&
        passwordHash?.Collation === 'utf8mb4_unicode_ci' &&

        activo?.Type === 'tinyint(1)' &&
        activo?.Null === 'NO' &&
        String(activo?.Default) === '1' &&

        fechaCreacion?.Type === 'timestamp' &&
        fechaCreacion?.Null === 'YES' &&
        /^current_timestamp(?:\(\))?$/i.test(
            String(fechaCreacion?.Default)
        );

    if (!estructuraCorrecta) {
        throw new Error(
            'La estructura de la tabla usuarios no coincide con la migración 001.'
        );
    }

    const [indices] = await conexion.query(
        'SHOW INDEX FROM usuarios'
    );

    const primaria = indices.filter(
        (indice) => indice.Key_name === 'PRIMARY'
    );

    const indiceUsuario = indices.filter(
        (indice) => indice.Key_name === 'usuario'
    );

    if (
        primaria.length !== 1 ||
        primaria[0].Column_name !== 'id' ||

        indiceUsuario.length !== 1 ||
        indiceUsuario[0].Column_name !== 'usuario' ||
        Number(indiceUsuario[0].Non_unique) !== 0 ||
        indiceUsuario[0].Sub_part !== null
    ) {
        throw new Error(
            'Los índices de la tabla usuarios son incompatibles.'
        );
    }
}

/* VERIFICACIONES ESPECIFICAS */

async function verificarMigracion(
    conexion,
    migracion
) {
    switch (migracion.version) {
        case 1:
            await verificarTablaUsuarios(conexion);
            break;

        default:
            throw new Error(
                `La migración ${migracion.version} no tiene una verificación estructural definida.`
            );
    }
}

/* EJECUCION DE MIGRACIONES */

async function ejecutarMigraciones() {
    let conexion;
    let nombreBloqueo;
    let bloqueoAdquirido = false;

    try {
        console.log('================================');
        console.log(
            `${APP_CONFIG.nombre} v${APP_CONFIG.version}`
        );
        console.log('MIGRACIONES DE BASE DE DATOS');
        console.log('================================');

        const migraciones = await cargarMigraciones();

        conexion = await pool.getConnection();

        const [bases] = await conexion.query(
            'SELECT DATABASE() AS nombre'
        );

        const nombreBase = bases[0].nombre;

        if (!nombreBase) {
            throw new Error(
                'No hay una base de datos seleccionada.'
            );
        }

        nombreBloqueo = crypto
            .createHash('sha256')
            .update(`alto-sistema:migraciones:${nombreBase}`)
            .digest('hex');

        const [bloqueos] = await conexion.execute(
            'SELECT GET_LOCK(?, 10) AS adquirido',
            [nombreBloqueo]
        );

        bloqueoAdquirido =
            Number(bloqueos[0].adquirido) === 1;

        if (!bloqueoAdquirido) {
            throw new Error(
                'No se pudo adquirir el bloqueo de migraciones.'
            );
        }

        await migracionRepository.crearRegistro(
            conexion
        );

        const registradas =
            await migracionRepository.listarMigraciones(
                conexion
            );

        verificarHistorial(
            migraciones,
            registradas
        );

        const pendientes = migraciones.slice(
            registradas.length
        );

        console.log('Base de datos: ' + nombreBase);
        console.log('Registradas: ' + registradas.length);
        console.log('Pendientes: ' + pendientes.length);

        for (const migracion of pendientes) {
            console.log(
                `Ejecutando: ${migracion.archivo}`
            );

            await migracionRepository.iniciarMigracion(
                conexion,
                migracion.version,
                migracion.archivo,
                migracion.checksum
            );

            await conexion.query(
                migracion.contenido
            );

            await verificarMigracion(
                conexion,
                migracion
            );

            await migracionRepository.completarMigracion(
                conexion,
                migracion.version
            );

            console.log(
                `APLICADA: ${migracion.archivo}`
            );
        }

        console.log('================================');
        console.log('BASE DE DATOS ACTUALIZADA');
        console.log('================================');

    } finally {
        try {
            if (conexion && bloqueoAdquirido) {
                await conexion.execute(
                    'SELECT RELEASE_LOCK(?)',
                    [nombreBloqueo]
                );
            }
        } finally {
            if (conexion) {
                conexion.release();
            }

            await pool.end();
        }
    }
}

/* PUNTO DE ENTRADA */

ejecutarMigraciones().catch((error) => {
    console.error('================================');
    console.error('ERROR DE MIGRACIÓN');
    console.error(error.message);
    console.error('================================');

    process.exitCode = 1;
});