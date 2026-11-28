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

/* VERIFICACION ESTRUCTURAL DE TORNEOS */

async function verificarTablaTorneos(conexion) {
    const [tablas] = await conexion.query(`
        SELECT
            ENGINE AS motor,
            TABLE_COLLATION AS collation
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'torneos'
    `);

    if (
        tablas.length !== 1 ||
        tablas[0].motor !== 'InnoDB' ||
        tablas[0].collation !== 'utf8mb4_unicode_ci'
    ) {
        throw new Error(
            'La configuración de la tabla torneos es incompatible.'
        );
    }

    const [columnas] = await conexion.query(
        'SHOW FULL COLUMNS FROM torneos'
    );

    const campos = new Map(
        columnas.map(
            (columna) => [columna.Field, columna]
        )
    );

    const id = campos.get('id');
    const nombre = campos.get('nombre');
    const descripcion = campos.get('descripcion');
    const estado = campos.get('estado');
    const fechaCreacion = campos.get('fecha_creacion');
    const fechaActualizacion =
        campos.get('fecha_actualizacion');

    const estructuraCorrecta =
        columnas.length === 6 &&

        id?.Type === 'int' &&
        id?.Null === 'NO' &&
        id?.Extra.includes('auto_increment') &&

        nombre?.Type === 'varchar(100)' &&
        nombre?.Null === 'NO' &&
        nombre?.Collation === 'utf8mb4_unicode_ci' &&

        descripcion?.Type === 'varchar(500)' &&
        descripcion?.Null === 'YES' &&
        descripcion?.Default === null &&
        descripcion?.Collation === 'utf8mb4_unicode_ci' &&

        estado?.Type === "enum('ACTIVO','ARCHIVADO')" &&
        estado?.Null === 'NO' &&
        estado?.Default === 'ACTIVO' &&
        estado?.Collation === 'utf8mb4_unicode_ci' &&

        fechaCreacion?.Type === 'timestamp' &&
        fechaCreacion?.Null === 'NO' &&
        /^current_timestamp(?:\(\))?$/i.test(
            String(fechaCreacion?.Default)
        ) &&
        !/on update/i.test(
            String(fechaCreacion?.Extra)
        ) &&

        fechaActualizacion?.Type === 'timestamp' &&
        fechaActualizacion?.Null === 'NO' &&
        /^current_timestamp(?:\(\))?$/i.test(
            String(fechaActualizacion?.Default)
        ) &&
        /on update current_timestamp(?:\(\))?/i.test(
            String(fechaActualizacion?.Extra)
        );

    if (!estructuraCorrecta) {
        throw new Error(
            'La estructura de la tabla torneos no coincide con la migración 002.'
        );
    }

    const [indices] = await conexion.query(
        'SHOW INDEX FROM torneos'
    );

    const primaria = indices.filter(
        (indice) => indice.Key_name === 'PRIMARY'
    );

    const indiceNombre = indices.filter(
        (indice) =>
            indice.Key_name === 'uq_torneos_nombre'
    );

    const indiceEstado = indices.filter(
        (indice) =>
            indice.Key_name === 'idx_torneos_estado'
    );

    const indicesCorrectos =
        primaria.length === 1 &&
        primaria[0].Column_name === 'id' &&
        Number(primaria[0].Non_unique) === 0 &&

        indiceNombre.length === 1 &&
        indiceNombre[0].Column_name === 'nombre' &&
        Number(indiceNombre[0].Non_unique) === 0 &&
        indiceNombre[0].Sub_part === null &&

        indiceEstado.length === 1 &&
        indiceEstado[0].Column_name === 'estado' &&
        Number(indiceEstado[0].Non_unique) === 1 &&
        indiceEstado[0].Sub_part === null;

    if (!indicesCorrectos) {
        throw new Error(
            'Los índices de la tabla torneos son incompatibles.'
        );
    }
}

/* VERIFICACION ESTRUCTURAL DE EDICIONES */

async function verificarTablaEdiciones(conexion) {
    const [tablas] = await conexion.query(`
        SELECT
            ENGINE AS motor,
            TABLE_COLLATION AS collation
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'ediciones'
    `);

    if (
        tablas.length !== 1 ||
        tablas[0].motor !== 'InnoDB' ||
        tablas[0].collation !== 'utf8mb4_unicode_ci'
    ) {
        throw new Error(
            'La configuración de la tabla ediciones es incompatible.'
        );
    }

    const [columnas] = await conexion.query(
        'SHOW FULL COLUMNS FROM ediciones'
    );

    const campos = new Map(
        columnas.map((columna) => [columna.Field, columna])
    );

    const id = campos.get('id');
    const torneoId = campos.get('torneo_id');
    const nombre = campos.get('nombre');
    const descripcion = campos.get('descripcion');
    const fechaInicio = campos.get('fecha_inicio');
    const fechaFinalizacion = campos.get('fecha_finalizacion');
    const estado = campos.get('estado');
    const fechaCreacion = campos.get('fecha_creacion');
    const fechaActualizacion = campos.get('fecha_actualizacion');

    const estructuraCorrecta =
        columnas.length === 9 &&

        id?.Type === 'int' &&
        id?.Null === 'NO' &&
        id?.Extra.includes('auto_increment') &&

        torneoId?.Type === 'int' &&
        torneoId?.Null === 'NO' &&
        torneoId?.Default === null &&

        nombre?.Type === 'varchar(100)' &&
        nombre?.Null === 'NO' &&
        nombre?.Collation === 'utf8mb4_unicode_ci' &&

        descripcion?.Type === 'varchar(500)' &&
        descripcion?.Null === 'YES' &&
        descripcion?.Default === null &&
        descripcion?.Collation === 'utf8mb4_unicode_ci' &&

        fechaInicio?.Type === 'date' &&
        fechaInicio?.Null === 'YES' &&
        fechaInicio?.Default === null &&

        fechaFinalizacion?.Type === 'date' &&
        fechaFinalizacion?.Null === 'YES' &&
        fechaFinalizacion?.Default === null &&

        estado?.Type === "enum('PLANIFICADA','EN_CURSO','FINALIZADA')" &&
        estado?.Null === 'NO' &&
        estado?.Default === 'PLANIFICADA' &&
        estado?.Collation === 'utf8mb4_unicode_ci' &&

        fechaCreacion?.Type === 'timestamp' &&
        fechaCreacion?.Null === 'NO' &&
        /^current_timestamp(?:\(\))?$/i.test(
            String(fechaCreacion?.Default)
        ) &&
        !/on update/i.test(String(fechaCreacion?.Extra)) &&

        fechaActualizacion?.Type === 'timestamp' &&
        fechaActualizacion?.Null === 'NO' &&
        /^current_timestamp(?:\(\))?$/i.test(
            String(fechaActualizacion?.Default)
        ) &&
        /on update current_timestamp(?:\(\))?/i.test(
            String(fechaActualizacion?.Extra)
        );

    if (!estructuraCorrecta) {
        throw new Error(
            'La estructura de la tabla ediciones no coincide con la migración 003.'
        );
    }

    const [indices] = await conexion.query(
        'SHOW INDEX FROM ediciones'
    );

    function coincideIndice(clave, columnasEsperadas, noUnico) {
        const filas = indices.filter(
            (indice) => indice.Key_name === clave
        ).sort(
            (a, b) => Number(a.Seq_in_index) - Number(b.Seq_in_index)
        );

        return filas.length === columnasEsperadas.length &&
            filas.every((fila, i) =>
                fila.Column_name === columnasEsperadas[i] &&
                Number(fila.Seq_in_index) === i + 1 &&
                Number(fila.Non_unique) === noUnico &&
                fila.Sub_part === null
            );
    }

    if (
        !coincideIndice('PRIMARY', ['id'], 0) ||
        !coincideIndice(
            'uq_ediciones_torneo_nombre', ['torneo_id', 'nombre'], 0
        ) ||
        !coincideIndice(
            'idx_ediciones_torneo_estado', ['torneo_id', 'estado'], 1
        )
    ) {
        throw new Error(
            'Los índices de la tabla ediciones son incompatibles.'
        );
    }

    const [referencias] = await conexion.query(`
        SELECT
            k.COLUMN_NAME AS columna,
            k.REFERENCED_TABLE_SCHEMA AS esquema_referenciado,
            k.TABLE_SCHEMA AS esquema_local,
            k.REFERENCED_TABLE_NAME AS tabla_referenciada,
            k.REFERENCED_COLUMN_NAME AS columna_referenciada,
            k.ORDINAL_POSITION AS posicion,
            r.DELETE_RULE AS regla_eliminacion,
            r.UPDATE_RULE AS regla_actualizacion
        FROM information_schema.KEY_COLUMN_USAGE AS k
        INNER JOIN information_schema.REFERENTIAL_CONSTRAINTS AS r
            ON r.CONSTRAINT_SCHEMA = k.CONSTRAINT_SCHEMA
           AND r.TABLE_NAME = k.TABLE_NAME
           AND r.CONSTRAINT_NAME = k.CONSTRAINT_NAME
        WHERE k.TABLE_SCHEMA = DATABASE()
          AND k.TABLE_NAME = 'ediciones'
          AND k.CONSTRAINT_NAME = 'fk_ediciones_torneo'
    `);

    const referencia = referencias[0];

    if (
        referencias.length !== 1 ||
        referencia.columna !== 'torneo_id' ||
        referencia.esquema_referenciado !== referencia.esquema_local ||
        referencia.tabla_referenciada !== 'torneos' ||
        referencia.columna_referenciada !== 'id' ||
        Number(referencia.posicion) !== 1 ||
        referencia.regla_eliminacion !== 'RESTRICT' ||
        referencia.regla_actualizacion !== 'RESTRICT'
    ) {
        throw new Error(
            'La clave foránea de ediciones no coincide con la migración 003.'
        );
    }

    const [restricciones] = await conexion.query(`
        SELECT
            t.ENFORCED AS aplicada,
            c.CHECK_CLAUSE AS expresion
        FROM information_schema.TABLE_CONSTRAINTS AS t
        INNER JOIN information_schema.CHECK_CONSTRAINTS AS c
            ON c.CONSTRAINT_SCHEMA = t.CONSTRAINT_SCHEMA
           AND c.CONSTRAINT_NAME = t.CONSTRAINT_NAME
        WHERE t.TABLE_SCHEMA = DATABASE()
          AND t.TABLE_NAME = 'ediciones'
          AND t.CONSTRAINT_TYPE = 'CHECK'
          AND t.CONSTRAINT_NAME = 'chk_ediciones_fechas'
    `);

    // MySQL puede agregar paréntesis, espacios y comillas de identificador
    // al representar esta expresión, que solo contiene disyunciones (OR).
    const normalizarExpresion = (expresion) =>
        String(expresion).toLowerCase().replace(/[\s`()]/g, '');

    const expresionEsperada = normalizarExpresion(
        'fecha_inicio IS NULL OR fecha_finalizacion IS NULL OR fecha_finalizacion >= fecha_inicio'
    );

    if (
        restricciones.length !== 1 ||
        restricciones[0].aplicada !== 'YES' ||
        normalizarExpresion(restricciones[0].expresion) !== expresionEsperada
    ) {
        throw new Error(
            'La restricción de fechas de ediciones es incompatible.'
        );
    }
}

/* VERIFICACION ESTRUCTURAL DE CATEGORIAS */

async function verificarTablaCategorias(conexion) {
    const [tablas] = await conexion.query(`
        SELECT
            ENGINE AS motor,
            TABLE_COLLATION AS collation
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'categorias'
    `);

    if (
        tablas.length !== 1 ||
        tablas[0].motor !== 'InnoDB' ||
        tablas[0].collation !== 'utf8mb4_unicode_ci'
    ) {
        throw new Error(
            'La configuración de la tabla categorias es incompatible.'
        );
    }

    const [columnas] = await conexion.query(
        'SHOW FULL COLUMNS FROM categorias'
    );

    const campos = new Map(
        columnas.map((columna) => [columna.Field, columna])
    );

    const id = campos.get('id');
    const edicionId = campos.get('edicion_id');
    const nombre = campos.get('nombre');
    const descripcion = campos.get('descripcion');
    const estado = campos.get('estado');
    const fechaCreacion = campos.get('fecha_creacion');
    const fechaActualizacion = campos.get('fecha_actualizacion');

    const estructuraCorrecta =
        columnas.length === 7 &&

        id?.Type === 'int' &&
        id?.Null === 'NO' &&
        id?.Extra.includes('auto_increment') &&

        edicionId?.Type === 'int' &&
        edicionId?.Null === 'NO' &&
        edicionId?.Default === null &&

        nombre?.Type === 'varchar(100)' &&
        nombre?.Null === 'NO' &&
        nombre?.Collation === 'utf8mb4_unicode_ci' &&

        descripcion?.Type === 'varchar(500)' &&
        descripcion?.Null === 'YES' &&
        descripcion?.Default === null &&
        descripcion?.Collation === 'utf8mb4_unicode_ci' &&

        estado?.Type === "enum('ACTIVA','ARCHIVADA')" &&
        estado?.Null === 'NO' &&
        estado?.Default === 'ACTIVA' &&
        estado?.Collation === 'utf8mb4_unicode_ci' &&

        fechaCreacion?.Type === 'timestamp' &&
        fechaCreacion?.Null === 'NO' &&
        /^current_timestamp(?:\(\))?$/i.test(
            String(fechaCreacion?.Default)
        ) &&
        !/on update/i.test(String(fechaCreacion?.Extra)) &&

        fechaActualizacion?.Type === 'timestamp' &&
        fechaActualizacion?.Null === 'NO' &&
        /^current_timestamp(?:\(\))?$/i.test(
            String(fechaActualizacion?.Default)
        ) &&
        /on update current_timestamp(?:\(\))?/i.test(
            String(fechaActualizacion?.Extra)
        );

    if (!estructuraCorrecta) {
        throw new Error(
            'La estructura de la tabla categorias no coincide con la migración 004.'
        );
    }

    const [indices] = await conexion.query(
        'SHOW INDEX FROM categorias'
    );

    function coincideIndice(clave, columnasEsperadas, noUnico) {
        const filas = indices.filter(
            (indice) => indice.Key_name === clave
        ).sort(
            (a, b) => Number(a.Seq_in_index) - Number(b.Seq_in_index)
        );

        return filas.length === columnasEsperadas.length &&
            filas.every((fila, i) =>
                fila.Column_name === columnasEsperadas[i] &&
                Number(fila.Seq_in_index) === i + 1 &&
                Number(fila.Non_unique) === noUnico &&
                fila.Sub_part === null
            );
    }

    if (
        !coincideIndice('PRIMARY', ['id'], 0) ||
        !coincideIndice(
            'uq_categorias_edicion_nombre', ['edicion_id', 'nombre'], 0
        ) ||
        !coincideIndice(
            'idx_categorias_edicion_estado', ['edicion_id', 'estado'], 1
        )
    ) {
        throw new Error(
            'Los índices de la tabla categorias son incompatibles.'
        );
    }

    const [referencias] = await conexion.query(`
        SELECT
            k.COLUMN_NAME AS columna,
            k.REFERENCED_TABLE_SCHEMA AS esquema_referenciado,
            k.TABLE_SCHEMA AS esquema_local,
            k.REFERENCED_TABLE_NAME AS tabla_referenciada,
            k.REFERENCED_COLUMN_NAME AS columna_referenciada,
            k.ORDINAL_POSITION AS posicion,
            r.DELETE_RULE AS regla_eliminacion,
            r.UPDATE_RULE AS regla_actualizacion
        FROM information_schema.KEY_COLUMN_USAGE AS k
        INNER JOIN information_schema.REFERENTIAL_CONSTRAINTS AS r
            ON r.CONSTRAINT_SCHEMA = k.CONSTRAINT_SCHEMA
           AND r.TABLE_NAME = k.TABLE_NAME
           AND r.CONSTRAINT_NAME = k.CONSTRAINT_NAME
        WHERE k.TABLE_SCHEMA = DATABASE()
          AND k.TABLE_NAME = 'categorias'
          AND k.CONSTRAINT_NAME = 'fk_categorias_edicion'
    `);

    const referencia = referencias[0];

    if (
        referencias.length !== 1 ||
        referencia.columna !== 'edicion_id' ||
        referencia.esquema_referenciado !== referencia.esquema_local ||
        referencia.tabla_referenciada !== 'ediciones' ||
        referencia.columna_referenciada !== 'id' ||
        Number(referencia.posicion) !== 1 ||
        referencia.regla_eliminacion !== 'RESTRICT' ||
        referencia.regla_actualizacion !== 'RESTRICT'
    ) {
        throw new Error(
            'La clave foránea de categorias no coincide con la migración 004.'
        );
    }
}

/* REGISTRO DE VERIFICADORES */

const VERIFICADORES = new Map([
    [1, verificarTablaUsuarios],
    [2, verificarTablaTorneos],
    [3, verificarTablaEdiciones],
    [4, verificarTablaCategorias]
]);

/* VERIFICACION PREVENTIVA */

function verificarDisponibilidadDeVerificadores(
    migraciones
) {
    for (const migracion of migraciones) {
        if (!VERIFICADORES.has(migracion.version)) {
            throw new Error(
                `La migración ${migracion.archivo} no tiene una verificación estructural definida.`
            );
        }
    }
}

/* VERIFICACIONES ESPECIFICAS */

async function verificarMigracion(
    conexion,
    migracion
) {
    const verificar = VERIFICADORES.get(
        migracion.version
    );

    if (!verificar) {
        throw new Error(
            `La migración ${migracion.version} no tiene una verificación estructural definida.`
        );
    }

    await verificar(conexion);
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

        verificarDisponibilidadDeVerificadores(
            migraciones
        );

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
