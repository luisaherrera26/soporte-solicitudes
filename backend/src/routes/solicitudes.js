const express = require('express');
const pool = require('../db');
const { requiereRol } = require('../middleware/auth');
const { CATEGORIAS } = require('../constantes');

const router = express.Router();

router.post('/', requiereRol('Solicitante'), async (req, res) => {
  try {
    const { titulo, descripcion, categoria } = req.body;

    const errores = [];
    if (!titulo || !titulo.trim()) errores.push('El título es obligatorio');
    if (!descripcion || !descripcion.trim()) errores.push('La descripción es obligatoria');
    if (!categoria) errores.push('La categoría es obligatoria');
    else if (!CATEGORIAS.includes(categoria)) errores.push('Categoría no válida');
    if (titulo && titulo.length > 150) errores.push('El título no puede superar 150 caracteres');

    if (errores.length > 0) {
      return res.status(400).json({ errores });
    }

    const resultado = await pool.query(
      `INSERT INTO solicitudes (titulo, descripcion, categoria, estado, propietario_id)
       VALUES ($1, $2, $3, 'Nuevo', $4)
       RETURNING id, titulo, descripcion, categoria, estado, propietario_id, creada_en`,
      [titulo.trim(), descripcion.trim(), categoria, req.session.usuario.id]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/categorias', (req, res) => {
  res.json(CATEGORIAS);
});
// Listar solo mis solicitudes
router.get('/', requiereRol('Solicitante'), async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT id, titulo, categoria, estado, prioridad, creada_en, actualizada_en
       FROM solicitudes
       WHERE propietario_id = $1
       ORDER BY actualizada_en DESC`,
      [req.session.usuario.id]
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Detalle de una de mis solicitudes
router.get('/:id', requiereRol('Solicitante'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    const resultado = await pool.query(
      `SELECT id, titulo, descripcion, categoria, estado, prioridad,
              propietario_id, creada_en, actualizada_en
       FROM solicitudes
       WHERE id = $1 AND propietario_id = $2`,
      [id, req.session.usuario.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }
    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;