import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { User, TokenType } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Check phone if provided
    if (registerDto.phone) {
      const phoneExists = await this.prisma.user.findUnique({
        where: { phone: registerDto.phone },
      });
      if (phoneExists) {
        throw new ConflictException('Phone number already registered');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        name: registerDto.name,
        phone: registerDto.phone,
        password: hashedPassword,
        role: registerDto.role,
      },
    });

    // Create email verification token
    await this.createVerificationToken(user.id, TokenType.EMAIL_VERIFICATION);

    // TODO: Send verification email

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Validate user
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // Access token
    const accessToken = this.jwtService.sign(payload);

    // Refresh token
    const refreshToken = await this.createRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
    };
  }

  async createRefreshToken(userId: string): Promise<string> {
    const token = randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    return token;
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (new Date() > tokenRecord.expiresAt) {
      await this.prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
      throw new UnauthorizedException('Refresh token expired');
    }

    const payload = {
      sub: tokenRecord.user.id,
      email: tokenRecord.user.email,
      role: tokenRecord.user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  async createVerificationToken(userId: string, type: TokenType): Promise<string> {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

    await this.prisma.verificationToken.create({
      data: {
        userId,
        token,
        type,
        expiresAt,
      },
    });

    return token;
  }

  async verifyEmail(token: string): Promise<void> {
    const verificationToken = await this.prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      throw new BadRequestException('Invalid verification token');
    }

    if (new Date() > verificationToken.expiresAt) {
      throw new BadRequestException('Verification token expired');
    }

    if (verificationToken.type !== TokenType.EMAIL_VERIFICATION) {
      throw new BadRequestException('Invalid token type');
    }

    // Update user
    await this.prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: true, isVerified: true },
    });

    // Delete token
    await this.prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });
  }

  sanitizeUser(user: User): Partial<User> {
    const { password, ...sanitized } = user;
    return sanitized;
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
        token: refreshToken,
      },
    });
  }
}
