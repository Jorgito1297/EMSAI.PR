/**
 * CLERE Core Audit Engine
 * Rutas de Eventos Clínicos
 *
 * Define todos los endpoints para el manejo de eventos del CAE.
 * Aplica middleware de validación y autenticación según corresponde.
 *
 * Endpoints disponibles:
 *   POST   /api/v1/events                           - Registrar nuevo evento
 *   GET    /api/v1/events/:eventId                  - Obtener evento específico
 *   GET    /api/v1/events/session/:sessionId        - Audit trail de sesión
 *   GET    /api/v1/events/session/:sessionId/validate - Validar integridad
 */

'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const eventController = require('../controllers/eventController');
const { validateEventLog, validateUuidParam } = require('../middleware/validation');
const { optionalAuth } = require('../middleware/authentication');

// Límite de tasa para escritura de eventos (protección contra abuso)
const writeRateLimit = rateLimit({
  windowMs: 60 * 1000, // ventana de 1 minuto
  max: 120,            // máximo 120 eventos por minuto por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Demasiadas solicitudes. Por favor, intente nuevamente en un momento.',
  },
});

// Límite de tasa para lectura y validación
const readRateLimit = rateLimit({
  windowMs: 60 * 1000, // ventana de 1 minuto
  max: 300,            // máximo 300 lecturas por minuto por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Demasiadas solicitudes. Por favor, intente nuevamente en un momento.',
  },
});

// Límite de tasa global para todas las rutas de eventos (protección base)
const globalRateLimit = rateLimit({
  windowMs: 60 * 1000, // ventana de 1 minuto
  max: 300,            // máximo 300 requests por minuto por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Demasiadas solicitudes. Por favor, intente nuevamente en un momento.',
  },
});

// Aplicar rate limiting global antes de la autenticación
router.use(globalRateLimit);

// Aplicar autenticación opcional a todas las rutas de eventos
router.use(optionalAuth);

/**
 * POST /api/v1/events
 * Registra un nuevo evento clínico en el audit log
 */
router.post('/', writeRateLimit, validateEventLog, eventController.createEvent);

/**
 * GET /api/v1/events/session/:sessionId/validate
 * Valida la integridad de la cadena de hash de una sesión
 * (IMPORTANTE: esta ruta debe ir ANTES de /:eventId para evitar conflictos)
 */
router.get(
  '/session/:sessionId/validate',
  readRateLimit,
  validateUuidParam('sessionId'),
  eventController.validateSessionIntegrity
);

/**
 * GET /api/v1/events/session/:sessionId
 * Obtiene el audit trail completo de una sesión
 */
router.get(
  '/session/:sessionId',
  readRateLimit,
  validateUuidParam('sessionId'),
  eventController.getSessionAuditTrail
);

/**
 * GET /api/v1/events/:eventId
 * Obtiene un evento específico por su ID
 */
router.get(
  '/:eventId',
  readRateLimit,
  validateUuidParam('eventId'),
  eventController.getEvent
);

module.exports = router;
