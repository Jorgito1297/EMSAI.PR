/**
 * CLERE Core Audit Engine
 * Servicio de Auditoría - Lógica Central del CAE
 *
 * Este servicio orquesta:
 * 1. Registro inmutable de eventos clínicos
 * 2. Generación y encadenamiento de hash signatures
 * 3. Validación de integridad de la cadena de audit
 * 4. Recuperación de eventos para análisis y reporte
 *
 * TODO: Integrar con n8n para memoria persistente de IA
 * TODO: Implementar publicación de eventos a Redis pub/sub
 * TODO: Agregar soporte para eventos batch (múltiples eventos simultáneos)
 */

'use strict';

const EventLog = require('../models/EventLog');
const { generateHash, validateHashChain, getPreviousHash } = require('./hashChainService');

/**
 * Registra un nuevo evento clínico en el audit log.
 *
 * Proceso:
 * 1. Obtiene el último hash de la sesión (para encadenamiento)
 * 2. Genera el hash del nuevo evento
 * 3. Persiste el evento con su hash en la base de datos
 * 4. Retorna el evento creado con validación de cadena
 *
 * @param {Object} eventInput - Datos del evento clínico a registrar
 * @returns {Promise<Object>} Evento creado con hash y estado de la cadena
 */
const logEvent = async (eventInput) => {
  // Timestamp canónico para el evento (garantiza consistencia en el hash)
  const timestamp_utc = new Date().toISOString();

  // Paso 1: Obtener el último hash de la sesión para encadenar
  const lastEvent = await EventLog.getLastEventBySession(eventInput.session_id);
  const previousHash = getPreviousHash(lastEvent ? lastEvent.hash_signature : null);

  // Paso 2: Construir el objeto de evento con timestamp normalizado
  const eventData = {
    ...eventInput,
    timestamp_utc,
  };

  // Paso 3: Generar hash criptográfico del evento encadenado
  const hash_signature = generateHash(eventData, previousHash);

  // Paso 4: Persistir el evento en la base de datos
  const savedEvent = await EventLog.createEvent({
    ...eventData,
    hash_signature,
    previous_hash: previousHash,
  });

  return {
    success: true,
    event_id: savedEvent.event_id,
    hash_signature: savedEvent.hash_signature,
    timestamp_utc: savedEvent.timestamp_utc,
    chain_position: lastEvent ? 'chained' : 'genesis',
  };
};

/**
 * Valida la integridad completa de la cadena de audit de una sesión.
 *
 * Verifica criptográficamente que ningún evento haya sido alterado
 * desde su registro original. Crítico para validez legal y forense.
 *
 * @param {string} sessionId - UUID de la sesión a validar
 * @returns {Promise<Object>} Resultado de la validación con detalles
 */
const validateSessionIntegrity = async (sessionId) => {
  // Obtener todos los eventos de la sesión en orden cronológico
  const events = await EventLog.getEventsBySession(sessionId);

  if (events.length === 0) {
    return {
      valid: true,
      message: 'Sesión sin eventos registrados',
      totalEvents: 0,
    };
  }

  // Ejecutar validación criptográfica de la cadena
  const validationResult = validateHashChain(events);

  return {
    ...validationResult,
    sessionId,
    firstEvent: events[0]?.event_id,
    lastEvent: events[events.length - 1]?.event_id,
    message: validationResult.valid
      ? `✅ Cadena de integridad válida (${events.length} eventos)`
      : `❌ Cadena comprometida en el evento #${validationResult.brokenAt}`,
  };
};

/**
 * Obtiene el historial completo de eventos de una sesión.
 * Incluye validación de integridad de la cadena.
 *
 * @param {string} sessionId - UUID de la sesión
 * @returns {Promise<Object>} Eventos y estado de la cadena
 */
const getSessionAuditTrail = async (sessionId) => {
  const events = await EventLog.getEventsBySession(sessionId);
  const integrityCheck = await validateSessionIntegrity(sessionId);

  return {
    sessionId,
    totalEvents: events.length,
    chainIntegrity: integrityCheck,
    events,
  };
};

/**
 * Recupera un evento específico por su ID.
 *
 * @param {string} eventId - UUID del evento
 * @returns {Promise<Object|null>} Evento encontrado o null
 */
const getEventById = async (eventId) => {
  return await EventLog.getEventById(eventId);
};

module.exports = {
  logEvent,
  validateSessionIntegrity,
  getSessionAuditTrail,
  getEventById,
};
