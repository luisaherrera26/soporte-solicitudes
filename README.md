# Plataforma de gestión de solicitudes de soporte

Caso de estudio MAR-Z (Anexo 10). Estado: **Sprint 1** (HU01 a HU04).

## Requisitos

- Node.js (versión LTS)
- PostgreSQL
- Git

## Instalación

1. Clonar el repositorio y entrar a la carpeta del proyecto.
2. Crear la base de datos `soporte` en PostgreSQL (pgAdmin o `CREATE DATABASE soporte;`).
3. Ejecutar `db/esquema.sql` sobre la base `soporte`.
4. Instalar dependencias:
   ```bash
   cd backend
   npm install
   ```
5. Crear `backend/.env` (no se sube al repositorio) con:
   ```
   DATABASE_URL=postgres://postgres:TU_CLAVE@localhost:5432/soporte
   SESSION_SECRET=un-texto-largo-y-aleatorio
   ```
6. Cargar los datos de prueba:
   ```bash
   node scripts/semilla.js
   ```
7. Iniciar el servidor:
   ```bash
   node src/index.js
   ```
8. Abrir `http://localhost:3000`.

## Usuarios de prueba (datos ficticios)

Contraseña de todos: `Prueba123*`

| Código | Rol | Estado |
|---|---|---|
| solicitante01 | Solicitante | Activo |
| solicitante02 | Solicitante | Activo |
| agente01 | Agente | Activo |
| agente02 | Agente | Inactivo |
| coordinador01 | Coordinador | Activo |
| auditor01 | Auditor | Activo |

## Decisiones del equipo

El Anexo 10 no define estos valores; los acordó el equipo:

- **Categorías:** Hardware, Software, Red y conectividad, Accesos y usuarios, Otro.
- **Prioridades:** Baja, Media, Alta.
- **Estados (para el Sprint 2):** Nuevo, Asignada, En atención, Resuelta, Cerrada, Reabierta.
- Un usuario con estado Inactivo no puede iniciar sesión.

## Historias del Sprint 1

| Historia | Descripción | Rutas |
|---|---|---|
| HU01 | Inicio y cierre de sesión por rol | `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/yo` |
| HU02 | Crear solicitud (Solicitante) | `POST /api/solicitudes` |
| HU03 | Consultar mis solicitudes y detalle | `GET /api/solicitudes`, `GET /api/solicitudes/:id` |
| HU04 | Priorizar y ordenar (Coordinador) | `GET /api/coordinacion/solicitudes`, `PATCH /api/coordinacion/solicitudes/:id/prioridad` |

## Cómo proteger una ruta

En `backend/src/middleware/auth.js`:

- `requiereSesion`: exige haber iniciado sesión (401 si no).
- `requiereRol('Coordinador')`: exige un rol concreto (403 si no corresponde).

La validación de rol se hace siempre en el servidor.

## Convenciones de trabajo

- Una rama por historia: `feature/HU05-asignar`.
- Partir siempre de `main` actualizado.
- Commits que empiezan con el ID: `HU05: asignar solicitud a agente activo`.
- Pull Request revisado y **Merged** antes de empezar otra rama.
- Etiqueta de cierre por sprint: `sprint-1-cierre`.

## Estructura

```
backend/   servidor Express, rutas, middleware y scripts
db/        esquema.sql
docs/      matriz de trazabilidad, pruebas y registro de defectos
frontend/  pantalla web (index.html)
```