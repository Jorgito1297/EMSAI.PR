/**
 * CLERE Core Audit Engine
 * Modelo: PatientState (patient_current_state)
 *
 * Arquitectura de estado híbrido - mantiene el estado actual
 * del paciente para acceso rápido durante la simulación clínica.
 * Los cambios de estado también se registran en event_log_master.
 *
 * TODO: Integrar con Redis para caché de estado en tiempo real
 * TODO: Implementar WebSocket para broadcasting de cambios de estado
 */

'use strict';

const db = require('../config/database');

/**
 * Crea o actualiza el estado de un paciente en la sesión.
 * Usa INSERT ... ON CONFLICT para upsert atómico.
 *
 * @param {Object} patientData - Datos del estado del paciente
 * @returns {Promise<Object>} Estado del paciente actualizado
 */
const upsertPatientState = async (patientData) => {
  const {
    patient_id,
    session_id,
    vitals,
    airway_status,
    circulation_status,
    interventions_active,
    medications_administered,
    transport_mode,
    airmed_status,
    hospital_destination,
    risk_level,
    time_since_scene_arrival,
  } = patientData;

  const sql = `
    INSERT INTO patient_current_state (
      patient_id, session_id, vitals, airway_status, circulation_status,
      interventions_active, medications_administered, transport_mode,
      airmed_status, hospital_destination, risk_level,
      time_since_scene_arrival, last_updated
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
    ON CONFLICT (patient_id) DO UPDATE SET
      vitals = EXCLUDED.vitals,
      airway_status = EXCLUDED.airway_status,
      circulation_status = EXCLUDED.circulation_status,
      interventions_active = EXCLUDED.interventions_active,
      medications_administered = EXCLUDED.medications_administered,
      transport_mode = EXCLUDED.transport_mode,
      airmed_status = EXCLUDED.airmed_status,
      hospital_destination = EXCLUDED.hospital_destination,
      risk_level = EXCLUDED.risk_level,
      time_since_scene_arrival = EXCLUDED.time_since_scene_arrival,
      last_updated = NOW()
    RETURNING *
  `;

  const params = [
    patient_id || null,
    session_id,
    JSON.stringify(vitals),
    airway_status || null,
    circulation_status || null,
    interventions_active ? JSON.stringify(interventions_active) : null,
    medications_administered ? JSON.stringify(medications_administered) : null,
    transport_mode || null,
    airmed_status || null,
    hospital_destination || null,
    risk_level || null,
    time_since_scene_arrival || null,
  ];

  const result = await db.query(sql, params);
  return result.rows[0];
};

/**
 * Obtiene el estado actual de un paciente.
 *
 * @param {string} patientId - UUID del paciente
 * @returns {Promise<Object|null>} Estado del paciente o null
 */
const getPatientState = async (patientId) => {
  const sql = 'SELECT * FROM patient_current_state WHERE patient_id = $1';
  const result = await db.query(sql, [patientId]);
  return result.rows[0] || null;
};

/**
 * Obtiene todos los pacientes de una sesión.
 *
 * @param {string} sessionId - UUID de la sesión
 * @returns {Promise<Array<Object>>} Lista de estados de pacientes
 */
const getPatientsBySession = async (sessionId) => {
  const sql = `
    SELECT * FROM patient_current_state
    WHERE session_id = $1
    ORDER BY last_updated DESC
  `;
  const result = await db.query(sql, [sessionId]);
  return result.rows;
};

module.exports = {
  upsertPatientState,
  getPatientState,
  getPatientsBySession,
};
