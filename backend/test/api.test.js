const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const connectDB = require('../src/config/db');
const userStore = require('../src/services/userStore');
const treatmentPlanStore = require('../src/services/treatmentPlanStore');
const clinicalStatusStore = require('../src/services/clinicalStatusStore');

describe('GlucoTwin API Tests', () => {
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

  let patientCookies;
  let adminCookies;
  let doctorCookies;
  let patientId;
  let createdAnnouncementId;

  it('should not allow privilege escalation on registration', async () => {
    const testEmail = `sneaky.${Date.now()}@example.com`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Sneaky User',
        email: testEmail,
        password: 'Password123!',
        role: 'admin',
      });
    
    expect(res.status).toBe(400); // Admin role is blocked on public registration
  });

  it('should login as admin and retrieve cookies', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@glucotwin.com',
        password: 'AdminPass123!'
      });
    expect(res.status).toBe(200);
    adminCookies = res.headers['set-cookie'];
    expect(adminCookies).toBeDefined();
  });

  it('should allow login with username as well as email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'admin',
        password: 'AdminPass123!'
      });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('admin@glucotwin.com');
  });

  it('should login as doctor and retrieve cookies', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'doctor@glucotwin.com',
        password: 'DoctorPass123!'
      });
    expect(res.status).toBe(200);
    doctorCookies = res.headers['set-cookie'];
    expect(doctorCookies).toBeDefined();
  });

  it('should login as patient and retrieve cookies', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'glucotwin@example.com',
        password: 'DemoPass123!'
      });
    expect(res.status).toBe(200);
    patientCookies = res.headers['set-cookie'];
    patientId = res.body.user.id;
    expect(patientCookies).toBeDefined();
  });

  it('protected route should work with cookie auth', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', patientCookies);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('glucotwin@example.com');
  });

  it('timeline route should return authenticated event data', async () => {
    const res = await request(app)
      .get('/api/glucotwin/timeline')
      .set('Cookie', patientCookies);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.events)).toBe(true);
    expect(res.body.events.length).toBeGreaterThan(0);
  });

  it('admin should be able to reset password', async () => {
    const res = await request(app)
      .post(`/api/admin/users/${patientId}/reset-password`)
      .set('Cookie', adminCookies)
      .send({ newPassword: 'NewPassword123!' });
    expect(res.status).toBe(200);

    // Verify it works
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'glucotwin@example.com',
        password: 'NewPassword123!'
      });
    expect(loginRes.status).toBe(200);
    // Reset patient cookies to use new session
    patientCookies = loginRes.headers['set-cookie'];
  });

  it('doctor should be able to bulk update status', async () => {
    const res = await request(app)
      .patch('/api/doctor/patients/bulk-status')
      .set('Cookie', doctorCookies)
      .send({ patientIds: [patientId], status: 'Reviewed by Nurse' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should keep admin unique while still allowing doctor accounts', async () => {
    const promoteAttempt = await request(app)
      .patch(`/api/admin/users/${patientId}`)
      .set('Cookie', adminCookies)
      .send({ role: 'admin' });

    expect(promoteAttempt.status).toBe(400);
    expect(promoteAttempt.body.error).toMatch(/only one admin account is allowed/i);

    const doctorEmail = `doctor-two-${Date.now()}@example.com`;

    const doctorUser = await userStore.createUser({
      fullName: 'Dr. Omar Hassan',
      email: doctorEmail,
      password: 'DoctorTwo123!',
      role: 'doctor',
      diabetesType: '',
      managementType: 'unknown',
      glucoseUnit: 'mg/dL',
    });

    expect(doctorUser.role).toBe('doctor');

    const doctorLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: doctorEmail,
        password: 'DoctorTwo123!'
      });

    expect(doctorLogin.status).toBe(200);
    expect(doctorLogin.body.user.role).toBe('doctor');
  });

  let planId;
  it('doctor should be able to create a treatment plan', async () => {
    const res = await request(app)
      .post(`/api/doctor/patients/${patientId}/treatment-plans`)
      .set('Cookie', doctorCookies)
      .send({ description: 'Increase basal by 10%' });
    expect(res.status).toBe(201);
    expect(res.body.plan).toBeDefined();
    planId = res.body.plan.id;
  });

  it('patient should be able to accept treatment plan', async () => {
    const res = await request(app)
      .post(`/api/glucotwin/treatment-plans/${planId}/accept`)
      .set('Cookie', patientCookies);
    expect(res.status).toBe(200);
    expect(res.body.plan.status).toBe('accepted');
  });

  it('care-team flow should store patient comments, applied timestamps, and clinician replies', async () => {
    const created = await request(app)
      .post(`/api/doctor/patients/${patientId}/treatment-plans`)
      .set('Cookie', doctorCookies)
      .send({ description: 'Shift dinner carb ratio review' });

    expect(created.status).toBe(201);
    const createdPlanId = created.body.plan.id;

    const accepted = await request(app)
      .post(`/api/glucotwin/treatment-plans/${createdPlanId}/accept`)
      .set('Cookie', patientCookies)
      .send({ patientComment: 'I can try this tonight if the overnight alarms stay quiet.' });

    expect(accepted.status).toBe(200);
    expect(accepted.body.plan.patientComment).toContain('tonight');
    expect(accepted.body.plan.appliedAt).toBeTruthy();

    const replied = await request(app)
      .post(`/api/doctor/patients/${patientId}/treatment-plans/${createdPlanId}/reply`)
      .set('Cookie', doctorCookies)
      .send({ reply: 'Sounds good. Please keep meal timing consistent for the next 72 hours.' });

    expect(replied.status).toBe(200);
    expect(replied.body.plan.clinicianReply).toContain('72 hours');

    const history = await request(app)
      .get('/api/glucotwin/treatment-plans')
      .set('Cookie', patientCookies);

    expect(history.status).toBe(200);
    expect(history.body.plans.some((plan) => plan.id === createdPlanId && plan.clinicianReply)).toBe(true);
  });

  it('admin should be able to create, update, list, and delete announcements', async () => {
    const created = await request(app)
      .post('/api/admin/announcements')
      .set('Cookie', adminCookies)
      .send({
        title: 'Maintenance Window',
        message: 'Nightly model refresh will run after midnight.',
        type: 'warning',
        active: true,
        audience: 'all',
      });

    expect(created.status).toBe(201);
    createdAnnouncementId = created.body.announcement.id;

    const listed = await request(app)
      .get('/api/admin/announcements')
      .set('Cookie', adminCookies);

    expect(listed.status).toBe(200);
    expect(listed.body.announcements.some((announcement) => announcement.id === createdAnnouncementId)).toBe(true);

    const updated = await request(app)
      .patch(`/api/admin/announcements/${createdAnnouncementId}`)
      .set('Cookie', adminCookies)
      .send({ active: false, message: 'Maintenance window postponed until tomorrow morning.' });

    expect(updated.status).toBe(200);
    expect(updated.body.announcement.active).toBe(false);

    const active = await request(app)
      .get('/api/announcements/active');

    expect(active.status).toBe(200);
    expect(active.body.announcements.some((announcement) => announcement.id === createdAnnouncementId)).toBe(false);

    const deleted = await request(app)
      .delete(`/api/admin/announcements/${createdAnnouncementId}`)
      .set('Cookie', adminCookies);

    expect(deleted.status).toBe(204);
  });
});
