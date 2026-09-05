import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';
import { AppModule } from '../../src/app.module.js';
import { VerificationService } from '../../src/verification/verification.service.js';

const dbPath = resolve(process.cwd(), 'prisma', 'test-e2e.db');
process.env.DATABASE_URL = `file:${dbPath}`;

const mockVerdict = {
  recommendation: 'approve' as const,
  summary: 'Site is reachable.',
  confirmed: [
    {
      claim: 'Site live',
      evidence: 'HTTP 200',
      sourceUrl: 'https://billspot.co/',
      confidence: 0.9,
    },
  ],
  unconfirmed: [],
  reasoning: 'Probe ok',
};

describe('Milestones (e2e, mocked verification)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    execSync('npx prisma migrate deploy', {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: `file:${dbPath}` },
      stdio: 'pipe',
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(VerificationService)
      .useValue({
        verifyMilestone: async () => mockVerdict,
        buildCheckMeta: () => ({
          orbio: true,
          webSearch: true,
          pdf: false,
          structuredJson: true,
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/milestones → GET → decide', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/milestones')
      .field('title', 'Public site live')
      .field('claim', 'BillSpot marketing site is live at billspot.co')
      .field('founderName', 'Demo Founder')
      .field('proofType', 'url')
      .field('proofUrl', 'https://billspot.co/')
      .expect(201);

    expect(created.body.id).toBeTruthy();
    expect(created.body.verdict?.recommendation).toBe('approve');
    expect(created.body.check?.structuredJson).toBe(true);

    const one = await request(app.getHttpServer())
      .get(`/api/milestones/${created.body.id}`)
      .expect(200);
    expect(one.body.title).toBe('Public site live');

    const decided = await request(app.getHttpServer())
      .patch(`/api/milestones/${created.body.id}/decision`)
      .send({ decision: 'approved', note: 'Looks good' })
      .expect(200);

    expect(decided.body.verdict.investorDecision).toBe('approved');
  });

  it('rejects private proof URLs on create', async () => {
    await request(app.getHttpServer())
      .post('/api/milestones')
      .field('title', 'Bad link')
      .field('claim', 'Internal host should fail')
      .field('founderName', 'Demo')
      .field('proofType', 'url')
      .field('proofUrl', 'http://127.0.0.1/admin')
      .expect(400);
  });

  it('lists milestones', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/milestones')
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
