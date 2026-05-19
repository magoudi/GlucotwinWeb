const crypto = require('crypto');
const { useInMemoryDb } = require('../config/env');
const TreatmentPlan = require('../models/TreatmentPlan');

// Map of patientId -> Array of plans
const plansByPatient = new Map();

function serializePlan(plan) {
  return {
    id: plan._id ? plan._id.toString() : plan.id,
    patientId: plan.patientId.toString ? plan.patientId.toString() : plan.patientId,
    doctorId: plan.doctorId.toString ? plan.doctorId.toString() : plan.doctorId,
    description: plan.description,
    details: plan.details,
    status: plan.status,
    createdAt: plan.createdAt,
    patientComment: plan.patientComment || '',
    patientRespondedAt: plan.patientRespondedAt || null,
    acceptedAt: plan.acceptedAt || null,
    dismissedAt: plan.dismissedAt || null,
    appliedAt: plan.appliedAt || null,
    clinicianReply: plan.clinicianReply || '',
    clinicianRepliedAt: plan.clinicianRepliedAt || null,
    doctorSignatureId: plan.doctorSignatureId ? plan.doctorSignatureId.toString() : plan.doctorSignatureId,
    signedAt: plan.signedAt || null,
    signedBy: plan.signedBy || null,
    requiresSignature: plan.requiresSignature !== undefined ? plan.requiresSignature : true,
  };
}

async function listPlansForPatient(patientId) {
  if (!useInMemoryDb) {
    const plans = await TreatmentPlan.find({ patientId }).sort({ createdAt: -1 });
    return plans.map(serializePlan);
  }
  return plansByPatient.get(patientId) || [];
}

async function getPlanById(patientId, planId) {
  if (!useInMemoryDb) {
    const plan = await TreatmentPlan.findOne({ _id: planId, patientId });
    if (!plan) return null;
    return serializePlan(plan);
  }
  const plans = await listPlansForPatient(patientId);
  return plans.find((p) => p.id === planId) || null;
}

async function getPendingPlan(patientId) {
  if (!useInMemoryDb) {
    const plan = await TreatmentPlan.findOne({ patientId, status: 'signed_pending_patient' });
    if (!plan) return null;
    return serializePlan(plan);
  }
  const plans = await listPlansForPatient(patientId);
  return plans.find((p) => p.status === 'signed_pending_patient') || null;
}

async function createPlan(patientId, doctorId, description, details) {
  if (!useInMemoryDb) {
    const plan = new TreatmentPlan({ patientId, doctorId, description, details, status: 'draft' });
    await plan.save();
    return serializePlan(plan);
  }

  // Automatically dismiss previous pending plans for this patient
  const plans = await listPlansForPatient(patientId);
  plans.forEach((p) => {
    if (p.status === 'pending') {
      p.status = 'dismissed';
      p.dismissedAt = new Date().toISOString();
      p.acceptedAt = null;
      p.appliedAt = null;
    }
  });

  const plan = {
    id: crypto.randomUUID(),
    patientId,
    doctorId,
    description,
    details,
    status: 'draft',
    createdAt: new Date().toISOString(),
    patientComment: '',
    patientRespondedAt: null,
    acceptedAt: null,
    dismissedAt: null,
    appliedAt: null,
    clinicianReply: '',
    clinicianRepliedAt: null,
  };

  plans.push(plan);
  plansByPatient.set(patientId, plans);

  return plan;
}

async function updatePlanStatus(patientId, planId, status, options = {}) {
  if (!useInMemoryDb) {
    const update = {
      status,
      patientComment: options.patientComment || '',
      patientRespondedAt: new Date(),
    };

    if (status === 'accepted') {
      update.acceptedAt = new Date();
      update.appliedAt = new Date();
      update.dismissedAt = null;
    }

    if (status === 'dismissed') {
      update.dismissedAt = new Date();
      update.acceptedAt = null;
      update.appliedAt = null;
    }

    const plan = await TreatmentPlan.findOneAndUpdate({ _id: planId, patientId }, update, { new: true });
    if (!plan) return null;
    return serializePlan(plan);
  }
  const plans = await listPlansForPatient(patientId);
  const plan = plans.find((p) => p.id === planId);
  if (plan) {
    plan.status = status;
    plan.patientComment = options.patientComment || '';
    plan.patientRespondedAt = new Date().toISOString();

    if (status === 'accepted') {
      plan.acceptedAt = new Date().toISOString();
      plan.appliedAt = new Date().toISOString();
      plan.dismissedAt = null;
    }

    if (status === 'dismissed') {
      plan.dismissedAt = new Date().toISOString();
      plan.acceptedAt = null;
      plan.appliedAt = null;
    }

    return plan;
  }
  return null;
}

async function addClinicianReply(patientId, planId, reply) {
  if (!useInMemoryDb) {
    const plan = await TreatmentPlan.findOneAndUpdate(
      { _id: planId, patientId },
      {
        clinicianReply: reply,
        clinicianRepliedAt: new Date(),
      },
      { new: true },
    );

    return plan ? serializePlan(plan) : null;
  }

  const plans = await listPlansForPatient(patientId);
  const plan = plans.find((entry) => entry.id === planId);

  if (!plan) {
    return null;
  }

  plan.clinicianReply = reply;
  plan.clinicianRepliedAt = new Date().toISOString();
  return plan;
}

async function signPlan(patientId, planId, signatureId, signedBy) {
  if (!useInMemoryDb) {
    const plan = await TreatmentPlan.findOneAndUpdate(
      { _id: planId, patientId },
      {
        status: 'signed_pending_patient',
        doctorSignatureId: signatureId,
        signedAt: new Date(),
        signedBy,
      },
      { new: true }
    );
    // Dismiss old pending plans
    await TreatmentPlan.updateMany(
      { patientId, _id: { $ne: planId }, status: 'signed_pending_patient' },
      { status: 'dismissed', dismissedAt: new Date(), acceptedAt: null, appliedAt: null }
    );
    return plan ? serializePlan(plan) : null;
  }

  const plans = await listPlansForPatient(patientId);
  const plan = plans.find((entry) => entry.id === planId);

  if (!plan) return null;

  plan.status = 'signed_pending_patient';
  plan.doctorSignatureId = signatureId;
  plan.signedAt = new Date().toISOString();
  plan.signedBy = signedBy;

  // Dismiss old ones
  plans.forEach((p) => {
    if (p.status === 'signed_pending_patient' && p.id !== planId) {
      p.status = 'dismissed';
      p.dismissedAt = new Date().toISOString();
    }
  });

  return plan;
}

module.exports = {
  addClinicianReply,
  listPlansForPatient,
  getPlanById,
  getPendingPlan,
  createPlan,
  updatePlanStatus,
  signPlan,
};
