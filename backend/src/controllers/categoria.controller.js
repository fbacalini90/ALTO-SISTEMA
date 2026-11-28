'use strict';

const categoriaService = require('../services/categoria.service');

const {
    CategoriaError
} = categoriaService;

/* TRATAMIENTO DE ERRORES */

function responderError(res, error) {
    if (error instanceof CategoriaError) {
        return res.status(error.status).json({
            mensaje: error.message
        });
    }

    console.error(
        'Error en el controlador de categorías:',
        error
    );

    return res.status(500).json({
        mensaje: 'Ocurrió un error interno al gestionar las categorías.'
    });
}

/* LISTAR CATEGORIAS */

async function listarCategorias(req, res) {
    try {
        const { torneoId, edicionId } = req.params;

        const resultado =
            await categoriaService.listarCategorias(
                torneoId,
                edicionId,
                req.query
            );

        return res.status(200).json(resultado);

    } catch (error) {
        return responderError(res, error);
    }
}

/* OBTENER CATEGORIA */

async function obtenerCategoria(req, res) {
    try {
        const {
            torneoId,
            edicionId,
            categoriaId
        } = req.params;

        const categoria =
            await categoriaService.obtenerCategoria(
                torneoId,
                edicionId,
                categoriaId
            );

        return res.status(200).json({
            categoria
        });

    } catch (error) {
        return responderError(res, error);
    }
}

/* CREAR CATEGORIA */

async function crearCategoria(req, res) {
    try {
        const { torneoId, edicionId } = req.params;

        const categoria =
            await categoriaService.crearCategoria(
                torneoId,
                edicionId,
                req.body
            );

        const ubicacion =
            `/api/torneos/${Number(torneoId)}` +
            `/ediciones/${Number(edicionId)}` +
            `/categorias/${categoria.id}`;

        return res
            .location(ubicacion)
            .status(201)
            .json({
                mensaje: 'Categoría creada correctamente.',
                categoria
            });

    } catch (error) {
        return responderError(res, error);
    }
}

/* ACTUALIZAR CATEGORIA */

async function actualizarCategoria(req, res) {
    try {
        const {
            torneoId,
            edicionId,
            categoriaId
        } = req.params;

        const categoria =
            await categoriaService.actualizarCategoria(
                torneoId,
                edicionId,
                categoriaId,
                req.body
            );

        return res.status(200).json({
            mensaje: 'Categoría actualizada correctamente.',
            categoria
        });

    } catch (error) {
        return responderError(res, error);
    }
}

/* CAMBIAR ESTADO */

async function cambiarEstadoCategoria(req, res) {
    try {
        const {
            torneoId,
            edicionId,
            categoriaId
        } = req.params;

        const categoria =
            await categoriaService.cambiarEstadoCategoria(
                torneoId,
                edicionId,
                categoriaId,
                req.body
            );

        const mensaje =
            categoria.estado === 'ACTIVA'
                ? 'Categoría activada correctamente.'
                : 'Categoría archivada correctamente.';

        return res.status(200).json({
            mensaje,
            categoria
        });

    } catch (error) {
        return responderError(res, error);
    }
}

/* ELIMINAR CATEGORIA */

async function eliminarCategoria(req, res) {
    try {
        const {
            torneoId,
            edicionId,
            categoriaId
        } = req.params;

        await categoriaService.eliminarCategoria(
            torneoId,
            edicionId,
            categoriaId
        );

        return res.status(200).json({
            mensaje: 'Categoría eliminada correctamente.'
        });

    } catch (error) {
        return responderError(res, error);
    }
}

/* EXPORTACIONES */

module.exports = {
    listarCategorias,
    obtenerCategoria,
    crearCategoria,
    actualizarCategoria,
    cambiarEstadoCategoria,
    eliminarCategoria
};