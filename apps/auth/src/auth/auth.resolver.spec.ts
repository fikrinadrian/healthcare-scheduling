import { UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthResolver } from './auth.resolver.js';
import { AuthService } from './auth.service.js';

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let authService: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(() => {
    authService = {
      signup: vi.fn(),
      signin: vi.fn(),
      logout: vi.fn(),
      validateToken: vi.fn(),
    };
    resolver = new AuthResolver(authService as unknown as AuthService);
  });

  it('delegates signup and signin to AuthService', () => {
    const input = { email: 'user@example.com', password: 'password123' };
    const signUpResult = { accessToken: 'signup-token' };
    const signInResult = { accessToken: 'signin-token' };
    authService.signup.mockReturnValue(signUpResult);
    authService.signin.mockReturnValue(signInResult);

    expect(resolver.signup(input)).toBe(signUpResult);
    expect(resolver.signin(input)).toBe(signInResult);
    expect(authService.signup).toHaveBeenCalledWith(input);
    expect(authService.signin).toHaveBeenCalledWith(input);
  });

  it('delegates logout to AuthService', () => {
    const result = { loggedOut: true };
    authService.logout.mockReturnValue(result);

    expect(resolver.logout('user-1')).toBe(result);
    expect(authService.logout).toHaveBeenCalledWith('user-1');
  });

  it('validates a Bearer token and returns the authenticated user', async () => {
    const user = { id: 'user-1', email: 'user@example.com' };
    authService.validateToken.mockResolvedValue(user);
    const request = {
      headers: { authorization: 'Bearer valid-token' },
    } as Request;

    await expect(resolver.validateToken(request)).resolves.toEqual({
      valid: true,
      user,
    });
    expect(authService.validateToken).toHaveBeenCalledWith('valid-token');
  });

  it('returns invalid for a missing or malformed Bearer header', async () => {
    const request = { headers: { authorization: 'Basic token' } } as Request;

    await expect(resolver.validateToken(request)).resolves.toEqual({
      valid: false,
      user: null,
    });
    expect(authService.validateToken).not.toHaveBeenCalled();
  });

  it('returns invalid when AuthService rejects the token', async () => {
    authService.validateToken.mockRejectedValue(
      new UnauthorizedException('Invalid token'),
    );
    const request = {
      headers: { authorization: 'Bearer invalid-token' },
    } as Request;

    await expect(resolver.validateToken(request)).resolves.toEqual({
      valid: false,
      user: null,
    });
  });
});
