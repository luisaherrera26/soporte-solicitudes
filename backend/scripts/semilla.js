const bcrypt = require('bcrypt');
const pool = require('../src/db');

const CLAVE_PRUEBA = 'Prueba123*'; // ficticia, solo para pruebas

const usuarios = [
  ['solicitante01', 'Solicitante', 'Activo'],
  ['agente01', 'Agente', 'Activo'],
  ['agente02', 'Agente', 'Inactivo'],
  ['coordinador01', 'Coordinador', 'Activo'],
  ['auditor01', 'Auditor', 'Activo'],
  ['solicitante02', 'Solicitante', 'Activo'],
];

(async () => {
  for (const [codigo, rol, estado] of usuarios) {
    const hash = await bcrypt.hash(CLAVE_PRUEBA, 10);
    await pool.query(
      `INSERT INTO usuarios (codigo, password_hash, rol, estado)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (codigo) DO NOTHING`,
      [codigo, hash, rol, estado]
    );
  }
  console.log('Semilla cargada');
  await pool.end();
})();