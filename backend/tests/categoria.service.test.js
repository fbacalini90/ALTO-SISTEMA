'use strict';

const {
    test,
    beforeEach
} = require('node:test');

const assert = require('node:assert/strict');


/* ==================================================
   REPOSITORIO SIMULADO
   ================================================== */

const conexionSimulada = Object.freeze({
    prueba: true
});

let contextos;
let categorias;
let llamadas;
let fallos;
let siguienteId;


/* REGISTRO DE OPERACIONES */

function registrar(metodo, argumentos) {

    llamadas.push({
        metodo,
        argumentos
    });

    if (fallos[metodo]) {
        throw fallos[metodo];
    }
}

function cantidadLlamadas(metodo) {

    return llamadas.filter(
        llamada => llamada.metodo === metodo
    ).length;
}

function verificarConexion(conexion) {

    assert.equal(
        conexion,
        conexionSimulada,
        'La operación debe utilizar la conexión de la transacción.'
    );
}

function copiar(registro) {

    return registro
        ? { ...registro }
        : null;
}

function buscarContexto(torneoId, edicionId) {

    return contextos.find(contexto =>
        contexto.torneo_id === torneoId &&
        contexto.edicion_id === edicionId
    );
}

function buscarCategoria(edicionId, categoriaId) {

    return categorias.find(categoria =>
        categoria.edicion_id === edicionId &&
        categoria.id === categoriaId
    );
}

function normalizarBusqueda(valor) {

    return String(valor ?? '')
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .toLowerCase();
}


/* IMPLEMENTACION SIMULADA */

const repositorioSimulado = {

    async conTransaccion(operacion) {

        registrar('conTransaccion', []);

        return operacion(conexionSimulada);
    },


    async obtenerContexto(
        torneoId,
        edicionId,
        conexion
    ) {

        verificarConexion(conexion);

        registrar(
            'obtenerContexto',
            [torneoId, edicionId]
        );

        return copiar(
            buscarContexto(torneoId, edicionId)
        );
    },


    async bloquearContexto(
        torneoId,
        edicionId,
        conexion
    ) {

        verificarConexion(conexion);

        registrar(
            'bloquearContexto',
            [torneoId, edicionId]
        );

        return copiar(
            buscarContexto(torneoId, edicionId)
        );
    },


    async listar(
        edicionId,
        filtros,
        conexion
    ) {

        verificarConexion(conexion);

        registrar(
            'listar',
            [edicionId, filtros]
        );

        const busqueda = normalizarBusqueda(
            filtros?.busqueda
        );

        return categorias.filter(categoria => {

            const coincideEdicion =
                categoria.edicion_id === edicionId;

            const coincideEstado =
                !filtros?.estado ||
                categoria.estado === filtros.estado;

            const coincideBusqueda =
                !busqueda ||
                normalizarBusqueda(categoria.nombre)
                    .includes(busqueda) ||
                normalizarBusqueda(categoria.descripcion)
                    .includes(busqueda);

            return coincideEdicion &&
                coincideEstado &&
                coincideBusqueda;

        }).map(copiar);
    },


    async obtenerPorId(
        edicionId,
        categoriaId,
        conexion
    ) {

        verificarConexion(conexion);

        registrar(
            'obtenerPorId',
            [edicionId, categoriaId]
        );

        return copiar(
            buscarCategoria(edicionId, categoriaId)
        );
    },


    async crear(
        edicionId,
        datos,
        conexion
    ) {

        verificarConexion(conexion);

        registrar(
            'crear',
            [edicionId, datos]
        );

        const id = siguienteId++;

        categorias.push({
            id,
            edicion_id: edicionId,
            nombre: datos.nombre,
            descripcion: datos.descripcion ?? null,
            estado: 'ACTIVA',
            fecha_creacion: '2026-11-28 10:00:00',
            fecha_actualizacion: '2026-11-28 10:00:00'
        });

        return id;
    },


    async actualizar(
        edicionId,
        categoriaId,
        datos,
        conexion
    ) {

        verificarConexion(conexion);

        registrar(
            'actualizar',
            [edicionId, categoriaId, datos]
        );

        const categoria = buscarCategoria(
            edicionId,
            categoriaId
        );

        if (!categoria) {
            return 0;
        }

        categoria.nombre = datos.nombre;
        categoria.descripcion = datos.descripcion;

        return 1;
    },


    async cambiarEstado(
        edicionId,
        categoriaId,
        estado,
        conexion
    ) {

        verificarConexion(conexion);

        registrar(
            'cambiarEstado',
            [edicionId, categoriaId, estado]
        );

        const categoria = buscarCategoria(
            edicionId,
            categoriaId
        );

        if (!categoria) {
            return 0;
        }

        categoria.estado = estado;

        return 1;
    },


    async eliminar(
        edicionId,
        categoriaId,
        conexion
    ) {

        verificarConexion(conexion);

        registrar(
            'eliminar',
            [edicionId, categoriaId]
        );

        const indice = categorias.findIndex(
            categoria =>
                categoria.edicion_id === edicionId &&
                categoria.id === categoriaId
        );

        if (indice === -1) {
            return 0;
        }

        categorias.splice(indice, 1);

        return 1;
    },


    async obtenerIndicadores(
        edicionId,
        conexion
    ) {

        verificarConexion(conexion);

        registrar(
            'obtenerIndicadores',
            [edicionId]
        );

        const registros = categorias.filter(
            categoria =>
                categoria.edicion_id === edicionId
        );

        return {
            total: registros.length,

            activas: registros.filter(
                categoria =>
                    categoria.estado === 'ACTIVA'
            ).length,

            archivadas: registros.filter(
                categoria =>
                    categoria.estado === 'ARCHIVADA'
            ).length
        };
    }

};


/* ==================================================
   INYECCION DEL REPOSITORIO
   ================================================== */

const rutaRepositorio = require.resolve(
    '../src/repositories/categoria.repository'
);

const moduloAnterior =
    require.cache[rutaRepositorio];

require.cache[rutaRepositorio] = {
    id: rutaRepositorio,
    filename: rutaRepositorio,
    loaded: true,
    exports: repositorioSimulado
};

let servicio;

try {

    servicio = require(
        '../src/services/categoria.service'
    );

} finally {

    if (moduloAnterior) {

        require.cache[rutaRepositorio] =
            moduloAnterior;

    } else {

        delete require.cache[rutaRepositorio];

    }

}

const {
    CategoriaError,
    listarCategorias,
    obtenerCategoria,
    crearCategoria,
    actualizarCategoria,
    cambiarEstadoCategoria,
    eliminarCategoria
} = servicio;


/* ==================================================
   PREPARACION DE CADA PRUEBA
   ================================================== */

beforeEach(() => {

    llamadas = [];

    fallos = Object.create(null);

    siguienteId = 1000;

    contextos = [
        {
            torneo_id: 1,
            torneo_nombre: 'NOCTURNO',
            torneo_estado: 'ACTIVO',
            edicion_id: 10,
            edicion_nombre: 'NOCTURNO 2027',
            edicion_estado: 'PLANIFICADA'
        },
        {
            torneo_id: 1,
            torneo_nombre: 'NOCTURNO',
            torneo_estado: 'ACTIVO',
            edicion_id: 11,
            edicion_nombre: 'NOCTURNO 2028',
            edicion_estado: 'EN_CURSO'
        },
        {
            torneo_id: 2,
            torneo_nombre: 'DIURNO',
            torneo_estado: 'ACTIVO',
            edicion_id: 20,
            edicion_nombre: 'DIURNO 2027',
            edicion_estado: 'PLANIFICADA'
        }
    ];

    categorias = [
        {
            id: 100,
            edicion_id: 10,
            nombre: 'LIBRE',
            descripcion: 'Categoría libre',
            estado: 'ACTIVA'
        },
        {
            id: 101,
            edicion_id: 10,
            nombre: 'SENIOR',
            descripcion: 'Mayores de 35 años',
            estado: 'ARCHIVADA'
        },
        {
            id: 200,
            edicion_id: 11,
            nombre: 'LIBRE',
            descripcion: null,
            estado: 'ACTIVA'
        },
        {
            id: 300,
            edicion_id: 20,
            nombre: 'FEMENINO',
            descripcion: null,
            estado: 'ACTIVA'
        }
    ];

});


/* ==================================================
   FUNCIONES AUXILIARES DE PRUEBA
   ================================================== */

async function esperarError(
    operacion,
    estadoEsperado
) {

    await assert.rejects(
        async () => operacion(),
        error => {

            assert.ok(
                error instanceof CategoriaError
            );

            assert.equal(
                error.status,
                estadoEsperado
            );

            assert.ok(error.message);

            return true;
        }
    );
}

function establecerTorneoArchivado() {

    for (const contexto of contextos) {

        if (contexto.torneo_id === 1) {

            contexto.torneo_estado =
                'ARCHIVADO';

        }
    }
}

function establecerEdicionFinalizada() {

    contextos[0].edicion_estado =
        'FINALIZADA';
}

function simularErrorMySQL(metodo, codigo) {

    fallos[metodo] = Object.assign(
        new Error('Error simulado de MySQL'),
        {
            code: codigo
        }
    );
}


/* ==================================================
   01 - LISTADO Y CONTEXTO
   ================================================== */

test('Lista las categorías de la edición solicitada', async () => {

    const resultado = await listarCategorias(1, 10);

    assert.equal(resultado.torneo.id, 1);

    assert.equal(resultado.edicion.id, 10);

    assert.equal(resultado.total, 2);

    assert.deepEqual(
        resultado.categorias.map(categoria => categoria.id),
        [100, 101]
    );

    assert.deepEqual(
        resultado.indicadores,
        {
            total: 2,
            activas: 1,
            archivadas: 1
        }
    );
});


test('Lista categorías utilizando identificadores de texto', async () => {

    const resultado = await listarCategorias(
        '1',
        '10'
    );

    assert.equal(resultado.total, 2);
});


test('Devuelve cero categorías para una edición vacía', async () => {

    categorias = [];

    const resultado = await listarCategorias(1, 10);

    assert.deepEqual(resultado.categorias, []);

    assert.equal(resultado.total, 0);

    assert.deepEqual(
        resultado.indicadores,
        {
            total: 0,
            activas: 0,
            archivadas: 0
        }
    );
});


test('No mezcla categorías de diferentes ediciones', async () => {

    const resultado = await listarCategorias(1, 11);

    assert.equal(resultado.total, 1);

    assert.equal(
        resultado.categorias[0].id,
        200
    );
});


test('No mezcla categorías de diferentes torneos', async () => {

    const resultado = await listarCategorias(2, 20);

    assert.equal(resultado.total, 1);

    assert.equal(
        resultado.categorias[0].id,
        300
    );
});


test('Rechaza una edición perteneciente a otro torneo', async () => {

    await esperarError(
        () => listarCategorias(1, 20),
        404
    );
});


test('Rechaza una edición inexistente', async () => {

    await esperarError(
        () => listarCategorias(1, 999),
        404
    );
});


test('Rechaza un torneo inexistente', async () => {

    await esperarError(
        () => listarCategorias(999, 10),
        404
    );
});


test('Permite consultar categorías de un torneo archivado', async () => {

    establecerTorneoArchivado();

    const resultado = await listarCategorias(1, 10);

    assert.equal(resultado.total, 2);

    assert.equal(
        resultado.torneo.estado,
        'ARCHIVADO'
    );
});


test('Permite consultar categorías de una edición finalizada', async () => {

    establecerEdicionFinalizada();

    const resultado = await listarCategorias(1, 10);

    assert.equal(resultado.total, 2);

    assert.equal(
        resultado.edicion.estado,
        'FINALIZADA'
    );
});


/* ==================================================
   02 - FILTROS Y BUSQUEDA
   ================================================== */

test('Filtra categorías activas', async () => {

    const resultado = await listarCategorias(
        1,
        10,
        {
            estado: 'ACTIVA'
        }
    );

    assert.equal(resultado.total, 1);

    assert.equal(
        resultado.categorias[0].nombre,
        'LIBRE'
    );
});


test('Filtra categorías archivadas', async () => {

    const resultado = await listarCategorias(
        1,
        10,
        {
            estado: 'ARCHIVADA'
        }
    );

    assert.equal(resultado.total, 1);

    assert.equal(
        resultado.categorias[0].nombre,
        'SENIOR'
    );
});


test('Los indicadores generales no dependen del filtro aplicado', async () => {

    const resultado = await listarCategorias(
        1,
        10,
        {
            estado: 'ACTIVA'
        }
    );

    assert.equal(resultado.total, 1);

    assert.equal(
        resultado.indicadores.total,
        2
    );

    assert.equal(
        resultado.indicadores.archivadas,
        1
    );
});


test('Permite buscar categorías por nombre', async () => {

    const resultado = await listarCategorias(
        1,
        10,
        {
            busqueda: 'senior'
        }
    );

    assert.equal(resultado.total, 1);

    assert.equal(
        resultado.categorias[0].id,
        101
    );
});


test('Permite buscar categorías por descripción', async () => {

    const resultado = await listarCategorias(
        1,
        10,
        {
            busqueda: '35 años'
        }
    );

    assert.equal(resultado.total, 1);

    assert.equal(
        resultado.categorias[0].id,
        101
    );
});


test('Rechaza estados de filtro inválidos', async () => {

    await esperarError(
        () => listarCategorias(
            1,
            10,
            {
                estado: 'INEXISTENTE'
            }
        ),
        400
    );
});


test('Rechaza filtros desconocidos', async () => {

    await esperarError(
        () => listarCategorias(
            1,
            10,
            {
                filtroInventado: 'valor'
            }
        ),
        400
    );
});


test('Rechaza una búsqueda superior al límite permitido', async () => {

    await esperarError(
        () => listarCategorias(
            1,
            10,
            {
                busqueda: 'a'.repeat(501)
            }
        ),
        400
    );
});


/* ==================================================
   03 - IDENTIFICADORES
   ================================================== */

for (const idInvalido of [
    0,
    -1,
    1.5,
    '',
    'abc',
    '1e2',
    '1.5',
    null,
    true,
    2147483648
]) {

    test(
        `Rechaza identificador inválido: ${JSON.stringify(idInvalido)}`,
        async () => {

            await esperarError(
                () => listarCategorias(idInvalido, 10),
                400
            );

            await esperarError(
                () => listarCategorias(1, idInvalido),
                400
            );

            await esperarError(
                () => obtenerCategoria(
                    1,
                    10,
                    idInvalido
                ),
                400
            );

        }
    );
}


/* ==================================================
   04 - CONSULTA INDIVIDUAL
   ================================================== */

test('Obtiene una categoría existente', async () => {

    const resultado = await obtenerCategoria(
        1,
        10,
        100
    );

    assert.equal(resultado.id, 100);

    assert.equal(resultado.nombre, 'LIBRE');
});


test('Rechaza una categoría inexistente', async () => {

    await esperarError(
        () => obtenerCategoria(1, 10, 999),
        404
    );
});


test('Impide consultar una categoría de otra edición', async () => {

    await esperarError(
        () => obtenerCategoria(1, 10, 200),
        404
    );
});


test('Impide consultar una categoría de otro torneo', async () => {

    await esperarError(
        () => obtenerCategoria(1, 10, 300),
        404
    );
});


/* ==================================================
   05 - CREACION DE CATEGORIAS
   ================================================== */

test('Crea una categoría en estado ACTIVA', async () => {

    const resultado = await crearCategoria(
        1,
        10,
        {
            nombre: 'FEMENINO',
            descripcion: 'Categoría femenina'
        }
    );

    assert.equal(resultado.id, 1000);

    assert.equal(resultado.edicion_id, 10);

    assert.equal(resultado.nombre, 'FEMENINO');

    assert.equal(resultado.estado, 'ACTIVA');

    assert.equal(
        cantidadLlamadas('crear'),
        1
    );
});


test('Permite crear categorías sin descripción', async () => {

    const resultado = await crearCategoria(
        1,
        10,
        {
            nombre: 'SUB 21'
        }
    );

    assert.equal(
        resultado.descripcion,
        null
    );
});


test('Normaliza espacios del nombre', async () => {

    const resultado = await crearCategoria(
        1,
        10,
        {
            nombre: '   SENIOR    PLUS   '
        }
    );

    assert.equal(
        resultado.nombre,
        'SENIOR PLUS'
    );
});


test('Normaliza el nombre mediante Unicode NFC', async () => {

    const resultado = await crearCategoria(
        1,
        10,
        {
            nombre: 'CATEGORI\u0301A'
        }
    );

    assert.equal(
        resultado.nombre,
        'CATEGORÍA'
    );
});


test('Normaliza una descripción vacía como null', async () => {

    const resultado = await crearCategoria(
        1,
        10,
        {
            nombre: 'SUB 23',
            descripcion: '   '
        }
    );

    assert.equal(resultado.descripcion, null);
});


test('Acepta un nombre de exactamente 100 caracteres', async () => {

    const resultado = await crearCategoria(
        1,
        10,
        {
            nombre: 'A'.repeat(100)
        }
    );

    assert.equal(resultado.nombre.length, 100);
});


test('Acepta una descripción de exactamente 500 caracteres', async () => {

    const resultado = await crearCategoria(
        1,
        10,
        {
            nombre: 'SUB 23',
            descripcion: 'A'.repeat(500)
        }
    );

    assert.equal(
        resultado.descripcion.length,
        500
    );
});


test('Rechaza un nombre de más de 100 caracteres', async () => {

    await esperarError(
        () => crearCategoria(
            1,
            10,
            {
                nombre: 'A'.repeat(101)
            }
        ),
        400
    );

    assert.equal(
        cantidadLlamadas('crear'),
        0
    );
});


test('Rechaza una descripción de más de 500 caracteres', async () => {

    await esperarError(
        () => crearCategoria(
            1,
            10,
            {
                nombre: 'SUB 23',
                descripcion: 'A'.repeat(501)
            }
        ),
        400
    );
});


for (const datosInvalidos of [
    null,
    [],
    {},
    { nombre: '' },
    { nombre: '   ' },
    { nombre: 123 },
    { nombre: true },
    { nombre: 'SUB 23', descripcion: 123 },
    { nombre: 'SUB 23', estado: 'ARCHIVADA' },
    { nombre: 'SUB 23', edicion_id: 11 },
    { nombre: 'SUB 23', campoDesconocido: true }
]) {

    test(
        `Rechaza creación inválida: ${JSON.stringify(datosInvalidos)}`,
        async () => {

            await esperarError(
                () => crearCategoria(
                    1,
                    10,
                    datosInvalidos
                ),
                400
            );

            assert.equal(
                cantidadLlamadas('crear'),
                0
            );

        }
    );
}


test('Permite crear categorías en una edición en curso', async () => {

    const resultado = await crearCategoria(
        1,
        11,
        {
            nombre: 'SUB 23'
        }
    );

    assert.equal(resultado.edicion_id, 11);

    assert.equal(resultado.estado, 'ACTIVA');
});


test('Impide crear categorías en un torneo archivado', async () => {

    establecerTorneoArchivado();

    await esperarError(
        () => crearCategoria(
            1,
            10,
            {
                nombre: 'SUB 23'
            }
        ),
        409
    );

    assert.equal(
        cantidadLlamadas('crear'),
        0
    );
});


test('Impide crear categorías en una edición finalizada', async () => {

    establecerEdicionFinalizada();

    await esperarError(
        () => crearCategoria(
            1,
            10,
            {
                nombre: 'SUB 23'
            }
        ),
        409
    );

    assert.equal(
        cantidadLlamadas('crear'),
        0
    );
});


test('Permite repetir nombres en otra edición', async () => {

    const resultado = await crearCategoria(
        1,
        11,
        {
            nombre: 'SENIOR'
        }
    );

    assert.equal(resultado.nombre, 'SENIOR');

    assert.equal(resultado.edicion_id, 11);
});


test('Permite repetir nombres en otro torneo', async () => {

    const resultado = await crearCategoria(
        2,
        20,
        {
            nombre: 'LIBRE'
        }
    );

    assert.equal(resultado.nombre, 'LIBRE');

    assert.equal(resultado.edicion_id, 20);
});


/* ==================================================
   06 - ACTUALIZACION DE CATEGORIAS
   ================================================== */

test('Actualiza el nombre y descripción de una categoría', async () => {

    const resultado = await actualizarCategoria(
        1,
        10,
        100,
        {
            nombre: 'LIBRE A',
            descripcion: 'Primera categoría'
        }
    );

    assert.equal(resultado.id, 100);

    assert.equal(resultado.nombre, 'LIBRE A');

    assert.equal(
        resultado.descripcion,
        'Primera categoría'
    );

    assert.equal(resultado.edicion_id, 10);

    assert.equal(resultado.estado, 'ACTIVA');
});


test('Permite actualizar únicamente el nombre', async () => {

    const resultado = await actualizarCategoria(
        1,
        10,
        100,
        {
            nombre: 'LIBRE A'
        }
    );

    assert.equal(resultado.nombre, 'LIBRE A');

    assert.equal(
        resultado.descripcion,
        'Categoría libre'
    );
});


test('Permite actualizar únicamente la descripción', async () => {

    const resultado = await actualizarCategoria(
        1,
        10,
        100,
        {
            descripcion: 'Nueva descripción'
        }
    );

    assert.equal(resultado.nombre, 'LIBRE');

    assert.equal(
        resultado.descripcion,
        'Nueva descripción'
    );
});


test('Permite quitar la descripción', async () => {

    const resultado = await actualizarCategoria(
        1,
        10,
        100,
        {
            descripcion: null
        }
    );

    assert.equal(resultado.descripcion, null);
});


test('Permite editar una categoría archivada', async () => {

    const resultado = await actualizarCategoria(
        1,
        10,
        101,
        {
            nombre: 'SENIOR PLUS'
        }
    );

    assert.equal(resultado.nombre, 'SENIOR PLUS');

    assert.equal(resultado.estado, 'ARCHIVADA');
});


test('Permite editar categorías de un torneo archivado', async () => {

    establecerTorneoArchivado();

    const resultado = await actualizarCategoria(
        1,
        10,
        100,
        {
            nombre: 'LIBRE MODIFICADA'
        }
    );

    assert.equal(
        resultado.nombre,
        'LIBRE MODIFICADA'
    );
});


test('Permite editar categorías de una edición finalizada', async () => {

    establecerEdicionFinalizada();

    const resultado = await actualizarCategoria(
        1,
        10,
        100,
        {
            nombre: 'LIBRE MODIFICADA'
        }
    );

    assert.equal(
        resultado.nombre,
        'LIBRE MODIFICADA'
    );
});


test('Evita escrituras cuando los datos no cambiaron', async () => {

    const resultado = await actualizarCategoria(
        1,
        10,
        100,
        {
            nombre: 'LIBRE',
            descripcion: 'Categoría libre'
        }
    );

    assert.equal(resultado.nombre, 'LIBRE');

    assert.equal(
        cantidadLlamadas('actualizar'),
        0
    );
});


test('Impide modificar la edición de una categoría', async () => {

    await esperarError(
        () => actualizarCategoria(
            1,
            10,
            100,
            {
                edicion_id: 11
            }
        ),
        400
    );
});


test('Impide modificar el estado mediante la edición general', async () => {

    await esperarError(
        () => actualizarCategoria(
            1,
            10,
            100,
            {
                estado: 'ARCHIVADA'
            }
        ),
        400
    );
});


test('Impide editar una categoría de otra edición', async () => {

    await esperarError(
        () => actualizarCategoria(
            1,
            10,
            200,
            {
                nombre: 'MODIFICADA'
            }
        ),
        404
    );

    assert.equal(
        cantidadLlamadas('actualizar'),
        0
    );
});


test('Rechaza actualizar una categoría inexistente', async () => {

    await esperarError(
        () => actualizarCategoria(
            1,
            10,
            999,
            {
                nombre: 'MODIFICADA'
            }
        ),
        404
    );
});


test('Rechaza un nombre vacío durante la edición', async () => {

    await esperarError(
        () => actualizarCategoria(
            1,
            10,
            100,
            {
                nombre: '   '
            }
        ),
        400
    );
});


/* ==================================================
   07 - CAMBIOS DE ESTADO
   ================================================== */

test('Archiva una categoría activa', async () => {

    const resultado = await cambiarEstadoCategoria(
        1,
        10,
        100,
        {
            estado: 'ARCHIVADA'
        }
    );

    assert.equal(
        resultado.estado,
        'ARCHIVADA'
    );

    assert.equal(
        cantidadLlamadas('cambiarEstado'),
        1
    );
});


test('Reactiva una categoría archivada', async () => {

    const resultado = await cambiarEstadoCategoria(
        1,
        10,
        101,
        {
            estado: 'ACTIVA'
        }
    );

    assert.equal(resultado.estado, 'ACTIVA');
});


test('Normaliza estados escritos en minúsculas', async () => {

    const resultado = await cambiarEstadoCategoria(
        1,
        10,
        101,
        {
            estado: '  activa  '
        }
    );

    assert.equal(resultado.estado, 'ACTIVA');
});


test('Permite archivar categorías de un torneo archivado', async () => {

    establecerTorneoArchivado();

    const resultado = await cambiarEstadoCategoria(
        1,
        10,
        100,
        {
            estado: 'ARCHIVADA'
        }
    );

    assert.equal(resultado.estado, 'ARCHIVADA');
});


test('Permite archivar categorías de una edición finalizada', async () => {

    establecerEdicionFinalizada();

    const resultado = await cambiarEstadoCategoria(
        1,
        10,
        100,
        {
            estado: 'ARCHIVADA'
        }
    );

    assert.equal(resultado.estado, 'ARCHIVADA');
});


test('Impide reactivar categorías de un torneo archivado', async () => {

    establecerTorneoArchivado();

    await esperarError(
        () => cambiarEstadoCategoria(
            1,
            10,
            101,
            {
                estado: 'ACTIVA'
            }
        ),
        409
    );

    assert.equal(
        cantidadLlamadas('cambiarEstado'),
        0
    );
});


test('Impide reactivar categorías de una edición finalizada', async () => {

    establecerEdicionFinalizada();

    await esperarError(
        () => cambiarEstadoCategoria(
            1,
            10,
            101,
            {
                estado: 'ACTIVA'
            }
        ),
        409
    );

    assert.equal(
        cantidadLlamadas('cambiarEstado'),
        0
    );
});


test('Permite solicitar el mismo estado sin realizar escrituras', async () => {

    const resultado = await cambiarEstadoCategoria(
        1,
        10,
        100,
        {
            estado: 'ACTIVA'
        }
    );

    assert.equal(resultado.estado, 'ACTIVA');

    assert.equal(
        cantidadLlamadas('cambiarEstado'),
        0
    );
});


test('Permite conservar el mismo estado en un contexto restringido', async () => {

    establecerEdicionFinalizada();

    const resultado = await cambiarEstadoCategoria(
        1,
        10,
        100,
        {
            estado: 'ACTIVA'
        }
    );

    assert.equal(resultado.estado, 'ACTIVA');

    assert.equal(
        cantidadLlamadas('cambiarEstado'),
        0
    );
});


for (const datosInvalidos of [
    {},
    null,
    { estado: 'FINALIZADA' },
    { estado: 'EN_CURSO' },
    { estado: '' },
    { estado: 123 },
    { estado: 'ACTIVA', nombre: 'MODIFICADA' }
]) {

    test(
        `Rechaza cambio de estado inválido: ${JSON.stringify(datosInvalidos)}`,
        async () => {

            await esperarError(
                () => cambiarEstadoCategoria(
                    1,
                    10,
                    100,
                    datosInvalidos
                ),
                400
            );

            assert.equal(
                cantidadLlamadas('cambiarEstado'),
                0
            );

        }
    );
}


test('Impide cambiar el estado de una categoría de otra edición', async () => {

    await esperarError(
        () => cambiarEstadoCategoria(
            1,
            10,
            200,
            {
                estado: 'ARCHIVADA'
            }
        ),
        404
    );
});


/* ==================================================
   08 - ELIMINACION DEFINITIVA
   ================================================== */

test('Elimina una categoría activa', async () => {

    await eliminarCategoria(1, 10, 100);

    assert.equal(
        buscarCategoria(10, 100),
        undefined
    );

    assert.equal(
        cantidadLlamadas('eliminar'),
        1
    );
});


test('Elimina una categoría archivada', async () => {

    await eliminarCategoria(1, 10, 101);

    assert.equal(
        buscarCategoria(10, 101),
        undefined
    );
});


test('Permite eliminar categorías de un torneo archivado', async () => {

    establecerTorneoArchivado();

    await eliminarCategoria(1, 10, 100);

    assert.equal(
        buscarCategoria(10, 100),
        undefined
    );
});


test('Permite eliminar categorías de una edición finalizada', async () => {

    establecerEdicionFinalizada();

    await eliminarCategoria(1, 10, 100);

    assert.equal(
        buscarCategoria(10, 100),
        undefined
    );
});


test('Impide eliminar una categoría de otra edición', async () => {

    await esperarError(
        () => eliminarCategoria(1, 10, 200),
        404
    );

    assert.ok(
        buscarCategoria(11, 200)
    );

    assert.equal(
        cantidadLlamadas('eliminar'),
        0
    );
});


test('Rechaza eliminar una categoría inexistente', async () => {

    await esperarError(
        () => eliminarCategoria(1, 10, 999),
        404
    );
});


test('Eliminar una categoría preserva las restantes', async () => {

    await eliminarCategoria(1, 10, 100);

    assert.equal(categorias.length, 3);

    assert.ok(buscarCategoria(10, 101));

    assert.ok(buscarCategoria(11, 200));

    assert.ok(buscarCategoria(20, 300));
});


/* ==================================================
   09 - ERRORES DE PERSISTENCIA
   ================================================== */

test('Convierte un nombre duplicado al crear en conflicto HTTP 409', async () => {

    simularErrorMySQL(
        'crear',
        'ER_DUP_ENTRY'
    );

    await esperarError(
        () => crearCategoria(
            1,
            10,
            {
                nombre: 'LIBRE'
            }
        ),
        409
    );
});


test('Convierte un nombre duplicado al editar en conflicto HTTP 409', async () => {

    simularErrorMySQL(
        'actualizar',
        'ER_DUP_ENTRY'
    );

    await esperarError(
        () => actualizarCategoria(
            1,
            10,
            100,
            {
                nombre: 'SENIOR'
            }
        ),
        409
    );
});


test('Impide eliminar una categoría con dependencias', async () => {

    simularErrorMySQL(
        'eliminar',
        'ER_ROW_IS_REFERENCED_2'
    );

    await esperarError(
        () => eliminarCategoria(1, 10, 100),
        409
    );

    assert.ok(
        buscarCategoria(10, 100)
    );
});


test('Gestiona la pérdida de una referencia durante la creación', async () => {

    simularErrorMySQL(
        'crear',
        'ER_NO_REFERENCED_ROW_2'
    );

    await esperarError(
        () => crearCategoria(
            1,
            10,
            {
                nombre: 'SUB 23'
            }
        ),
        409
    );
});


test('Gestiona un bloqueo mutuo de MySQL', async () => {

    simularErrorMySQL(
        'bloquearContexto',
        'ER_LOCK_DEADLOCK'
    );

    await esperarError(
        () => crearCategoria(
            1,
            10,
            {
                nombre: 'SUB 23'
            }
        ),
        409
    );

    assert.equal(
        cantidadLlamadas('crear'),
        0
    );
});


test('Gestiona el tiempo de espera de un bloqueo MySQL', async () => {

    simularErrorMySQL(
        'bloquearContexto',
        'ER_LOCK_WAIT_TIMEOUT'
    );

    await esperarError(
        () => crearCategoria(
            1,
            10,
            {
                nombre: 'SUB 23'
            }
        ),
        409
    );
});


test('Conserva los errores inesperados de persistencia', async () => {

    const errorOriginal =
        new Error('Fallo inesperado');

    fallos.crear = errorOriginal;

    await assert.rejects(
        () => crearCategoria(
            1,
            10,
            {
                nombre: 'SUB 23'
            }
        ),
        error => {

            assert.equal(
                error,
                errorOriginal
            );

            return true;
        }
    );
});


/* ==================================================
   10 - TRANSACCIONES Y BLOQUEOS
   ================================================== */

test('Las consultas utilizan una transacción de lectura', async () => {

    await listarCategorias(1, 10);

    assert.equal(
        cantidadLlamadas('conTransaccion'),
        1
    );

    assert.equal(
        cantidadLlamadas('obtenerContexto'),
        1
    );

    assert.equal(
        cantidadLlamadas('bloquearContexto'),
        0
    );
});


test('La creación bloquea el contexto antes de insertar', async () => {

    await crearCategoria(
        1,
        10,
        {
            nombre: 'SUB 23'
        }
    );

    const metodos = llamadas.map(
        llamada => llamada.metodo
    );

    assert.equal(
        cantidadLlamadas('conTransaccion'),
        1
    );

    assert.ok(
        metodos.indexOf('bloquearContexto') >= 0
    );

    assert.ok(
        metodos.indexOf('bloquearContexto') <
        metodos.indexOf('crear')
    );
});


test('La edición bloquea el contexto antes de actualizar', async () => {

    await actualizarCategoria(
        1,
        10,
        100,
        {
            nombre: 'LIBRE A'
        }
    );

    const metodos = llamadas.map(
        llamada => llamada.metodo
    );

    assert.ok(
        metodos.indexOf('bloquearContexto') >= 0
    );

    assert.ok(
        metodos.indexOf('bloquearContexto') <
        metodos.indexOf('actualizar')
    );
});


test('El cambio de estado bloquea el contexto antes de escribir', async () => {

    await cambiarEstadoCategoria(
        1,
        10,
        100,
        {
            estado: 'ARCHIVADA'
        }
    );

    const metodos = llamadas.map(
        llamada => llamada.metodo
    );

    assert.ok(
        metodos.indexOf('bloquearContexto') >= 0
    );

    assert.ok(
        metodos.indexOf('bloquearContexto') <
        metodos.indexOf('cambiarEstado')
    );
});


test('La eliminación bloquea el contexto antes de borrar', async () => {

    await eliminarCategoria(1, 10, 100);

    const metodos = llamadas.map(
        llamada => llamada.metodo
    );

    assert.ok(
        metodos.indexOf('bloquearContexto') >= 0
    );

    assert.ok(
        metodos.indexOf('bloquearContexto') <
        metodos.indexOf('eliminar')
    );
});


/* ==================================================
   11 - CONSISTENCIA DE INDICADORES
   ================================================== */

test('Actualiza los indicadores después de crear una categoría', async () => {

    await crearCategoria(
        1,
        10,
        {
            nombre: 'SUB 23'
        }
    );

    const resultado = await listarCategorias(1, 10);

    assert.deepEqual(
        resultado.indicadores,
        {
            total: 3,
            activas: 2,
            archivadas: 1
        }
    );
});


test('Actualiza los indicadores después de archivar', async () => {

    await cambiarEstadoCategoria(
        1,
        10,
        100,
        {
            estado: 'ARCHIVADA'
        }
    );

    const resultado = await listarCategorias(1, 10);

    assert.deepEqual(
        resultado.indicadores,
        {
            total: 2,
            activas: 0,
            archivadas: 2
        }
    );
});


test('Actualiza los indicadores después de reactivar', async () => {

    await cambiarEstadoCategoria(
        1,
        10,
        101,
        {
            estado: 'ACTIVA'
        }
    );

    const resultado = await listarCategorias(1, 10);

    assert.deepEqual(
        resultado.indicadores,
        {
            total: 2,
            activas: 2,
            archivadas: 0
        }
    );
});


test('Actualiza los indicadores después de eliminar', async () => {

    await eliminarCategoria(1, 10, 100);

    const resultado = await listarCategorias(1, 10);

    assert.deepEqual(
        resultado.indicadores,
        {
            total: 1,
            activas: 0,
            archivadas: 1
        }
    );
});


test('Las operaciones no modifican indicadores de otras ediciones', async () => {

    const antes = await listarCategorias(1, 11);

    await crearCategoria(
        1,
        10,
        {
            nombre: 'SUB 23'
        }
    );

    await eliminarCategoria(1, 10, 100);

    const despues = await listarCategorias(1, 11);

    assert.deepEqual(
        despues.indicadores,
        antes.indicadores
    );

    assert.deepEqual(
        despues.categorias,
        antes.categorias
    );
});