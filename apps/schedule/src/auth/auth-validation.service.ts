import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type ValidateTokenResult = {
  data?: { validateToken?: { valid?: boolean } };
  errors?: unknown[];
};

@Injectable()
export class AuthValidationService {
  constructor(private readonly configService: ConfigService) {}

  async validateAuthorization(authorization?: string): Promise<void> {
    const match = authorization?.trim().match(/^Bearer\s+(\S+)$/i);

    if (!match) {
      throw new UnauthorizedException();
    }

    const authServiceUrl =
      this.configService.get<string>('AUTH_SERVICE_URL') ??
      'http://auth:3001/graphql';
    const timeoutMs = Number(
      this.configService.get<string>('AUTH_SERVICE_TIMEOUT_MS') ?? 3000,
    );

    let response: Response;
    let result: ValidateTokenResult;

    try {
      response = await fetch(authServiceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${match[1]}`,
        },
        body: JSON.stringify({
          query: 'query ValidateToken { validateToken { valid } }',
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (!response.ok) {
        throw new Error(`Auth Service returned HTTP ${response.status}`);
      }

      result = (await response.json()) as ValidateTokenResult;
    } catch {
      throw new ServiceUnavailableException('Auth Service is unavailable');
    }

    if (
      result.errors?.length ||
      typeof result.data?.validateToken?.valid !== 'boolean'
    ) {
      throw new ServiceUnavailableException(
        'Auth Service returned an invalid response',
      );
    }

    if (!result.data.validateToken.valid) {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}
