require('dotenv').config();
const express = require('express');
const session = require('express-session');
const pool = require('./db');
const authRoutes = require('./routes/auth');
const { requiereRol } = require('./middleware/auth');
const solicitudesRoutes = require('./routes/solicitudes');

const app = express();
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax' },
}));

app.get('/salud', (req, res) => res.json({ estado: 'ok' }));
app.use('/api/solicitudes', solicitudesRoutes);

app.get('/salud-bd', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ estado: 'bd ok' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ estado: 'bd error' });
  }
});

app.use('/api/auth', authRoutes);

// Ruta temporal para probar el control por rol (se borra después)
app.get('/api/prueba-coordinador', requiereRol('Coordinador'), (req, res) => {
  res.json({ mensaje: 'Entraste como Coordinador' });
});

const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, () => console.log(`Servidor en puerto ${PUERTO}`));