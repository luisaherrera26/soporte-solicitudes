CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(30) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL
    CHECK (rol IN ('Solicitante','Agente','Coordinador','Auditor')),
  estado VARCHAR(10) NOT NULL DEFAULT 'Activo'
    CHECK (estado IN ('Activo','Inactivo'))
);

CREATE TABLE solicitudes (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  descripcion TEXT NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'Nuevo',
  prioridad VARCHAR(10),
  propietario_id INT NOT NULL REFERENCES usuarios(id),
  creada_en TIMESTAMP NOT NULL DEFAULT NOW(),
  actualizada_en TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE historial_cambios (
  id SERIAL PRIMARY KEY,
  solicitud_id INT NOT NULL REFERENCES solicitudes(id),
  actor_id INT NOT NULL REFERENCES usuarios(id),
  campo VARCHAR(50) NOT NULL,
  valor_anterior TEXT,
  valor_nuevo TEXT,
  fecha TIMESTAMP NOT NULL DEFAULT NOW()
);