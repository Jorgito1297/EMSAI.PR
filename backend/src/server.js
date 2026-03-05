/**
 * CLERE Core Audit Engine
 * Entry Point del Servidor
 *
 * Inicia el servidor Express después de verificar la
 * conexión a la base de datos. Maneja señales del sistema
 * para cierre graceful en contenedores Docker/AWS.
 *
 * TODO: Agregar integración con PM2 para producción
 * TODO: Implementar health checks de dependencias (Redis, n8n)
 */

'use strict';

require('dotenv').config();

const app = require('./app');
const { testConnection, pool } = require('./config/database');

const PORT = process.env.PORT || 3000;

/**
 * Inicia el servidor de la API
 */
const startServer = async () => {
  // Verificar conexión a la base de datos antes de iniciar
  const dbConnected = await testConnection();

  if (!dbConnected && process.env.NODE_ENV === 'production') {
    console.error('❌ No se puede iniciar el servidor sin conexión a la base de datos en producción');
    process.exit(1);
  }

  if (!dbConnected) {
    console.warn('⚠️  Servidor iniciado sin conexión a la base de datos (modo desarrollo)');
  }

  const server = app.listen(PORT, () => {
    console.log(`\n🚀 CLERE Core Audit Engine corriendo en puerto ${PORT}`);
    console.log(`📚 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`📊 API: http://localhost:${PORT}/api/v1/events\n`);
  });

  // Cierre graceful al recibir señales del sistema
  const gracefulShutdown = async (signal) => {
    console.log(`\n📛 Señal ${signal} recibida. Cerrando servidor...`);

    server.close(async () => {
      console.log('🔌 Servidor HTTP cerrado');

      // Cerrar conexiones del pool de PostgreSQL
      await pool.end();
      console.log('🐘 Pool de PostgreSQL cerrado');

      process.exit(0);
    });

    // Forzar cierre después de 10 segundos si no responde
    setTimeout(() => {
      console.error('❌ Cierre forzado por timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  return server;
};

startServer().catch((err) => {
  console.error('❌ Error fatal al iniciar el servidor:', err);
  process.exit(1);
});
