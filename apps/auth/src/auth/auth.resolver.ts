import { UnauthorizedException } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { AuthService } from './auth.service.js';
import { Auth } from './entities/auth.entity.js';
import { SignInput } from './dto/sign-input.js';
import { SignResponse } from './dto/sign-response.js';
import { LogoutResponse } from './dto/logout-response.js';
import { ValidateTokenResponse } from './dto/validate-token-response.js';
import type { Request } from 'express';

@Resolver(() => Auth)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => SignResponse)
  signup(@Args('signUpInput') signUpInput: SignInput) {
    return this.authService.signup(signUpInput);
  }

  @Mutation(() => SignResponse)
  signin(@Args('signInInput') signInInput: SignInput) {
    return this.authService.signin(signInInput);
  }

  @Mutation(() => LogoutResponse)
  logout(@Args('userId', { type: () => String }) userId: string) {
    return this.authService.logout(userId);
  }

  @Query(() => ValidateTokenResponse)
  async validateToken(@Context('req') req: Request) {
    const [scheme, token, ...extraParts] =
      req.headers.authorization?.trim().split(/\s+/) ?? [];

    if (scheme?.toLowerCase() !== 'bearer' || !token || extraParts.length > 0) {
      return { valid: false, user: null };
    }

    try {
      const user = await this.authService.validateToken(token);
      return { valid: true, user };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return { valid: false, user: null };
      }

      throw error;
    }
  }
}
