import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AuthService } from './auth.service.js';
import { AuthResolver } from './auth.resolver.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  providers: [AuthResolver, AuthService, JwtService, PrismaService],
})
export class AuthModule {}
