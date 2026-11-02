import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: Record<string, ReturnType<typeof vi.fn>> };
  let jwt: { verifyAsync: ReturnType<typeof vi.fn> };
  let config: {
    get: ReturnType<typeof vi.fn>;
    getOrThrow: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: vi.fn(),
        updateMany: vi.fn(),
      },
    };
    jwt = { verifyAsync: vi.fn() };
    config = {
      get: vi.fn(),
      getOrThrow: vi.fn().mockReturnValue('access-secret'),
    };
    service = new AuthService(
      prisma as unknown as PrismaService,
      jwt as unknown as JwtService,
      config as unknown as ConfigService,
    );
  });

  it('verifies the JWT and returns the matching user', async () => {
    const user = { id: 'user-1', email: 'user@example.com' };
    jwt.verifyAsync.mockResolvedValue({ userId: user.id });
    prisma.user.findUnique.mockResolvedValue(user);

    await expect(service.validateToken('signed-token')).resolves.toEqual(user);
    expect(jwt.verifyAsync).toHaveBeenCalledWith('signed-token', {
      secret: 'access-secret',
    });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: user.id },
      select: { id: true, email: true },
    });
  });

  it('rejects an invalid JWT', async () => {
    jwt.verifyAsync.mockRejectedValue(new Error('signature mismatch'));

    await expect(service.validateToken('invalid-token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('rejects a JWT without a user ID', async () => {
    jwt.verifyAsync.mockResolvedValue({});

    await expect(
      service.validateToken('token-without-user'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('rejects a token when its user no longer exists', async () => {
    jwt.verifyAsync.mockResolvedValue({ userId: 'deleted-user' });
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.validateToken('orphaned-token'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('clears the refresh token when logging out', async () => {
    prisma.user.updateMany.mockResolvedValue({ count: 1 });

    await expect(service.logout('user-1')).resolves.toEqual({
      loggedOut: true,
    });
    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: { id: 'user-1', refreshToken: { not: null } },
      data: { refreshToken: null },
    });
  });
});
