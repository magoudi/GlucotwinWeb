const mongoose = require('mongoose');
const { mongoUri, mongoDbName, useInMemoryDb } = require('./env');
const userStore = require('../services/userStore');

async function connectDB() {
  if (useInMemoryDb) {
    await userStore.ensureDemoUser();
    console.log('Using in-memory GlucoTwin user store');
    return;
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(mongoUri, mongoDbName ? { dbName: mongoDbName } : undefined);
  console.log('MongoDB connected for GlucoTwin backend');
}

module.exports = connectDB;
