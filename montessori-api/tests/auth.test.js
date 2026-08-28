/**
 * Auth module integration tests.
 * Requires a test database (set TEST_DATABASE_URL or use the same DB).
 * Run: npm test
 */

import request from 'supertest';
import app from '../src/server.js';
import prisma from '../src/config/db.js';

const TEST_ORG = {
  orgName: 'Test School',
  orgSlug: `test-school-${Date.now()}`,
  branchName: 'Main',
  firstName: 'Test',
  lastName: 'Admin',
  email: `testadmin-${Date.now()}@test.com`,
  password: 'Test@1234',
};

let accessToken;
let refreshToken;
let registeredUserId;

afterAll(async () => {
  // Cleanup test data
  const org = await prisma.organization.findUnique({ where: { slug: TEST_ORG.orgSlug } });
  if (org) {
    await prisma.userRole.deleteMany({ where: { user: { organizationId: org.id } } });
    await prisma.refreshToken.deleteMany({ where: { user: { organizationId: org.id } } });
    await prisma.user.deleteMany({ where: { organizationId: org.id } });
    await prisma.branch.deleteMany({ where: { organizationId: org.id } });
    await prisma.role.deleteMany({ where: { organizationId: org.id } });
    await prisma.organization.delete({ where: { id: org.id } });
  }
  await prisma.$disconnect();
});

describe('POST /api/v1/auth/register', () => {
  it('registers a new organisation and returns tokens', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(TEST_ORG)
      .expect(201);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.user.email).toBe(TEST_ORG.email);
    expect(res.body.user.roles).toContain('ORG_ADMIN');

    accessToken = res.body.accessToken;
    refreshToken = res.body.refreshToken;
    registeredUserId = res.body.user.id;
  });

  it('rejects duplicate email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...TEST_ORG, orgSlug: 'another-slug' })
      .expect(409);

    expect(res.body.error.code).toBe('EMAIL_TAKEN');
  });

  it('rejects duplicate slug', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...TEST_ORG, email: 'other@test.com' })
      .expect(409);

    expect(res.body.error.code).toBe('SLUG_TAKEN');
  });

  it('rejects weak password', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({ ...TEST_ORG, orgSlug: 'x-slug', email: 'x@x.com', password: 'weakpassword' })
      .expect(422);
  });
});

describe('POST /api/v1/auth/login', () => {
  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_ORG.email, password: TEST_ORG.password })
      .expect(200);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('rejects incorrect password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_ORG.email, password: 'WrongPass@1' })
      .expect(401);

    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('rejects unknown email', async () => {
    await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@nowhere.com', password: 'Test@1234' })
      .expect(401);
  });
});

describe('GET /api/v1/auth/me', () => {
  it('returns current user with roles and permissions', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.id).toBe(registeredUserId);
    expect(res.body.roles).toContain('ORG_ADMIN');
    expect(Array.isArray(res.body.permissions)).toBe(true);
    expect(res.body.permissions.length).toBeGreaterThan(0);
  });

  it('rejects missing token', async () => {
    await request(app).get('/api/v1/auth/me').expect(401);
  });
});

describe('POST /api/v1/auth/refresh', () => {
  it('rotates tokens and returns new pair', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    // The old refresh token should no longer work
    refreshToken = res.body.refreshToken;
    accessToken = res.body.accessToken;
  });

  it('rejects replayed (consumed) refresh token', async () => {
    // The previous refreshToken was rotated — using it again should fail
    const old = refreshToken;
    // rotate once
    await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: old })
      .expect(200);

    // replay the already-consumed token
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: old })
      .expect(401);

    expect(res.body.error.code).toBe('INVALID_REFRESH_TOKEN');
  });
});

describe('POST /api/v1/auth/forgot-password', () => {
  it('responds with success regardless of email existence (no enumeration)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'nobody@nowhere.com' })
      .expect(200);

    expect(res.body.message).toMatch(/if that email exists/i);
  });
});

describe('Health check', () => {
  it('returns 200 OK', async () => {
    const res = await request(app).get('/health').expect(200);
    expect(res.body.status).toBe('ok');
  });
});
