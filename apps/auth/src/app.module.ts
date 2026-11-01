import { Module } from '@nestjs/common';
import { AuthController } from './app.controller.js';
import { AuthService } from './app.service.js';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    AuthModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'apps/auth/schema.gql',
      sortSchema: true,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AppModule {}
