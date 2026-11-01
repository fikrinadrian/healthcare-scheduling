import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service.js';
import { CustomerResolver } from './customer.resolver.js';

@Module({
  providers: [CustomerResolver, CustomerService],
})
export class CustomerModule {}
