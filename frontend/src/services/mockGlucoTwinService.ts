import {
  adaptationTimelineMock,
  analyticsMock,
  basalScheduleMock,
  glucoseForecastMock,
  patientProfileMock,
  prototypeDisclaimer,
  type SafetyStatus,
  type TwinPhase,
} from '../data/mockPatientData'

type BolusInput = {
  currentGlucose: number
  carbs: number
  protein: number
  fat: number
  fiber: number
  mealType: string
  activity: string
  insulinOnBoard: number
}

type FoodPortionInput = {
  food: string
  mealType: string
  currentGlucose: number
  context: string
}

type WhatIfInput = {
  foodAmount: number
  carbs: number
  protein: number
  fat: number
  bolusDose: number
  activity: string
  basalChange: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function round(value: number, digits = 0) {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

export function runPhysioSafetyCheckMock(input: { peakGlucose: number; minGlucose?: number; confidence?: number }) {
  const minGlucose = input.minGlucose ?? input.peakGlucose - 36
  const status = minGlucose < 70 || input.peakGlucose > 260
    ? 'Unsafe'
    : minGlucose < 82 || input.peakGlucose > 190 || (input.confidence ?? 0.86) < 0.72
      ? 'Caution'
      : 'Safe'

  return {
    status: status as SafetyStatus,
    label: status === 'Safe' ? 'Physio check passed' : status === 'Caution' ? 'Suggested for review' : 'Do not use clinically',
    message:
      status === 'Safe'
        ? 'Physiological simulation stays inside the configured prototype safety envelope.'
        : status === 'Caution'
          ? 'Simulation approaches a safety threshold, so the result is marked for review.'
          : 'Simulation crosses a safety threshold. A safer alternative is shown for demonstration.',
  }
}

export function getDashboardData() {
  const currentPhase: TwinPhase = 'Adaptation'
  const safety = runPhysioSafetyCheckMock({ peakGlucose: 151, minGlucose: 92 })

  return {
    disclaimer: prototypeDisclaimer,
    currentGlucose: 126,
    predictions: [
      { label: '30 min', value: 138 },
      { label: '60 min', value: 151 },
      { label: '120 min', value: 132 },
    ],
    currentPhase,
    latestSafetyStatus: safety.status,
    recentSummaries: [
      { label: 'Recent meal', value: '52 g carbs', detail: 'Lunch logged 1h ago' },
      { label: 'Insulin', value: '4.2 U', detail: 'Bolus on board: 1.1 U' },
      { label: 'Activity', value: '38 min', detail: 'Moderate walk detected' },
      { label: 'Sleep', value: '7.3 h', detail: 'Stable overnight trend' },
    ],
    explainability: {
      confidence: '86%',
      summary: 'The next-hour forecast is driven mostly by meal timing, partial insulin coverage, and a beneficial activity effect from your afternoon walk.',
      drivers: [
        { label: 'Meal context', detail: 'Lunch size and carb density are still the main reason for the expected 60-minute peak.' },
        { label: 'Insulin on board', detail: 'A small active bolus is reducing the size of the predicted peak.' },
        { label: 'Activity effect', detail: 'Recent moderate movement is expected to pull the late curve back toward target.' },
      ],
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
    glucoseForecast: glucoseForecastMock,
  }
}

export function getAdaptationStatus() {
  const daysCompleted = adaptationTimelineMock.length
  return {
    disclaimer: prototypeDisclaimer,
    daysTotal: 14,
    daysCompleted,
    progress: round((daysCompleted / 14) * 100),
    personalizationStatus: 'Physiological model personalization is 71% complete',
    collectedData: [
      { label: 'CGM readings', value: '459', detail: '5-min samples' },
      { label: 'Insulin events', value: '72', detail: 'Basal and bolus history' },
      { label: 'Meal logs', value: '38', detail: 'Macros and meal timing' },
      { label: 'Activity minutes', value: '372', detail: 'Wearable stream' },
      { label: 'Sleep nights', value: '10/11', detail: 'One low-confidence night' },
    ],
    warnings: ['Day 5 sleep confidence is low', 'Day 10 meal log is incomplete', 'Three more complete days needed before active mode'],
    timeline: adaptationTimelineMock,
  }
}

export function getAiModelsStatus() {
  return {
    disclaimer: prototypeDisclaimer,
    models: [
      {
        name: 'Bolus Dose Prediction',
        status: 'Needs More Data' as SafetyStatus,
        phase: 'Not started',
        inputs: ['Current glucose', 'Meal macros', 'Meal type', 'Recent activity', 'Insulin on board'],
        output: 'Suggested for review: 4.4 U bolus',
        safety: runPhysioSafetyCheckMock({ peakGlucose: 198, minGlucose: 86, confidence: 0.68 }),
        feedback: 'Waiting for a complete 14-day adaptation window before showing active recommendations.',
      },
      {
        name: 'Basal Schedule Prediction',
        status: 'Caution' as SafetyStatus,
        phase: 'Fine-tuning',
        inputs: ['Overnight CGM', 'Basal profile', 'Activity history', 'Sleep quality'],
        output: '24-hour profile with evening increase',
        safety: runPhysioSafetyCheckMock({ peakGlucose: 184, minGlucose: 78 }),
        feedback: 'Evening segment is close to the low-glucose threshold and remains in review mode.',
      },
      {
        name: 'Food Portion Recommendation',
        status: 'Safe' as SafetyStatus,
        phase: 'Continuously updating',
        inputs: ['Food type', 'Meal timing', 'Current glucose', 'Activity and sleep context'],
        output: 'Recommended portion: 1 medium bowl, 48 g carbs',
        safety: runPhysioSafetyCheckMock({ peakGlucose: 162, minGlucose: 94 }),
        feedback: 'Portion stays in range under the simulated physiological response.',
      },
    ],
  }
}

export function predictBolusMock(input: BolusInput) {
  const carbDose = input.carbs / 11
  const correctionDose = Math.max((input.currentGlucose - 120) / 42, 0)
  const macroAdjustment = input.fat > 20 || input.protein > 30 ? 0.35 : 0
  const activityAdjustment = input.activity.toLowerCase().includes('high') ? -0.45 : input.activity.toLowerCase().includes('moderate') ? -0.2 : 0
  const fiberAdjustment = input.fiber > 8 ? -0.15 : 0
  const suggestedDose = clamp(carbDose + correctionDose + macroAdjustment + activityAdjustment + fiberAdjustment - input.insulinOnBoard * 0.35, 0.5, 9)
  const peak = round(input.currentGlucose + input.carbs * 1.05 - suggestedDose * 28 + input.fat * 0.35)
  const safety = runPhysioSafetyCheckMock({ peakGlucose: peak, minGlucose: peak - 58 })

  return {
    suggestedDose: round(suggestedDose, 1),
    alternativeDose: round(Math.max(suggestedDose - 0.6, 0.5), 1),
    curve: [
      { label: 'Now', value: input.currentGlucose },
      { label: '+30m', value: round(input.currentGlucose + input.carbs * 0.42 - suggestedDose * 8) },
      { label: '+60m', value: peak },
      { label: '+120m', value: round(peak - 24) },
    ],
    safety,
    explanation: `Mock ${input.mealType.toLowerCase()} bolus is based on macros, correction need, activity, fiber, and insulin-on-board. This is suggested for review only.`,
  }
}

export function generateBasalScheduleMock() {
  const peak = Math.max(...basalScheduleMock.map((item) => item.response))
  return {
    disclaimer: prototypeDisclaimer,
    schedule: basalScheduleMock,
    predictedResponse: basalScheduleMock.map((item) => ({ label: item.time.split('-')[0], value: item.response })),
    safety: runPhysioSafetyCheckMock({ peakGlucose: peak, minGlucose: 86 }),
    note: 'Schedule generated from prototype CGM, sleep, and activity patterns. Not medical advice.',
  }
}

export function recommendFoodPortionMock(input: FoodPortionInput) {
  const baseCarbs = input.food.toLowerCase().includes('rice') ? 54 : input.food.toLowerCase().includes('pasta') ? 58 : 42
  const contextAdjustment = input.context.toLowerCase().includes('poor sleep') ? -8 : input.context.toLowerCase().includes('activity') ? 8 : 0
  const carbs = clamp(baseCarbs + contextAdjustment - Math.max(input.currentGlucose - 145, 0) * 0.12, 24, 64)
  const peak = round(input.currentGlucose + carbs * 0.92)
  const safety = runPhysioSafetyCheckMock({ peakGlucose: peak, minGlucose: input.currentGlucose - 12 })

  return {
    portion: `${round(carbs / baseCarbs, 1)} serving of ${input.food || 'selected meal'}`,
    macros: {
      carbs: round(carbs),
      protein: round(carbs * 0.36),
      fat: round(carbs * 0.18),
      fiber: round(carbs * 0.12),
    },
    glucosePrediction: [
      { label: '+30m', value: round(input.currentGlucose + carbs * 0.32) },
      { label: '+60m', value: peak },
      { label: '+120m', value: round(peak - 22) },
    ],
    safety,
    warning: safety.status === 'Safe' ? 'Meal portion remains in the prototype range.' : 'Meal or portion may cause high glucose in this simulation.',
  }
}

export function runWhatIfScenarioMock(input: WhatIfInput) {
  const activityDrop = input.activity.toLowerCase().includes('high') ? 32 : input.activity.toLowerCase().includes('moderate') ? 18 : 6
  const basalEffect = input.basalChange * 18
  const start = 126
  const peak = round(start + input.carbs * 0.95 + input.fat * 0.25 - input.bolusDose * 27 - activityDrop - basalEffect)
  const curve = [
    { label: 'Now', value: start },
    { label: '+30m', value: round(start + input.carbs * 0.35 - input.bolusDose * 7) },
    { label: '+60m', value: peak },
    { label: '+120m', value: round(peak - activityDrop * 0.5 - input.bolusDose * 5) },
  ]
  const safety = runPhysioSafetyCheckMock({ peakGlucose: Math.max(...curve.map((point) => point.value)), minGlucose: Math.min(...curve.map((point) => point.value)) })

  return {
    predictions: curve.filter((point) => point.label !== 'Now'),
    curve,
    safety,
    explanation: `Scenario combines ${input.foodAmount} g food, macros, ${input.bolusDose} U review dose, ${input.activity.toLowerCase()} activity, and basal change into a simulated glucose trend.`,
  }
}

export function getPatientProfileMock() {
  return { disclaimer: prototypeDisclaimer, ...patientProfileMock }
}

export function getAnalyticsMockData() {
  return { disclaimer: prototypeDisclaimer, ...analyticsMock }
}
