/**
 * CLERE Core Audit Engine
 * Modelo: Session (sessions)
 *
 * Gestiona el ciclo de vida de las sesiones de simulación clínica.
 * Una sesión puede estar en estado: active, paused, completed o abandoned.
 * Los eventos del audit log se vinculan a sesiones a través de session_id.
 */

'use strict';

const db = require('../config/database');

/** Estados válidos de una sesión */
const VALID_SESSION_STATUSES = ['active', 'paused', 'completed', 'abandoned'];

/**
 * Crea una nueva sesión de simulación.
 *
 * @param {Object} sessionData - Datos de la sesión a crear
 * @returns {Promise<Object>} Sesión creada con su session_id
 */
const createSession = async (sessionData) => {
  const {
    scenario_type,
    jurisdiction_profile,
    user_id,
    team_id,
    notes,
  } = sessionData;

  const sql = `
    INSERT INTO sessions (
      scenario_type, jurisdiction_profile, user_id, team_id, notes
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  const params = [
    scenario_type,
    jurisdiction_profile,
    user_id || null,
    team_id || null,
    notes || null,
  ];

  const result = await db.query(sql, params);
  return result.rows[0];
};

/**
 * Obtiene una sesión por su ID.
 *
 * @param {string} sessionId - UUID de la sesión
 * @returns {Promise<Object|null>} Sesión encontrada o null
 */
const getSessionById = async (sessionId) => {
  const sql = 'SELECT * FROM sessions WHERE session_id = $1';
  const result = await db.query(sql, [sessionId]);
  return result.rows[0] || null;
};

/**
 * Actualiza el estado de una sesión.
 * Registra automáticamente los timestamps según el nuevo estado.
 *
 * @param {string} sessionId - UUID de la sesión a actualizar
 * @param {string} status - Nuevo estado ('active' | 'paused' | 'completed' | 'abandoned')
 * @param {string|null} notes - Notas opcionales sobre el cambio de estado
 * @returns {Promise<Object|null>} Sesión actualizada o null si no existe
 */
const updateSessionStatus = async (sessionId, status, notes) => {
  // Determinar qué timestamps actualizar según el nuevo estado
  let statusTimestampSql = '';
  if (status === 'paused') {
    statusTimestampSql = ', paused_at = NOW()';
  } else if (status === 'completed' || status === 'abandoned') {
    statusTimestampSql = ', completed_at = NOW()';
  } else if (status === 'active') {
    statusTimestampSql = ', paused_at = NULL';
  }

  const notesSql = notes !== undefined ? ', notes = $3' : '';
  const params = notes !== undefined
    ? [status, sessionId, notes]
    : [status, sessionId];

  const sql = `
    UPDATE sessions
    SET status = $1${statusTimestampSql}${notesSql}
    WHERE session_id = $2
    RETURNING *
  `;

  const result = await db.query(sql, params);
  return result.rows[0] || null;
};

module.exports = {
  createSession,
  getSessionById,
  updateSessionStatus,
  VALID_SESSION_STATUSES,
};
