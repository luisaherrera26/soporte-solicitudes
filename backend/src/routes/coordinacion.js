const express = require('express');
const pool = require('../db');
const { requiereRol } = require('../middleware/auth');
const { PRIORIDADES } = require('../constantes');

const router = express.Router();

// Columnas por las que se puede ordenar (lista fija, nunca texto del usuario)
const ORDENES = {
  prioridad: `CASE prioridad WHEN 'Alta' THEN 1 WHEN 'Media' THEN 2 WHEN 'Baja' THEN 3 ELSE 4 END`,
  estado: 'estado',
  fecha: 'creada_en',
};

// Listar todas las solicitudes (solo Coordinador)
// Ejemplo: GET /api/coordinacion/solicitudes?orden=prioridad&dir=asc
router.get('/solicitudes', requiereRol('Coordinador'), async (req, res) => {
  try {
    const orden = req.query.orden || 'fecha';
    const dir = (req.query.dir || 'desc').toLowerCase();

    if (!ORDENES[orden] || !['asc', 'desc'].includes(dir)) {
      return res.status(400).json({ error: 'Orden no válido' });
    }

    const resultado = await pool.query(
      `SELECT id, titulo, categoria, estado, prioridad, creada_en, actualizada_en
       FROM solicitudes
       ORDER BY ${ORDENES[orden]} ${dir.toUpperCase()}, id ASC`
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Cambiar la prioridad (solo Coordinador)
router.patch('/solicitudes/:id/prioridad', requiereRol('Coordinador'), async (req, res) => {
  const id = Number(req.params.id);
  const { prioridad } = req.body;

  if (!Number.isInteger(id)) {
    return res.status(404).json({ error: 'Solicitud no encontrada' });
  }
  if (!PRIORIDADES.includes(prioridad)) {
    return res.status(400).json({ error: 'Prioridad no válida', validas: PRIORIDADES });
  }

  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');

    const actual = await cliente.query(
      'SELECT prioridad FROM solicitudes WHERE id = $1 FOR UPDATE',
      [id]
    );
    if (actual.rows.length === 0) {
      await cliente.query('ROLLBACK');
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    const anterior = actual.rows[0].prioridad;
    if (anterior === prioridad) {
      await cliente.query('ROLLBACK');
      return res.status(200).json({ mensaje: 'La prioridad ya tenía ese valor', prioridad });
    }

    const actualizada = await cliente.query(
      `UPDATE solicitudes
       SET prioridad = $1, actualizada_en = NOW()
       WHERE id = $2
       RETURNING id, titulo, estado, prioridad, actualizada_en`,
      [prioridad, id]
    );

    await cliente.query(
      `INSERT INTO historial_cambios (solicitud_id, actor_id, campo, valor_anterior, valor_nuevo)
       VALUES ($1, $2, 'prioridad', $3, $4)`,
      [id, req.session.usuario.id, anterior, prioridad]
    );

    await cliente.query('COMMIT');
    res.json(actualizada.rows[0]);
  } catch (error) {
    await cliente.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    cliente.release();
  }
});

module.exports = router;