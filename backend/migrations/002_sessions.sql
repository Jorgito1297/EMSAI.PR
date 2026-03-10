-- ============================================================
-- CLERE Core Audit Engine - Migración 002: Tabla de Sesiones
-- Descripción: Agrega la tabla sessions para rastrear el
-- ciclo de vida de las sesiones de simulación clínica.
-- ============================================================

CREATE TABLE IF NOT EXISTS sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_type VARCHAR(50) NOT NULL,
    jurisdiction_profile VARCHAR(50) NOT NULL,
    user_id UUID,
    team_id UUID,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    paused_at TIMESTAMP,
    completed_at TIMESTAMP,
    notes TEXT,
    CONSTRAINT valid_session_status CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
    CONSTRAINT valid_scenario_type CHECK (scenario_type IN ('Field1', 'Field2', 'Field3', 'Field4', 'Hospital', 'AirMed', 'MassCasualty')),
    CONSTRAINT valid_jurisdiction CHECK (jurisdiction_profile IN ('USA', 'PR', 'Custom'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_started ON sessions(started_at);
