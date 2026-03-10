import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsPhoneNumber } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsPhoneNumber('IN')
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  avatar?: string;
}
