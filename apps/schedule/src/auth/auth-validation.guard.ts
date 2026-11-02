import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext, type GqlContextType } from '@nestjs/graphql';
import type { Request } from 'express';
import { AuthValidationService } from './auth-validation.service.js';

@Injectable()
export class AuthValidationGuard implements CanActivate {
  constructor(private readonly authValidationService: AuthValidationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let request: Request;

    if (context.getType<GqlContextType>() === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context).getContext<{
        req: Request;
      }>();
      request = gqlContext.req;
    } else {
      request = context.switchToHttp().getRequest<Request>();
    }

    await this.authValidationService.validateAuthorization(
      request.headers.authorization,
    );

    return true;
  }
}
