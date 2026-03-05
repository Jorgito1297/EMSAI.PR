-- ============================================================
-- CLERE Core Audit Engine - Esquema Inicial de Base de Datos
-- Migración: 001_initial_schema.sql
-- Descripción: Crea todas las tablas del Core Audit Engine (CAE)
-- ============================================================

-- Habilitar extensión para generación de UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLA PRINCIPAL: event_log_master
-- La "caja negra" del simulador. Cada acción, decisión y
-- evento queda registrado aquí de forma inmutable.
-- ============================================================
CREATE TABLE IF NOT EXISTS event_log_master (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    timestamp_utc TIMESTAMP NOT NULL DEFAULT NOW(),
    actor_user_id UUID,
    actor_role VARCHAR(50) NOT NULL,       -- Field | Dispatcher | MedicalControl | System
    jurisdiction_profile VARCHAR(50) NOT NULL, -- USA | PR | Custom
    scenario_type VARCHAR(50) NOT NULL,    -- Field1-4 | Hospital | AirMed | MassCasualty
    action_category VARCHAR(50) NOT NULL,  -- clinical | communication | logistics | authorization
    action_name VARCHAR(100) NOT NULL,
    patient_id UUID,
    clinical_phase VARCHAR(50),            -- scene | transport | hospital
    pre_condition_state_json JSONB,
    decision_input_json JSONB,
    rule_engine_result VARCHAR(20),        -- pass | fail | conditional
    llm_recommendation_json JSONB,
    human_override_flag BOOLEAN DEFAULT FALSE,
    final_decision_json JSONB,
    response_time_ms INTEGER,
    risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 100),
    protocol_reference VARCHAR(200),
    legal_relevance_flag BOOLEAN DEFAULT FALSE,
    chaos_factor_active BOOLEAN DEFAULT FALSE,
    score_delta INTEGER,
    hash_signature VARCHAR(64) NOT NULL,
    previous_hash VARCHAR(64),
    CONSTRAINT valid_actor_role CHECK (actor_role IN ('Field', 'Dispatcher', 'MedicalControl', 'System')),
    CONSTRAINT valid_jurisdiction CHECK (jurisdiction_profile IN ('USA', 'PR', 'Custom'))
);

CREATE INDEX IF NOT EXISTS idx_session_id ON event_log_master(session_id);
CREATE INDEX IF NOT EXISTS idx_timestamp ON event_log_master(timestamp_utc);
CREATE INDEX IF NOT EXISTS idx_patient_id ON event_log_master(patient_id);
CREATE INDEX IF NOT EXISTS idx_actor_role ON event_log_master(actor_role);

-- ============================================================
-- TABLA: patient_current_state
-- Arquitectura de estado híbrido - mantiene el estado actual
-- del paciente para acceso rápido durante la simulación.
-- ============================================================
CREATE TABLE IF NOT EXISTS patient_current_state (
    patient_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    vitals JSONB NOT NULL,                 -- { bp, hr, spo2, rr, gcs, temp }
    airway_status VARCHAR(50),
    circulation_status VARCHAR(50),
    interventions_active JSONB,            -- array de intervenciones activas
    medications_administered JSONB,        -- array de medicamentos con dosis y tiempos
    transport_mode VARCHAR(50),
    airmed_status VARCHAR(50),
    hospital_destination VARCHAR(100),
    risk_level VARCHAR(20) CHECK (risk_level IN ('stable', 'moderate', 'critical')),
    time_since_scene_arrival INTEGER,      -- segundos
    last_updated TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_patient ON patient_current_state(session_id);

-- ============================================================
-- TABLA: communication_transcripts
-- Registra todas las comunicaciones entre roles.
-- Crítico para evaluación de desempeño en equipo.
-- ============================================================
CREATE TABLE IF NOT EXISTS communication_transcripts (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    sender_role VARCHAR(50) NOT NULL,
    receiver_role VARCHAR(50) NOT NULL,
    timestamp_utc TIMESTAMP NOT NULL DEFAULT NOW(),
    raw_text TEXT NOT NULL,
    structured_intent JSONB,
    tone_analysis_score INTEGER CHECK (tone_analysis_score BETWEEN 0 AND 100),
    clarity_score INTEGER CHECK (clarity_score BETWEEN 0 AND 100),
    latency_ms INTEGER
);

CREATE INDEX IF NOT EXISTS idx_comm_session ON communication_transcripts(session_id);

-- ============================================================
-- TABLA: performance_metrics
-- Métricas agregadas por sesión/usuario para certificación
-- y perfilación neurocognitiva (CCPI, CSAI, CCSS, CLDL).
-- ============================================================
CREATE TABLE IF NOT EXISTS performance_metrics (
    metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL UNIQUE,
    user_id UUID NOT NULL,
    team_id UUID,
    clinical_accuracy_percent DECIMAL(5,2),
    decision_time_average_ms INTEGER,
    resource_efficiency_score INTEGER CHECK (resource_efficiency_score BETWEEN 0 AND 100),
    leadership_score INTEGER CHECK (leadership_score BETWEEN 0 AND 100),
    airmed_appropriateness_score INTEGER CHECK (airmed_appropriateness_score BETWEEN 0 AND 100),
    mortality_preventability_index DECIMAL(5,2),
    overall_simulation_score INTEGER CHECK (overall_simulation_score BETWEEN 0 AND 100),
    ccpi INTEGER,  -- CLERE Clinical Performance Index
    csai INTEGER,  -- CLERE Stress Adaptation Index
    ccss INTEGER,  -- CLERE Cognitive Stability Score
    cldl INTEGER,  -- CLERE Leadership Development Level
    completed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_metrics_user ON performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_metrics_session ON performance_metrics(session_id);

-- ============================================================
-- TABLA: legal_analysis_layer
-- Para simulación de reportes médico-legales y forenses.
-- Vinculada a event_log_master para trazabilidad completa.
-- ============================================================
CREATE TABLE IF NOT EXISTS legal_analysis_layer (
    analysis_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES event_log_master(event_id) ON DELETE CASCADE,
    standard_of_care_match_score INTEGER CHECK (standard_of_care_match_score BETWEEN 0 AND 100),
    deviation_severity VARCHAR(20) CHECK (deviation_severity IN ('none', 'minor', 'moderate', 'severe')),
    defensibility_index INTEGER CHECK (defensibility_index BETWEEN 0 AND 100),
    negligence_risk_level VARCHAR(20) CHECK (negligence_risk_level IN ('low', 'moderate', 'high')),
    documentation_completeness_score INTEGER CHECK (documentation_completeness_score BETWEEN 0 AND 100),
    jurisdiction_reference VARCHAR(200)
);

CREATE INDEX IF NOT EXISTS idx_legal_event ON legal_analysis_layer(event_id);
