import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service.js';
import { CustomerResolver } from './customer.resolver.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  providers: [CustomerResolver, CustomerService, PrismaService],
})
export class CustomerModule {}
