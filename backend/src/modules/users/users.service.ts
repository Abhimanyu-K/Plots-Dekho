import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<User> {
    // Check if phone number is being changed and if it's already in use
    if (updateProfileDto.phone) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          phone: updateProfileDto.phone,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        throw new ConflictException('Phone number already in use');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateProfileDto,
    });

    return updatedUser;
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.findById(userId);

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  async deleteAccount(userId: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id: userId },
    });
  }

  sanitizeUser(user: User): Partial<User> {
    const { password, ...sanitized } = user;
    return sanitized;
  }
}
