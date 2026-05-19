const crypto = require('crypto');
const { useInMemoryDb } = require('../config/env');
const TimelineEvent = require('../models/TimelineEvent');

// In-memory store: patientId -> Array of events
const eventsByPatient = new Map();

function serializeEvent(event) {
  return {
    id: event._id ? event._id.toString() : event.id,
    patientId: event.patientId.toString ? event.patientId.toString() : event.patientId,
    eventType: event.eventType,
    type: event.eventType, // alias for frontend compatibility
    title: event.title,
    detail: event.detail || '',
    impact: event.impact || '',
    severity: event.severity || 'info',
    metadata: event.metadata || {},
    timestamp: event.timestamp || event.createdAt,
    timestampLabel: formatTimestamp(event.timestamp || event.createdAt),
    targetContext: '',
  };
}

function formatTimestamp(date) {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;

  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return `Today, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  }

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Add an event to the patient timeline.
 */
async function addEvent(patientId, eventType, title, detail = '', impact = '', severity = 'info', metadata = {}) {
  const pid = String(patientId);

  if (!useInMemoryDb) {
    const event = new TimelineEvent({
      patientId: pid,
      eventType,
      title,
      detail,
      impact,
      severity,
      metadata,
      timestamp: new Date(),
    });
    await event.save();
    return serializeEvent(event);
  }

  const event = {
    id: crypto.randomUUID(),
    patientId: pid,
    eventType,
    title,
    detail,
    impact,
    severity,
    metadata,
    timestamp: new Date().toISOString(),
  };

  const events = eventsByPatient.get(pid) || [];
  events.unshift(event);
  if (events.length > 200) events.length = 200;
  eventsByPatient.set(pid, events);

  return serializeEvent(event);
}

/**
 * List timeline events for a patient.
 */
async function listEvents(patientId, limit = 50) {
  const pid = String(patientId);

  if (!useInMemoryDb) {
    const events = await TimelineEvent.find({ patientId: pid })
      .sort({ timestamp: -1 })
      .limit(limit);
    return events.map(serializeEvent);
  }

  const events = eventsByPatient.get(pid) || [];
  return events.slice(0, limit).map(serializeEvent);
}

/**
 * Get a count summary of events for a patient.
 */
async function getSummary(patientId) {
  const events = await listEvents(patientId, 100);
  return {
    meals: events.filter(e => e.eventType === 'meal').length,
    insulinEvents: events.filter(e => e.eventType === 'insulin').length,
    activityMinutes: events.filter(e => e.eventType === 'activity')
      .reduce((sum, e) => sum + (e.metadata?.durationMinutes || 0), 0),
    sleepHours: events.filter(e => e.eventType === 'sleep')
      .reduce((sum, e) => sum + (e.metadata?.hours || 0), 0),
    predictions: events.filter(e => e.eventType === 'prediction').length,
    treatmentPlans: events.filter(e => e.eventType === 'treatment_plan').length,
  };
}

module.exports = {
  addEvent,
  listEvents,
  getSummary,
};
