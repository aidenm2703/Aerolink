require('./database');
const secret = process.env.JWT_SECRET;
if (!secret || Buffer.byteLength(secret) < 32 || secret.startsWith('reemplazar_')) throw new Error('Configura JWT_SECRET con una clave aleatoria de al menos 32 bytes en backend/.env.');
module.exports = { secret, expiresIn: process.env.JWT_EXPIRES_IN || '1h', issuer: 'aerolink', audience: 'aerolink-web' };
