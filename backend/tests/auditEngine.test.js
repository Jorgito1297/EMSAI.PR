/**
 * CLERE Core Audit Engine
 * Tests Unitarios del Motor de Auditoría
 *
 * Valida la funcionalidad central del CAE:
 * - Generación de hash SHA-256
 * - Encadenamiento de hashes (blockchain-style)
 * - Validación de integridad de la cadena
 * - Endpoints de la API (con mock de base de datos)
 */

'use strict';

const {
  generateHash,
  validateHashChain,
  getPreviousHash,
  GENESIS_HASH,
} = require('../src/services/hashChainService');

// ============================================================
// Tests del Servicio de Hash Chain
// ============================================================

describe('HashChainService', () => {
  // Evento de prueba base
  const mockEvent = {
    session_id: '550e8400-e29b-41d4-a716-446655440000',
    timestamp_utc: '2025-01-15T12:00:00.000Z',
    actor_role: 'Field',
    jurisdiction_profile: 'USA',
    scenario_type: 'Field1',
    action_category: 'clinical',
    action_name: 'administer_oxygen',
    patient_id: '550e8400-e29b-41d4-a716-446655440001',
    rule_engine_result: 'pass',
    response_time_ms: 3200,
  };

  describe('generateHash()', () => {
    test('debe generar un hash SHA-256 de 64 caracteres hexadecimales', () => {
      const hash = generateHash(mockEvent, GENESIS_HASH);
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    test('debe generar el mismo hash para los mismos datos (determinístico)', () => {
      const hash1 = generateHash(mockEvent, GENESIS_HASH);
      const hash2 = generateHash(mockEvent, GENESIS_HASH);
      expect(hash1).toBe(hash2);
    });

    test('debe generar hashes diferentes para eventos diferentes', () => {
      const event2 = { ...mockEvent, action_name: 'intubate_patient' };
      const hash1 = generateHash(mockEvent, GENESIS_HASH);
      const hash2 = generateHash(event2, GENESIS_HASH);
      expect(hash1).not.toBe(hash2);
    });

    test('debe generar hashes diferentes para previousHash diferentes', () => {
      const hash1 = generateHash(mockEvent, GENESIS_HASH);
      const hash2 = generateHash(mockEvent, 'a'.repeat(64));
      expect(hash1).not.toBe(hash2);
    });

    test('debe cambiar si se modifica cualquier campo del evento', () => {
      const originalHash = generateHash(mockEvent, GENESIS_HASH);

      const tamperedEvent = { ...mockEvent, actor_role: 'System' };
      const tamperedHash = generateHash(tamperedEvent, GENESIS_HASH);

      expect(originalHash).not.toBe(tamperedHash);
    });
  });

  describe('getPreviousHash()', () => {
    test('debe retornar GENESIS_HASH cuando lastHash es null', () => {
      expect(getPreviousHash(null)).toBe(GENESIS_HASH);
    });

    test('debe retornar GENESIS_HASH cuando lastHash es undefined', () => {
      expect(getPreviousHash(undefined)).toBe(GENESIS_HASH);
    });

    test('debe retornar el hash provisto cuando no es null', () => {
      const existingHash = 'abc123' + '0'.repeat(58);
      expect(getPreviousHash(existingHash)).toBe(existingHash);
    });

    test('GENESIS_HASH debe tener 64 caracteres de ceros', () => {
      expect(GENESIS_HASH).toHaveLength(64);
      expect(GENESIS_HASH).toBe('0'.repeat(64));
    });
  });

  describe('validateHashChain()', () => {
    /**
     * Construye una cadena de eventos válida para testing
     */
    const buildValidChain = (count = 3) => {
      const events = [];

      for (let i = 0; i < count; i++) {
        const prevHash = i === 0 ? GENESIS_HASH : events[i - 1].hash_signature;

        const eventData = {
          ...mockEvent,
          action_name: `action_${i}`,
          timestamp_utc: `2025-01-15T12:0${i}:00.000Z`,
          previous_hash: prevHash,
        };

        const hash = generateHash(eventData, prevHash);
        events.push({ ...eventData, hash_signature: hash });
      }

      return events;
    };

    test('debe validar correctamente una cadena vacía', () => {
      const result = validateHashChain([]);
      expect(result.valid).toBe(true);
      expect(result.totalEvents).toBe(0);
    });

    test('debe validar un solo evento válido', () => {
      const events = buildValidChain(1);
      const result = validateHashChain(events);
      expect(result.valid).toBe(true);
      expect(result.totalEvents).toBe(1);
    });

    test('debe validar una cadena de 3 eventos correctamente enlazados', () => {
      const events = buildValidChain(3);
      const result = validateHashChain(events);
      expect(result.valid).toBe(true);
      expect(result.brokenAt).toBeNull();
      expect(result.totalEvents).toBe(3);
    });

    test('debe detectar manipulación de datos en el primer evento', () => {
      const events = buildValidChain(3);

      // Manipular el primer evento (cambiar campo pero no recalcular hash)
      events[0] = { ...events[0], actor_role: 'System' };

      const result = validateHashChain(events);
      expect(result.valid).toBe(false);
      expect(result.brokenAt).toBe(0);
    });

    test('debe detectar manipulación en un evento intermedio', () => {
      const events = buildValidChain(5);

      // Manipular el segundo evento (índice 1)
      events[1] = { ...events[1], action_name: 'manipulated_action' };

      const result = validateHashChain(events);
      expect(result.valid).toBe(false);
      // La cadena se rompe en el índice 1 o en el siguiente (2)
      expect(result.brokenAt).toBeLessThanOrEqual(2);
    });

    test('debe detectar si se inserta un evento en la cadena', () => {
      const events = buildValidChain(3);

      // Insertar un evento falso en el medio
      const fakeEvent = {
        ...mockEvent,
        action_name: 'fake_action',
        timestamp_utc: '2025-01-15T12:00:30.000Z',
        previous_hash: events[0].hash_signature,
        hash_signature: 'f'.repeat(64), // hash falso
      };

      events.splice(1, 0, fakeEvent);

      const result = validateHashChain(events);
      expect(result.valid).toBe(false);
    });

    test('debe validar una cadena de 10 eventos', () => {
      const events = buildValidChain(10);
      const result = validateHashChain(events);
      expect(result.valid).toBe(true);
      expect(result.totalEvents).toBe(10);
    });
  });
});

// ============================================================
// Tests de la API con mock de base de datos
// ============================================================

// Mock del módulo de base de datos para tests de integración
jest.mock('../src/config/database', () => ({
  query: jest.fn(),
  getClient: jest.fn(),
  pool: { end: jest.fn() },
  testConnection: jest.fn().mockResolvedValue(true),
}));

const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/database');

describe('API Endpoints - POST /api/v1/events', () => {
  // Datos de request válidos para tests
  const validEventRequest = {
    session_id: '550e8400-e29b-41d4-a716-446655440000',
    actor_role: 'Field',
    jurisdiction_profile: 'USA',
    scenario_type: 'Field1',
    action_category: 'clinical',
    action_name: 'administer_oxygen',
    patient_id: '550e8400-e29b-41d4-a716-446655440001',
    clinical_phase: 'scene',
    decision_input: { spo2: 88, intervention: 'NRB_15L' },
    rule_engine_result: 'pass',
    response_time_ms: 3200,
  };

  beforeEach(() => {
    // Resetear mocks antes de cada test
    jest.clearAllMocks();
  });

  test('debe registrar un evento válido y retornar 201 con hash', async () => {
    // Mock: no hay eventos previos en la sesión (primer evento = génesis)
    db.query
      .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // getLastEventBySession
      .mockResolvedValueOnce({                          // createEvent
        rows: [{
          event_id: '660e8400-e29b-41d4-a716-446655440000',
          hash_signature: 'a'.repeat(64),
          timestamp_utc: new Date().toISOString(),
        }],
        rowCount: 1,
      });

    const response = await request(app)
      .post('/api/v1/events')
      .send(validEventRequest)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.event_id).toBeDefined();
    expect(response.body.hash_signature).toBeDefined();
    expect(response.body.chain_valid).toBe(true);
  });

  test('debe retornar 400 si falta session_id', async () => {
    const { session_id: _session_id, ...invalidRequest } = validEventRequest;

    const response = await request(app)
      .post('/api/v1/events')
      .send(invalidRequest)
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBeDefined();
  });

  test('debe retornar 400 si actor_role es inválido', async () => {
    const response = await request(app)
      .post('/api/v1/events')
      .send({ ...validEventRequest, actor_role: 'InvalidRole' })
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  test('debe retornar 400 si jurisdiction_profile es inválido', async () => {
    const response = await request(app)
      .post('/api/v1/events')
      .send({ ...validEventRequest, jurisdiction_profile: 'INVALID' })
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  test('debe retornar 400 si risk_score está fuera de rango (0-100)', async () => {
    const response = await request(app)
      .post('/api/v1/events')
      .send({ ...validEventRequest, risk_score: 150 })
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  test('debe aceptar evento con campos opcionales omitidos', async () => {
    const minimalRequest = {
      session_id: '550e8400-e29b-41d4-a716-446655440000',
      actor_role: 'Dispatcher',
      jurisdiction_profile: 'PR',
      scenario_type: 'Field2',
      action_category: 'communication',
      action_name: 'radio_contact',
    };

    db.query
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
      .mockResolvedValueOnce({
        rows: [{
          event_id: '770e8400-e29b-41d4-a716-446655440000',
          hash_signature: 'b'.repeat(64),
          timestamp_utc: new Date().toISOString(),
        }],
        rowCount: 1,
      });

    const response = await request(app)
      .post('/api/v1/events')
      .send(minimalRequest)
      .expect(201);

    expect(response.body.success).toBe(true);
  });

  test('el hash_signature debe ser una cadena de 64 caracteres hexadecimales', async () => {
    // Para este test usamos el hash real generado (sin mock del hash)
    db.query
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
      .mockResolvedValueOnce({
        rows: [{
          event_id: '880e8400-e29b-41d4-a716-446655440000',
          hash_signature: generateHash(
            { ...validEventRequest, timestamp_utc: new Date().toISOString() },
            GENESIS_HASH
          ),
          timestamp_utc: new Date().toISOString(),
        }],
        rowCount: 1,
      });

    const response = await request(app)
      .post('/api/v1/events')
      .send(validEventRequest)
      .expect(201);

    expect(response.body.hash_signature).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe('API Endpoints - GET /health', () => {
  test('debe retornar 200 con estado ok', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body.status).toBe('ok');
    expect(response.body.service).toBe('CLERE Core Audit Engine');
  });
});

describe('API Endpoints - Rutas no existentes', () => {
  test('debe retornar 404 para rutas desconocidas', async () => {
    const response = await request(app)
      .get('/api/v1/nonexistent')
      .expect(404);

    expect(response.body.success).toBe(false);
  });
});

describe('API Endpoints - GET /api/v1/events/:eventId', () => {
  test('debe retornar 400 para un UUID inválido', async () => {
    const response = await request(app)
      .get('/api/v1/events/not-a-valid-uuid')
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  test('debe retornar 404 si el evento no existe', async () => {
    db.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const response = await request(app)
      .get('/api/v1/events/550e8400-e29b-41d4-a716-446655440099')
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('no encontrado');
  });
});
