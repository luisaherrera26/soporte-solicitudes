require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const pool = require('./db');
const authRoutes = require('./routes/auth');
const solicitudesRoutes = require('./routes/solicitudes');
const coordinacionRoutes = require('./routes/coordinacion');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../../frontend')));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax' },
}));

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

app.use('/api/auth', authRoutes);
app.use('/api/solicitudes', solicitudesRoutes);
app.use('/api/coordinacion', coordinacionRoutes);

const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, () => console.log(`Servidor en puerto ${PUERTO}`));