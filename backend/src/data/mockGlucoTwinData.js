const prototypeFlags = {
  mock: true,
  simulationOnly: true,
  notMedicalAdvice: true,
  disclaimer: 'Prototype simulation using mock data. Not for real medical use. Do not use for real insulin dosing.',
  warnings: [
    'Prototype simulation using mock data.',
    'Not for real medical use.',
    'Do not use for real insulin dosing.',
  ],
};

const glucoseForecast = [
  { label: 'Now', value: 126 },
  { label: '+30m', value: 138 },
  { label: '+60m', value: 151 },
  { label: '+90m', value: 145 },
  { label: '+120m', value: 132 },
];

const adaptationTimeline = [
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
];

const basalSchedule = [
  { time: '00:00-04:00', rate: 0.62, response: 112 },
  { time: '04:00-08:00', rate: 0.78, response: 128 },
  { time: '08:00-12:00', rate: 0.72, response: 136 },
  { time: '12:00-16:00', rate: 0.66, response: 142 },
  { time: '16:00-20:00', rate: 0.82, response: 148 },
  { time: '20:00-00:00', rate: 0.68, response: 124 },
];

const analytics = {
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
    { label: 'Avg recovery', value: '54m', detail: 'Mock estimate' },
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
};

const timelineEvents = [
  {
    id: 'evt-1',
    type: 'meal',
    title: 'Lunch logged',
    detail: '52 g carbs, 24 g protein, 18 g fat',
    timestampLabel: 'Today, 12:10 PM',
    impact: 'Expected post-meal rise remains inside your target envelope.',
    severity: 'info',
  },
  {
    id: 'evt-2',
    type: 'insulin',
    title: 'Bolus recorded',
    detail: '4.2 U meal bolus with 1.1 U insulin on board',
    timestampLabel: 'Today, 12:14 PM',
    impact: 'Dose matched the logged meal with a small activity reduction.',
    severity: 'safe',
  },
  {
    id: 'evt-3',
    type: 'activity',
    title: 'Moderate walk detected',
    detail: '38 minutes at moderate intensity',
    timestampLabel: 'Today, 3:05 PM',
    impact: 'Predicted to reduce the late-afternoon peak by roughly 18 mg/dL.',
    severity: 'safe',
  },
  {
    id: 'evt-4',
    type: 'sleep',
    title: 'Sleep confidence warning',
    detail: 'Wearable data quality was low overnight',
    timestampLabel: 'Today, 7:30 AM',
    impact: 'Overnight recommendations remain in review mode until confidence improves.',
    severity: 'warning',
  },
  {
    id: 'evt-5',
    type: 'plan',
    title: 'Treatment plan sent',
    detail: 'Clinician suggested a basal review for evening hours',
    timestampLabel: 'Yesterday, 6:20 PM',
    impact: 'Pending your review in Care Team.',
    severity: 'info',
  },
];

const explainabilityDrivers = [
  { label: 'Meal context', detail: 'Lunch size and carb density are still the main reason for the expected 60-minute peak.' },
  { label: 'Insulin on board', detail: 'A small active bolus is reducing the size of the predicted peak.' },
  { label: 'Activity effect', detail: 'Recent moderate movement is expected to pull the late curve back toward target.' },
];

module.exports = {
  adaptationTimeline,
  analytics,
  basalSchedule,
  explainabilityDrivers,
  glucoseForecast,
  prototypeFlags,
  timelineEvents,
};
