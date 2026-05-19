export type SafetyStatus = 'Safe' | 'Caution' | 'Unsafe' | 'Needs More Data'
export type TwinPhase = 'Adaptation' | 'Fine-tuning' | 'Active'

export const prototypeDisclaimer = 'This is a prototype simulation using data. Not for real medical use.'

export const patientProfileMock = {
  patient: {
    name: 'Maya Hassan',
    age: 34,
    diagnosis: 'Type 1 diabetes',
    managementType: 'Pump',
    unitsPreference: 'mg/dL',
    timezone: 'Africa/Cairo',
  },
  targets: {
    range: '80-150 mg/dL',
    overnightRange: '90-140 mg/dL',
    safetyFloor: '70 mg/dL',
    safetyCeiling: '250 mg/dL',
  },
  insulinSettings: {
    sensitivity: '42 mg/dL per unit',
    carbRatio: '1 unit per 11 g carbs',
    activeInsulinTime: '4 hours',
  },
  basalProfile: [
    { time: '00:00-04:00', rate: 0.62 },
    { time: '04:00-08:00', rate: 0.78 },
    { time: '08:00-12:00', rate: 0.72 },
    { time: '12:00-18:00', rate: 0.66 },
    { time: '18:00-22:00', rate: 0.82 },
    { time: '22:00-00:00', rate: 0.68 },
  ],
  connectedSources: [
    { name: 'CGM stream', status: 'Connected', lastSync: '5 min ago' },
    { name: 'Pump history', status: 'Connected', lastSync: '14 min ago' },
    { name: 'Meal photos', status: 'Prototype only', lastSync: 'Today' },
    { name: 'Activity wearable', status: 'Connected', lastSync: '28 min ago' },
    { name: 'Sleep tracker', status: 'Connected', lastSync: '6 hours ago' },
  ],
  modelStatus: [
    { label: 'Physiological model', value: 'Personalized 71%', status: 'Adaptation' },
    { label: 'Bolus dose AI', value: 'Waiting for adaptation', status: 'Not started' },
    { label: 'Basal schedule AI', value: 'Shadow-mode checks', status: 'Fine-tuning' },
    { label: 'Food portion AI', value: 'Continuous update', status: 'Continuously updating' },
  ],
}

export const adaptationTimelineMock = [
  { day: 1, glucose: 38, insulin: 6, meals: 3, activity: 32, sleep: 7.1, status: 'Complete' },
  { day: 2, glucose: 42, insulin: 7, meals: 4, activity: 28, sleep: 6.7, status: 'Complete' },
  { day: 3, glucose: 40, insulin: 6, meals: 3, activity: 41, sleep: 7.5, status: 'Complete' },
  { day: 4, glucose: 44, insulin: 7, meals: 4, activity: 36, sleep: 7.0, status: 'Complete' },
  { day: 5, glucose: 39, insulin: 5, meals: 3, activity: 18, sleep: 5.9, status: 'Missing sleep confidence' },
  { day: 6, glucose: 45, insulin: 8, meals: 4, activity: 47, sleep: 7.6, status: 'Complete' },
  { day: 7, glucose: 43, insulin: 6, meals: 3, activity: 54, sleep: 7.8, status: 'Complete' },
  { day: 8, glucose: 41, insulin: 7, meals: 4, activity: 22, sleep: 6.3, status: 'Complete' },
  { day: 9, glucose: 46, insulin: 8, meals: 4, activity: 35, sleep: 6.9, status: 'Complete' },
  { day: 10, glucose: 37, insulin: 5, meals: 2, activity: 16, sleep: 6.0, status: 'Meal log gap' },
  { day: 11, glucose: 44, insulin: 7, meals: 4, activity: 43, sleep: 7.3, status: 'Complete' },
]

export const glucoseForecastMock = [
  { label: 'Now', value: 126 },
  { label: '+30m', value: 138 },
  { label: '+60m', value: 151 },
  { label: '+90m', value: 145 },
  { label: '+120m', value: 132 },
]

export const basalScheduleMock = [
  { time: '00:00-04:00', rate: 0.62, response: 112 },
  { time: '04:00-08:00', rate: 0.78, response: 128 },
  { time: '08:00-12:00', rate: 0.72, response: 136 },
  { time: '12:00-16:00', rate: 0.66, response: 142 },
  { time: '16:00-20:00', rate: 0.82, response: 148 },
  { time: '20:00-00:00', rate: 0.68, response: 124 },
]

export const analyticsMock = {
  glucoseTrends: [
    { label: 'Mon', value: 132 },
    { label: 'Tue', value: 146 },
    { label: 'Wed', value: 121 },
    { label: 'Thu', value: 158 },
    { label: 'Fri', value: 139 },
    { label: 'Sat', value: 151 },
    { label: 'Sun', value: 128 },
  ],
  timeInRange: [
    { label: 'In range', value: 72 },
    { label: 'High', value: 20 },
    { label: 'Low', value: 8 },
  ],
  events: [
    { label: 'Hypo events', value: '3', detail: 'Prototype data' },
    { label: 'High events', value: '8', detail: 'Mostly after dinner' },
    { label: 'Avg recovery', value: '54m', detail: 'Estimate' },
  ],
  mealImpact: [
    { label: 'Breakfast', value: 22 },
    { label: 'Lunch', value: 34 },
    { label: 'Dinner', value: 46 },
    { label: 'Snacks', value: 18 },
  ],
  bolusHistory: [
    { label: 'Mon', value: 14 },
    { label: 'Tue', value: 16 },
    { label: 'Wed', value: 12 },
    { label: 'Thu', value: 18 },
    { label: 'Fri', value: 15 },
  ],
  basalHistory: [
    { label: '00-04', value: 0.62 },
    { label: '04-08', value: 0.78 },
    { label: '08-12', value: 0.72 },
    { label: '12-18', value: 0.66 },
    { label: '18-22', value: 0.82 },
  ],
  activityEffect: [
    { label: 'Low', value: -8 },
    { label: 'Moderate', value: -22 },
    { label: 'High', value: -36 },
  ],
  sleepEffect: [
    { label: 'Poor', value: 24 },
    { label: 'Okay', value: 12 },
    { label: 'Good', value: 4 },
  ],
}
