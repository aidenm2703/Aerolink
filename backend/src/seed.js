const { sequelize, models } = require('./models');
const samples = require('./data/samples.json');
async function seed() {
  await sequelize.sync();
  await sequelize.transaction(async transaction => {
    const ids = {};
    for (const [name, sample] of Object.entries(samples)) {
      const model = models[name], data = { ...sample };
      for (const [key, attr] of Object.entries(model.rawAttributes)) if (attr.references && data[key] != null) data[key] = ids[attr.references.model];
      const uniqueKey = name === 'clientes' ? 'correo' : name === 'casilleros' || name === 'facturas' ? 'numero' : name === 'paquetes' ? 'tracking' : 'codigo';
      const [row] = await model.findOrCreate({ where: { [uniqueKey]: data[uniqueKey] }, defaults: data, transaction });
      ids[name] = row.id;
    }
  });
  console.log('Seed completado: datos relacionados para las 15 entidades, sin borrar registros.');
}
seed().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => sequelize.close());
