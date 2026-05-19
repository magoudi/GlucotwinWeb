const crypto = require('crypto');

// In-memory connector status per patient
// patientId -> Map of connectorType -> { status, lastSync, config }
const connectorsByPatient = new Map();

const CONNECTOR_TYPES = {
  cgm: { name: 'CGM Stream', provider: 'Dexcom / Libre / generic importer' },
  pump: { name: 'Pump Profile', provider: 'Omnipod / Tandem / Medtronic import' },
  health_platform: { name: 'Health Platforms', provider: 'Apple Health / Google Fit' },
  nightscout: { name: 'Nightscout', provider: 'API sync' },
  activity_tracker: { name: 'Activity Tracker', provider: 'Fitbit / Garmin / wearable' },
  manual: { name: 'Manual Upload', provider: 'CSV / spreadsheet import' },
};

function getConnectors(patientId) {
  const pid = String(patientId);
  const patientConnectors = connectorsByPatient.get(pid) || new Map();

  return Object.entries(CONNECTOR_TYPES).map(([type, info]) => {
    const conn = patientConnectors.get(type);
    return {
      type,
      name: info.name,
      provider: info.provider,
      status: conn ? conn.status : 'disconnected',
      lastSync: conn ? conn.lastSync : null,
      connectedAt: conn ? conn.connectedAt : null,
    };
  });
}

function connectConnector(patientId, connectorType) {
  const pid = String(patientId);

  if (!CONNECTOR_TYPES[connectorType]) {
    return null;
  }

  let patientConnectors = connectorsByPatient.get(pid);
  if (!patientConnectors) {
    patientConnectors = new Map();
    connectorsByPatient.set(pid, patientConnectors);
  }

  const connector = {
    status: 'connected',
    lastSync: new Date().toISOString(),
    connectedAt: new Date().toISOString(),
    config: {},
  };

  patientConnectors.set(connectorType, connector);

  const info = CONNECTOR_TYPES[connectorType];
  return {
    type: connectorType,
    name: info.name,
    provider: info.provider,
    status: connector.status,
    lastSync: connector.lastSync,
    connectedAt: connector.connectedAt,
  };
}

function disconnectConnector(patientId, connectorType) {
  const pid = String(patientId);
  const patientConnectors = connectorsByPatient.get(pid);

  if (!patientConnectors || !patientConnectors.has(connectorType)) {
    return false;
  }

  patientConnectors.delete(connectorType);
  return true;
}

module.exports = {
  getConnectors,
  connectConnector,
  disconnectConnector,
  CONNECTOR_TYPES,
};
