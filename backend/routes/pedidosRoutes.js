const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/pedidosController');
const { verificarToken, soloAdmin } = require('../middleware/authMiddleware');

router.post('/',                verificarToken, ctrl.crearPedido);
router.get('/',                 verificarToken, ctrl.misPedidos);
router.get('/admin/todos',      verificarToken, soloAdmin, ctrl.todosPedidos);
router.put('/admin/:id/estado', verificarToken, soloAdmin, ctrl.cambiarEstado);

module.exports = router;