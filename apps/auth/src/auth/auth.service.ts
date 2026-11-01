import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { hash, compare } from 'bcrypt';

import { SignInput } from './dto/sign-input.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signup(SignInput: SignInput) {
    const hashPassword = await hash(SignInput.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: SignInput.email,
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
      user,
    };
  }

  async signin(SignInput: SignInput) {
    const user = await this.prisma.user.findUnique({
      where: { email: SignInput.email },
    });

    if (!user) {
      throw new ForbiddenException('Email and password is incorrect');
    }

    const doPasswordsMatch = await compare(SignInput.password, user.password);

    if (!doPasswordsMatch) {
      throw new ForbiddenException('Email and password is incorrect');
    }

    const { accessToken, refreshToken } = await this.createToken(
      user.id,
      user.email,
    );

    await this.updateRefreshToken(user.id, user.email, refreshToken);

    return {
      accessToken,
      user,
    };
  }

  async logout(userId: string) {
    await this.prisma.user.updateMany({
      where: { id: userId, refreshToken: { not: null } },
      data: { refreshToken: null },
    });

    return { loggedOut: true };
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

  async validateToken(token: string) {
    let decoded: { userId?: string };
    const secret = this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');

    try {
      decoded = await this.jwtService.verifyAsync<{ userId?: string }>(token, {
        secret,
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    if (!decoded.userId) {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
