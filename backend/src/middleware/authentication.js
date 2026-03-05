/**
 * CLERE Core Audit Engine
 * Middleware de Autenticación JWT
 *
 * Placeholder para autenticación JWT. En la fase actual,
 * verifica el token si está presente pero no lo requiere
 * obligatoriamente para facilitar el desarrollo inicial.
 *
 * TODO: Implementar autenticación JWT obligatoria en producción
 * TODO: Integrar con sistema de roles RBAC (Field, Dispatcher, etc.)
 * TODO: Agregar refresh tokens para sesiones largas de simulación
 * TODO: Implementar audit log de accesos autenticados
 */

'use strict';

const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticación JWT opcional.
 * Si el token está presente, lo valida y agrega el usuario al request.
 * Si no está presente, continúa sin autenticación (modo desarrollo).
 *
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Next middleware
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Sin token - modo desarrollo/testing
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
    req.user = decoded;
    next();
  } catch (err) {
    // Token inválido o expirado
    return res.status(401).json({
      success: false,
      error: 'Token de autenticación inválido o expirado',
    });
  }
};

/**
 * Middleware de autenticación JWT requerida.
 * Rechaza requests sin token válido con 401.
 *
 * TODO: Activar este middleware en producción para todos los endpoints
 *
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Next middleware
 */
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token de autenticación requerido',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Token de autenticación inválido o expirado',
    });
  }
};

module.exports = { optionalAuth, requireAuth };
