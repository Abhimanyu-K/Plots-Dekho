import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsObject, IsOptional, IsEnum } from 'class-validator';
import { PropertyType, ListingType, FurnishingType } from '@prisma/client';

export class SearchCriteriaDto {
  @ApiProperty({ required: false, enum: PropertyType })
  @IsOptional()
  @IsEnum(PropertyType)
  propertyType?: PropertyType;

  @ApiProperty({ required: false, enum: ListingType })
  @IsOptional()
  @IsEnum(ListingType)
  listingType?: ListingType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  minPrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  maxPrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  minBedrooms?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  maxBedrooms?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  minArea?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  maxArea?: number;

  @ApiProperty({ required: false, enum: FurnishingType })
  @IsOptional()
  @IsEnum(FurnishingType)
  furnishing?: FurnishingType;
}

export class CreateSavedSearchDto {
  @ApiProperty({ example: 'My Search for 3BHK in Bangalore' })
  @IsString()
  name: string;

  @ApiProperty({ type: SearchCriteriaDto })
  @IsObject()
  criteria: SearchCriteriaDto;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  enableNotifications?: boolean;
}
