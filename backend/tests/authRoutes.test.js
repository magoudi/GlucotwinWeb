const request = require('supertest');
const app = require('../src/app');
const userStore = require('../src/services/userStore');
const mongoose = require('mongoose');

describe('Auth Routes (Password Recovery)', () => {
  let mockUserId;

  beforeAll(async () => {
    // Clear and set up a mock user for the test
    // Assuming an in-memory test DB or a mocked store
    const user = await userStore.createUser({
      email: 'testrecovery@glucotwin.com',
      password: 'password123',
      fullName: 'Recovery Test User',
      role: 'patient'
    });
    mockUserId = user._id;
  });

  afterAll(async () => {
    // Cleanup mock user if needed (in memory drops naturally, but just in case)
  });

  describe('POST /api/auth/password-reset/request-code', () => {
    it('should return 400 if email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/password-reset/request-code')
        .send({});
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 200 if email does not exist (prevents enumeration)', async () => {
      const res = await request(app)
        .post('/api/auth/password-reset/request-code')
        .send({ email: 'nonexistent@glucotwin.com' });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.resetCode).toBeUndefined(); // Should not generate a code
    });

    it('should generate a reset code and return success if email exists', async () => {
      const res = await request(app)
        .post('/api/auth/password-reset/request-code')
        .send({ email: 'testrecovery@glucotwin.com' });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.resetCode).toBeDefined(); // Mock code in prototype test env
    });
  });

  describe('POST /api/auth/password-reset/verify-code', () => {
    let validCode;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/password-reset/request-code')
        .send({ email: 'testrecovery@glucotwin.com' });
      validCode = res.body.resetCode;
    });

    it('should return 400 if email or code is missing', async () => {
      const res = await request(app)
        .post('/api/auth/password-reset/verify-code')
        .send({ email: 'testrecovery@glucotwin.com' });
      
      expect(res.status).toBe(400);
    });

    it('should return 400 for an invalid code', async () => {
      const res = await request(app)
        .post('/api/auth/password-reset/verify-code')
        .send({ email: 'testrecovery@glucotwin.com', code: '000000' });
      
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('PASSWORD_RESET_CODE_INVALID');
    });

    it('should successfully verify code and return a reset session token', async () => {
      const res = await request(app)
        .post('/api/auth/password-reset/verify-code')
        .send({ email: 'testrecovery@glucotwin.com', code: validCode });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.resetToken).toBeDefined();
    });
  });

  describe('POST /api/auth/password-reset/confirm', () => {
    let validToken;

    beforeAll(async () => {
      const reqRes = await request(app)
        .post('/api/auth/password-reset/request-code')
        .send({ email: 'testrecovery@glucotwin.com' });
      
      const verRes = await request(app)
        .post('/api/auth/password-reset/verify-code')
        .send({ email: 'testrecovery@glucotwin.com', code: reqRes.body.resetCode });
      
      validToken = verRes.body.resetToken;
    });

    it('should return 400 for an invalid token', async () => {
      const res = await request(app)
        .post('/api/auth/password-reset/confirm')
        .send({ email: 'testrecovery@glucotwin.com', resetToken: 'invalid_token', newPassword: 'NewPassword123!' });
      
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('PASSWORD_RESET_TOKEN_INVALID');
    });

    it('should successfully reset password with a valid token', async () => {
      const res = await request(app)
        .post('/api/auth/password-reset/confirm')
        .send({ email: 'testrecovery@glucotwin.com', resetToken: validToken, newPassword: 'NewPassword123!' });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      
      // Verify login works with new password
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'testrecovery@glucotwin.com', password: 'NewPassword123!' });
        
      expect(loginRes.status).toBe(200);
      expect(loginRes.body.user).toBeDefined();
    });
  });
});
