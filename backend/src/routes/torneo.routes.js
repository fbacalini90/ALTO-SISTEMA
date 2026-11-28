const express = require('express');

const torneoController =
    require('../controllers/torneo.controller');

const { requireAuth } =
    require('../middlewares/auth');

const router = express.Router();

/* PROTECCION DE TODAS LAS RUTAS */

router.use(requireAuth);

/* LISTAR TORNEOS */

router.get(
    '/',
    torneoController.listar
);

/* OBTENER TORNEO POR ID */

router.get(
    '/:id',
    torneoController.obtener
);

/* CREAR TORNEO */

router.post(
    '/',
    torneoController.crear
);

/* ACTUALIZAR TORNEO */

router.put(
    '/:id',
    torneoController.actualizar
);

/* ARCHIVAR O REACTIVAR TORNEO */

router.patch(
    '/:id/estado',
    torneoController.cambiarEstado
);

/* ELIMINAR TORNEO */

router.delete(
    '/:id',
    torneoController.eliminar
);

/* EXPORTACION */

module.exports = router;
