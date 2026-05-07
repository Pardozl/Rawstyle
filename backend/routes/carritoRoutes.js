const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/carritoController');
const { verificarToken } = require('../middleware/authMiddleware');

router.get('/',              verificarToken, ctrl.verCarrito);
router.post('/',             verificarToken, ctrl.agregarAlCarrito);
router.put('/:detalleId',    verificarToken, ctrl.actualizarCantidad);
router.delete('/vaciar',     verificarToken, ctrl.vaciarCarrito);
router.delete('/:detalleId', verificarToken, ctrl.eliminarDelCarrito);

module.exports = router;ports = router;