const db     = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
require('dotenv').config();

async function registro(req, res) {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
        return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
    }

    try {
        const [existe] = await db.query(
            'SELECT id FROM usuarios WHERE email = ?', [email]
        );
        if (existe.length > 0) {
            return res.status(409).json({ mensaje: 'El correo ya está registrado.' });
        }

        const hash = await bcrypt.hash(password, 10);
        const [resultado] = await db.query(
            'INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)',
            [nombre, email, hash]
        );

        await db.query(
            'INSERT INTO carritos (usuario_id) VALUES (?)',
            [resultado.insertId]
        );

        res.status(201).json({ mensaje: 'Usuario registrado correctamente.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error en el servidor.' });
    }
}

async function login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ mensaje: 'Email y contraseña requeridos.' });
    }

    try {
        const [filas] = await db.query(
            'SELECT * FROM usuarios WHERE email = ?', [email]
        );
        if (filas.length === 0) {
            return res.status(401).json({ mensaje: 'Credenciales incorrectas.' });
        }

        const usuario = filas[0];
        const coincide = await bcrypt.compare(password, usuario.password_hash);
        if (!coincide) {
            return res.status(401).json({ mensaje: 'Credenciales incorrectas.' });
        }

        const token = jwt.sign(
            { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
            token,
            usuario: {
                id:     usuario.id,
                nombre: usuario.nombre,
                email:  usuario.email,
                rol:    usuario.rol,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error en el servidor.' });
    }
}

module.exports = { registro, login };