# CLERE - Centro de Liderazgo en Respuestas a Emergencias

**"Aprende Jugando. Responde con Excelencia."**

## 🧠 Visión

CLERE es una plataforma de simulación clínica que integra neurociencias cognitivas para entrenar profesionales de la salud en respuestas a emergencias, con registro inmutable de decisiones clínicas para validez legal y académica.

## 🎯 Características Principales

- 📋 Registro inmutable de eventos clínicos (blockchain-style hash chain)
- 🧠 Evaluación neurocognitiva invisible (índices CCPI, CSAI, CCSS, CLDL)
- 🏆 Certificación internacional (INCLC - Online Track)
- ⚖️ Reportes médico-legales con trazabilidad criptográfica
- 🌍 Multi-jurisdicción: USA, Puerto Rico y personalizable

## 🏗️ Estructura del Proyecto

```
/
├── backend/          # Core Audit Engine (Node.js + Express + PostgreSQL)
│   ├── src/          # Servicios, modelos, controladores, rutas, middleware
│   ├── migrations/   # Schema de PostgreSQL (5 tablas)
│   └── tests/        # 27 tests unitarios
│
├── frontend/         # Dashboard (Next.js 16 + React 19 + TypeScript)
│   ├── app/          # App Router: Dashboard, Eventos, Audit Trail, Métricas
│   ├── components/   # Navbar, EventForm, AuditTrail, StatCard, etc.
│   ├── lib/          # API client, Zod schemas, TanStack Query config
│   └── hooks/        # Custom React Query hooks
│
└── README.md
```

## 🛠️ Stack Técnico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript strict, Tailwind CSS 4 |
| **Data Fetching** | TanStack Query v5 |
| **Validation** | Zod v4 |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Backend** | Node.js, Express |
| **Database** | PostgreSQL |
| **Security** | SHA-256 Hash Chain, JWT (placeholder), Rate Limiting |
| **Cloud (futuro)** | AWS, Redis, n8n |

## 🚀 Inicio Rápido

### Backend (Core Audit Engine)
```bash
cd backend
npm install
cp .env.example .env   # Configurar DATABASE_URL
psql -f migrations/001_initial_schema.sql
npm run dev            # Puerto 3000
```

### Frontend (Dashboard)
```bash
cd frontend
npm install
cp .env.example .env.local   # Configurar NEXT_PUBLIC_API_URL
npm run dev                   # Puerto 3001
```

Acceder a: `http://localhost:3001`

## 📜 Licencia

Todos los derechos reservados - CLERE 2025

---

**Desarrollado con pasión para transformar la educación en emergencias médicas.**
