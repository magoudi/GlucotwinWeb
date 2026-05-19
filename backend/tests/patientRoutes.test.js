const request = require('supertest');
const app = require('../src/app');
const userStore = require('../src/services/userStore');

describe('Patient Routes', () => {
  let authCookie;
  let patientId;

  beforeAll(async () => {
    // Create a mock patient
    const user = await userStore.createUser({
      email: 'patient_test@glucotwin.com',
      password: 'password123',
      fullName: 'Test Patient',
      role: 'patient',
      glucoseUnit: 'mg/dL',
      targetGlucoseMin: 70,
      targetGlucoseMax: 150
    });
    patientId = user._id;

    // Log in to get token
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'patient_test@glucotwin.com', password: 'password123' });
    
    authCookie = res.headers['set-cookie'];
  });

  describe('GET /api/patient/summary', () => {
    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/patient/summary');
      expect(res.status).toBe(401);
    });

    it('should return patient summary data', async () => {
      const res = await request(app)
        .get('/api/patient/summary')
        .set('Cookie', authCookie);
      
      expect(res.status).toBe(200);
      expect(res.body.currentGlucose).toBeDefined();
      expect(res.body.recentMeals).toBeDefined();
      expect(res.body.recentInsulin).toBeDefined();
      expect(res.body.timelineSummary).toBeDefined();
    });
  });

  describe('GET /api/patient/timeline', () => {
    it('should return timeline events', async () => {
      const res = await request(app)
        .get('/api/patient/timeline')
        .set('Cookie', authCookie);
      
      expect(res.status).toBe(200);
      expect(res.body.events).toBeDefined();
      expect(Array.isArray(res.body.events)).toBe(true);
    });
  });

  describe('GET /api/patient/analytics', () => {
    it('should return analytics data', async () => {
      const res = await request(app)
        .get('/api/patient/analytics')
        .set('Cookie', authCookie);
      
      expect(res.status).toBe(200);
      expect(res.body.glucoseTrends).toBeDefined();
      expect(res.body.timeInRange).toBeDefined();
    });
  });

  describe('GET /api/patient/care-team', () => {
    it('should return care team data', async () => {
      const res = await request(app)
        .get('/api/patient/care-team')
        .set('Cookie', authCookie);
      
      expect(res.status).toBe(200);
      expect(res.body.careTeam).toBeDefined();
      expect(Array.isArray(res.body.careTeam)).toBe(true);
    });
  });

  describe('Connectors API', () => {
    it('should fetch connectors status', async () => {
      const res = await request(app)
        .get('/api/patient/connectors')
        .set('Cookie', authCookie);
      
      expect(res.status).toBe(200);
      expect(res.body.connectors).toBeDefined();
    });

    it('should connect a connector and add a timeline event', async () => {
      const res = await request(app)
        .post('/api/patient/connectors/cgm/connect')
        .set('Cookie', authCookie);
      
      expect(res.status).toBe(200);
      expect(res.body.connector.status).toBe('connected');

      // Verify timeline event was added
      const timelineRes = await request(app)
        .get('/api/patient/timeline')
        .set('Cookie', authCookie);
      
      const events = timelineRes.body.events;
      const connectEvent = events.find(e => e.type === 'connector_sync' && e.title.includes('CGM Stream'));
      expect(connectEvent).toBeDefined();
    });

    it('should disconnect a connector', async () => {
      const res = await request(app)
        .post('/api/patient/connectors/cgm/disconnect')
        .set('Cookie', authCookie);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
