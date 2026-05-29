const crypto = require('crypto');
const { useInMemoryDb } = require('../config/env');
const AuditEntry = require('../models/AuditEntry');

const AUDIT_LOG_SECRET = process.env.AUDIT_LOG_SECRET || 'fallback-secret-for-development';
const GENESIS_HASH = 'GENESIS';

// Fallback in-memory array
const entries = [];
const MAX_LOG_SIZE = 500;

function buildCanonicalPayload(data) {
  // Stable JSON stringify by sorting keys
  return JSON.stringify(data, Object.keys(data).sort());
}

function normalizeAuditHash(value) {
  return typeof value === 'string' && value.trim() ? value : GENESIS_HASH;
}

function calculateAuditHash(payload, previousHash) {
  const hmac = crypto.createHmac('sha256', AUDIT_LOG_SECRET);
  hmac.update(typeof payload === 'string' ? payload : '');
  hmac.update(normalizeAuditHash(previousHash));
  return hmac.digest('hex');
}

async function getLatestAuditHash() {
  if (useInMemoryDb) {
    if (entries.length === 0) return GENESIS_HASH;
    return normalizeAuditHash(entries[0].recordHash);
  }

  // Older databases may still contain legacy rows from before the hashed chain
  // fields existed. Skip those rows so new audit writes can proceed safely.
  const latest = await AuditEntry.findOne({
    recordHash: { $type: 'string', $ne: '' },
  }).sort({ createdAt: -1 });
  return latest ? normalizeAuditHash(latest.recordHash) : GENESIS_HASH;
}

async function createAuditEntry(data) {
  const previousHash = await getLatestAuditHash();
  
  const payloadData = {
    actorId: String(data.actorId || ''),
    actorRole: String(data.actorRole || ''),
    action: String(data.action || ''),
    targetId: String(data.targetId || ''),
    targetType: String(data.targetType || ''),
    ipAddress: String(data.ipAddress || ''),
    userAgent: String(data.userAgent || ''),
    metadata: data.metadata || {},
    timestamp: new Date().toISOString(),
  };

  const canonicalPayload = buildCanonicalPayload(payloadData);
  const recordHash = calculateAuditHash(canonicalPayload, previousHash);

  if (!useInMemoryDb) {
    const entry = new AuditEntry({
      ...payloadData,
      previousHash,
      recordHash,
      integrityVersion: 'v1',
      canonicalPayload,
    });
    
    try {
      await entry.save();
    } catch (err) {
      console.error('Audit log failed to save:', err);
    }
    return entry;
  }

  // In-memory version
  const newEntry = {
    ...payloadData,
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    previousHash,
    recordHash,
    integrityVersion: 'v1',
    canonicalPayload,
  };
  
  entries.unshift(newEntry);
  if (entries.length > MAX_LOG_SIZE) {
    entries.length = MAX_LOG_SIZE;
  }
  return newEntry;
}

// Wrapper to preserve existing call signatures across the app
async function log(actorId, action, targetId, details = '') {
  return createAuditEntry({
    actorId,
    action,
    targetId,
    metadata: { details },
  });
}

async function verifyAuditChain() {
  if (useInMemoryDb) {
    // Basic verification for in-memory
    let expectedPrevHash = GENESIS_HASH;
    // entries are prepended (unshift), so [0] is latest, [last] is earliest.
    // To verify we need to go from earliest to latest.
    const chronological = [...entries].reverse();
    let checkedEntries = 0;
    
    for (const entry of chronological) {
      if (entry.previousHash !== expectedPrevHash) {
        return { valid: false, checkedEntries, brokenAt: entry.id };
      }
      
      const calcHash = calculateAuditHash(entry.canonicalPayload, expectedPrevHash);
      if (calcHash !== entry.recordHash) {
        return { valid: false, checkedEntries, brokenAt: entry.id };
      }
      
      expectedPrevHash = entry.recordHash;
      checkedEntries++;
    }
    
    return { valid: true, checkedEntries, brokenAt: null };
  }

  // MongoDB Verification
  const logs = await AuditEntry.find().sort({ createdAt: 1 }); // Oldest first
  
  let expectedPrevHash = GENESIS_HASH;
  let checkedEntries = 0;

  for (const entry of logs.filter((candidate) => candidate.recordHash && candidate.previousHash && candidate.canonicalPayload)) {
    if (entry.previousHash !== expectedPrevHash) {
      return { valid: false, checkedEntries, brokenAt: entry._id.toString() };
    }

    const calcHash = calculateAuditHash(entry.canonicalPayload, expectedPrevHash);
    if (calcHash !== entry.recordHash) {
      return { valid: false, checkedEntries, brokenAt: entry._id.toString() };
    }

    expectedPrevHash = entry.recordHash;
    checkedEntries++;
  }

  return { valid: true, checkedEntries, brokenAt: null };
}

async function getAll(limit = 100) {
  if (!useInMemoryDb) {
    const logs = await AuditEntry.find().sort({ createdAt: -1 }).limit(limit);
    return logs.map(l => ({
      id: l._id ? l._id.toString() : `audit_${Date.now()}`,
      adminId: l.actorId || '',
      action: l.action || 'unknown',
      targetId: l.targetId || null,
      details: l.metadata && l.metadata.details ? l.metadata.details : (l.metadata ? JSON.stringify(l.metadata) : ''),
      timestamp: l.createdAt || new Date().toISOString(),
    }));
  }
  return entries.slice(0, limit).map(l => ({
    id: l.id || `audit_${Date.now()}`,
    adminId: l.actorId || '',
    action: l.action || 'unknown',
    targetId: l.targetId || null,
    details: (l.metadata && l.metadata.details) ? l.metadata.details : '',
    timestamp: l.timestamp || new Date().toISOString(),
  }));
}

async function clear() {
  if (!useInMemoryDb) {
    // Normally audits should never be deleted. 
    // This function is purely for testing/seeding environments.
    await AuditEntry.collection.deleteMany({});
    return;
  }
  entries.length = 0;
}

module.exports = {
  createAuditEntry,
  buildCanonicalPayload,
  calculateAuditHash,
  verifyAuditChain,
  log,
  getAll,
  clear,
};
