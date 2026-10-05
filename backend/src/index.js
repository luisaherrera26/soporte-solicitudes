const express = require('express');
const app = express();
app.use(express.json());

app.get('/salud', (req, res) => res.json({ estado: 'ok' }));

const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, () => console.log(`Servidor en puerto ${PUERTO}`));