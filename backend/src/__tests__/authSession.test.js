const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const connectDB = require('../config/db');
const userStore = require('../services/userStore');

describe('auth session and validation flows', () => {
  beforeAll(async () => {
    await connectDB();

    const requiredUsers = [
      {
        fullName: 'GlucoTwin Demo',
        email: 'glucotwin@example.com',
        password: 'DemoPass123!',
        role: 'patient',
        diabetesType: 'Type 1 Diabetes',
        managementType: 'pump',
        glucoseUnit: 'mg/dL',
      },
      {
        fullName: 'GlucoTwin Admin',
        email: 'admin@glucotwin.com',
        password: 'AdminPass123!',
        role: 'admin',
        diabetesType: '',
        managementType: 'unknown',
        glucoseUnit: 'mg/dL',
      },
      {
        fullName: 'Dr. Sarah Jenkins',
        email: 'doctor@glucotwin.com',
        password: 'DoctorPass123!',
        role: 'doctor',
        diabetesType: '',
        managementType: 'unknown',
        glucoseUnit: 'mg/dL',
      },
    ];

    for (const user of requiredUsers) {
      const existing = await userStore.findByLoginForAuth(user.email);

      if (!existing) {
        await userStore.createUser(user);
        continue;
      }

      existing.fullName = user.fullName;
      existing.role = user.role;
      existing.diabetesType = user.diabetesType;
      existing.managementType = user.managementType;
      existing.glucoseUnit = user.glucoseUnit;
      await existing.setPassword(user.password);
      await userStore.saveUser(existing);
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  test('doctor impersonation lifecycle is reflected by /auth/me and can be stopped safely', async () => {
    const doctor = request.agent(app);

    const loginResponse = await doctor
      .post('/api/auth/login')
      .send({ email: 'doctor@glucotwin.com', password: 'DoctorPass123!' })
      .expect(200);

    expect(loginResponse.body.session).toEqual({
      isImpersonating: false,
      impersonator: null,
    });

    const patientsResponse = await doctor.get('/api/doctor/patients').expect(200);
    const patient = patientsResponse.body.patients[0];

    expect(patient).toBeTruthy();

    const impersonationResponse = await doctor
      .post(`/api/doctor/patients/${patient.id}/impersonate`)
      .send()
      .expect(200);

    expect(impersonationResponse.body.session.isImpersonating).toBe(true);
    expect(impersonationResponse.body.session.impersonator.role).toBe('doctor');

    const meResponse = await doctor.get('/api/auth/me').expect(200);

    expect(meResponse.body.user.id).toBe(patient.id);
    expect(meResponse.body.session.isImpersonating).toBe(true);

    const stopResponse = await doctor.post('/api/auth/stop-impersonating').send().expect(200);

    expect(stopResponse.body.session).toEqual({
      isImpersonating: false,
      impersonator: null,
    });
    expect(stopResponse.body.user.role).toBe('doctor');
  });

  test('validation blocks invalid doctor/admin mutations', async () => {
    const doctor = request.agent(app);
    await doctor
      .post('/api/auth/login')
      .send({ email: 'doctor@glucotwin.com', password: 'DoctorPass123!' })
      .expect(200);

    await doctor
      .patch('/api/doctor/patients/bulk-status')
      .send({ patientIds: ['missing-patient'], status: 'Needs Review' })
      .expect(404);

    const admin = request.agent(app);
    const adminLogin = await admin
      .post('/api/auth/login')
      .send({ email: 'admin@glucotwin.com', password: 'AdminPass123!' })
      .expect(200);

    await admin
      .patch(`/api/admin/users/${adminLogin.body.user.id}`)
      .send({ role: 'patient' })
      .expect(400);
  });
});
