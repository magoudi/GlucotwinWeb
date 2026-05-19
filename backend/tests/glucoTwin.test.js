const request = require('supertest');
const app = require('../src/app');
const userStore = require('../src/services/userStore');

describe('GlucoTwin Simulator Routes', () => {
  let token;
  let patientId;

  beforeAll(async () => {
    const user = await userStore.createUser({
      email: 'sim_test@glucotwin.com',
      password: 'password123',
      fullName: 'Sim Patient',
      role: 'patient',
      glucoseUnit: 'mg/dL',
      targetGlucoseMin: 70,
      targetGlucoseMax: 180,
      carbRatio: 12,
      correctionFactor: 40
    });
    patientId = user._id;

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'sim_test@glucotwin.com', password: 'password123' });
    
    token = res.headers['set-cookie'];
  });

  describe('POST /api/glucotwin/bolus/predict', () => {
    it('should return a bolus calculation with safety drivers', async () => {
      const res = await request(app)
        .post('/api/glucotwin/bolus/predict')
        .set('Cookie', token)
        .send({
          currentGlucose: 160,
          carbs: 60,
          fatProteinLevel: 'medium',
          insulinOnBoard: 1.0,
          activityLevel: 'low'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.suggestedDose).toBeDefined();
      expect(res.body.safety).toBeDefined();
      expect(res.body.safety.status).toBeDefined();
    });
  });

  describe('POST /api/glucotwin/what-if', () => {
    it('should return trajectory predictions for a what-if scenario', async () => {
      const res = await request(app)
        .post('/api/glucotwin/what-if')
        .set('Cookie', token)
        .send({
          carbs: 40,
          insulinDose: 4.0,
          activityMinutes: 30,
          activityIntensity: 'moderate'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.curve).toBeDefined();
      expect(res.body.safety).toBeDefined();
      expect(Array.isArray(res.body.curve)).toBe(true);
    });
  });
});
