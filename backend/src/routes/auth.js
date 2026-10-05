const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const { requiereSesion } = require('../middleware/auth');

const router = express.Router();

// Hash falso para que el tiempo de respuesta sea parecido
// exista o no el usuario
const HASH_FALSO = bcrypt.hashSync('no-existe', 10);

router.post('/login', async (req, res) => {
  try {
    const { codigo, password } = req.body;
    if (!codigo || !password) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const resultado = await pool.query(
      'SELECT id, codigo, password_hash, rol, estado FROM usuarios WHERE codigo = $1',
      [codigo]
    );
    const usuario = resultado.rows[0];

    const hash = usuario ? usuario.password_hash : HASH_FALSO;
    const coincide = await bcrypt.compare(password, hash);

    if (!usuario || !coincide || usuario.estado !== 'Activo') {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    req.session.usuario = { id: usuario.id, codigo: usuario.codigo, rol: usuario.rol };
    res.json({ codigo: usuario.codigo, rol: usuario.rol });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/logout', requiereSesion, (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ mensaje: 'Sesión cerrada' });
  });
});

router.get('/yo', requiereSesion, (req, res) => {
  res.json(req.session.usuario);
});

module.exports = router;