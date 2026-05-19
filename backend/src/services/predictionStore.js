const crypto = require('crypto');
const { useInMemoryDb } = require('../config/env');
const Prediction = require('../models/Prediction');

// In-memory store: patientId -> Array of predictions
const predictionsByPatient = new Map();

function serializePrediction(p) {
  return {
    id: p._id ? p._id.toString() : p.id,
    patientId: p.patientId.toString ? p.patientId.toString() : p.patientId,
    predictionType: p.predictionType,
    inputData: p.inputData || {},
    resultData: p.resultData || {},
    confidence: p.confidence,
    safetyStatus: p.safetyStatus,
    drivers: p.drivers || [],
    createdAt: p.createdAt,
  };
}

/**
 * Save a prediction result.
 */
async function savePrediction(patientId, predictionType, inputData, resultData, confidence = 0.86, safetyStatus = 'safe', drivers = []) {
  const pid = String(patientId);

  if (!useInMemoryDb) {
    const prediction = new Prediction({
      patientId: pid,
      predictionType,
      inputData,
      resultData,
      confidence,
      safetyStatus: safetyStatus.toLowerCase(),
      drivers,
    });
    await prediction.save();
    return serializePrediction(prediction);
  }

  const prediction = {
    id: crypto.randomUUID(),
    patientId: pid,
    predictionType,
    inputData,
    resultData,
    confidence,
    safetyStatus: safetyStatus.toLowerCase(),
    drivers,
    createdAt: new Date().toISOString(),
  };

  const predictions = predictionsByPatient.get(pid) || [];
  predictions.unshift(prediction);
  if (predictions.length > 100) predictions.length = 100;
  predictionsByPatient.set(pid, predictions);

  return serializePrediction(prediction);
}

/**
 * List predictions for a patient.
 */
async function listPredictions(patientId, limit = 20, type = null) {
  const pid = String(patientId);

  if (!useInMemoryDb) {
    const filter = { patientId: pid };
    if (type) filter.predictionType = type;
    const predictions = await Prediction.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit);
    return predictions.map(serializePrediction);
  }

  let predictions = predictionsByPatient.get(pid) || [];
  if (type) {
    predictions = predictions.filter(p => p.predictionType === type);
  }
  return predictions.slice(0, limit).map(serializePrediction);
}

/**
 * Get count of predictions by safety status.
 */
async function getStats(patientId) {
  const all = await listPredictions(patientId, 100);
  return {
    total: all.length,
    safe: all.filter(p => p.safetyStatus === 'safe').length,
    caution: all.filter(p => p.safetyStatus === 'caution').length,
    unsafe: all.filter(p => p.safetyStatus === 'unsafe').length,
  };
}

module.exports = {
  savePrediction,
  listPredictions,
  getStats,
};
