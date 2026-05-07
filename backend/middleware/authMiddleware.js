const jwt = require('jsonwebtoken');
require('dotenv').config();

function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ mensaje: 'Acceso denegado. Token requerido.' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = payload;
        next();
    } catch (err) {
        return res.status(403).json({ mensaje: 'Token inválido o expirado.' });
    }
}

function soloAdmin(req, res, next) {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ mensaje: 'Acceso solo para administradores.' });
    }
    next();
}

module.exports = { verificarToken, soloAdmin };