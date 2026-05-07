const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/productosController');
const { verificarToken, soloAdmin } = require('../middleware/authMiddleware');

router.get('/',                    ctrl.obtenerProductos);
router.get('/admin/todos',         verificarToken, soloAdmin, ctrl.obtenerTodosAdmin);
router.get('/categoria/:categoriaId', ctrl.obtenerPorCategoria);
router.get('/:id',                 ctrl.obtenerProductoPorId);
router.post('/',                   verificarToken, soloAdmin, ctrl.crearProducto);
router.put('/:id',                 verificarToken, soloAdmin, ctrl.actualizarProducto);
router.delete('/:id',              verificarToken, soloAdmin, ctrl.eliminarProducto);

module.exports = router;