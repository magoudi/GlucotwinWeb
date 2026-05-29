const userStore = require('../services/userStore');
const AppError = require('../utils/AppError');
const auditLog = require('../services/auditLog');
const clinicalNotesStore = require('../services/clinicalNotesStore');
const treatmentPlanStore = require('../services/treatmentPlanStore');
const clinicalStatusStore = require('../services/clinicalStatusStore');
const timelineService = require('../services/timelineService');
const predictionStore = require('../services/predictionStore');
const { safeUser } = require('../utils/userResponse');
const { signToken } = require('../utils/auth');
const { z } = require('zod');
const mongoose = require('mongoose');
const crypto = require('crypto');
const ElectronicSignature = require('../models/ElectronicSignature');
const { useInMemoryDb } = require('../config/env');

const VALID_CLINICAL_STATUSES = [
  'Needs Review',
  'Reviewed by Nurse',
  'Ready for Doctor',
  'Discharged',
];

const noteSchema = z.object({
  content: z.string().trim().min(1).max(1500),
}).strict();

const treatmentPlanSchema = z.object({
  description: z.string().trim().min(1).max(500),
  details: z.record(z.string(), z.any()).optional(),
}).strict();

const treatmentPlanReplySchema = z.object({
  reply: z.string().trim().min(1).max(600),
}).strict();

const clinicalStatusSchema = z.object({
  status: z.enum(VALID_CLINICAL_STATUSES),
}).strict();

const bulkStatusSchema = z.object({
  patientIds: z.array(z.string().trim().min(1)).min(1).max(100),
  status: z.enum(VALID_CLINICAL_STATUSES),
}).strict();

function parseOrThrow(schema, payload) {
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  return parsed.data;
}

async function assertPatientExists(patientId) {
  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    throw new AppError('Patient not found', 404);
  }

  const patient = await userStore.findById(patientId);

  if (!patient || patient.role !== 'patient') {
    throw new AppError('Patient not found', 404);
  }

  return patient;
}

async function getStats(req, res, next) {
  try {
    const allUsers = await userStore.listAllUsers();
    const patients = allUsers.filter((u) => u.role === 'patient');

    // Calculate a dynamic risk level based on mock conditions
    const patientsWithRisk = patients.map(p => {
      let riskLevel = 'Low';
      if (p.carbRatio < 8 || p.correctionFactor < 20 || (p.featureFlags && p.featureFlags.get('advanced_what_if'))) {
        riskLevel = 'High';
      } else if (p.targetGlucoseMin < 70 || p.targetGlucoseMax > 180) {
        riskLevel = 'Medium';
      }
      return { ...safeUser(p), riskLevel };
    });

    const highRiskCount = patientsWithRisk.filter(p => p.riskLevel === 'High').length;

    // Mock analytics for the clinic
    const stats = {
      totalPatients: patients.length,
      patientsAtRisk: highRiskCount || Math.floor(patients.length * 0.15) || 1, // mock if 0
      recentAlerts: [
        { type: 'Hypoglycemia Risk', patient: 'Demo User', time: '10m ago' },
        { type: 'Missed Bolus', patient: 'Anonymous', time: '1h ago' },
        { type: 'High Variability', patient: 'Anonymous', time: '3h ago' },
      ],
    };

    res.json({ stats });
  } catch (error) {
    next(error);
  }
}

async function listPatients(req, res, next) {
  try {
    const doctorId = req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const allUsers = await userStore.listAllUsers();
    let patients = allUsers.filter((u) => u.role === 'patient');

    // Doctor sees only assigned patients; admin sees all
    if (!isAdmin) {
      patients = patients.filter((p) => {
        const assigned = p.assignedDoctor ? p.assignedDoctor.toString() : null;
        // Show patients assigned to this doctor, or patients with no assignment (for demo flexibility)
        return assigned === doctorId || !assigned;
      });
    }

    const search = req.query.search;
    if (search) {
      const q = search.toLowerCase();
      patients = patients.filter((u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const total = patients.length;
    const paginatedPatients = patients.slice(startIndex, endIndex);

    const serializedPatients = await Promise.all(paginatedPatients.map(async (p) => {
        let riskLevel = 'Low';
        if (p.carbRatio < 8 || p.correctionFactor < 20 || (p.featureFlags && p.featureFlags.get('advanced_what_if'))) {
          riskLevel = 'High';
        } else if (p.targetGlucoseMin < 70 || p.targetGlucoseMax > 180) {
          riskLevel = 'Medium';
        }
        return { ...safeUser(p), riskLevel, clinicalStatus: await clinicalStatusStore.getStatus(p._id.toString()) };
      }));

    res.json({ 
      patients: serializedPatients,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getPatient(req, res, next) {
  try {
    const patient = await userStore.findById(req.params.id);
    if (!patient || patient.role !== 'patient') {
      throw new AppError('Patient not found', 404);
    }
    
    auditLog.log(
      req.user._id.toString(),
      'doctor.patient.read',
      patient._id.toString(),
      `Doctor viewed patient profile for ${patient.email}`
    );
    
    res.json({ patient: safeUser(patient) });
  } catch (error) {
    next(error);
  }
}

async function impersonatePatient(req, res, next) {
  try {
    const targetUser = await assertPatientExists(req.params.id);

    const token = signToken(targetUser, req.user._id.toString());

    auditLog.log(
      req.user._id.toString(),
      'doctor.impersonate',
      targetUser._id.toString(),
      `Doctor initiated clinical view session for patient ${targetUser.email}`,
    );

    const options = {
      expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    };

    res.cookie('impersonation_token', token, options).json({
      user: safeUser(targetUser),
      session: {
        isImpersonating: true,
        impersonator: {
          id: req.user._id.toString(),
          fullName: req.user.fullName,
          role: req.user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

async function listNotes(req, res, next) {
  try {
    const notes = await clinicalNotesStore.listNotesForPatient(req.params.id);
    res.json({ notes });
  } catch (error) {
    next(error);
  }
}

async function addNote(req, res, next) {
  try {
    const { content } = parseOrThrow(noteSchema, req.body);
    await assertPatientExists(req.params.id);
    const note = await clinicalNotesStore.addNote(req.params.id, req.user._id.toString(), content);
    auditLog.log(req.user._id.toString(), 'doctor.note.add', req.params.id, 'Added clinical note');
    res.status(201).json({ note });
  } catch (error) {
    next(error);
  }
}

async function createTreatmentPlan(req, res, next) {
  try {
    const { description, details } = parseOrThrow(treatmentPlanSchema, req.body);
    await assertPatientExists(req.params.id);
    const plan = await treatmentPlanStore.createPlan(req.params.id, req.user._id.toString(), description, details || {});
    auditLog.log(req.user._id.toString(), 'doctor.plan.create_draft', req.params.id, `Created draft treatment plan: ${description}`);
    
    // Do NOT notify patient or create timeline event yet, it's just a draft.

    res.status(201).json({ plan });
  } catch (error) {
    next(error);
  }
}

async function listTreatmentPlans(req, res, next) {
  try {
    await assertPatientExists(req.params.id);
    const plans = await treatmentPlanStore.listPlansForPatient(req.params.id);
    res.json({ plans });
  } catch (error) {
    next(error);
  }
}

async function signAndSendTreatmentPlan(req, res, next) {
  try {
    const { password, meaning } = parseOrThrow(
      z.object({
        password: z.string().min(1, 'Password is required'),
        meaning: z.string().min(1, 'Meaning of signature is required'),
      }),
      req.body
    );

    await assertPatientExists(req.params.id);

    // Fetch plan
    const plan = await treatmentPlanStore.getPlanById(req.params.id, req.params.planId);
    if (!plan) {
      throw new AppError('Treatment plan not found', 404);
    }

    if (plan.status !== 'draft') {
      throw new AppError('Only draft treatment plans can be signed and sent.', 400, 'TREATMENT_PLAN_NOT_DRAFT');
    }

    // Verify doctor password
    const doctorUser = await userStore.findByIdForAuth(req.user._id.toString());
    const isPasswordValid = await doctorUser.checkPassword(password);
    if (!isPasswordValid) {
      auditLog.log(req.user._id.toString(), 'doctor.signature.failed', req.params.id, 'Failed signature attempt due to invalid password');
      throw new AppError('Signature failed. Please check your password.', 401, 'SIGNATURE_PASSWORD_INVALID');
    }

    const ipAddress = req.ip || '0.0.0.0';
    const userAgent = req.get('User-Agent') || 'Unknown';
    
    // Create snapshot hash
    const snapshotPayload = JSON.stringify({
      patientId: plan.patientId,
      doctorId: plan.doctorId,
      description: plan.description,
      details: plan.details,
      createdAt: plan.createdAt
    });
    const recordSnapshotHash = crypto.createHash('sha256').update(snapshotPayload).digest('hex');
    const signatureHash = crypto.createHash('sha256').update(recordSnapshotHash + meaning + doctorUser._id.toString() + Date.now()).digest('hex');

    let signatureId = `mock_sig_${Date.now()}`;
    
    if (!useInMemoryDb) {
      const signature = new ElectronicSignature({
        signerId: doctorUser._id,
        signerRole: 'doctor',
        targetType: 'TreatmentPlan',
        targetId: plan.id,
        meaning,
        ipAddress,
        userAgent,
        recordSnapshotHash,
        signatureHash,
      });
      await signature.save();
      signatureId = signature._id.toString();
    }

    // Update Plan
    const signedPlan = await treatmentPlanStore.signPlan(req.params.id, plan.id, signatureId, doctorUser.fullName);

    // Create Audit Log
    auditLog.log(req.user._id.toString(), 'doctor.plan.signed_and_sent', plan.id, `Doctor electronically signed and sent treatment plan. Snapshot Hash: ${recordSnapshotHash}`);

    // Create timeline event for the patient
    await timelineService.addEvent(
      req.params.id, 'treatment_plan',
      'New treatment plan from your doctor',
      plan.description,
      'Review and respond in Care Team.',
      'warning',
      { planId: plan.id, doctorId: req.user._id.toString() },
    );

    // Emit WebSocket Event
    const io = req.app.get('io');
    if (io) {
      io.to(`patient_${req.params.id}`).emit('new_treatment_plan', signedPlan);
    }

    res.json({ success: true, plan: signedPlan });
  } catch (error) {
    next(error);
  }
}

async function replyToTreatmentPlan(req, res, next) {
  try {
    const { reply } = parseOrThrow(treatmentPlanReplySchema, req.body);
    await assertPatientExists(req.params.id);
    const plan = await treatmentPlanStore.addClinicianReply(req.params.id, req.params.planId, reply);

    if (!plan) {
      throw new AppError('Treatment plan not found', 404);
    }

    auditLog.log(req.user._id.toString(), 'doctor.plan.reply', req.params.id, 'Added clinician reply to treatment plan');
    res.json({ plan });
  } catch (error) {
    next(error);
  }
}

async function getInsights(req, res, next) {
  try {
    const patient = await userStore.findById(req.params.id);
    if (!patient || patient.role !== 'patient') {
      throw new AppError('Patient not found', 404);
    }

    auditLog.log(
      req.user._id.toString(),
      'doctor.insights.read',
      patient._id.toString(),
      `Doctor requested AI clinical insights for ${patient.email}`
    );

    const insights = [];

    // Check recent predictions for this patient
    const recentPredictions = await predictionStore.listPredictions(patient._id.toString(), 10);
    const unsafePredictions = recentPredictions.filter(p => p.safetyStatus === 'unsafe');
    const cautionPredictions = recentPredictions.filter(p => p.safetyStatus === 'caution');

    if (unsafePredictions.length > 0) {
      insights.push({
        id: 'ins-pred-unsafe',
        type: 'danger',
        title: `${unsafePredictions.length} Unsafe Prediction(s) Recently`,
        description: `Patient has ${unsafePredictions.length} prediction(s) flagged as unsafe in recent history. Review their simulation parameters and consider adjusting treatment.`,
        suggestedAction: 'Review prediction history and consider treatment plan adjustment',
      });
    }

    if (cautionPredictions.length > 2) {
      insights.push({
        id: 'ins-pred-caution',
        type: 'warning',
        title: 'Multiple Caution-Level Predictions',
        description: `${cautionPredictions.length} predictions are marked as caution. The patient may need parameter tuning.`,
        suggestedAction: 'Review carb ratio and correction factor settings',
      });
    }
    
    // Dynamic mock logic
    if (patient.carbRatio < 8) {
      insights.push({
        id: 'ins-1',
        type: 'danger',
        title: 'Aggressive Carb Ratio Detected',
        description: `Patient's carb ratio is set to 1:${patient.carbRatio}, leading to potential post-prandial hypoglycemia. Digital Twin simulation suggests increasing to 1:12.`,
        suggestedAction: 'Increase Carb Ratio to 1:12'
      });
    }

    if (patient.targetGlucoseMax > 160) {
      insights.push({
        id: 'ins-2',
        type: 'warning',
        title: 'Elevated Target Range',
        description: `The maximum target glucose is ${patient.targetGlucoseMax} mg/dL, which reduces the aggressiveness of automated bolus corrections.`,
        suggestedAction: 'Lower Max Target to 150 mg/dL'
      });
    }

    // Default insight if none triggered
    if (insights.length === 0) {
      insights.push({
        id: 'ins-3',
        type: 'info',
        title: 'Stable Basal Profile',
        description: 'The patient\'s overnight basal profile (12 AM - 6 AM) maintains glucose within 10% of the target line. No immediate changes recommended.',
        suggestedAction: 'None'
      });
    }

    res.json({ insights });
  } catch (error) {
    next(error);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { status } = parseOrThrow(clinicalStatusSchema, req.body);
    await assertPatientExists(req.params.id);
    const updatedStatus = await clinicalStatusStore.updateStatus(req.params.id, status, req.user._id.toString());
    auditLog.log(req.user._id.toString(), 'doctor.status.update', req.params.id, `Updated patient status to: ${status}`);
    res.json({ clinicalStatus: updatedStatus });
  } catch (error) {
    next(error);
  }
}

async function updateBulkStatus(req, res, next) {
  try {
    const { patientIds, status } = parseOrThrow(bulkStatusSchema, req.body);
    const uniquePatientIds = Array.from(new Set(patientIds));

    await Promise.all(uniquePatientIds.map((id) => assertPatientExists(id)));
    
    await Promise.all(uniquePatientIds.map(async (id) => {
      await clinicalStatusStore.updateStatus(id, status, req.user._id.toString());
      auditLog.log(req.user._id.toString(), 'doctor.status.bulk_update', id, `Bulk updated status to: ${status}`);
    }));

    res.json({ success: true, count: uniquePatientIds.length });
  } catch (error) {
    next(error);
  }
}

// --- SUPERVISION REQUESTS ---

async function getSupervisionRequests(req, res, next) {
  try {
    const supervisionStore = require('../services/supervisionStore');
    const doctorId = req.user._id.toString();
    const requests = await supervisionStore.getDoctorRequests(doctorId);

    res.json({
      success: true,
      data: requests.map(r => ({
        id: r._id ? r._id.toString() : r.id,
        patient: r.patient || (r.patientId && r.patientId.fullName ? {
          id: r.patientId._id.toString(),
          fullName: r.patientId.fullName,
          email: r.patientId.email,
          diabetesType: r.patientId.diabetesType || '',
          managementType: r.patientId.managementType || '',
        } : null),
        status: r.status,
        message: r.message || '',
        requestedAt: r.requestedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
}

async function respondToSupervisionRequest(req, res, next) {
  try {
    const supervisionStore = require('../services/supervisionStore');
    const doctorId = req.user._id.toString();
    const requestId = req.params.id;
    const decision = String(req.body.decision || '').trim().toLowerCase();
    const responseMessage = String(req.body.responseMessage || '').trim();

    if (!['accepted', 'rejected'].includes(decision)) {
      throw new AppError('Decision must be "accepted" or "rejected".', 400, 'VALIDATION_ERROR');
    }

    const request = await supervisionStore.respondToRequest(requestId, doctorId, decision, responseMessage);
    auditLog.log(doctorId, `doctor.supervision_${decision}`, requestId, `Doctor ${decision} supervision request`);

    res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
}

// --- APPOINTMENTS ---
async function getAppointments(req, res, next) {
  try {
    const Appointment = require('../models/Appointment');
    const appointments = await Appointment.find({ doctorId: req.user._id }).sort({ scheduledAt: 1 });
    res.json({ success: true, data: appointments });
  } catch (error) { next(error); }
}

async function createAppointment(req, res, next) {
  try {
    const Appointment = require('../models/Appointment');
    const appointment = await Appointment.create({
      doctorId: req.user._id,
      ...req.body
    });
    res.json({ success: true, data: appointment });
  } catch (error) { next(error); }
}

async function updateAppointment(req, res, next) {
  try {
    const Appointment = require('../models/Appointment');
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctorId: req.user._id },
      req.body,
      { new: true }
    );
    res.json({ success: true, data: appointment });
  } catch (error) { next(error); }
}

// --- MESSAGES ---
async function getMessages(req, res, next) {
  try {
    const Message = require('../models/Message');
    const messages = await Message.find({ $or: [{ senderId: req.user._id }, { receiverId: req.user._id }] }).sort({ createdAt: -1 });
    res.json({ success: true, data: messages });
  } catch (error) { next(error); }
}

async function sendMessage(req, res, next) {
  try {
    const Message = require('../models/Message');
    const message = await Message.create({
      senderId: req.user._id,
      receiverId: req.body.receiverId,
      patientId: req.body.patientId || req.body.receiverId,
      body: req.body.body
    });
    res.json({ success: true, data: message });
  } catch (error) { next(error); }
}

// --- REPORTS ---
async function generateReport(req, res, next) {
  try {
    const Report = require('../models/Report');
    const report = await Report.create({
      patientId: req.params.id,
      doctorId: req.user._id,
      reportType: req.body.reportType || 'clinical',
      dateRange: req.body.dateRange || { start: new Date(Date.now() - 30*24*60*60*1000), end: new Date() },
      fileUrl: '/mock-reports/doctor-report-' + Date.now() + '.pdf'
    });
    res.json({ success: true, data: report });
  } catch (error) { next(error); }
}

// --- SETTINGS ---
async function getSettings(req, res, next) {
  try {
    const settings = req.user.settings || { notifications: true, language: 'en' };
    res.json({ success: true, data: settings });
  } catch (error) { next(error); }
}

async function updateSettings(req, res, next) {
  try {
    res.json({ success: true, data: { ...req.body } });
  } catch (error) { next(error); }
}

module.exports = {
  addNote,
  createTreatmentPlan,
  getInsights,
  getPatient,
  getStats,
  getSupervisionRequests,
  impersonatePatient,
  listNotes,
  listPatients,
  listTreatmentPlans,
  replyToTreatmentPlan,
  respondToSupervisionRequest,
  signAndSendTreatmentPlan,
  updateBulkStatus,
  updateStatus,
  getAppointments,
  createAppointment,
  updateAppointment,
  getMessages,
  sendMessage,
  generateReport,
  getSettings,
  updateSettings,
};
