import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsArray,
  Min,
  IsDateString,
} from 'class-validator';
import { PropertyType, ListingType, FurnishingType, PropertyStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreatePropertyDto {
  @ApiProperty({ example: 'Spacious 3BHK Apartment in Prime Location' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Beautiful apartment with modern amenities...', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: PropertyType, example: PropertyType.APARTMENT })
  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @ApiProperty({ enum: ListingType, example: ListingType.SALE })
  @IsEnum(ListingType)
  listingType: ListingType;

  @ApiProperty({ example: 5000000 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiProperty({ example: 50000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  deposit?: number;

  @ApiProperty({ example: 3, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bedrooms?: number;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bathrooms?: number;

  @ApiProperty({ example: 1200, required: false, description: 'Area in square feet' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  areaSqft?: number;

  @ApiProperty({ enum: FurnishingType, example: FurnishingType.SEMI_FURNISHED, required: false })
  @IsOptional()
  @IsEnum(FurnishingType)
  furnishing?: FurnishingType;

  @ApiProperty({ example: '123 Main Street, Koramangala', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'Bangalore', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'Karnataka', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: '560034', required: false })
  @IsOptional()
  @IsString()
  pincode?: string;

  @ApiProperty({ example: 12.9352, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @ApiProperty({ example: 77.6245, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;

  @ApiProperty({ example: '2024-04-01T00:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  availableFrom?: Date;

  @ApiProperty({ example: ['gym', 'swimming-pool', 'parking'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @ApiProperty({ enum: PropertyStatus, example: PropertyStatus.ACTIVE, required: false })
  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @ApiProperty({ example: ['https://example.com/image.jpg'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
