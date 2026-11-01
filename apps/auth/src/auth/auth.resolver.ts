import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AuthService } from './auth.service.js';
import { Auth } from './entities/auth.entity.js';
import { SignUpInput } from './dto/signup-input.js';
import { SignResponse } from './dto/sign-response.js';

@Resolver(() => Auth)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => SignResponse)
  signup(@Args('signUpInput') signUpInput: SignUpInput) {
    return this.authService.signup(signUpInput);
  }
}
