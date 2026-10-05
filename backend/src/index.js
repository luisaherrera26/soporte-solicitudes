const express = require('express');
const pool = require('./db');

const app = express();
app.use(express.json());

app.get('/salud', (req, res) => res.json({ estado: 'ok' }));

app.get('/salud-bd', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ estado: 'bd ok' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ estado: 'bd error' });
  }
});

const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, () => console.log(`Servidor en puerto ${PUERTO}`));