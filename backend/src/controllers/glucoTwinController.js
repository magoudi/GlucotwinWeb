const mockService = require('../services/mockGlucoTwinService');
const treatmentPlanStore = require('../services/treatmentPlanStore');
const timelineService = require('../services/timelineService');
const auditLog = require('../services/auditLog');
const AppError = require('../utils/AppError');

function userId(req) {
  return req.user._id.toString();
}

async function dashboard(req, res, next) {
  try {
    res.json(await mockService.getDashboardData(req.user));
  } catch (error) {
    next(error);
  }
}

async function adaptation(req, res, next) {
  try {
    res.json(await mockService.getAdaptationStatus(req.user));
  } catch (error) {
    next(error);
  }
}

async function analytics(req, res, next) {
  try {
    res.json(await mockService.getAnalyticsData(req.user));
  } catch (error) {
    next(error);
  }
}

async function models(req, res, next) {
  try {
    res.json(await mockService.getModelsStatus(req.user));
  } catch (error) {
    next(error);
  }
}

async function predictBolus(req, res, next) {
  try {
    const result = await mockService.predictBolusMock(req.user, req.body);

    // Emit unsafe predictions to patient + assigned doctor
    if (result.safety && result.safety.status === 'unsafe') {
      const io = req.app.get('io');
      if (io) {
        io.to(`patient_${userId(req)}`).emit('high_risk_prediction', {
          type: 'bolus',
          safety: result.safety,
          suggestedDose: result.suggestedDose,
        });
        if (req.user.assignedDoctor) {
          io.to(`doctor_${req.user.assignedDoctor.toString()}`).emit('high_risk_prediction', {
            patientId: userId(req),
            type: 'bolus',
            safety: result.safety,
          });
        }
      }
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function generateBasal(req, res, next) {
  try {
    const result = await mockService.generateBasalScheduleMock(req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function recommendFood(req, res, next) {
  try {
    const result = await mockService.recommendFoodPortionMock(req.user, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function runWhatIf(req, res, next) {
  try {
    const result = await mockService.runWhatIfScenarioMock(req.user, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function getPendingPlan(req, res, next) {
  try {
    const plan = await treatmentPlanStore.getPendingPlan(userId(req));
    res.json({ plan });
  } catch (error) {
    next(error);
  }
}

async function listPlans(req, res, next) {
  try {
    const plans = await treatmentPlanStore.listPlansForPatient(userId(req));
    res.json({ plans });
  } catch (error) {
    next(error);
  }
}

async function dismissPlan(req, res, next) {
  try {
    const plan = await treatmentPlanStore.updatePlanStatus(userId(req), req.params.id, 'dismissed', req.body || {});
    if (!plan) {
      throw new AppError('Treatment plan not found', 404);
    }

    // Create timeline event
    await timelineService.addEvent(
      userId(req), 'treatment_plan',
      'Treatment plan dismissed',
      plan.description || 'Plan dismissed by patient',
      'Dismissed — no changes applied.',
      'info',
      { planId: plan.id, status: 'dismissed' },
    );

    // Notify doctor
    const io = req.app.get('io');
    if (io && plan.doctorId) {
      io.to(`doctor_${plan.doctorId}`).emit('treatment_plan_response', {
        planId: plan.id,
        patientId: userId(req),
        status: 'dismissed',
        patientComment: req.body.patientComment || '',
      });
    }

    auditLog.log(userId(req), 'patient.plan.dismiss', plan.id, 'Treatment plan dismissed');

    res.json({ plan });
  } catch (error) {
    next(error);
  }
}

async function acceptPlan(req, res, next) {
  try {
    const plan = await treatmentPlanStore.updatePlanStatus(userId(req), req.params.id, 'accepted', req.body || {});
    if (!plan) {
      throw new AppError('Treatment plan not found', 404);
    }

    // Create timeline event
    await timelineService.addEvent(
      userId(req), 'treatment_plan',
      'Treatment plan accepted',
      plan.description || 'Plan accepted by patient',
      'Changes are now active in your profile.',
      'safe',
      { planId: plan.id, status: 'accepted' },
    );

    // Notify doctor
    const io = req.app.get('io');
    if (io && plan.doctorId) {
      io.to(`doctor_${plan.doctorId}`).emit('treatment_plan_response', {
        planId: plan.id,
        patientId: userId(req),
        status: 'accepted',
        patientComment: req.body.patientComment || '',
      });
    }

    auditLog.log(userId(req), 'patient.plan.accept', plan.id, 'Treatment plan accepted');

    res.json({ plan });
  } catch (error) {
    next(error);
  }
}

async function timeline(req, res, next) {
  try {
    res.json(await mockService.getTimelineData(req.user));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  adaptation,
  analytics,
  dashboard,
  generateBasal,
  listPlans,
  models,
  predictBolus,
  recommendFood,
  runWhatIf,
  getPendingPlan,
  dismissPlan,
  acceptPlan,
  timeline,
};
