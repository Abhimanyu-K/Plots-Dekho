import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class AuthTokensDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}

export class AuthResponseDto {
  @ApiProperty()
  user: Partial<User>;

  @ApiProperty()
  tokens: AuthTokensDto;
}
