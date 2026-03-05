/**
 * CLERE Core Audit Engine
 * Modelo: PerformanceMetrics (performance_metrics)
 *
 * Métricas agregadas por sesión/usuario para:
 * - Certificación internacional INCLC
 * - Perfilación neurocognitiva invisible
 * - Evaluación de liderazgo clínico
 *
 * Índices CLERE:
 * - CCPI: CLERE Clinical Performance Index
 * - CSAI: CLERE Stress Adaptation Index
 * - CCSS: CLERE Cognitive Stability Score
 * - CLDL: CLERE Leadership Development Level
 *
 * TODO: Implementar cálculo automático de índices CLERE
 * TODO: Integrar con n8n para análisis de IA de perfiles
 */

'use strict';

const db = require('../config/database');

/**
 * Crea o actualiza las métricas de rendimiento de una sesión.
 *
 * @param {Object} metricsData - Datos de métricas de la sesión
 * @returns {Promise<Object>} Métricas guardadas
 */
const upsertMetrics = async (metricsData) => {
  const {
    session_id,
    user_id,
    team_id,
    clinical_accuracy_percent,
    decision_time_average_ms,
    resource_efficiency_score,
    leadership_score,
    airmed_appropriateness_score,
    mortality_preventability_index,
    overall_simulation_score,
    ccpi,
    csai,
    ccss,
    cldl,
  } = metricsData;

  const sql = `
    INSERT INTO performance_metrics (
      session_id, user_id, team_id, clinical_accuracy_percent,
      decision_time_average_ms, resource_efficiency_score, leadership_score,
      airmed_appropriateness_score, mortality_preventability_index,
      overall_simulation_score, ccpi, csai, ccss, cldl, completed_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
    ON CONFLICT (session_id) DO UPDATE SET
      clinical_accuracy_percent = EXCLUDED.clinical_accuracy_percent,
      decision_time_average_ms = EXCLUDED.decision_time_average_ms,
      resource_efficiency_score = EXCLUDED.resource_efficiency_score,
      leadership_score = EXCLUDED.leadership_score,
      airmed_appropriateness_score = EXCLUDED.airmed_appropriateness_score,
      mortality_preventability_index = EXCLUDED.mortality_preventability_index,
      overall_simulation_score = EXCLUDED.overall_simulation_score,
      ccpi = EXCLUDED.ccpi,
      csai = EXCLUDED.csai,
      ccss = EXCLUDED.ccss,
      cldl = EXCLUDED.cldl,
      completed_at = NOW()
    RETURNING *
  `;

  const params = [
    session_id,
    user_id,
    team_id || null,
    clinical_accuracy_percent || null,
    decision_time_average_ms || null,
    resource_efficiency_score || null,
    leadership_score || null,
    airmed_appropriateness_score || null,
    mortality_preventability_index || null,
    overall_simulation_score || null,
    ccpi || null,
    csai || null,
    ccss || null,
    cldl || null,
  ];

  const result = await db.query(sql, params);
  return result.rows[0];
};

/**
 * Obtiene las métricas de una sesión específica.
 *
 * @param {string} sessionId - UUID de la sesión
 * @returns {Promise<Object|null>} Métricas de la sesión o null
 */
const getMetricsBySession = async (sessionId) => {
  const sql = 'SELECT * FROM performance_metrics WHERE session_id = $1';
  const result = await db.query(sql, [sessionId]);
  return result.rows[0] || null;
};

/**
 * Obtiene el historial de métricas de un usuario.
 *
 * @param {string} userId - UUID del usuario
 * @returns {Promise<Array<Object>>} Historial de métricas
 */
const getMetricsByUser = async (userId) => {
  const sql = `
    SELECT * FROM performance_metrics
    WHERE user_id = $1
    ORDER BY completed_at DESC
  `;
  const result = await db.query(sql, [userId]);
  return result.rows;
};

module.exports = {
  upsertMetrics,
  getMetricsBySession,
  getMetricsByUser,
};
