require('dotenv').config({ quiet: true });

const useInMemoryDb = String(process.env.USE_IN_MEMORY_DB || '').toLowerCase() === 'true';
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
const mongoDbName = process.env.MONGODB_DB || '';
const rawClientOrigins = process.env.CLIENT_URL || process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

function expandDevOrigins(value) {
  const origins = new Set(
    String(value)
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  );

  for (const origin of Array.from(origins)) {
    if (origin.includes('localhost')) {
      origins.add(origin.replace('localhost', '127.0.0.1'));
    }

    if (origin.includes('127.0.0.1')) {
      origins.add(origin.replace('127.0.0.1', 'localhost'));
    }
  }

  return Array.from(origins);
}

function requireEnv(name, value) {
  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

module.exports = {
  port: process.env.PORT || 3000,
  mongoUri: useInMemoryDb ? mongoUri || '' : requireEnv('MONGO_URI or MONGODB_URI', mongoUri),
  mongoDbName,
  jwtSecret: requireEnv('JWT_SECRET', process.env.JWT_SECRET),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: rawClientOrigins.split(',')[0].trim(),
  clientOrigins: expandDevOrigins(rawClientOrigins),
  nodeEnv: process.env.NODE_ENV || 'development',
  useInMemoryDb,
};
