import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { CustomerModule } from './customer/customer.module.js';
import { DoctorModule } from './doctor/doctor.module.js';
import { ScheduleModule } from './schedule/schedule.module.js';
import { AuthValidationModule } from './auth/auth-validation.module.js';
import { AuthValidationGuard } from './auth/auth-validation.guard.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthValidationModule,
    CustomerModule,
    DoctorModule,
    ScheduleModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'apps/schedule/schema.gql',
      sortSchema: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useExisting: AuthValidationGuard,
    },
  ],
})
export class AppModule {}
