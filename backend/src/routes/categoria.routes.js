'use strict';

const express = require('express');

const {
    requireAuth
} = require('../middlewares/auth');

const categoriaController = require(
    '../controllers/categoria.controller'
);

/* CONFIGURACION DEL ROUTER */

const router = express.Router({
    mergeParams: true
});

/* PROTECCION DE RUTAS */

router.use(requireAuth);

/* LISTAR CATEGORIAS */

router.get(
    '/',
    categoriaController.listarCategorias
);

/* OBTENER CATEGORIA */

router.get(
    '/:categoriaId',
    categoriaController.obtenerCategoria
);

/* CREAR CATEGORIA */

router.post(
    '/',
    categoriaController.crearCategoria
);

/* ACTUALIZAR CATEGORIA */

router.put(
    '/:categoriaId',
    categoriaController.actualizarCategoria
);

/* CAMBIAR ESTADO */

router.patch(
    '/:categoriaId/estado',
    categoriaController.cambiarEstadoCategoria
);

/* ELIMINAR CATEGORIA */

router.delete(
    '/:categoriaId',
    categoriaController.eliminarCategoria
);

/* EXPORTACION */

module.exports = router;