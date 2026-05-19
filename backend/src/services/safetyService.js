/**
 * Central safety service for all digital twin predictions.
 * Every prediction route must call checkSafety() before returning results.
 */
const systemSettingsStore = require('./systemSettingsStore');

/**
 * @param {object} params
 * @param {number} params.predictedPeak - Maximum predicted glucose
 * @param {number} params.predictedMin - Minimum predicted glucose
 * @param {number} [params.confidence=0.86] - Model confidence (0-1)
 * @param {object} [params.user] - User object with target ranges
 * @returns {Promise<{status: string, label: string, message: string}>}
 */
async function checkSafety({ predictedPeak, predictedMin, confidence = 0.86, user } = {}) {
  const settings = await systemSettingsStore.getSettings();

  const targetMin = user && user.targetGlucoseMin ? user.targetGlucoseMin : settings.defaultTargetMin;
  const targetMax = user && user.targetGlucoseMax ? user.targetGlucoseMax : settings.defaultTargetMax;

  const peak = Number(predictedPeak || 150);
  const min = Number(predictedMin || peak - 36);
  const conf = Number(confidence);

  let status;
  if (min < targetMin || peak > targetMax + 80) {
    status = 'unsafe';
  } else if (min < targetMin + 12 || peak > targetMax + 10 || conf < 0.72) {
    status = 'caution';
  } else {
    status = 'safe';
  }

  const labels = {
    safe: 'Physio check passed',
    caution: 'Suggested for review',
    unsafe: 'Do not use clinically',
  };

  const messages = {
    safe: 'Mock physiological simulation stays inside the configured prototype safety envelope.',
    caution: 'Mock simulation approaches a safety threshold, so the result is marked for review.',
    unsafe: 'Mock simulation crosses a safety threshold. A safer alternative is shown for demonstration.',
  };

  return {
    status,
    label: labels[status],
    message: messages[status],
  };
}

/**
 * Build the explainability drivers array for a prediction.
 * @param {object} context - Contextual data about the prediction
 * @returns {Array<{label: string, detail: string}>}
 */
function buildDrivers(context = {}) {
  const drivers = [];

  if (context.currentGlucose && context.targetMax) {
    if (context.currentGlucose > context.targetMax) {
      drivers.push({ label: 'Current glucose above target', detail: `Current glucose ${context.currentGlucose} mg/dL exceeds target max ${context.targetMax} mg/dL.` });
    }
  }

  if (context.carbs && context.carbs > 0) {
    drivers.push({ label: 'Meal carbohydrates', detail: `${context.carbs}g carbs will raise predicted glucose.` });
  }

  if (context.insulinOnBoard && context.insulinOnBoard > 0) {
    drivers.push({ label: 'Active insulin on board', detail: `${context.insulinOnBoard}U active insulin reduces the final dose recommendation.` });
  }

  if (context.activity) {
    const act = String(context.activity).toLowerCase();
    if (act.includes('high') || act.includes('moderate')) {
      drivers.push({ label: 'Recent activity effect', detail: `${context.activity} reduces glucose risk in the prediction window.` });
    }
  }

  if (context.confidence !== undefined && context.confidence < 0.72) {
    drivers.push({ label: 'Low confidence', detail: 'Confidence is below threshold because recent data may be incomplete.' });
  }

  if (context.fatProtein) {
    drivers.push({ label: 'High fat/protein', detail: 'Elevated fat or protein may cause a delayed glucose rise.' });
  }

  // Default driver if none matched
  if (drivers.length === 0) {
    drivers.push({ label: 'Standard prediction', detail: 'Prediction uses current profile settings and recent context.' });
  }

  return drivers;
}

module.exports = {
  checkSafety,
  buildDrivers,
};
