/**
 * CLERE Core Audit Engine
 * Controlador de Eventos Clínicos
 *
 * Maneja los endpoints de la API para:
 * - Registro de eventos clínicos (POST /api/v1/events)
 * - Validación de integridad de sesión (GET /api/v1/events/session/:id/validate)
 * - Recuperación del audit trail completo (GET /api/v1/events/session/:id)
 * - Recuperación de evento específico (GET /api/v1/events/:id)
 *
 * TODO: Agregar paginación para sesiones con muchos eventos
 * TODO: Implementar exportación PDF del audit trail para reportes legales
 * TODO: Agregar webhook a n8n cuando se registra evento de alta relevancia legal
 */

'use strict';

const auditService = require('../services/auditService');

/**
 * POST /api/v1/events
 * Registra un nuevo evento clínico en el audit log.
 *
 * El evento es firmado criptográficamente y encadenado
 * con el último evento de la misma sesión.
 *
 * @param {Object} req - Request con datos del evento en body
 * @param {Object} res - Response con event_id, hash y estado de la cadena
 */
const createEvent = async (req, res) => {
  try {
    const {
      session_id,
      actor_role,
      actor_user_id,
      jurisdiction_profile,
      scenario_type,
      action_category,
      action_name,
      patient_id,
      clinical_phase,
      decision_input,
      rule_engine_result,
      llm_recommendation,
      human_override_flag,
      final_decision,
      response_time_ms,
      risk_score,
      protocol_reference,
      legal_relevance_flag,
      chaos_factor_active,
      score_delta,
      pre_condition_state,
    } = req.body;

    // Mapear nombres del request a nombres internos del modelo
    const eventInput = {
      session_id,
      actor_role,
      actor_user_id: actor_user_id || (req.user ? req.user.id : null),
      jurisdiction_profile,
      scenario_type,
      action_category,
      action_name,
      patient_id,
      clinical_phase,
      decision_input_json: decision_input,
      rule_engine_result,
      llm_recommendation_json: llm_recommendation,
      human_override_flag,
      final_decision_json: final_decision,
      response_time_ms,
      risk_score,
      protocol_reference,
      legal_relevance_flag,
      chaos_factor_active,
      score_delta,
      pre_condition_state_json: pre_condition_state,
    };

    const result = await auditService.logEvent(eventInput);

    return res.status(201).json({
      success: true,
      event_id: result.event_id,
      hash_signature: result.hash_signature,
      chain_valid: true,
      timestamp_utc: result.timestamp_utc,
      chain_position: result.chain_position,
    });
  } catch (err) {
    console.error('Error al registrar evento clínico:', err);
    return res.status(500).json({
      success: false,
      error: 'Error interno al registrar el evento',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

/**
 * GET /api/v1/events/:eventId
 * Recupera un evento específico por su ID.
 *
 * @param {Object} req - Request con eventId en params
 * @param {Object} res - Response con datos del evento
 */
const getEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await auditService.getEventById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Evento no encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      event,
    });
  } catch (err) {
    console.error('Error al recuperar evento:', err);
    return res.status(500).json({
      success: false,
      error: 'Error interno al recuperar el evento',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

/**
 * GET /api/v1/events/session/:sessionId
 * Recupera el audit trail completo de una sesión.
 * Incluye validación de integridad de la cadena de hashes.
 *
 * @param {Object} req - Request con sessionId en params
 * @param {Object} res - Response con todos los eventos y validación
 */
const getSessionAuditTrail = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const auditTrail = await auditService.getSessionAuditTrail(sessionId);

    return res.status(200).json({
      success: true,
      ...auditTrail,
    });
  } catch (err) {
    console.error('Error al recuperar audit trail de sesión:', err);
    return res.status(500).json({
      success: false,
      error: 'Error interno al recuperar el audit trail',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

/**
 * GET /api/v1/events/session/:sessionId/validate
 * Valida la integridad criptográfica de toda la cadena de una sesión.
 * Crítico para reportes legales y forenses.
 *
 * @param {Object} req - Request con sessionId en params
 * @param {Object} res - Response con resultado de validación
 */
const validateSessionIntegrity = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const validationResult = await auditService.validateSessionIntegrity(sessionId);

    const httpStatus = validationResult.valid ? 200 : 409;

    return res.status(httpStatus).json({
      success: validationResult.valid,
      ...validationResult,
    });
  } catch (err) {
    console.error('Error al validar integridad de sesión:', err);
    return res.status(500).json({
      success: false,
      error: 'Error interno al validar la integridad',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

module.exports = {
  createEvent,
  getEvent,
  getSessionAuditTrail,
  validateSessionIntegrity,
};
