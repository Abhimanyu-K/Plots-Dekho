import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, IsBoolean } from 'class-validator';

export class UploadImageDto {
  @ApiProperty({ example: 'https://example.com/image.jpg' })
  @IsString()
  imageUrl: string;

  @ApiProperty({ example: 'https://example.com/thumb.jpg', required: false })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}

export class AddImagesDto {
  @ApiProperty({ type: [UploadImageDto] })
  images: UploadImageDto[];
}
