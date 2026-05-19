const safetyService = require('../src/services/safetyService');

describe('Safety Service', () => {
  const defaultUser = {
    targetGlucoseMin: 70,
    targetGlucoseMax: 180,
  };

  describe('checkSafety', () => {
    it('should return safe for normal glucose predictions', async () => {
      const result = await safetyService.checkSafety({
        predictedMin: 110,
        predictedPeak: 150,
        confidence: 0.9,
        user: defaultUser
      });
      expect(result.status).toBe('safe');
    });

    it('should return caution for low confidence', async () => {
      const result = await safetyService.checkSafety({
        predictedMin: 110,
        predictedPeak: 150,
        confidence: 0.65,
        user: defaultUser
      });
      expect(result.status).toBe('caution');
    });

    it('should return unsafe if predicted min is below target', async () => {
      const result = await safetyService.checkSafety({
        predictedMin: 65,
        predictedPeak: 120,
        confidence: 0.9,
        user: defaultUser
      });
      expect(result.status).toBe('unsafe');
    });

    it('should return unsafe if predicted peak is way above target', async () => {
      const result = await safetyService.checkSafety({
        predictedMin: 150,
        predictedPeak: 270,
        confidence: 0.9,
        user: defaultUser
      });
      expect(result.status).toBe('unsafe');
    });
  });

  describe('buildDrivers', () => {
    it('should build proper drivers array based on context', () => {
      const drivers = safetyService.buildDrivers({
        currentGlucose: 200,
        targetMax: 180,
        carbs: 50,
        insulinOnBoard: 2.5
      });

      expect(drivers.some(d => d.label === 'Current glucose above target')).toBe(true);
      expect(drivers.some(d => d.label === 'Meal carbohydrates')).toBe(true);
      expect(drivers.some(d => d.label === 'Active insulin on board')).toBe(true);
    });
  });
});
