const db = require('../config/db');

// GET
async function verCarrito(req, res) {
    try {
        const [carrito] = await db.query(
            'SELECT id FROM carritos WHERE usuario_id = ?',
            [req.usuario.id]
        );
        if (carrito.length === 0) {
            return res.status(404).json({ mensaje: 'Carrito no encontrado.' });
        }

        const carritoId = carrito[0].id;
        const [items] = await db.query(`
      SELECT dc.id, dc.cantidad,
             p.id AS producto_id, p.nombre, p.precio,
             p.imagen_url, p.stock,
             (dc.cantidad * p.precio) AS subtotal
      FROM detalle_carrito dc
      JOIN productos p ON dc.producto_id = p.id
      WHERE dc.carrito_id = ?
    `, [carritoId]);

        const total = items.reduce((sum, i) => sum + parseFloat(i.subtotal), 0);
        res.json({ items, total: total.toFixed(2) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al obtener el carrito.' });
    }
}

// POST
async function agregarAlCarrito(req, res) {
    const { producto_id, cantidad } = req.body;

    if (!producto_id || !cantidad || cantidad < 1) {
        return res.status(400).json({ mensaje: 'Producto y cantidad requeridos.' });
    }

    try {
        const [prod] = await db.query(
            'SELECT stock FROM productos WHERE id = ? AND activo = TRUE',
            [producto_id]
        );
        if (prod.length === 0) {
            return res.status(404).json({ mensaje: 'Producto no disponible.' });
        }
        if (prod[0].stock < cantidad) {
            return res.status(400).json({ mensaje: 'Stock insuficiente.' });
        }

        const [carrito] = await db.query(
            'SELECT id FROM carritos WHERE usuario_id = ?',
            [req.usuario.id]
        );
        const carritoId = carrito[0].id;

        const [existe] = await db.query(
            'SELECT id, cantidad FROM detalle_carrito WHERE carrito_id = ? AND producto_id = ?',
            [carritoId, producto_id]
        );

        if (existe.length > 0) {
            const nuevaCantidad = existe[0].cantidad + cantidad;
            if (nuevaCantidad > prod[0].stock) {
                return res.status(400).json({ mensaje: 'Stock insuficiente para esa cantidad.' });
            }
            await db.query(
                'UPDATE detalle_carrito SET cantidad = ? WHERE id = ?',
                [nuevaCantidad, existe[0].id]
            );
        } else {
            await db.query(
                'INSERT INTO detalle_carrito (carrito_id, producto_id, cantidad) VALUES (?, ?, ?)',
                [carritoId, producto_id, cantidad]
            );
        }

        res.json({ mensaje: 'Producto agregado al carrito.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al agregar al carrito.' });
    }
}

// PUT
async function actualizarCantidad(req, res) {
    const { cantidad } = req.body;

    if (!cantidad || cantidad < 1) {
        return res.status(400).json({ mensaje: 'Cantidad inválida.' });
    }

    try {
        await db.query(
            'UPDATE detalle_carrito SET cantidad = ? WHERE id = ?',
            [cantidad, req.params.detalleId]
        );
        res.json({ mensaje: 'Cantidad actualizada.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al actualizar cantidad.' });
    }
}

// DELETE
async function eliminarDelCarrito(req, res) {
    try {
        await db.query(
            'DELETE FROM detalle_carrito WHERE id = ?',
            [req.params.detalleId]
        );
        res.json({ mensaje: 'Producto eliminado del carrito.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al eliminar del carrito.' });
    }
}


async function vaciarCarrito(req, res) {
    try {
        const [carrito] = await db.query(
            'SELECT id FROM carritos WHERE usuario_id = ?',
            [req.usuario.id]
        );
        await db.query(
            'DELETE FROM detalle_carrito WHERE carrito_id = ?',
            [carrito[0].id]
        );
        res.json({ mensaje: 'Carrito vaciado.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al vaciar el carrito.' });
    }
}

module.exports = {
    verCarrito,
    agregarAlCarrito,
    actualizarCantidad,
    eliminarDelCarrito,
    vaciarCarrito,
};