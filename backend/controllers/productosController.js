const db = require('../config/db');

// GET
async function obtenerProductos(req, res) {
    try {
        const [productos] = await db.query(`
            SELECT p.*, c.nombre AS categoria
            FROM productos p
                     JOIN categorias c ON p.categoria_id = c.id
            WHERE p.activo = TRUE
            ORDER BY p.creado_en DESC
        `);
        const resultado = productos.map(p => ({
            ...p,
            tallas: typeof p.tallas === 'string' ? JSON.parse(p.tallas) : (p.tallas || [])
        }));
        res.json(resultado);
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al obtener productos.' });
    }
}

async function obtenerProductoPorId(req, res) {
    try {
        const [filas] = await db.query(`
            SELECT p.*, c.nombre AS categoria
            FROM productos p
                     JOIN categorias c ON p.categoria_id = c.id
            WHERE p.id = ?
        `, [req.params.id]);

        if (filas.length === 0) {
            return res.status(404).json({ mensaje: 'Producto no encontrado.' });
        }
        const producto = filas[0];
        producto.tallas = typeof producto.tallas === 'string'
            ? JSON.parse(producto.tallas)
            : (producto.tallas || []);
        res.json(producto);
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al obtener el producto.' });
    }
}

async function obtenerPorCategoria(req, res) {
    try {
        const [productos] = await db.query(`
            SELECT p.*, c.nombre AS categoria
            FROM productos p
                     JOIN categorias c ON p.categoria_id = c.id
            WHERE p.categoria_id = ? AND p.activo = TRUE
            ORDER BY p.creado_en DESC
        `, [req.params.categoriaId]);
        const resultado = productos.map(p => ({
            ...p,
            tallas: typeof p.tallas === 'string' ? JSON.parse(p.tallas) : (p.tallas || [])
        }));
        res.json(resultado);
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al filtrar por categoría.' });
    }
}


async function obtenerTodosAdmin(req, res) {
    try {
        const [productos] = await db.query(`
            SELECT p.*, c.nombre AS categoria
            FROM productos p
                     JOIN categorias c ON p.categoria_id = c.id
            ORDER BY p.creado_en DESC
        `);
        const resultado = productos.map(p => ({
            ...p,
            tallas: typeof p.tallas === 'string' ? JSON.parse(p.tallas) : (p.tallas || [])
        }));
        res.json(resultado);
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al obtener productos.' });
    }
}


// POST
async function crearProducto(req, res) {
    const { categoria_id, nombre, descripcion, precio, stock, imagen_url, tallas } = req.body;

    if (!categoria_id || !nombre || !precio || stock === undefined) {
        return res.status(400).json({ mensaje: 'Faltan campos obligatorios.' });
    }

    try {
        const [resultado] = await db.query(`
            INSERT INTO productos (categoria_id, nombre, descripcion, precio, stock, imagen_url, tallas)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [categoria_id, nombre, descripcion, precio, stock, imagen_url, JSON.stringify(tallas || [])]);

        res.status(201).json({ mensaje: 'Producto creado.', id: resultado.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al crear el producto.' });
    }
}
// PUT
async function actualizarProducto(req, res) {
    const { categoria_id, nombre, descripcion, precio, stock, imagen_url, activo, tallas } = req.body;

    try {
        await db.query(`
            UPDATE productos
            SET categoria_id = ?, nombre = ?, descripcion = ?,
                precio = ?, stock = ?, imagen_url = ?, activo = ?, tallas = ?
            WHERE id = ?
        `, [categoria_id, nombre, descripcion, precio, stock, imagen_url, activo,
            JSON.stringify(tallas || []), req.params.id]);

        res.json({ mensaje: 'Producto actualizado.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al actualizar el producto.' });
    }
}

// DELETE PUT
async function eliminarProducto(req, res) {
    try {
        await db.query(
            'UPDATE productos SET activo = FALSE WHERE id = ?',
            [req.params.id]
        );
        res.json({ mensaje: 'Producto desactivado correctamente.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al eliminar el producto.' });
    }
}


module.exports = {
    obtenerProductos,
    obtenerProductoPorId,
    obtenerPorCategoria,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    obtenerTodosAdmin,
};