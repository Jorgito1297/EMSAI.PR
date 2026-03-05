# CLERE Core Audit Engine (CAE)

> **"La caja negra de la simulación clínica"**

El **Core Audit Engine** es la infraestructura fundacional de CLERE (Centro de Liderazgo en Respuestas a Emergencias). Proporciona registro inmutable de eventos clínicos, trazabilidad forense y la base para evaluación neurocognitiva de profesionales de salud.

---

## 🎯 Propósito

El CAE es la columna vertebral invisible que habilita:

- 📋 **Registro inmutable** de cada decisión y acción clínica (blockchain-style)
- ⚖️ **Reportes médico-legales** con trazabilidad criptográfica completa
- 🧠 **Perfilación neurocognitiva** mediante métricas invisibles
- 🤖 **Memoria persistente de IA** vía integración con n8n
- 🏆 **Certificación internacional** INCLC con validez académica y legal

Sin este fundamento sólido e inmutable, ninguna otra funcionalidad de CLERE puede construirse de manera confiable.

---

## 🏗️ Arquitectura del Sistema

```
CLERE Core Audit Engine
├── PostgreSQL (persistencia inmutable)
│   ├── event_log_master      → Caja negra de la simulación
│   ├── patient_current_state → Estado actual del paciente
│   ├── communication_transcripts → Transcripciones de comunicación
│   ├── performance_metrics   → Métricas de rendimiento y CLERE indices
│   └── legal_analysis_layer  → Análisis médico-legal forense
├── Hash Chain (integridad criptográfica)
│   └── SHA-256 encadenado entre eventos (blockchain-style)
├── Express API (REST)
│   └── POST/GET /api/v1/events
└── TODO: Redis (caché de estado en tiempo real)
    └── TODO: n8n (orquestación IA y memoria persistente)
```

---

## 📁 Estructura del Proyecto

```
/backend
  /src
    /config
      database.js         # Configuración de conexión a PostgreSQL con pool
    /models
      EventLog.js          # Modelo de event_log_master (caja negra)
      PatientState.js      # Modelo de patient_current_state
      PerformanceMetrics.js # Modelo de performance_metrics (índices CLERE)
    /services
      auditService.js      # Lógica central del motor de auditoría
      hashChainService.js  # Implementación del hash chain criptográfico
    /controllers
      eventController.js   # Controladores de endpoints de la API
    /routes
      events.js            # Definición de rutas Express
    /middleware
      validation.js        # Validación de input con Joi
      authentication.js    # Autenticación JWT (placeholder para producción)
    app.js                 # Configuración de Express (separado para testing)
    server.js              # Entry point del servidor
  /migrations
    001_initial_schema.sql # Schema completo de PostgreSQL (5 tablas)
  /tests
    auditEngine.test.js    # Tests unitarios e integración del CAE
  package.json
  .env.example
  README.md
```

---

## 🗄️ Schema de Base de Datos

### Tabla Principal: `event_log_master`

La "caja negra" del simulador. **Cada acción, decisión y evento** queda registrado aquí con firma criptográfica.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `event_id` | UUID | Identificador único del evento (PK) |
| `session_id` | UUID | Sesión de simulación |
| `timestamp_utc` | TIMESTAMP | Marca temporal en UTC |
| `actor_role` | VARCHAR | Field \| Dispatcher \| MedicalControl \| System |
| `jurisdiction_profile` | VARCHAR | USA \| PR \| Custom |
| `action_category` | VARCHAR | clinical \| communication \| logistics \| authorization |
| `hash_signature` | VARCHAR(64) | SHA-256 del evento (encadenado) |
| `previous_hash` | VARCHAR(64) | Hash del evento anterior (chain) |
| `risk_score` | INTEGER | Score de riesgo 0-100 |
| `legal_relevance_flag` | BOOLEAN | Evento con relevancia legal |

### Tabla: `patient_current_state`

Estado actual del paciente para acceso rápido durante la simulación. Los cambios también se registran en `event_log_master`.

### Tabla: `communication_transcripts`

Transcripciones completas de comunicación entre roles. Incluye análisis de tono y claridad para evaluación de trabajo en equipo.

### Tabla: `performance_metrics`

Métricas agregadas por sesión con los **Índices CLERE**:
- **CCPI**: CLERE Clinical Performance Index
- **CSAI**: CLERE Stress Adaptation Index  
- **CCSS**: CLERE Cognitive Stability Score
- **CLDL**: CLERE Leadership Development Level

### Tabla: `legal_analysis_layer`

Capa de análisis médico-legal forense, vinculada a `event_log_master` con referencias al estándar de cuidado.

---

## 🔐 Sistema de Hash Chain (Integridad Inmutable)

El CAE implementa un sistema de cadena de hashes **estilo blockchain** para garantizar que ningún evento pueda ser alterado retroactivamente sin detección.

### Funcionamiento

```
Evento 1 ─────────────────────────────────────────────
  hash = SHA256(eventData + GENESIS_HASH)
  hash_signature = "abc123..."
  
Evento 2 ────────────────────────────────────────────
  hash = SHA256(eventData + "abc123...")   ← encadenado
  hash_signature = "def456..."
  
Evento 3 ──────────────────────────────────────────── 
  hash = SHA256(eventData + "def456...")   ← encadenado
  hash_signature = "ghi789..."
```

Si cualquier evento es alterado, su hash cambia y rompe la cadena. Esto es **detectable y evidenciable** en procedimientos legales.

### Validación de Integridad

```bash
GET /api/v1/events/session/{sessionId}/validate
```

Respuesta para cadena válida:
```json
{
  "valid": true,
  "message": "✅ Cadena de integridad válida (47 eventos)",
  "totalEvents": 47,
  "brokenAt": null
}
```

---

## 🌐 Endpoints de la API

### `POST /api/v1/events`

Registra un nuevo evento clínico en el audit log con firma criptográfica.

**Request:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "actor_role": "Field",
  "jurisdiction_profile": "USA",
  "scenario_type": "Field1",
  "action_category": "clinical",
  "action_name": "administer_oxygen",
  "patient_id": "550e8400-e29b-41d4-a716-446655440001",
  "clinical_phase": "scene",
  "decision_input": {
    "spo2": 88,
    "intervention": "NRB_15L"
  },
  "rule_engine_result": "pass",
  "response_time_ms": 3200
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "event_id": "660e8400-e29b-41d4-a716-446655440000",
  "hash_signature": "3a7bd3e2360a3d29eea436fcfb7e44c735d117c42d1c1835420b6b9942dd4f1b",
  "chain_valid": true,
  "timestamp_utc": "2025-01-15T12:00:00.000Z",
  "chain_position": "genesis"
}
```

### `GET /api/v1/events/:eventId`

Recupera un evento específico por su UUID.

### `GET /api/v1/events/session/:sessionId`

Recupera el audit trail completo de una sesión con validación de integridad.

### `GET /api/v1/events/session/:sessionId/validate`

Valida criptográficamente la integridad de toda la cadena de una sesión. Retorna 200 si es válida, 409 si está comprometida.

### `GET /health`

Health check del servicio.

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js >= 18.x
- PostgreSQL >= 14
- npm >= 9.x

### Pasos de Instalación

```bash
# 1. Instalar dependencias
cd backend
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL

# 3. Ejecutar migraciones de base de datos
psql -U <usuario> -d <database> -f migrations/001_initial_schema.sql

# 4. Iniciar en desarrollo
npm run dev

# 5. Iniciar en producción
npm start
```

### Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de conexión a PostgreSQL | `postgresql://user:pass@localhost:5432/clere_db` |
| `NODE_ENV` | Ambiente de ejecución | `development` \| `production` |
| `PORT` | Puerto del servidor | `3000` |
| `JWT_SECRET` | Clave secreta para JWT | `super-secret-key-min-32-chars` |

---

## 🧪 Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar con cobertura de código
npm run test:coverage
```

Los tests cubren:
- ✅ Generación determinística de hashes SHA-256
- ✅ Detección de manipulación en la cadena de hashes
- ✅ Validación de campos requeridos en la API
- ✅ Rechazo de valores fuera de rango
- ✅ Endpoint de health check
- ✅ Manejo de rutas no encontradas (404)
- ✅ Respuesta correcta para eventos no encontrados

---

## 🔮 Roadmap de Integraciones

### Fase 2: Redis Cache
```
# Variables a agregar en .env
REDIS_URL=redis://localhost:6379
```
- Cache de estado del paciente en tiempo real
- Pub/Sub para broadcasting de cambios via WebSocket
- TTL automático al finalizar sesiones

### Fase 3: n8n AI Integration
```
# Variables a agregar en .env  
N8N_WEBHOOK_URL=http://localhost:5678/webhook/clere-events
```
- Publicación automática de eventos a n8n
- Análisis de IA de patrones de decisión
- Memoria persistente del asistente AI entre sesiones
- Generación automática de reportes de feedback

### Fase 4: WebSocket (Tiempo Real)
- Broadcasting de actualizaciones de estado del paciente
- Notificaciones de alertas críticas en tiempo real
- Sincronización multi-usuario para simulaciones de equipo

---

## 📊 Índices CLERE

Los 4 índices de evaluación neurocognitiva invisible:

| Índice | Nombre Completo | Descripción |
|--------|-----------------|-------------|
| **CCPI** | CLERE Clinical Performance Index | Precisión clínica global en la sesión |
| **CSAI** | CLERE Stress Adaptation Index | Capacidad de mantener rendimiento bajo presión |
| **CCSS** | CLERE Cognitive Stability Score | Consistencia cognitiva ante variables caóticas |
| **CLDL** | CLERE Leadership Development Level | Indicadores de liderazgo en comunicación y coordinación |

---

## 🏛️ Contexto Legal

El sistema está diseñado para soportar **reportes médico-legales forenses**:

- Cada evento tiene un hash SHA-256 vinculado a los datos exactos en ese momento
- La cadena de hashes garantiza que ningún evento puede ser alterado retroactivamente
- La tabla `legal_analysis_layer` analiza cada evento contra el estándar de cuidado
- Compatible con requerimientos de jurisdicción USA y Puerto Rico

---

## 📝 Licencia

Todos los derechos reservados - CLERE 2025

---

*Desarrollado con pasión para transformar la educación en emergencias médicas.*
