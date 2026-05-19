const {
  adaptationTimeline,
  analytics,
  basalSchedule,
  explainabilityDrivers,
  glucoseForecast,
  prototypeFlags,
  timelineEvents,
} = require('../data/mockGlucoTwinData');
const systemSettingsStore = require('./systemSettingsStore');
const safetyService = require('./safetyService');
const predictionStore = require('./predictionStore');
const timelineService = require('./timelineService');

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function round(value, digits = 0) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function withFlags(payload) {
  return {
    ...prototypeFlags,
    ...payload,
  };
}

async function getDashboardData(user) {
  const userId = user._id.toString();
  const safetyCheck = await safetyService.checkSafety({ predictedPeak: 151, predictedMin: 92, user });
  
  return withFlags({
    userId,
    currentGlucose: 126,
    predictions: [
      { label: '30 min', value: 138 },
      { label: '60 min', value: 151 },
      { label: '120 min', value: 132 },
    ],
    currentPhase: 'Adaptation',
    latestSafetyStatus: safetyCheck.status,
    recentSummaries: [
      { label: 'Recent meal', value: '52 g carbs', detail: 'Lunch logged 1h ago' },
      { label: 'Insulin', value: '4.2 U', detail: 'Mock bolus on board: 1.1 U' },
      { label: 'Activity', value: '38 min', detail: 'Moderate walk detected' },
      { label: 'Sleep', value: '7.3 h', detail: 'Stable overnight trend' },
    ],
    explainability: {
      confidence: '86%',
      summary: 'The next-hour forecast is driven mostly by meal timing, partial insulin coverage, and a beneficial activity effect from your afternoon walk.',
      drivers: explainabilityDrivers,
    },
    flow: [
      'Raw patient inputs',
      'Cleaning / preprocessing',
      'AI model prediction',
      'Physiological simulation',
      'Safety decision',
      'Simulation result for review',
      'Feedback saved',
    ],
    glucoseForecast,
  });
}

function getAdaptationStatus(user) {
  const userId = user._id.toString();
  const daysCompleted = adaptationTimeline.length;

  return withFlags({
    userId,
    daysTotal: 14,
    daysCompleted,
    progress: round((daysCompleted / 14) * 100),
    personalizationStatus: 'Physiological model personalization is 71% complete',
    collectedData: [
      { label: 'CGM readings', value: '459', detail: 'Mock 5-min samples' },
      { label: 'Insulin events', value: '72', detail: 'Basal and bolus history' },
      { label: 'Meal logs', value: '38', detail: 'Macros and meal timing' },
      { label: 'Activity minutes', value: '372', detail: 'Wearable mock stream' },
      { label: 'Sleep nights', value: '10/11', detail: 'One low-confidence night' },
    ],
    warnings: ['Day 5 sleep confidence is low', 'Day 10 meal log is incomplete', 'Three more complete days needed before active mode'],
    timeline: adaptationTimeline,
  });
}

async function getModelsStatus(user) {
  const userId = user._id.toString();
  const bolusSafety = await safetyService.checkSafety({ predictedPeak: 198, predictedMin: 86, confidence: 0.68, user });
  const basalSafety = await safetyService.checkSafety({ predictedPeak: 184, predictedMin: 78, user });
  const foodSafety = await safetyService.checkSafety({ predictedPeak: 162, predictedMin: 94, user });

  return withFlags({
    userId,
    models: [
      {
        name: 'Bolus Dose Prediction',
        status: 'Needs More Data',
        phase: 'Not started',
        inputs: ['Current glucose', 'Meal macros', 'Meal type', 'Recent activity', 'Insulin on board'],
        output: 'Suggested for review: 4.4 U mock bolus',
        safety: bolusSafety,
        feedback: 'Waiting for a complete 14-day adaptation window before showing active recommendations.',
      },
      {
        name: 'Basal Schedule Prediction',
        status: 'Caution',
        phase: 'Fine-tuning',
        inputs: ['Overnight CGM', 'Basal profile', 'Activity history', 'Sleep quality'],
        output: 'Mock 24-hour profile with evening increase',
        safety: basalSafety,
        feedback: 'Evening segment is close to the low-glucose threshold and remains in review mode.',
      },
      {
        name: 'Food Portion Recommendation',
        status: 'Safe',
        phase: 'Continuously updating',
        inputs: ['Food type', 'Meal timing', 'Current glucose', 'Activity and sleep context'],
        output: 'Recommended portion: 1 medium bowl, 48 g carbs',
        safety: foodSafety,
        feedback: 'Mock portion stays in range under the simulated physiological response.',
      },
    ],
  });
}

async function predictBolusMock(user, input = {}) {
  const userId = user._id.toString();
  const currentGlucose = Number(input.currentGlucose || 142);
  const carbs = Number(input.carbs || 54);
  const protein = Number(input.protein || 24);
  const fat = Number(input.fat || 18);
  const fiber = Number(input.fiber || 7);
  const insulinOnBoard = Number(input.insulinOnBoard || 0);
  const mealType = String(input.mealType || 'Meal');
  const activity = String(input.activity || 'Moderate activity');
  const carbDose = carbs / (user.carbRatio || 11);
  const correctionDose = Math.max((currentGlucose - 120) / (user.correctionFactor || 42), 0);
  const macroAdjustment = fat > 20 || protein > 30 ? 0.35 : 0;
  const activityAdjustment = activity.toLowerCase().includes('high') ? -0.45 : activity.toLowerCase().includes('moderate') ? -0.2 : 0;
  const fiberAdjustment = fiber > 8 ? -0.15 : 0;
  const suggestedDose = clamp(carbDose + correctionDose + macroAdjustment + activityAdjustment + fiberAdjustment - insulinOnBoard * 0.35, 0.5, 9);
  const peak = round(currentGlucose + carbs * 1.05 - suggestedDose * 28 + fat * 0.35);
  const safety = await safetyService.checkSafety({ predictedPeak: peak, predictedMin: peak - 58, user });
  const drivers = safetyService.buildDrivers({ currentGlucose, targetMax: user.targetGlucoseMax, carbs, insulinOnBoard, activity, confidence: 0.86, fatProtein: fat > 20 || protein > 30 });

  const result = withFlags({
    userId,
    suggestedDose: round(suggestedDose, 1),
    alternativeDose: round(Math.max(suggestedDose - 0.6, 0.5), 1),
    curve: [
      { label: 'Now', value: currentGlucose },
      { label: '+30m', value: round(currentGlucose + carbs * 0.42 - suggestedDose * 8) },
      { label: '+60m', value: peak },
      { label: '+120m', value: round(peak - 24) },
    ],
    safety,
    drivers,
    explanation: `Mock ${mealType.toLowerCase()} bolus is based on macros, correction need, activity, fiber, and insulin-on-board. This is suggested for review only.`,
  });

  // Save prediction and create timeline event
  await predictionStore.savePrediction(userId, 'bolus', input, result, 0.86, safety.status, drivers);
  await timelineService.addEvent(userId, 'prediction', 'Bolus prediction generated', `Suggested ${result.suggestedDose}U for ${carbs}g carbs`, `Safety: ${safety.label}`, safety.status === 'safe' ? 'safe' : 'warning', { predictionType: 'bolus', dose: result.suggestedDose });

  return result;
}

async function generateBasalScheduleMock(user) {
  const userId = user._id.toString();
  const peak = Math.max(...basalSchedule.map((item) => item.response));

  const schedule = user.basalProfile && user.basalProfile.length > 0
    ? user.basalProfile.map(b => ({ time: `${b.startTime}-${String((parseInt(b.startTime.split(':')[0])+4)%24).padStart(2, '0')}:00`, rate: b.rate, response: Math.round(100 + b.rate * 40) }))
    : basalSchedule;

  const predictedResponse = (user.basalProfile && user.basalProfile.length > 0 ? user.basalProfile : basalSchedule)
    .map((item) => ({ label: item.startTime ? item.startTime.split(':')[0] : item.time.split('-')[0], value: item.startTime ? Math.round(100 + item.rate * 40) : item.response }));

  const safety = await safetyService.checkSafety({ predictedPeak: peak, predictedMin: 86, user });
  const drivers = safetyService.buildDrivers({ confidence: 0.86 });

  const result = withFlags({
    userId,
    schedule,
    predictedResponse,
    safety,
    drivers,
    note: 'Mock schedule generated from prototype CGM, sleep, and activity patterns. Not medical advice.',
  });

  await predictionStore.savePrediction(userId, 'basal', {}, result, 0.86, safety.status, drivers);
  await timelineService.addEvent(userId, 'prediction', 'Basal schedule generated', `${schedule.length} time blocks analyzed`, `Safety: ${safety.label}`, 'info', { predictionType: 'basal' });

  return result;
}

async function recommendFoodPortionMock(user, input = {}) {
  const userId = user._id.toString();
  const food = String(input.food || input.mealName || 'selected meal');
  const currentGlucose = Number(input.currentGlucose || 136);
  const context = String(input.context || 'Moderate activity today');
  const baseCarbs = food.toLowerCase().includes('rice') ? 54 : food.toLowerCase().includes('pasta') ? 58 : 42;
  const contextAdjustment = context.toLowerCase().includes('poor sleep') ? -8 : context.toLowerCase().includes('activity') ? 8 : 0;
  const carbs = clamp(baseCarbs + contextAdjustment - Math.max(currentGlucose - (user.targetGlucoseMax || 145), 0) * 0.12, 24, 64);
  const peak = round(currentGlucose + carbs * 0.92);
  const safety = await safetyService.checkSafety({ predictedPeak: peak, predictedMin: currentGlucose - 12, user });
  const drivers = safetyService.buildDrivers({ currentGlucose, targetMax: user.targetGlucoseMax, carbs, activity: context });

  const result = withFlags({
    userId,
    portion: `${round(carbs / baseCarbs, 1)} serving of ${food}`,
    macros: {
      carbs: round(carbs),
      protein: round(carbs * 0.36),
      fat: round(carbs * 0.18),
      fiber: round(carbs * 0.12),
    },
    glucosePrediction: [
      { label: '+30m', value: round(currentGlucose + carbs * 0.32) },
      { label: '+60m', value: peak },
      { label: '+120m', value: round(peak - 22) },
    ],
    safety,
    drivers,
    warning: safety.status === 'safe' ? 'Mock meal portion remains in the prototype range.' : 'Mock meal or portion may cause high glucose in this simulation.',
  });

  await predictionStore.savePrediction(userId, 'food', input, result, 0.86, safety.status, drivers);
  await timelineService.addEvent(userId, 'prediction', 'Food recommendation generated', `${food}: ${round(carbs)}g carbs recommended`, `Safety: ${safety.label}`, 'info', { predictionType: 'food', food });

  return result;
}

async function runWhatIfScenarioMock(user, input = {}) {
  const userId = user._id.toString();
  const settings = await systemSettingsStore.getSettings();
  const foodAmount = Number(input.foodAmount || 420);
  const carbs = Number(input.carbs || 62);
  const fat = Number(input.fat || 20);
  const bolusDose = Number(input.bolusDose || 4.8);
  const activity = String(input.activity || 'Moderate activity');
  const basalChange = Number(input.basalChange || 0);
  const avgBasal = user.basalProfile && user.basalProfile.length > 0
    ? user.basalProfile.reduce((sum, b) => sum + b.rate, 0) / user.basalProfile.length
    : 1.0;
  
  const targetBasalRate = avgBasal * (1 + basalChange / 100);
  const finalBasalRate = settings.enableAdvancedWhatIf ? targetBasalRate : clamp(targetBasalRate, 0, settings.maxBasalRate);
  const finalBasalChangeUnits = finalBasalRate - avgBasal;

  const activityDrop = activity.toLowerCase().includes('high') ? 32 : activity.toLowerCase().includes('moderate') ? 18 : 6;
  const basalEffect = finalBasalChangeUnits * 18 * 5;
  const start = 126;
  const peak = round(start + carbs * 0.95 + fat * 0.25 - bolusDose * 27 - activityDrop - basalEffect);
  const curve = [
    { label: 'Now', value: start },
    { label: '+30m', value: round(start + carbs * 0.35 - bolusDose * 7) },
    { label: '+60m', value: peak },
    { label: '+120m', value: round(peak - activityDrop * 0.5 - bolusDose * 5) },
  ];
  const safety = await safetyService.checkSafety({
    predictedPeak: Math.max(...curve.map((point) => point.value)),
    predictedMin: Math.min(...curve.map((point) => point.value)),
    user,
  });
  const drivers = safetyService.buildDrivers({ carbs, activity, insulinOnBoard: bolusDose, confidence: 0.86 });

  const result = withFlags({
    userId,
    predictions: curve.filter((point) => point.label !== 'Now'),
    curve,
    safety,
    drivers,
    explanation: `Mock scenario combines ${foodAmount} g food, macros, ${bolusDose} U review dose, ${activity.toLowerCase()} activity, and basal change into a simulated glucose trend.`,
  });

  await predictionStore.savePrediction(userId, 'what_if', input, result, 0.86, safety.status, drivers);
  await timelineService.addEvent(userId, 'prediction', 'What-if simulation run', `${foodAmount}g food, ${bolusDose}U dose, ${activity}`, `Safety: ${safety.label}`, 'info', { predictionType: 'what_if' });

  return result;
}

function getAnalyticsData(user) {
  const userId = user._id.toString();
  return withFlags({ userId, ...analytics });
}

function getTimelineData(user) {
  const userId = user._id.toString();

  return withFlags({
    userId,
    summary: {
      meals: 3,
      insulinEvents: 5,
      activityMinutes: 38,
      sleepHours: 7.3,
    },
    events: timelineEvents.map((event) => ({
      ...event,
      targetContext: `${user.targetGlucoseMin || 80}-${user.targetGlucoseMax || 150} ${user.glucoseUnit || 'mg/dL'} target`,
    })),
  });
}

module.exports = {
  generateBasalScheduleMock,
  getAdaptationStatus,
  getAnalyticsData,
  getDashboardData,
  getModelsStatus,
  getTimelineData,
  predictBolusMock,
  recommendFoodPortionMock,
  runWhatIfScenarioMock,
};
