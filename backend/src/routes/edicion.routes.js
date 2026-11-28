
const express = require('express');

const { requireAuth } =
    require('../middlewares/auth');

const edicionController =
    require('../controllers/edicion.controller');


/* CONFIGURACION DEL ROUTER */

const router = express.Router({
    mergeParams: true
});


/* PROTECCION DEL MODULO */

router.use(requireAuth);


/* LISTADO DE EDICIONES */

router.get(
    '/',
    edicionController.listarEdiciones
);


/* CONSULTA INDIVIDUAL */

router.get(
    '/:edicionId',
    edicionController.obtenerEdicion
);


/* CREACION DE EDICIONES */

router.post(
    '/',
    edicionController.crearEdicion
);


/* ACTUALIZACION DE EDICIONES */

router.put(
    '/:edicionId',
    edicionController.actualizarEdicion
);


/* CAMBIO DE ESTADO */

router.patch(
    '/:edicionId/estado',
    edicionController.cambiarEstadoEdicion
);


/* ELIMINACION DEFINITIVA */

router.delete(
    '/:edicionId',
    edicionController.eliminarEdicion
);


/* EXPORTACION */

module.exports = router;
