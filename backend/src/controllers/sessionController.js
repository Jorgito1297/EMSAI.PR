/**
 * CLERE Core Audit Engine
 * Controlador de Sesiones
 *
 * Maneja los endpoints de la API para:
 * - Creación de sesiones de simulación (POST /api/v1/sessions)
 * - Consulta de estado de sesión (GET /api/v1/sessions/:sessionId)
 * - Actualización de estado (PATCH /api/v1/sessions/:sessionId/status)
 */

'use strict';

const Session = require('../models/Session');

/**
 * POST /api/v1/sessions
 * Crea una nueva sesión de simulación clínica.
 *
 * @param {Object} req - Request con datos de la sesión en body
 * @param {Object} res - Response con session_id y estado inicial
 */
const createSession = async (req, res) => {
  try {
    const { scenario_type, jurisdiction_profile, user_id, team_id, notes } = req.body;

    const sessionInput = {
      scenario_type,
      jurisdiction_profile,
      user_id: user_id || (req.user ? req.user.id : null),
      team_id: team_id || null,
      notes: notes || null,
    };

    const session = await Session.createSession(sessionInput);

    return res.status(201).json({
      success: true,
      session_id: session.session_id,
      status: session.status,
      scenario_type: session.scenario_type,
      jurisdiction_profile: session.jurisdiction_profile,
      started_at: session.started_at,
    });
  } catch (err) {
    console.error('Error al crear sesión:', err);
    return res.status(500).json({
      success: false,
      error: 'Error interno al crear la sesión',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

/**
 * GET /api/v1/sessions/:sessionId
 * Obtiene la información y estado actual de una sesión.
 *
 * @param {Object} req - Request con sessionId en params
 * @param {Object} res - Response con datos completos de la sesión
 */
const getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.getSessionById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Sesión no encontrada',
      });
    }

    return res.status(200).json({
      success: true,
      session,
    });
  } catch (err) {
    console.error('Error al recuperar sesión:', err);
    return res.status(500).json({
      success: false,
      error: 'Error interno al recuperar la sesión',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

/**
 * PATCH /api/v1/sessions/:sessionId/status
 * Actualiza el estado de una sesión de simulación.
 * Transiciones válidas de estado:
 *   active → paused | completed | abandoned
 *   paused → active | completed | abandoned
 *
 * @param {Object} req - Request con sessionId en params y status en body
 * @param {Object} res - Response con la sesión actualizada
 */
const updateSessionStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { status, notes } = req.body;

    // Verificar que la sesión existe antes de actualizarla
    const existing = await Session.getSessionById(sessionId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Sesión no encontrada',
      });
    }

    // No permitir reactivar una sesión ya finalizada
    if (
      (existing.status === 'completed' || existing.status === 'abandoned') &&
      status !== existing.status
    ) {
      return res.status(409).json({
        success: false,
        error: `No se puede cambiar el estado de una sesión ${existing.status} a ${status}`,
        current_status: existing.status,
      });
    }

    const updated = await Session.updateSessionStatus(sessionId, status, notes);

    return res.status(200).json({
      success: true,
      session_id: updated.session_id,
      status: updated.status,
      previous_status: existing.status,
      started_at: updated.started_at,
      paused_at: updated.paused_at,
      completed_at: updated.completed_at,
      notes: updated.notes,
    });
  } catch (err) {
    console.error('Error al actualizar estado de sesión:', err);
    return res.status(500).json({
      success: false,
      error: 'Error interno al actualizar el estado de la sesión',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

module.exports = {
  createSession,
  getSession,
  updateSessionStatus,
};
