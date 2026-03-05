/**
 * CLERE Core Audit Engine
 * Configuración de conexión a PostgreSQL
 *
 * Utiliza la librería 'pg' con pool de conexiones para
 * manejo eficiente de múltiples requests concurrentes.
 *
 * TODO: Agregar configuración de SSL para producción en AWS
 * TODO: Integrar con Redis para caché de queries frecuentes
 */

'use strict';

const { Pool } = require('pg');

// Pool de conexiones - reutiliza conexiones para mejor rendimiento
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
  // Configuración del pool de conexiones
  max: 20,                  // máximo de conexiones concurrentes
  idleTimeoutMillis: 30000, // tiempo de espera antes de cerrar conexión inactiva
  connectionTimeoutMillis: 2000, // timeout para obtener conexión del pool
});

// Manejo de errores del pool de conexiones
pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL:', err);
  process.exit(-1);
});

/**
 * Ejecuta una query SQL con parámetros opcionales
 * @param {string} text - Query SQL
 * @param {Array} params - Parámetros de la query
 * @returns {Promise<Object>} Resultado de la query
 */
const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;

  // Log en desarrollo para debugging de queries lentas
  if (process.env.NODE_ENV === 'development') {
    console.log('Query ejecutada:', { text, duration: `${duration}ms`, rows: res.rowCount });
  }

  return res;
};

/**
 * Obtiene un cliente dedicado del pool para transacciones
 * @returns {Promise<Object>} Cliente de base de datos
 */
const getClient = async () => {
  const client = await pool.connect();
  const originalQuery = client.query.bind(client);
  const originalRelease = client.release.bind(client);

  // Wrapper para detectar conexiones que no se liberan
  const acquisitionStack = new Error('Contexto de adquisición del cliente de base de datos');
  const timeout = setTimeout(() => {
    console.error(
      '⚠️ Cliente de base de datos no liberado después de 5 segundos.\n' +
      'Stack de adquisición:\n' + acquisitionStack.stack
    );
  }, 5000);

  client.query = (...args) => originalQuery(...args);
  client.release = () => {
    clearTimeout(timeout);
    client.release = originalRelease;
    return originalRelease();
  };

  return client;
};

/**
 * Verifica la conexión a la base de datos
 * @returns {Promise<boolean>} true si la conexión es exitosa
 */
const testConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Conexión a PostgreSQL establecida:', res.rows[0].now);
    return true;
  } catch (err) {
    console.error('❌ Error al conectar a PostgreSQL:', err.message);
    return false;
  }
};

module.exports = { query, getClient, pool, testConnection };
