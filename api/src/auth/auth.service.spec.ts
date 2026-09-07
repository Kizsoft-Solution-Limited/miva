import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { hashPassword } from './password.js';

vi.mock('./password.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./password.js')>();
  return {
    ...actual,
    hashPassword: vi.fn(async (p: string) => `hash:${p}`),
    verifyPassword: vi.fn(async (p: string, hash: string) => hash === `hash:${p}`),
  };
});

describe('AuthService', () => {
  const users = new Map<
    string,
    { id: string; email: string; passwordHash: string; role: string }
  >();

  const prisma = {
    user: {
      findUnique: vi.fn(async ({ where }: { where: { email: string } }) => {
        return users.get(where.email) ?? null;
      }),
      create: vi.fn(
        async ({
          data,
        }: {
          data: { email: string; passwordHash: string; role: string };
        }) => {
          const row = { id: `id-${data.email}`, ...data };
          users.set(data.email, row);
          return row;
        },
      ),
    },
  };

  let service: AuthService;

  beforeEach(() => {
    users.clear();
    vi.clearAllMocks();
    process.env.AUTH_SECRET = 'test-secret';
    service = new AuthService(prisma as never);
  });

  it('registers a founder and returns a token', async () => {
    const out = await service.register('A@Example.com', 'password1', 'founder');
    expect(out.email).toBe('a@example.com');
    expect(out.role).toBe('founder');
    expect(out.token).toContain('.');
    expect(hashPassword).toHaveBeenCalled();
  });

  it('rejects duplicate email', async () => {
    await service.register('dup@example.com', 'password1', 'investor');
    await expect(
      service.register('dup@example.com', 'password1', 'founder'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('logs in with correct password', async () => {
    await service.register('inv@example.com', 'password1', 'investor');
    const out = await service.login('inv@example.com', 'password1');
    expect(out.role).toBe('investor');
  });

  it('rejects bad password', async () => {
    await service.register('inv@example.com', 'password1', 'investor');
    await expect(
      service.login('inv@example.com', 'wrongpass'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
