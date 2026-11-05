const app = require('./src/app');
const { sequelize } = require('./src/models');
const agente = require('./src/v2/agents/notificaciones');
let server;
async function shutdown() {
  await agente.stop();
  if (server) await new Promise(resolve => server.close(resolve));
  await sequelize.close();
}
async function start() {
  const port = Number(process.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT inválido.');
  await sequelize.authenticate();
  // Crea tablas faltantes; no altera ni elimina las tablas existentes.
  await sequelize.sync();
  server = app.listen(port);
  await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); });
  agente.start();
  console.log('Aerolink | ' + sequelize.getDialect() + ' conectado | base: ' + sequelize.config.database + ' | http://localhost:' + port + '/api');
  process.once('SIGINT', () => shutdown().catch(() => { process.exitCode = 1; }));
  process.once('SIGTERM', () => shutdown().catch(() => { process.exitCode = 1; }));
}
start().catch(async error => {
  console.error('No se pudo iniciar Aerolink: ' + error.message);
  await sequelize.close();
  process.exitCode = 1;
});

