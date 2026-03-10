/**
 * CLERE Core Audit Engine
 * Rutas de Sesiones de Simulación
 *
 * Define los endpoints para la gestión del ciclo de vida de sesiones.
 *
 * Endpoints disponibles:
 *   POST   /api/v1/sessions                           - Crear nueva sesión
 *   GET    /api/v1/sessions/:sessionId                - Obtener estado de sesión
 *   PATCH  /api/v1/sessions/:sessionId/status         - Actualizar estado de sesión
 */

'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const sessionController = require('../controllers/sessionController');
const {
  validateUuidParam,
  validateCreateSession,
  validateUpdateSessionStatus,
} = require('../middleware/validation');
const { optionalAuth } = require('../middleware/authentication');

// Límite de tasa global para rutas de sesiones
const sessionRateLimit = rateLimit({
  windowMs: 60 * 1000, // ventana de 1 minuto
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Demasiadas solicitudes. Por favor, intente nuevamente en un momento.',
  },
});

router.use(sessionRateLimit);
router.use(optionalAuth);

/**
 * POST /api/v1/sessions
 * Crea una nueva sesión de simulación clínica
 */
router.post('/', validateCreateSession, sessionController.createSession);

/**
 * GET /api/v1/sessions/:sessionId
 * Obtiene el estado e información de una sesión
 */
router.get(
  '/:sessionId',
  validateUuidParam('sessionId'),
  sessionController.getSession
);

/**
 * PATCH /api/v1/sessions/:sessionId/status
 * Actualiza el estado de una sesión (active, paused, completed, abandoned)
 */
router.patch(
  '/:sessionId/status',
  validateUuidParam('sessionId'),
  validateUpdateSessionStatus,
  sessionController.updateSessionStatus
);

module.exports = router;
