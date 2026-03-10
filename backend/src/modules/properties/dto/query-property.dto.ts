import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PropertyType, ListingType, FurnishingType, PropertyStatus } from '@prisma/client';

export class QueryPropertyDto {
  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({ enum: PropertyType, required: false })
  @IsOptional()
  @IsEnum(PropertyType)
  propertyType?: PropertyType;

  @ApiProperty({ enum: ListingType, required: false })
  @IsOptional()
  @IsEnum(ListingType)
  listingType?: ListingType;

  @ApiProperty({ required: false, example: 'Bangalore' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false, example: 1000000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiProperty({ required: false, example: 10000000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiProperty({ required: false, example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minBedrooms?: number;

  @ApiProperty({ required: false, example: 4 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxBedrooms?: number;

  @ApiProperty({ required: false, example: 800, description: 'Minimum area in sqft' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minArea?: number;

  @ApiProperty({ required: false, example: 2000, description: 'Maximum area in sqft' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxArea?: number;

  @ApiProperty({ enum: FurnishingType, required: false })
  @IsOptional()
  @IsEnum(FurnishingType)
  furnishing?: FurnishingType;

  @ApiProperty({ enum: PropertyStatus, required: false })
  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @ApiProperty({ required: false, example: 'apartment' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, example: 'price', enum: ['price', 'createdAt', 'updatedAt', 'viewsCount'] })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({ required: false, example: 'desc', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
