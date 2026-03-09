/**
 * CLERE Core Audit Engine
 * Middleware de Validación de Input
 *
 * Valida todos los datos de entrada usando Joi antes de
 * que lleguen a los servicios o la base de datos.
 * Previene inyección de datos maliciosos y errores de tipo.
 *
 * TODO: Agregar validaciones específicas por jurisdiction_profile
 * TODO: Implementar sanitización de texto libre (raw_text en transcripts)
 */

'use strict';

const Joi = require('joi');

/**
 * Schema de validación para el endpoint POST /api/v1/events
 * Valida el body del request de log de eventos clínicos.
 */
const eventLogSchema = Joi.object({
  // Identificadores de sesión (obligatorio)
  session_id: Joi.string().uuid({ version: 'uuidv4' }).required()
    .messages({ 'string.guid': 'session_id debe ser un UUID v4 válido' }),

  // Datos del actor (obligatorio)
  actor_role: Joi.string().valid('Field', 'Dispatcher', 'MedicalControl', 'System').required()
    .messages({ 'any.only': 'actor_role debe ser: Field, Dispatcher, MedicalControl, o System' }),

  actor_user_id: Joi.string().uuid({ version: 'uuidv4' }).optional().allow(null),

  // Contexto de la simulación (obligatorio)
  jurisdiction_profile: Joi.string().valid('USA', 'PR', 'Custom').required()
    .messages({ 'any.only': 'jurisdiction_profile debe ser: USA, PR, o Custom' }),

  scenario_type: Joi.string().valid(
    'Field1', 'Field2', 'Field3', 'Field4',
    'Hospital', 'AirMed', 'MassCasualty'
  ).required()
    .messages({ 'any.only': 'scenario_type inválido' }),

  // Datos de la acción (obligatorio)
  action_category: Joi.string().valid('clinical', 'communication', 'logistics', 'authorization').required()
    .messages({ 'any.only': 'action_category debe ser: clinical, communication, logistics, o authorization' }),

  action_name: Joi.string().max(100).required(),

  // Datos del paciente (opcional)
  patient_id: Joi.string().uuid({ version: 'uuidv4' }).optional().allow(null),

  clinical_phase: Joi.string().valid('scene', 'transport', 'hospital').optional().allow(null),

  // Datos de decisión clínica (opcionales)
  decision_input: Joi.object().optional().allow(null),

  rule_engine_result: Joi.string().valid('pass', 'fail', 'conditional').optional().allow(null),

  llm_recommendation: Joi.object().optional().allow(null),

  human_override_flag: Joi.boolean().optional().default(false),

  final_decision: Joi.object().optional().allow(null),

  // Métricas de rendimiento (opcionales)
  response_time_ms: Joi.number().integer().min(0).optional().allow(null),

  risk_score: Joi.number().integer().min(0).max(100).optional().allow(null),

  // Metadatos (opcionales)
  protocol_reference: Joi.string().max(200).optional().allow(null),

  legal_relevance_flag: Joi.boolean().optional().default(false),

  chaos_factor_active: Joi.boolean().optional().default(false),

  score_delta: Joi.number().integer().optional().allow(null),

  pre_condition_state: Joi.object().optional().allow(null),
});

/**
 * Middleware de validación para eventos clínicos.
 * Retorna 400 Bad Request si la validación falla.
 *
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Next middleware
 */
const validateEventLog = (req, res, next) => {
  const { error, value } = eventLogSchema.validate(req.body, {
    abortEarly: false,   // Reportar todos los errores, no solo el primero
    stripUnknown: true,  // Eliminar campos no definidos en el schema
  });

  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Datos de entrada inválidos',
      details: error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      })),
    });
  }

  // Reemplazar req.body con los datos validados y sanitizados
  req.body = value;
  next();
};

/**
 * Middleware de validación para parámetros UUID en la URL.
 *
 * @param {string} paramName - Nombre del parámetro a validar
 * @returns {Function} Middleware de Express
 */
const validateUuidParam = (paramName = 'id') => (req, res, next) => {
  const schema = Joi.object({
    [paramName]: Joi.string().uuid({ version: 'uuidv4' }).required(),
  });

  const { error } = schema.validate({ [paramName]: req.params[paramName] });

  if (error) {
    return res.status(400).json({
      success: false,
      error: `Parámetro '${paramName}' inválido: debe ser un UUID v4`,
    });
  }

  next();
};

module.exports = {
  validateEventLog,
  validateUuidParam,
  eventLogSchema,
};
