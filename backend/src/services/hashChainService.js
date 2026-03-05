/**
 * CLERE Core Audit Engine
 * Servicio de Hash Chain - Integridad de Datos Inmutable
 *
 * Implementa un sistema de cadena de hashes estilo blockchain
 * para garantizar que ningún evento del log pueda ser alterado
 * sin detección. Cada evento firma el anterior, creando una
 * cadena criptográfica irrompible.
 *
 * TODO: Integrar con AWS KMS para firma adicional en producción
 * TODO: Exportar cadena de hash para verificación forense externa
 */

'use strict';

const crypto = require('crypto');

// Hash especial para el primer evento de una sesión (bloque génesis)
const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Genera un hash SHA-256 para un evento dado, encadenándolo
 * con el hash del evento anterior (previousHash).
 *
 * @param {Object} eventData - Datos del evento a firmar
 * @param {string} previousHash - Hash del evento anterior en la cadena
 * @returns {string} Hash SHA-256 de 64 caracteres hexadecimales
 */
const generateHash = (eventData, previousHash) => {
  // Crear objeto determinístico con las claves del evento ordenadas
  // para garantizar el mismo hash independientemente del orden de propiedades
  const dataToHash = {
    session_id: eventData.session_id,
    timestamp_utc: eventData.timestamp_utc,
    actor_role: eventData.actor_role,
    jurisdiction_profile: eventData.jurisdiction_profile,
    scenario_type: eventData.scenario_type,
    action_category: eventData.action_category,
    action_name: eventData.action_name,
    patient_id: eventData.patient_id || null,
    rule_engine_result: eventData.rule_engine_result || null,
    response_time_ms: eventData.response_time_ms || null,
    previous_hash: previousHash,
  };

  const dataString = JSON.stringify(dataToHash);
  return crypto.createHash('sha256').update(dataString).digest('hex');
};

/**
 * Valida la integridad de una cadena de eventos.
 * Verifica que cada evento esté correctamente enlazado
 * con el anterior a través de sus hash_signatures.
 *
 * @param {Array<Object>} events - Array de eventos ordenados por timestamp
 * @returns {{ valid: boolean, brokenAt: number|null, totalEvents: number }}
 */
const validateHashChain = (events) => {
  if (!events || events.length === 0) {
    return { valid: true, brokenAt: null, totalEvents: 0 };
  }

  // Verificar el primer evento (debe referenciar GENESIS_HASH o ser null)
  const firstEvent = events[0];
  const firstExpected = generateHash(firstEvent, firstEvent.previous_hash || GENESIS_HASH);
  if (firstExpected !== firstEvent.hash_signature) {
    return { valid: false, brokenAt: 0, totalEvents: events.length };
  }

  // Verificar cada evento subsiguiente
  for (let i = 1; i < events.length; i++) {
    const currentEvent = events[i];
    const expectedHash = generateHash(currentEvent, events[i - 1].hash_signature);

    if (expectedHash !== currentEvent.hash_signature) {
      return {
        valid: false,
        brokenAt: i,
        totalEvents: events.length,
      };
    }
  }

  return { valid: true, brokenAt: null, totalEvents: events.length };
};

/**
 * Obtiene el hash del último evento de una sesión para
 * encadenar el próximo evento.
 *
 * @param {string|null} lastHash - Hash del último evento, o null si es el primero
 * @returns {string} Hash a usar como previousHash del siguiente evento
 */
const getPreviousHash = (lastHash) => {
  return lastHash || GENESIS_HASH;
};

module.exports = {
  generateHash,
  validateHashChain,
  getPreviousHash,
  GENESIS_HASH,
};
