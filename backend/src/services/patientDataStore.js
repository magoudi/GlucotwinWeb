const crypto = require('crypto');
const { useInMemoryDb } = require('../config/env');
const GlucoseReading = require('../models/GlucoseReading');
const Meal = require('../models/Meal');
const InsulinDose = require('../models/InsulinDose');
const Activity = require('../models/Activity');

// In-memory stores
const glucoseByPatient = new Map();
const mealsByPatient = new Map();
const insulinByPatient = new Map();
const activitiesByPatient = new Map();

// --- GLUCOSE READINGS ---

async function addGlucoseReading(patientId, value, unit = 'mg/dL', source = 'manual') {
  const pid = String(patientId);

  if (!useInMemoryDb) {
    const reading = new GlucoseReading({ patientId: pid, value, unit, source });
    await reading.save();
    return { id: reading._id.toString(), value: reading.value, unit: reading.unit, source: reading.source, timestamp: reading.timestamp };
  }

  const reading = { id: crypto.randomUUID(), patientId: pid, value, unit, source, timestamp: new Date().toISOString() };
  const readings = glucoseByPatient.get(pid) || [];
  readings.unshift(reading);
  if (readings.length > 500) readings.length = 500;
  glucoseByPatient.set(pid, readings);
  return reading;
}

async function getRecentReadings(patientId, hours = 24) {
  const pid = String(patientId);
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  if (!useInMemoryDb) {
    return GlucoseReading.find({ patientId: pid, timestamp: { $gte: since } }).sort({ timestamp: -1 });
  }

  const readings = glucoseByPatient.get(pid) || [];
  return readings.filter(r => new Date(r.timestamp) >= since);
}

async function getLatestReading(patientId) {
  const pid = String(patientId);

  if (!useInMemoryDb) {
    return GlucoseReading.findOne({ patientId: pid }).sort({ timestamp: -1 });
  }

  const readings = glucoseByPatient.get(pid) || [];
  return readings[0] || null;
}

// --- MEALS ---

async function addMeal(patientId, data) {
  const pid = String(patientId);

  if (!useInMemoryDb) {
    const meal = new Meal({ patientId: pid, ...data });
    await meal.save();
    return { id: meal._id.toString(), ...data, timestamp: meal.timestamp };
  }

  const meal = { id: crypto.randomUUID(), patientId: pid, ...data, timestamp: new Date().toISOString() };
  const meals = mealsByPatient.get(pid) || [];
  meals.unshift(meal);
  if (meals.length > 200) meals.length = 200;
  mealsByPatient.set(pid, meals);
  return meal;
}

async function getRecentMeals(patientId, count = 10) {
  const pid = String(patientId);

  if (!useInMemoryDb) {
    return Meal.find({ patientId: pid }).sort({ timestamp: -1 }).limit(count);
  }

  const meals = mealsByPatient.get(pid) || [];
  return meals.slice(0, count);
}

// --- INSULIN ---

async function addInsulinDose(patientId, data) {
  const pid = String(patientId);

  if (!useInMemoryDb) {
    const dose = new InsulinDose({ patientId: pid, ...data });
    await dose.save();
    return { id: dose._id.toString(), ...data, timestamp: dose.timestamp };
  }

  const dose = { id: crypto.randomUUID(), patientId: pid, ...data, timestamp: new Date().toISOString() };
  const doses = insulinByPatient.get(pid) || [];
  doses.unshift(dose);
  if (doses.length > 200) doses.length = 200;
  insulinByPatient.set(pid, doses);
  return dose;
}

async function getRecentInsulin(patientId, count = 10) {
  const pid = String(patientId);

  if (!useInMemoryDb) {
    return InsulinDose.find({ patientId: pid }).sort({ timestamp: -1 }).limit(count);
  }

  const doses = insulinByPatient.get(pid) || [];
  return doses.slice(0, count);
}

// --- ACTIVITY ---

async function addActivity(patientId, data) {
  const pid = String(patientId);

  if (!useInMemoryDb) {
    const activity = new Activity({ patientId: pid, ...data });
    await activity.save();
    return { id: activity._id.toString(), ...data, timestamp: activity.timestamp };
  }

  const activity = { id: crypto.randomUUID(), patientId: pid, ...data, timestamp: new Date().toISOString() };
  const activities = activitiesByPatient.get(pid) || [];
  activities.unshift(activity);
  if (activities.length > 200) activities.length = 200;
  activitiesByPatient.set(pid, activities);
  return activity;
}

async function getRecentActivities(patientId, count = 10) {
  const pid = String(patientId);

  if (!useInMemoryDb) {
    return Activity.find({ patientId: pid }).sort({ timestamp: -1 }).limit(count);
  }

  const activities = activitiesByPatient.get(pid) || [];
  return activities.slice(0, count);
}

module.exports = {
  addGlucoseReading,
  getRecentReadings,
  getLatestReading,
  addMeal,
  getRecentMeals,
  addInsulinDose,
  getRecentInsulin,
  addActivity,
  getRecentActivities,
};
