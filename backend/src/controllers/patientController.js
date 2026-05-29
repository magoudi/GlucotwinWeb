const userStore = require('../services/userStore');
const patientDataStore = require('../services/patientDataStore');
const predictionStore = require('../services/predictionStore');
const timelineService = require('../services/timelineService');
const treatmentPlanStore = require('../services/treatmentPlanStore');
const connectorStore = require('../services/connectorStore');
const auditLog = require('../services/auditLog');
const mockService = require('../services/mockGlucoTwinService');
const { safeUser, initialsForName } = require('../utils/userResponse');
const AppError = require('../utils/AppError');

// --- SUMMARY ---

async function getSummary(req, res, next) {
  try {
    const userId = req.user._id.toString();
    const latestGlucose = await patientDataStore.getLatestReading(userId);
    const recentMeals = await patientDataStore.getRecentMeals(userId, 3);
    const recentInsulin = await patientDataStore.getRecentInsulin(userId, 3);
    const recentPredictions = await predictionStore.listPredictions(userId, 5);
    const pendingPlan = await treatmentPlanStore.getPendingPlan(userId);
    const timelineEvents = await timelineService.listEvents(userId, 5);
    const timelineSummary = await timelineService.getSummary(userId);

    // Risk alerts based on profile
    const riskAlerts = [];
    if (req.user.carbRatio < 8) {
      riskAlerts.push({ type: 'warning', message: 'Carb ratio is very aggressive — consider reviewing with your care team.' });
    }
    if (req.user.targetGlucoseMax > 200) {
      riskAlerts.push({ type: 'info', message: 'Target glucose max is above standard range.' });
    }
    if (recentPredictions.some(p => p.safetyStatus === 'unsafe')) {
      riskAlerts.push({ type: 'danger', message: 'A recent prediction was flagged as unsafe.' });
    }

    const mockDashboard = await mockService.getDashboardData(req.user);

    res.json({
      ...mockDashboard,
      currentGlucose: latestGlucose ? latestGlucose.value : mockDashboard.currentGlucose,
      glucoseUnit: req.user.glucoseUnit || 'mg/dL',
      latestReading: latestGlucose || null,
      pendingPlan,
      recentMeals,
      recentInsulin,
      recentPredictions,
      timelineEvents,
      timelineSummary,
      riskAlerts,
    });
  } catch (error) {
    next(error);
  }
}

// --- PROFILE ---

const allowedProfileFields = [
  'fullName', 'username', 'phone', 'bio', 'subtitle', 'dateOfBirth',
  'diabetesType', 'managementType', 'glucoseUnit',
  'targetGlucoseMin', 'targetGlucoseMax',
  'carbRatio', 'correctionFactor', 'insulinSensitivity', 'basalProfile',
];

async function getProfile(req, res) {
  res.json({ user: safeUser(req.user) });
}

async function updateProfile(req, res, next) {
  try {
    const updates = {};
    allowedProfileFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      throw new AppError('Provide at least one field to update', 400);
    }

    if (updates.fullName) {
      updates.fullName = String(updates.fullName).trim();
      updates.initials = initialsForName(updates.fullName);
    }

    if (updates.username) {
      updates.username = String(updates.username).trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
    }

    const user = await userStore.updateById(req.user._id, updates);

    // Timeline event for profile update
    await timelineService.addEvent(
      req.user._id.toString(), 'profile_update',
      'Profile updated',
      `Updated: ${Object.keys(updates).join(', ')}`,
      'Profile changes may affect future predictions.',
      'info',
      { updatedFields: Object.keys(updates) },
    );

    auditLog.log(req.user._id.toString(), 'patient.profile.update', req.user._id.toString(), `Updated fields: ${Object.keys(updates).join(', ')}`);

    res.json({ user: safeUser(user) });
  } catch (error) {
    next(error);
  }
}

// --- ANALYTICS ---

async function getAnalytics(req, res, next) {
  try {
    const userId = req.user._id.toString();
    const predictions = await predictionStore.listPredictions(userId, 50);
    const predictionStats = await predictionStore.getStats(userId);

    // Compute analytics from predictions + static mock data for comprehensive view
    const {
      analytics: staticAnalytics,
    } = require('../data/mockGlucoTwinData');

    res.json({
      ...staticAnalytics,
      predictionStats,
      recentPredictions: predictions.slice(0, 10),
    });
  } catch (error) {
    next(error);
  }
}

// --- TIMELINE ---

async function getTimeline(req, res, next) {
  try {
    const userId = req.user._id.toString();
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const events = await timelineService.listEvents(userId, limit);
    const summary = await timelineService.getSummary(userId);

    // Merge with static mock events for richness
    const { timelineEvents: mockEvents } = require('../data/mockGlucoTwinData');
    const enrichedMockEvents = mockEvents.map((event) => ({
      ...event,
      targetContext: `${req.user.targetGlucoseMin || 80}-${req.user.targetGlucoseMax || 150} ${req.user.glucoseUnit || 'mg/dL'} target`,
    }));

    // Combine: real events first, then mock events
    const allEvents = [...events, ...enrichedMockEvents];

    res.json({
      summary: {
        meals: summary.meals || 3,
        insulinEvents: summary.insulinEvents || 5,
        activityMinutes: summary.activityMinutes || 38,
        sleepHours: summary.sleepHours || 7.3,
        predictions: summary.predictions || 0,
        treatmentPlans: summary.treatmentPlans || 0,
      },
      events: allEvents,
    });
  } catch (error) {
    next(error);
  }
}

// --- CARE TEAM ---

async function getCareTeam(req, res, next) {
  try {
    const userId = req.user._id.toString();

    // Fetch assigned doctor
    let assignedDoctor = null;
    if (req.user.assignedDoctor) {
      const doctor = await userStore.findById(req.user.assignedDoctor);
      if (doctor && doctor.role === 'doctor') {
        assignedDoctor = {
          id: doctor._id.toString(),
          fullName: doctor.fullName,
          email: doctor.email,
          initials: doctor.initials || initialsForName(doctor.fullName),
          role: 'Endocrinologist',
        };
      }
    }

    // If no assigned doctor, show default placeholder
    if (!assignedDoctor) {
      // Try to find any doctor in the system as a fallback
      const allUsers = await userStore.listAllUsers();
      const anyDoctor = allUsers.find(u => u.role === 'doctor');
      if (anyDoctor) {
        assignedDoctor = {
          id: anyDoctor._id.toString(),
          fullName: anyDoctor.fullName,
          email: anyDoctor.email,
          initials: anyDoctor.initials || initialsForName(anyDoctor.fullName),
          role: 'Endocrinologist',
        };
      }
    }

    const careTeam = [
      assignedDoctor ? { ...assignedDoctor, accessLevel: 'Full access' } : { fullName: 'No doctor assigned', role: 'Endocrinologist', accessLevel: 'None', initials: '—' },
      { fullName: 'Diabetes Nurse', role: 'Diabetes Educator', accessLevel: 'Reports', initials: 'DN' },
      { fullName: 'Nutrition Support', role: 'Nutritionist', accessLevel: 'Meal data only', initials: 'NS' },
    ];

    // Treatment plan summary
    const plans = await treatmentPlanStore.listPlansForPatient(userId);
    const pendingCount = plans.filter(p => p.status === 'pending').length;
    const acceptedCount = plans.filter(p => p.status === 'accepted').length;

    res.json({
      assignedDoctor,
      careTeam,
      planSummary: { pending: pendingCount, accepted: acceptedCount, total: plans.length },
      sharingSettings: {
        glucoseData: true,
        insulinData: true,
        mealData: true,
        activityData: true,
        predictionResults: true,
      },
    });
  } catch (error) {
    next(error);
  }
}

// --- CONNECTORS ---

async function getConnectors(req, res) {
  const connectors = connectorStore.getConnectors(req.user._id.toString());
  res.json({ connectors });
}

async function connectConnector(req, res, next) {
  try {
    const connectorType = req.params.type;
    const result = connectorStore.connectConnector(req.user._id.toString(), connectorType);

    if (!result) {
      throw new AppError(`Unknown connector type: ${connectorType}`, 400);
    }

    await timelineService.addEvent(
      req.user._id.toString(), 'connector_sync',
      `${result.name} connected`,
      `${result.provider} — sync started`,
      'New data source will improve predictions.',
      'safe',
      { connectorType },
    );

    auditLog.log(req.user._id.toString(), 'patient.connector.connect', req.user._id.toString(), `Connected ${result.name}`);
    res.json({ connector: result });
  } catch (error) {
    next(error);
  }
}

async function disconnectConnector(req, res, next) {
  try {
    const connectorType = req.params.type;
    const success = connectorStore.disconnectConnector(req.user._id.toString(), connectorType);

    if (!success) {
      throw new AppError('Connector not found or not connected', 404);
    }

    auditLog.log(req.user._id.toString(), 'patient.connector.disconnect', req.user._id.toString(), `Disconnected ${connectorType}`);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

// --- TREATMENT PLAN REPLY ---

async function replyToTreatmentPlan(req, res, next) {
  try {
    const userId = req.user._id.toString();
    const planId = req.params.id;
    const action = String(req.body.action || '').toLowerCase();
    const patientComment = String(req.body.patientComment || '');

    if (!['accept', 'dismiss'].includes(action)) {
      throw new AppError('Action must be "accept" or "dismiss"', 400);
    }

    const status = action === 'accept' ? 'accepted' : 'dismissed';
    const plan = await treatmentPlanStore.updatePlanStatus(userId, planId, status, { patientComment });

    if (!plan) {
      throw new AppError('Treatment plan not found', 404);
    }

    // Timeline event
    await timelineService.addEvent(
      userId, 'treatment_plan',
      `Treatment plan ${status}`,
      plan.description,
      status === 'accepted' ? 'Plan changes are now active.' : 'Plan was dismissed.',
      status === 'accepted' ? 'safe' : 'info',
      { planId, status },
    );

    auditLog.log(userId, `patient.plan.${action}`, planId, `Patient ${action}ed treatment plan`);

    // Notify doctor via Socket.io
    const io = req.app.get('io');
    if (io && plan.doctorId) {
      io.to(`doctor_${plan.doctorId}`).emit('treatment_plan_response', {
        planId: plan.id,
        patientId: userId,
        status,
        patientComment,
      });
    }

    res.json({ plan });
  } catch (error) {
    next(error);
  }
}

// --- DOCTOR SUPERVISION ---

async function listAvailableDoctors(req, res, next) {
  try {
    const supervisionStore = require('../services/supervisionStore');
    const doctors = await supervisionStore.listDoctors();
    res.json({
      success: true,
      data: doctors.map(d => ({
        id: d._id ? d._id.toString() : d.id,
        fullName: d.fullName,
        email: d.email,
        specialty: d.specialty || '',
        clinicName: d.clinicName || '',
        licenseNumber: d.licenseNumber || '',
      })),
    });
  } catch (error) {
    next(error);
  }
}

async function createDoctorRequest(req, res, next) {
  try {
    const supervisionStore = require('../services/supervisionStore');
    const patientId = req.user._id.toString();
    const doctorId = String(req.body.doctorId || '').trim();
    const message = String(req.body.message || '').trim();

    if (!doctorId) {
      throw new AppError('Doctor ID is required.', 400, 'VALIDATION_ERROR');
    }

    const request = await supervisionStore.createRequest(patientId, doctorId, message);
    auditLog.log(patientId, 'patient.supervision_request', doctorId, 'Patient requested doctor supervision');

    res.status(201).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
}

async function getMyDoctorRequests(req, res, next) {
  try {
    const supervisionStore = require('../services/supervisionStore');
    const patientId = req.user._id.toString();
    const requests = await supervisionStore.getPatientRequests(patientId);

    res.json({
      success: true,
      data: requests.map(r => ({
        id: r._id ? r._id.toString() : r.id,
        doctorId: r.doctorId ? (r.doctorId._id ? r.doctorId._id.toString() : r.doctorId.toString()) : '',
        doctor: r.doctor || (r.doctorId && r.doctorId.fullName ? {
          id: r.doctorId._id.toString(),
          fullName: r.doctorId.fullName,
          email: r.doctorId.email,
          specialty: r.doctorId.specialty || '',
          clinicName: r.doctorId.clinicName || '',
        } : null),
        status: r.status,
        message: r.message || '',
        responseMessage: r.responseMessage || '',
        requestedAt: r.requestedAt,
        respondedAt: r.respondedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
}

// --- REPORTS ---
async function getReports(req, res, next) {
  try {
    const Report = require('../models/Report');
    const reports = await Report.find({ patientId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: reports });
  } catch (error) { next(error); }
}

async function generateReport(req, res, next) {
  try {
    const Report = require('../models/Report');
    const report = await Report.create({
      patientId: req.user._id,
      reportType: req.body.reportType || 'weekly',
      dateRange: req.body.dateRange || { start: new Date(Date.now() - 7*24*60*60*1000), end: new Date() },
      fileUrl: '/mock-reports/report-' + Date.now() + '.pdf'
    });
    res.json({ success: true, data: report });
  } catch (error) { next(error); }
}

// --- REMINDERS ---
async function getReminders(req, res, next) {
  try {
    const Reminder = require('../models/Reminder');
    const reminders = await Reminder.find({ patientId: req.user._id }).sort({ scheduledAt: 1 });
    res.json({ success: true, data: reminders });
  } catch (error) { next(error); }
}

async function createReminder(req, res, next) {
  try {
    const Reminder = require('../models/Reminder');
    const reminder = await Reminder.create({
      patientId: req.user._id,
      ...req.body
    });
    res.json({ success: true, data: reminder });
  } catch (error) { next(error); }
}

async function updateReminder(req, res, next) {
  try {
    const Reminder = require('../models/Reminder');
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, patientId: req.user._id },
      req.body,
      { new: true }
    );
    res.json({ success: true, data: reminder });
  } catch (error) { next(error); }
}

async function deleteReminder(req, res, next) {
  try {
    const Reminder = require('../models/Reminder');
    await Reminder.findOneAndDelete({ _id: req.params.id, patientId: req.user._id });
    res.json({ success: true, data: { deleted: true } });
  } catch (error) { next(error); }
}

// --- SETTINGS ---
async function getSettings(req, res, next) {
  try {
    const settings = req.user.settings || { notifications: true, language: 'en', units: req.user.glucoseUnit || 'mg/dL' };
    res.json({ success: true, data: settings });
  } catch (error) { next(error); }
}

async function updateSettings(req, res, next) {
  try {
    res.json({ success: true, data: { ...req.body } });
  } catch (error) { next(error); }
}

module.exports = {
  connectConnector,
  createDoctorRequest,
  disconnectConnector,
  getAnalytics,
  getCareTeam,
  getConnectors,
  getMyDoctorRequests,
  getProfile,
  getSummary,
  getTimeline,
  listAvailableDoctors,
  replyToTreatmentPlan,
  updateProfile,
  getReports,
  generateReport,
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  getSettings,
  updateSettings,
};

