function requiereSesion(req, res, next) {
  if (!req.session.usuario) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  next();
}

function requiereRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.session.usuario) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    if (!rolesPermitidos.includes(req.session.usuario.rol)) {
      return res.status(403).json({ error: 'Acceso no permitido' });
    }
    next();
  };
}

module.exports = { requiereSesion, requiereRol };