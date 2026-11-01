import { Module } from '@nestjs/common';
import { DoctorService } from './doctor.service.js';
import { DoctorResolver } from './doctor.resolver.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  providers: [DoctorResolver, DoctorService, PrismaService],
})
export class DoctorModule {}
