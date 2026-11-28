const { test, after } = require('node:test');
const assert = require('node:assert/strict');

const { pool } = require('../src/config/database');

const torneoService =
    require('../src/services/torneo.service');

const torneoRepository =
    require('../src/repositories/torneo.repository');

/* DATOS FICTICIOS DE PRUEBA */

const TORNEO_PRUEBA = Object.freeze({
    id: 1,
    nombre: 'TORNEO DE PRUEBA',
    descripcion: 'Competición ficticia',
    estado: 'ACTIVO',
    fecha_creacion: '2026-11-27T00:00:00.000Z',
    fecha_actualizacion: '2026-11-27T00:00:00.000Z'
});

/* CIERRE DE RECURSOS */

after(async () => {
    await pool.end();
});

/* VALIDACION DE IDENTIFICADORES */

test('Acepta identificadores enteros positivos', () => {
    assert.equal(torneoService.validarId(1), 1);
    assert.equal(torneoService.validarId('25'), 25);
});

test('Rechaza identificadores inválidos', () => {
    const valoresInvalidos = [
        0,
        -1,
        1.5,
        'abc',
        '',
        null,
        undefined,
        true,
        '1 OR 1=1',
        2147483648
    ];

    for (const valor of valoresInvalidos) {
        assert.throws(
            () => torneoService.validarId(valor),
            {
                name: 'TorneoError',
                status: 400
            }
        );
    }
});

/* VALIDACION DE NOMBRES */

test('Normaliza los espacios del nombre', () => {
    const resultado =
        torneoService.validarDatosTorneo({
            nombre: '  TORNEO   DE   PRUEBA  '
        });

    assert.equal(
        resultado.nombre,
        'TORNEO DE PRUEBA'
    );
});

test('Conserva correctamente los acentos y la Ñ', () => {
    const resultado =
        torneoService.validarDatosTorneo({
            nombre: 'CAMPEONATO CAÑADENSE',
            descripcion: 'Competición de fútbol'
        });

    assert.equal(
        resultado.nombre,
        'CAMPEONATO CAÑADENSE'
    );

    assert.equal(
        resultado.descripcion,
        'Competición de fútbol'
    );
});

test('Rechaza nombres vacíos o inválidos', () => {
    const nombresInvalidos = [
        '',
        '   ',
        null,
        undefined,
        123,
        true,
        []
    ];

    for (const nombre of nombresInvalidos) {
        assert.throws(
            () => torneoService.validarDatosTorneo({
                nombre
            }),
            {
                name: 'TorneoError',
                status: 400
            }
        );
    }
});

test('Controla el límite de 100 caracteres del nombre', () => {
    assert.equal(
        torneoService.validarDatosTorneo({
            nombre: 'A'.repeat(100)
        }).nombre.length,
        100
    );

    assert.throws(
        () => torneoService.validarDatosTorneo({
            nombre: 'A'.repeat(101)
        }),
        {
            name: 'TorneoError',
            status: 400
        }
    );
});

/* VALIDACION DE DESCRIPCIONES */

test('Permite descripciones opcionales', () => {
    for (const descripcion of [
        undefined,
        null,
        '',
        '   '
    ]) {
        const resultado =
            torneoService.validarDatosTorneo({
                nombre: 'TORNEO DE PRUEBA',
                descripcion
            });

        assert.equal(
            resultado.descripcion,
            null
        );
    }
});

test('Controla el tipo y la longitud de la descripción', () => {
    const resultado =
        torneoService.validarDatosTorneo({
            nombre: 'TORNEO DE PRUEBA',
            descripcion: 'A'.repeat(500)
        });

    assert.equal(
        resultado.descripcion.length,
        500
    );

    for (const descripcion of [
        123,
        true,
        {},
        [],
        'A'.repeat(501)
    ]) {
        assert.throws(
            () => torneoService.validarDatosTorneo({
                nombre: 'TORNEO DE PRUEBA',
                descripcion
            }),
            {
                name: 'TorneoError',
                status: 400
            }
        );
    }
});

/* PROTECCION DE CAMPOS */

test('Rechaza campos no autorizados', () => {
    assert.throws(
        () => torneoService.validarDatosTorneo({
            nombre: 'TORNEO DE PRUEBA',
            estado: 'ARCHIVADO'
        }),
        {
            name: 'TorneoError',
            status: 400
        }
    );

    assert.throws(
        () => torneoService.validarDatosTorneo({
            nombre: 'TORNEO DE PRUEBA',
            id: 25
        }),
        {
            name: 'TorneoError',
            status: 400
        }
    );
});

/* VALIDACION DE FILTROS */

test('Normaliza correctamente los filtros', () => {
    const resultado =
        torneoService.validarFiltros({
            busqueda: '  TORNEO   DE PRUEBA  ',
            estado: 'activo'
        });

    assert.deepEqual(resultado, {
        busqueda: 'TORNEO DE PRUEBA',
        estado: 'ACTIVO'
    });

    assert.deepEqual(
        torneoService.validarFiltros(),
        {
            busqueda: '',
            estado: null
        }
    );
});

test('Rechaza filtros inválidos', () => {
    const filtrosInvalidos = [
        { estado: 'ELIMINADO' },
        { busqueda: 123 },
        { busqueda: ['TORNEO'] },
        { busqueda: 'A'.repeat(501) },
        { filtroDesconocido: true }
    ];

    for (const filtros of filtrosInvalidos) {
        assert.throws(
            () => torneoService.validarFiltros(filtros),
            {
                name: 'TorneoError',
                status: 400
            }
        );
    }
});

/* VALIDACION DE ESTADOS */

test('Acepta únicamente estados administrativos válidos', () => {
    assert.equal(
        torneoService.validarEstado('activo'),
        'ACTIVO'
    );

    assert.equal(
        torneoService.validarEstado(' archivado '),
        'ARCHIVADO'
    );

    for (const estado of [
        'ELIMINADO',
        '',
        null,
        1,
        true
    ]) {
        assert.throws(
            () => torneoService.validarEstado(estado),
            {
                name: 'TorneoError',
                status: 400
            }
        );
    }
});

/* LISTADO DE TORNEOS */

test('Lista torneos aplicando filtros normalizados', async (t) => {
    const listado = [
        { ...TORNEO_PRUEBA }
    ];

    const mock = t.mock.method(
        torneoRepository,
        'listar',
        async () => listado
    );

    const resultado =
        await torneoService.listarTorneos({
            busqueda: '  PRUEBA  ',
            estado: 'activo'
        });

    assert.deepEqual(resultado, listado);

    assert.equal(mock.mock.callCount(), 1);

    assert.deepEqual(
        mock.mock.calls[0].arguments,
        [{
            busqueda: 'PRUEBA',
            estado: 'ACTIVO'
        }]
    );
});

/* CONSULTA INDIVIDUAL */

test('Obtiene un torneo existente', async (t) => {
    const mock = t.mock.method(
        torneoRepository,
        'buscarPorId',
        async () => ({ ...TORNEO_PRUEBA })
    );

    const resultado =
        await torneoService.obtenerTorneo('1');

    assert.deepEqual(
        resultado,
        TORNEO_PRUEBA
    );

    assert.deepEqual(
        mock.mock.calls[0].arguments,
        [1]
    );
});

test('Devuelve error 404 cuando el torneo no existe', async (t) => {
    t.mock.method(
        torneoRepository,
        'buscarPorId',
        async () => null
    );

    await assert.rejects(
        () => torneoService.obtenerTorneo(999),
        {
            name: 'TorneoError',
            status: 404
        }
    );
});

/* CREACION DE TORNEOS */

test('Crea un torneo con datos normalizados', async (t) => {
    const mock = t.mock.method(
        torneoRepository,
        'crear',
        async () => 1
    );

    t.mock.method(
        torneoRepository,
        'buscarPorId',
        async () => ({ ...TORNEO_PRUEBA })
    );

    const resultado =
        await torneoService.crearTorneo({
            nombre: '  TORNEO   DE PRUEBA  ',
            descripcion: ' Competición ficticia '
        });

    assert.deepEqual(
        mock.mock.calls[0].arguments,
        [{
            nombre: 'TORNEO DE PRUEBA',
            descripcion: 'Competición ficticia'
        }]
    );

    assert.equal(resultado.id, 1);
    assert.equal(resultado.estado, 'ACTIVO');
});

test('Rechaza la creación de torneos duplicados', async (t) => {
    t.mock.method(
        torneoRepository,
        'crear',
        async () => {
            const error = new Error(
                'Duplicate entry'
            );

            error.code = 'ER_DUP_ENTRY';

            throw error;
        }
    );

    await assert.rejects(
        () => torneoService.crearTorneo({
            nombre: 'TORNEO DE PRUEBA'
        }),
        {
            name: 'TorneoError',
            status: 409
        }
    );
});

/* ACTUALIZACION DE TORNEOS */

test('Actualiza el nombre y la descripción de un torneo', async (t) => {
    let torneo = {
        ...TORNEO_PRUEBA
    };

    t.mock.method(
        torneoRepository,
        'buscarPorId',
        async () => ({ ...torneo })
    );

    const mock = t.mock.method(
        torneoRepository,
        'actualizar',
        async (id, datos) => {
            torneo = {
                ...torneo,
                ...datos
            };

            return 1;
        }
    );

    const resultado =
        await torneoService.actualizarTorneo(1, {
            nombre: 'TORNEO MODIFICADO',
            descripcion: 'Nueva descripción'
        });

    assert.equal(
        resultado.nombre,
        'TORNEO MODIFICADO'
    );

    assert.equal(
        resultado.descripcion,
        'Nueva descripción'
    );

    assert.equal(
        resultado.estado,
        'ACTIVO'
    );

    assert.equal(
        mock.mock.callCount(),
        1
    );
});

test('Rechaza actualizaciones con nombres duplicados', async (t) => {
    t.mock.method(
        torneoRepository,
        'buscarPorId',
        async () => ({ ...TORNEO_PRUEBA })
    );

    t.mock.method(
        torneoRepository,
        'actualizar',
        async () => {
            const error = new Error(
                'Duplicate entry'
            );

            error.code = 'ER_DUP_ENTRY';

            throw error;
        }
    );

    await assert.rejects(
        () => torneoService.actualizarTorneo(1, {
            nombre: 'OTRO TORNEO'
        }),
        {
            name: 'TorneoError',
            status: 409
        }
    );
});

test('Evita actualizaciones cuando los datos no cambian', async (t) => {
    t.mock.method(
        torneoRepository,
        'buscarPorId',
        async () => ({ ...TORNEO_PRUEBA })
    );

    const mock = t.mock.method(
        torneoRepository,
        'actualizar',
        async () => 1
    );

    const resultado =
        await torneoService.actualizarTorneo(1, {
            nombre: TORNEO_PRUEBA.nombre,
            descripcion: TORNEO_PRUEBA.descripcion
        });

    assert.deepEqual(
        resultado,
        TORNEO_PRUEBA
    );

    assert.equal(
        mock.mock.callCount(),
        0
    );
});

/* ARCHIVADO Y REACTIVACION */

test('Archiva y reactiva un torneo conservando sus datos', async (t) => {
    let torneo = {
        ...TORNEO_PRUEBA
    };

    t.mock.method(
        torneoRepository,
        'buscarPorId',
        async () => ({ ...torneo })
    );

    const mock = t.mock.method(
        torneoRepository,
        'actualizarEstado',
        async (id, estado) => {
            torneo = {
                ...torneo,
                estado
            };

            return 1;
        }
    );

    const archivado =
        await torneoService.cambiarEstadoTorneo(
            1,
            { estado: 'ARCHIVADO' }
        );

    assert.equal(
        archivado.estado,
        'ARCHIVADO'
    );

    assert.equal(
        archivado.nombre,
        TORNEO_PRUEBA.nombre
    );

    assert.equal(
        archivado.id,
        TORNEO_PRUEBA.id
    );

    assert.equal(
        archivado.descripcion,
        TORNEO_PRUEBA.descripcion
    );

    const reactivado =
        await torneoService.cambiarEstadoTorneo(
            1,
            { estado: 'ACTIVO' }
        );

    assert.deepEqual(
        reactivado,
        TORNEO_PRUEBA
    );

    assert.equal(
        mock.mock.callCount(),
        2
    );
});

test('Evita cambios de estado innecesarios', async (t) => {
    t.mock.method(
        torneoRepository,
        'buscarPorId',
        async () => ({ ...TORNEO_PRUEBA })
    );

    const mock = t.mock.method(
        torneoRepository,
        'actualizarEstado',
        async () => 1
    );

    const resultado =
        await torneoService.cambiarEstadoTorneo(
            1,
            { estado: 'ACTIVO' }
        );

    assert.equal(
        resultado.estado,
        'ACTIVO'
    );

    assert.equal(
        mock.mock.callCount(),
        0
    );
});

test('Rechaza cambios de estado con datos no permitidos', async (t) => {
    const mock = t.mock.method(
        torneoRepository,
        'actualizarEstado',
        async () => 1
    );

    const datosInvalidos = [
        {},
        null,
        { estado: 'ELIMINADO' },
        {
            estado: 'ARCHIVADO',
            nombre: 'OTRO NOMBRE'
        }
    ];

    for (const datos of datosInvalidos) {
        await assert.rejects(
            () => torneoService.cambiarEstadoTorneo(
                1,
                datos
            ),
            {
                name: 'TorneoError',
                status: 400
            }
        );
    }

    assert.equal(
        mock.mock.callCount(),
        0
    );
});

/* ERRORES INESPERADOS */

test('Propaga errores inesperados de persistencia', async (t) => {
    t.mock.method(
        torneoRepository,
        'crear',
        async () => {
            throw new Error(
                'Error de conexión simulado'
            );
        }
    );

    await assert.rejects(
        () => torneoService.crearTorneo({
            nombre: 'TORNEO DE PRUEBA'
        }),
        {
            message: 'Error de conexión simulado'
        }
    );
});

/* ELIMINACION DEFINITIVA */

for (const estado of ['ACTIVO', 'ARCHIVADO']) {
    test(`Elimina únicamente el torneo ${estado} solicitado`, async (t) => {
        const registros = new Map([
            [1, { ...TORNEO_PRUEBA, estado }],
            [2, { ...TORNEO_PRUEBA, id: 2, nombre: 'OTRO TORNEO' }]
        ]);

        const otro = { ...registros.get(2) };

        const mock = t.mock.method(
            torneoRepository,
            'eliminar',
            async (id) => registros.delete(id) ? 1 : 0
        );

        await torneoService.eliminarTorneo('1');

        assert.equal(mock.mock.callCount(), 1);
        assert.deepEqual(mock.mock.calls[0].arguments, [1]);
        assert.equal(registros.has(1), false);
        assert.deepEqual(registros.get(2), otro);
    });
}

test('Rechaza identificadores inválidos antes de eliminar', async (t) => {
    const mock = t.mock.method(
        torneoRepository,
        'eliminar',
        async () => 1
    );

    for (const id of [0, -1, 1.5, 'abc', null, undefined, '1 OR 1=1', 2147483648]) {
        await assert.rejects(
            () => torneoService.eliminarTorneo(id),
            { name: 'TorneoError', status: 400 }
        );
    }

    assert.equal(mock.mock.callCount(), 0);
});

test('Devuelve 404 al intentar eliminar un torneo inexistente', async (t) => {
    t.mock.method(torneoRepository, 'eliminar', async () => 0);

    await assert.rejects(
        () => torneoService.eliminarTorneo(999),
        { name: 'TorneoError', status: 404 }
    );
});

test('Devuelve 409 cuando una clave foránea impide eliminar', async (t) => {
    for (const code of ['ER_ROW_IS_REFERENCED_2', 'ER_ROW_IS_REFERENCED']) {
        const mock = t.mock.method(torneoRepository, 'eliminar', async () => {
            throw Object.assign(new Error('Foreign key constraint'), { code });
        });

        try {
            await assert.rejects(
                () => torneoService.eliminarTorneo(1),
                { name: 'TorneoError', status: 409 }
            );
        } finally {
            mock.mock.restore();
        }
    }
});

test('Propaga errores inesperados al eliminar un torneo', async (t) => {
    const error = new Error('Error de conexión simulado');

    t.mock.method(torneoRepository, 'eliminar', async () => {
        throw error;
    });

    await assert.rejects(
        () => torneoService.eliminarTorneo(1),
        (recibido) => recibido === error
    );
});
