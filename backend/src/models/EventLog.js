/**
 * CLERE Core Audit Engine
 * Modelo: EventLog (event_log_master)
 *
 * Representa la "caja negra" del simulador CLERE.
 * Cada acción clínica, decisión y evento queda registrado
 * de forma inmutable con firma criptográfica.
 *
 * TODO: Agregar soft-delete para cumplimiento HIPAA
 * TODO: Implementar particionamiento por session_id para escala
 */

'use strict';

const db = require('../config/database');

/**
 * Roles válidos de actores en el sistema
 */
const VALID_ACTOR_ROLES = ['Field', 'Dispatcher', 'MedicalControl', 'System'];

/**
 * Jurisdicciones soportadas
 */
const VALID_JURISDICTIONS = ['USA', 'PR', 'Custom'];

/**
 * Inserta un nuevo evento en el log maestro.
 * Esta operación es irreversible por diseño (audit trail inmutable).
 *
 * @param {Object} eventData - Datos completos del evento a registrar
 * @returns {Promise<Object>} Evento creado con su event_id y hash_signature
 */
const createEvent = async (eventData) => {
  const {
    session_id,
    timestamp_utc,
    actor_user_id,
    actor_role,
    jurisdiction_profile,
    scenario_type,
    action_category,
    action_name,
    patient_id,
    clinical_phase,
    pre_condition_state_json,
    decision_input_json,
    rule_engine_result,
    llm_recommendation_json,
    human_override_flag,
    final_decision_json,
    response_time_ms,
    risk_score,
    protocol_reference,
    legal_relevance_flag,
    chaos_factor_active,
    score_delta,
    hash_signature,
    previous_hash,
  } = eventData;

  const sql = `
    INSERT INTO event_log_master (
      session_id, timestamp_utc, actor_user_id, actor_role,
      jurisdiction_profile, scenario_type, action_category, action_name,
      patient_id, clinical_phase, pre_condition_state_json, decision_input_json,
      rule_engine_result, llm_recommendation_json, human_override_flag,
      final_decision_json, response_time_ms, risk_score, protocol_reference,
      legal_relevance_flag, chaos_factor_active, score_delta,
      hash_signature, previous_hash
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
      $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
    )
    RETURNING *
  `;

  const params = [
    session_id,
    timestamp_utc || new Date().toISOString(),
    actor_user_id || null,
    actor_role,
    jurisdiction_profile,
    scenario_type,
    action_category,
    action_name,
    patient_id || null,
    clinical_phase || null,
    pre_condition_state_json ? JSON.stringify(pre_condition_state_json) : null,
    decision_input_json ? JSON.stringify(decision_input_json) : null,
    rule_engine_result || null,
    llm_recommendation_json ? JSON.stringify(llm_recommendation_json) : null,
    human_override_flag !== undefined ? human_override_flag : false,
    final_decision_json ? JSON.stringify(final_decision_json) : null,
    response_time_ms || null,
    risk_score || null,
    protocol_reference || null,
    legal_relevance_flag !== undefined ? legal_relevance_flag : false,
    chaos_factor_active !== undefined ? chaos_factor_active : false,
    score_delta || null,
    hash_signature,
    previous_hash || null,
  ];

  const result = await db.query(sql, params);
  return result.rows[0];
};

/**
 * Obtiene todos los eventos de una sesión, ordenados cronológicamente.
 * Utilizado para validación de la cadena de hash.
 *
 * @param {string} sessionId - UUID de la sesión
 * @returns {Promise<Array<Object>>} Array de eventos ordenados por timestamp
 */
const getEventsBySession = async (sessionId) => {
  const sql = `
    SELECT * FROM event_log_master
    WHERE session_id = $1
    ORDER BY timestamp_utc ASC, event_id ASC
  `;
  const result = await db.query(sql, [sessionId]);
  return result.rows;
};

/**
 * Obtiene el último evento de una sesión para encadenar el hash.
 *
 * @param {string} sessionId - UUID de la sesión
 * @returns {Promise<Object|null>} Último evento o null si no existe
 */
const getLastEventBySession = async (sessionId) => {
  const sql = `
    SELECT hash_signature, event_id, timestamp_utc
    FROM event_log_master
    WHERE session_id = $1
    ORDER BY timestamp_utc DESC, event_id DESC
    LIMIT 1
  `;
  const result = await db.query(sql, [sessionId]);
  return result.rows[0] || null;
};

/**
 * Obtiene un evento específico por su ID.
 *
 * @param {string} eventId - UUID del evento
 * @returns {Promise<Object|null>} Evento encontrado o null
 */
const getEventById = async (eventId) => {
  const sql = 'SELECT * FROM event_log_master WHERE event_id = $1';
  const result = await db.query(sql, [eventId]);
  return result.rows[0] || null;
};

module.exports = {
  createEvent,
  getEventsBySession,
  getLastEventBySession,
  getEventById,
  VALID_ACTOR_ROLES,
  VALID_JURISDICTIONS,
};
