const db = require('../config/db');

// GET
async function misPedidos(req, res) {
    try {
        const [pedidos] = await db.query(`
      SELECT p.id, p.total, p.costo_envio, p.estado,
             p.metodo_pago, p.direccion_envio, p.creado_en
      FROM pedidos p
      WHERE p.usuario_id = ?
      ORDER BY p.creado_en DESC
    `, [req.usuario.id]);

        for (const pedido of pedidos) {
            const [detalle] = await db.query(`
        SELECT dp.cantidad, dp.precio_unitario,
               pr.nombre, pr.imagen_url
        FROM detalle_pedido dp
        JOIN productos pr ON dp.producto_id = pr.id
        WHERE dp.pedido_id = ?
      `, [pedido.id]);
            pedido.productos = detalle;
        }

        res.json(pedidos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al obtener pedidos.' });
    }
}


async function todosPedidos(req, res) {
    try {
        const [pedidos] = await db.query(`
      SELECT p.*, u.nombre AS cliente, u.email
      FROM pedidos p
      JOIN usuarios u ON p.usuario_id = u.id
      ORDER BY p.creado_en DESC
    `);

        for (const pedido of pedidos) {
            const [detalle] = await db.query(`
        SELECT dp.cantidad, dp.precio_unitario, pr.nombre
        FROM detalle_pedido dp
        JOIN productos pr ON dp.producto_id = pr.id
        WHERE dp.pedido_id = ?
      `, [pedido.id]);
            pedido.productos = detalle;
        }

        res.json(pedidos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al obtener pedidos.' });
    }
}

// POST
async function crearPedido(req, res) {
    const { metodo_pago, direccion_envio, costo_envio = 10000 } = req.body;

    if (!metodo_pago || !direccion_envio) {
        return res.status(400).json({ mensaje: 'Método de pago y dirección requeridos.' });
    }

    try {
        const [carrito] = await db.query(
            'SELECT id FROM carritos WHERE usuario_id = ?',
            [req.usuario.id]
        );
        const carritoId = carrito[0].id;

        const [items] = await db.query(`
      SELECT dc.cantidad, p.id AS producto_id, p.precio, p.stock, p.nombre
      FROM detalle_carrito dc
      JOIN productos p ON dc.producto_id = p.id
      WHERE dc.carrito_id = ?
    `, [carritoId]);

        if (items.length === 0) {
            return res.status(400).json({ mensaje: 'El carrito está vacío.' });
        }

        for (const item of items) {
            if (item.stock < item.cantidad) {
                return res.status(400).json({
                    mensaje: `Stock insuficiente para: ${item.nombre}`
                });
            }
        }

        const subtotal = items.reduce((s, i) => s + i.precio * i.cantidad, 0);
        const total    = subtotal + parseFloat(costo_envio);

        const [pedido] = await db.query(`
      INSERT INTO pedidos (usuario_id, total, costo_envio, metodo_pago, direccion_envio)
      VALUES (?, ?, ?, ?, ?)
    `, [req.usuario.id, total, costo_envio, metodo_pago, direccion_envio]);

        const pedidoId = pedido.insertId;

        for (const item of items) {
            await db.query(`
        INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario)
        VALUES (?, ?, ?, ?)
      `, [pedidoId, item.producto_id, item.cantidad, item.precio]);

            await db.query(
                'UPDATE productos SET stock = stock - ? WHERE id = ?',
                [item.cantidad, item.producto_id]
            );
        }

        await db.query(
            'DELETE FROM detalle_carrito WHERE carrito_id = ?',
            [carritoId]
        );

        res.status(201).json({
            mensaje: 'Pedido creado exitosamente.',
            pedido_id: pedidoId,
            total,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al crear el pedido.' });
    }
}

// PUT
async function cambiarEstado(req, res) {
    const { estado } = req.body;
    const estadosValidos = ['pendiente','procesando','enviado','entregado','cancelado'];

    if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ mensaje: 'Estado no válido.' });
    }

    try {
        await db.query(
            'UPDATE pedidos SET estado = ? WHERE id = ?',
            [estado, req.params.id]
        );
        res.json({ mensaje: 'Estado actualizado.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al actualizar estado.' });
    }
}

module.exports = { crearPedido, misPedidos, todosPedidos, cambiarEstado };