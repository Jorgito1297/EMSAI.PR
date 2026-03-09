/**
 * CLERE Core Audit Engine
 * Configuración principal de Express
 *
 * Configura middleware global, rutas y manejo de errores.
 * Separado de server.js para facilitar testing (supertest).
 *
 * TODO: Implementar compression middleware para respuestas grandes
 * TODO: Agregar OpenAPI/Swagger para documentación interactiva
 */

'use strict';

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const eventsRouter = require('./routes/events');

const app = express();

// ============================================================
// Middleware de Seguridad y Utilidades Globales
// ============================================================

// Helmet: configura headers HTTP de seguridad
app.use(helmet());

// CORS: permite requests desde el frontend de CLERE
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [
      'http://localhost:3000',  // backend dev / legacy
      'http://localhost:3001',  // Next.js frontend dev
      'http://localhost:8080',  // alternate frontend
    ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Morgan: logging de HTTP requests (solo en desarrollo)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Parseo de JSON en el body de los requests
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ============================================================
// Rutas de la API
// ============================================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'CLERE Core Audit Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Rutas de eventos clínicos (v1)
app.use('/api/v1/events', eventsRouter);

// ============================================================
// Manejo de Errores Global
// ============================================================

// 404 - Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado',
    path: req.originalUrl,
  });
});

// 500 - Error interno del servidor
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

module.exports = app;
