import {
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthValidationService } from './auth-validation.service.js';

describe('AuthValidationService', () => {
  let service: AuthValidationService;
  let fetchMock: ReturnType<typeof vi.fn>;
  let configGet: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    configGet = vi.fn((key: string) => {
      if (key === 'AUTH_SERVICE_URL') return 'http://auth:3001/graphql';
      if (key === 'AUTH_SERVICE_TIMEOUT_MS') return '2500';
      return undefined;
    });

    service = new AuthValidationService({
      get: configGet,
    } as unknown as ConfigService);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('forwards a bearer token to Auth Service and accepts a valid token', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ data: { validateToken: { valid: true } } }),
        {
          status: 200,
        },
      ),
    );

    await expect(
      service.validateAuthorization('Bearer signed-token'),
    ).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://auth:3001/graphql',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer signed-token',
        },
        signal: expect.any(AbortSignal),
      }),
    );

    const requestOptions = fetchMock.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(requestOptions.body as string)).toEqual({
      query: 'query ValidateToken { validateToken { valid } }',
    });
    expect((requestOptions.signal as AbortSignal).aborted).toBe(false);
  });

  it('rejects a missing authorization header without calling Auth Service', async () => {
    await expect(service.validateAuthorization()).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects malformed bearer headers without calling Auth Service', async () => {
    await expect(
      service.validateAuthorization('Bearer token extra'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a token that Auth Service reports as invalid', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ data: { validateToken: { valid: false } } }),
        {
          status: 200,
        },
      ),
    );

    await expect(
      service.validateAuthorization('Bearer invalid-token'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('fails closed when Auth Service returns GraphQL errors', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ errors: [{ message: 'Database unavailable' }] }),
        {
          status: 200,
        },
      ),
    );

    await expect(
      service.validateAuthorization('Bearer signed-token'),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('fails closed when Auth Service returns an incomplete response', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ data: { validateToken: {} } }), {
        status: 200,
      }),
    );

    await expect(
      service.validateAuthorization('Bearer signed-token'),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('fails closed when Auth Service returns a non-success HTTP status', async () => {
    fetchMock.mockResolvedValue(new Response('unavailable', { status: 503 }));

    await expect(
      service.validateAuthorization('Bearer signed-token'),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('fails closed when Auth Service cannot be reached', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));

    await expect(
      service.validateAuthorization('Bearer signed-token'),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
