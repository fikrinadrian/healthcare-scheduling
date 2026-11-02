import type { ExecutionContext } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthValidationGuard } from './auth-validation.guard.js';
import { AuthValidationService } from './auth-validation.service.js';

describe('AuthValidationGuard', () => {
  let guard: AuthValidationGuard;
  let validateAuthorization: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    validateAuthorization = vi.fn().mockResolvedValue(undefined);
    guard = new AuthValidationGuard({
      validateAuthorization,
    } as unknown as AuthValidationService);
  });

  it('validates the authorization header for HTTP requests', async () => {
    const request = { headers: { authorization: 'Bearer http-token' } };
    const context = {
      getType: () => 'http',
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(validateAuthorization).toHaveBeenCalledWith('Bearer http-token');
  });

  it('validates the authorization header from GraphQL request context', async () => {
    const request = { headers: { authorization: 'Bearer graphql-token' } };
    const context = {
      getType: () => 'graphql',
      getArgs: () => [null, null, { req: request }, null],
      getClass: () => class Resolver {},
      getHandler: () => () => undefined,
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(validateAuthorization).toHaveBeenCalledWith('Bearer graphql-token');
  });

  it('propagates authentication failures from the validation service', async () => {
    const unauthorized = new Error('Unauthorized');
    validateAuthorization.mockRejectedValue(unauthorized);
    const context = {
      getType: () => 'http',
      switchToHttp: () => ({ getRequest: () => ({ headers: {} }) }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toBe(unauthorized);
  });
});
