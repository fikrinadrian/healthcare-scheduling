import { Controller, Get } from '@nestjs/common';
import { AuthService } from './app.service.js';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  getHello(): string {
    return this.authService.getHello();
  }
}
