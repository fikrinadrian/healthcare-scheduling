import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { hash } from 'bcrypt';

import { SignUpInput } from './dto/signup-input.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signup(signUpInput: SignUpInput) {
    const hashPassword = await hash(signUpInput.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: signUpInput.email,
        password: hashPassword,
      },
    });

    const { accessToken, refreshToken } = await this.createToken(
      user.id,
      user.email,
    );

    await this.updateRefreshToken(user.id, user.email, refreshToken);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async createToken(userId: string, email: string) {
    const accessToken = await this.jwtService.signAsync(
      {
        userId,
        email,
      },
      {
        expiresIn: '1h',
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        userId,
        email,
        accessToken,
      },
      {
        expiresIn: '7d',
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async updateRefreshToken(
    userId: string,
    email: string,
    refreshToken: string,
  ) {
    const hashedRefreshToken = await hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
  }
}
