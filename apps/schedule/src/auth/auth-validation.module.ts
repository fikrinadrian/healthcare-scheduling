import { Module } from '@nestjs/common';
import { AuthValidationGuard } from './auth-validation.guard.js';
import { AuthValidationService } from './auth-validation.service.js';

@Module({
  providers: [AuthValidationService, AuthValidationGuard],
  exports: [AuthValidationGuard],
})
export class AuthValidationModule {}
