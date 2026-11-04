const app = require('./src/app');
const { sequelize } = require('./src/models');
async function start() {
  await sequelize.authenticate();
  await sequelize.sync();
  const port = Number(process.env.PORT || 3000);
  const server = app.listen(port, () => console.log('Aerolink | BD conectada | http://localhost:' + port + '/api'));
  server.on('error', error => { console.error('No se pudo iniciar:', error.message); process.exitCode = 1; });
}
start().catch(error => { console.error('No se pudo iniciar:', error.message); process.exitCode = 1; });
