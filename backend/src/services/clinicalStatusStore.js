const { useInMemoryDb } = require('../config/env');
const ClinicalStatus = require('../models/ClinicalStatus');
const User = require('../models/User');

const statusByPatient = new Map();

async function getStatus(patientId) {
  if (!useInMemoryDb) {
    const record = await ClinicalStatus.findOne({ patientId });
    if (record) {
      return record.status;
    }

    const user = await User.findById(patientId);
    return user ? user.clinicalStatus : 'Needs Review';
  }
  return statusByPatient.get(patientId) || 'Needs Review';
}

async function updateStatus(patientId, status, updatedBy = null) {
  if (!useInMemoryDb) {
    await ClinicalStatus.findOneAndUpdate(
      { patientId },
      {
        status,
        updatedBy: updatedBy || null,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );
    await User.findByIdAndUpdate(patientId, { clinicalStatus: status });
    return status;
  }
  statusByPatient.set(patientId, status);
  return status;
}

module.exports = {
  getStatus,
  updateStatus,
};
