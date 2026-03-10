# WEEK 3: PROPERTY LISTING - PART 1 (CREATE & VIEW)
## Detailed Implementation Guide

---

## 📋 OVERVIEW

**Goal**: Implement complete property creation flow with multi-step form, image upload, location picking, and property detail viewing.

**Deliverables**:
- Multi-step property creation form (7 steps)
- Image upload to Cloudinary with preview
- Google Places address autocomplete
- Interactive map for location selection
- Amenities selection system
- Property detail page with image gallery
- Property card component
- Seed amenities data

---

## 🏗️ PROPERTY CREATION FLOW

```
Step 1: Property Type & Listing Type
   ↓
Step 2: Basic Details (BHK, Area, Price)
   ↓
Step 3: Address & Location (Autocomplete + Map)
   ↓
Step 4: Amenities Selection
   ↓
Step 5: Photos Upload (Drag & Drop, Reorder)
   ↓
Step 6: Additional Details (Furnishing, Availability)
   ↓
Step 7: Review & Submit
```

---

## DAY 1: BACKEND - PROPERTY MODULE SETUP

### Morning (4 hours)

#### Task 1.1: Setup Cloudinary (1 hour)

**Install dependencies**:
```bash
cd backend
pnpm add cloudinary multer
pnpm add -D @types/multer
```

**Add to .env**:
```env
# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**File**: `backend/src/config/cloudinary.config.ts`

```typescript
import { registerAs } from '@nestjs/config';

export default registerAs('cloudinary', () => ({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
}));
```

**File**: `backend/src/modules/common/cloudinary/cloudinary.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider';
import { CloudinaryService } from './cloudinary.service';

@Module({
  providers: [CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
```

**File**: `backend/src/modules/common/cloudinary/cloudinary.provider.ts`

```typescript
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: (config: ConfigService) => {
    return cloudinary.config({
      cloud_name: config.get('cloudinary.cloudName'),
      api_key: config.get('cloudinary.apiKey'),
      api_secret: config.get('cloudinary.apiSecret'),
    });
  },
  inject: [ConfigService],
};
```

**File**: `backend/src/modules/common/cloudinary/cloudinary.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'properties',
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { width: 1920, height: 1080, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      const stream = Readable.from(file.buffer);
      stream.pipe(upload);
    });
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder: string = 'properties',
  ): Promise<UploadApiResponse[]> {
    const uploadPromises = files.map((file) => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteImage(publicId: string): Promise<any> {
    return cloudinary.uploader.destroy(publicId);
  }

  async deleteMultipleImages(publicIds: string[]): Promise<any> {
    return cloudinary.api.delete_resources(publicIds);
  }

  extractPublicId(url: string): string {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const publicId = filename.split('.')[0];
    const folder = parts[parts.length - 2];
    return `${folder}/${publicId}`;
  }
}
```

#### Task 1.2: Create Properties Module (3 hours)

**File**: `backend/src/modules/properties/properties.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { CloudinaryModule } from '../common/cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [PropertiesController],
  providers: [PropertiesService],
  exports: [PropertiesService],
})
export class PropertiesModule {}
```

**File**: `backend/src/modules/properties/dto/create-property.dto.ts`

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
  MaxLength,
  IsDateString,
  IsInt,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PropertyType, ListingType, FurnishingType } from '@prisma/client';

export class CreatePropertyDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  description?: string;

  @ApiProperty({ enum: PropertyType })
  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @ApiProperty({ enum: ListingType })
  @IsEnum(ListingType)
  listingType: ListingType;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  @Min(0)
  deposit?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  @Min(0)
  bedrooms?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  @Min(0)
  bathrooms?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  @Min(0)
  areaSqft?: number;

  @ApiPropertyOptional({ enum: FurnishingType })
  @IsEnum(FurnishingType)
  @IsOptional()
  furnishing?: FurnishingType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  pincode?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  availableFrom?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  amenityIds?: string[];
}
```

**File**: `backend/src/modules/properties/dto/update-property.dto.ts`

```typescript
import { PartialType } from '@nestjs/swagger';
import { CreatePropertyDto } from './create-property.dto';

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {}
```

**File**: `backend/src/modules/properties/dto/property-response.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { Property, PropertyImage, Amenity, User } from '@prisma/client';

export class PropertyResponseDto implements Property {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  propertyType: any;

  @ApiProperty()
  listingType: any;

  @ApiProperty()
  price: any;

  @ApiProperty()
  deposit: any;

  @ApiProperty()
  bedrooms: number;

  @ApiProperty()
  bathrooms: number;

  @ApiProperty()
  areaSqft: any;

  @ApiProperty()
  furnishing: any;

  @ApiProperty()
  address: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  state: string;

  @ApiProperty()
  pincode: string;

  @ApiProperty()
  latitude: any;

  @ApiProperty()
  longitude: any;

  @ApiProperty()
  availableFrom: Date;

  @ApiProperty()
  status: any;

  @ApiProperty()
  isVerified: boolean;

  @ApiProperty()
  viewsCount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: () => [PropertyImage] })
  images?: PropertyImage[];

  @ApiProperty({ type: () => [Amenity] })
  amenities?: Amenity[];

  @ApiProperty()
  user?: Partial<User>;
}
```

**File**: `backend/src/modules/properties/properties.service.ts`

```typescript
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyStatus, Prisma } from '@prisma/client';

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createPropertyDto: CreatePropertyDto) {
    const { amenityIds, ...propertyData } = createPropertyDto;

    // Create property with amenities
    const property = await this.prisma.property.create({
      data: {
        ...propertyData,
        userId,
        amenities: amenityIds
          ? {
              create: amenityIds.map((amenityId) => ({
                amenity: { connect: { id: amenityId } },
              })),
            }
          : undefined,
      },
      include: {
        images: true,
        amenities: {
          include: {
            amenity: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
    });

    return this.formatPropertyResponse(property);
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.PropertyWhereInput;
    orderBy?: Prisma.PropertyOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params || {};

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        skip,
        take,
        where: {
          ...where,
          status: PropertyStatus.ACTIVE,
        },
        orderBy,
        include: {
          images: {
            where: { isPrimary: true },
            take: 1,
          },
          amenities: {
            include: {
              amenity: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      }),
      this.prisma.property.count({
        where: {
          ...where,
          status: PropertyStatus.ACTIVE,
        },
      }),
    ]);

    return {
      data: properties.map((p) => this.formatPropertyResponse(p)),
      total,
    };
  }

  async findOne(id: string, incrementView: boolean = true) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        amenities: {
          include: {
            amenity: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // Increment view count
    if (incrementView) {
      await this.prisma.property.update({
        where: { id },
        data: {
          viewsCount: {
            increment: 1,
          },
        },
      });
    }

    return this.formatPropertyResponse(property);
  }

  async update(id: string, userId: string, updatePropertyDto: UpdatePropertyDto) {
    // Check ownership
    const property = await this.prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.userId !== userId) {
      throw new ForbiddenException('You can only update your own properties');
    }

    const { amenityIds, ...propertyData } = updatePropertyDto;

    // If amenities are being updated, replace them
    let amenitiesUpdate = {};
    if (amenityIds !== undefined) {
      amenitiesUpdate = {
        amenities: {
          deleteMany: {},
          create: amenityIds.map((amenityId) => ({
            amenity: { connect: { id: amenityId } },
          })),
        },
      };
    }

    const updated = await this.prisma.property.update({
      where: { id },
      data: {
        ...propertyData,
        ...amenitiesUpdate,
      },
      include: {
        images: true,
        amenities: {
          include: {
            amenity: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
    });

    return this.formatPropertyResponse(updated);
  }

  async remove(id: string, userId: string) {
    // Check ownership
    const property = await this.prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.userId !== userId) {
      throw new ForbiddenException('You can only delete your own properties');
    }

    // Soft delete
    await this.prisma.property.update({
      where: { id },
      data: {
        status: PropertyStatus.DELETED,
      },
    });
  }

  async addImages(propertyId: string, userId: string, imageUrls: string[]) {
    // Check ownership
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.userId !== userId) {
      throw new ForbiddenException('You can only add images to your own properties');
    }

    // Get current image count for ordering
    const imageCount = await this.prisma.propertyImage.count({
      where: { propertyId },
    });

    const images = await Promise.all(
      imageUrls.map((url, index) =>
        this.prisma.propertyImage.create({
          data: {
            propertyId,
            imageUrl: url,
            thumbnailUrl: url, // Cloudinary handles this via transformations
            isPrimary: imageCount === 0 && index === 0,
            order: imageCount + index,
          },
        }),
      ),
    );

    return images;
  }

  async deleteImage(imageId: string, userId: string) {
    const image = await this.prisma.propertyImage.findUnique({
      where: { id: imageId },
      include: { property: true },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    if (image.property.userId !== userId) {
      throw new ForbiddenException('You can only delete images from your own properties');
    }

    await this.prisma.propertyImage.delete({
      where: { id: imageId },
    });
  }

  async setPrimaryImage(imageId: string, userId: string) {
    const image = await this.prisma.propertyImage.findUnique({
      where: { id: imageId },
      include: { property: true },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    if (image.property.userId !== userId) {
      throw new ForbiddenException('Unauthorized');
    }

    // Remove primary from all images of this property
    await this.prisma.propertyImage.updateMany({
      where: { propertyId: image.propertyId },
      data: { isPrimary: false },
    });

    // Set this image as primary
    await this.prisma.propertyImage.update({
      where: { id: imageId },
      data: { isPrimary: true },
    });
  }

  private formatPropertyResponse(property: any) {
    return {
      ...property,
      amenities: property.amenities?.map((pa: any) => pa.amenity) || [],
    };
  }
}
```

### Afternoon (4 hours)

#### Task 1.3: Create Properties Controller (2 hours)

**File**: `backend/src/modules/properties/properties.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PaginationDto, PaginatedResponseDto } from '../common/dto/pagination.dto';
import { SuccessResponseDto } from '../common/dto/response.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';

@ApiTags('Properties')
@Controller('properties')
export class PropertiesController {
  constructor(
    private propertiesService: PropertiesService,
    private cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new property listing' })
  async create(
    @CurrentUser() user: any,
    @Body() createPropertyDto: CreatePropertyDto,
  ) {
    return this.propertiesService.create(user.id, createPropertyDto);
  }

  @Post(':id/images')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('images', 20))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload property images' })
  async uploadImages(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    // Upload to Cloudinary
    const uploads = await this.cloudinaryService.uploadMultipleImages(
      files,
      `properties/${id}`,
    );

    const imageUrls = uploads.map((upload) => upload.secure_url);

    // Save to database
    const images = await this.propertiesService.addImages(id, user.id, imageUrls);

    return new SuccessResponseDto('Images uploaded successfully', images);
  }

  @Delete('images/:imageId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a property image' })
  async deleteImage(@Param('imageId') imageId: string, @CurrentUser() user: any) {
    await this.propertiesService.deleteImage(imageId, user.id);
  }

  @Post('images/:imageId/set-primary')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set image as primary' })
  async setPrimaryImage(@Param('imageId') imageId: string, @CurrentUser() user: any) {
    await this.propertiesService.setPrimaryImage(imageId, user.id);
    return new SuccessResponseDto('Primary image set successfully');
  }

  @Get()
  @ApiOperation({ summary: 'Get all properties with pagination' })
  async findAll(@Query() paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const { data, total } = await this.propertiesService.findAll({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    } as PaginatedResponseDto<any>;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property by ID' })
  async findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update property' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertiesService.update(id, user.id, updatePropertyDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete property' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.propertiesService.remove(id, user.id);
  }
}
```

**Install Multer**:
```bash
pnpm add @nestjs/platform-express
```

#### Task 1.4: Seed Amenities Data (2 hours)

**File**: `backend/prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const amenities = [
  // Security & Safety
  { name: 'Security Guard', category: 'Security', icon: 'shield' },
  { name: 'CCTV Surveillance', category: 'Security', icon: 'camera' },
  { name: 'Gated Community', category: 'Security', icon: 'fence' },
  { name: 'Fire Safety', category: 'Security', icon: 'flame' },

  // Parking
  { name: 'Car Parking', category: 'Parking', icon: 'car' },
  { name: 'Bike Parking', category: 'Parking', icon: 'bike' },
  { name: 'Visitor Parking', category: 'Parking', icon: 'parking' },

  // Fitness & Recreation
  { name: 'Gym', category: 'Fitness', icon: 'dumbbell' },
  { name: 'Swimming Pool', category: 'Fitness', icon: 'waves' },
  { name: 'Playground', category: 'Recreation', icon: 'baby' },
  { name: 'Clubhouse', category: 'Recreation', icon: 'home' },
  { name: 'Garden', category: 'Recreation', icon: 'tree' },
  { name: 'Jogging Track', category: 'Fitness', icon: 'footprints' },

  // Utilities
  { name: 'Power Backup', category: 'Utilities', icon: 'zap' },
  { name: 'Lift', category: 'Utilities', icon: 'move-vertical' },
  { name: 'Water Supply', category: 'Utilities', icon: 'droplet' },
  { name: 'Gas Pipeline', category: 'Utilities', icon: 'flame' },
  { name: 'Waste Disposal', category: 'Utilities', icon: 'trash' },
  { name: 'Rainwater Harvesting', category: 'Utilities', icon: 'cloud-rain' },

  // Indoor
  { name: 'Air Conditioning', category: 'Indoor', icon: 'wind' },
  { name: 'Wi-Fi', category: 'Indoor', icon: 'wifi' },
  { name: 'Modular Kitchen', category: 'Indoor', icon: 'chef-hat' },
  { name: 'Servant Room', category: 'Indoor', icon: 'users' },
  { name: 'Study Room', category: 'Indoor', icon: 'book' },
  { name: 'Store Room', category: 'Indoor', icon: 'package' },
  { name: 'Pooja Room', category: 'Indoor', icon: 'church' },

  // Outdoor
  { name: 'Balcony', category: 'Outdoor', icon: 'home' },
  { name: 'Terrace', category: 'Outdoor', icon: 'building' },

  // Pet Friendly
  { name: 'Pet Allowed', category: 'Policies', icon: 'dog' },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Seed amenities
  for (const amenity of amenities) {
    await prisma.amenity.upsert({
      where: { name: amenity.name },
      update: {},
      create: amenity,
    });
  }

  console.log('✅ Seeding completed');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Update package.json**:
```json
{
  "scripts": {
    "prisma:seed": "ts-node prisma/seed.ts"
  }
}
```

Run seed:
```bash
pnpm prisma:seed
```

---

## DAY 2-3: FRONTEND - MULTI-STEP FORM

### Task 2.1: Create Property Form Store (2 hours)

**File**: `frontend/lib/store/property-form-store.ts`

```typescript
import { create } from 'zustand';
import { PropertyType, ListingType, FurnishingType } from '@/types';

export interface PropertyFormData {
  // Step 1
  propertyType?: PropertyType;
  listingType?: ListingType;

  // Step 2
  title?: string;
  price?: number;
  deposit?: number;
  bedrooms?: number;
  bathrooms?: number;
  areaSqft?: number;

  // Step 3
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;

  // Step 4
  amenityIds?: string[];

  // Step 5
  images?: File[];

  // Step 6
  furnishing?: FurnishingType;
  availableFrom?: string;
  description?: string;
}

interface PropertyFormStore {
  currentStep: number;
  formData: PropertyFormData;
  setCurrentStep: (step: number) => void;
  updateFormData: (data: Partial<PropertyFormData>) => void;
  resetForm: () => void;
  nextStep: () => void;
  prevStep: () => void;
}

export const usePropertyFormStore = create<PropertyFormStore>((set) => ({
  currentStep: 1,
  formData: {},

  setCurrentStep: (step) => set({ currentStep: step }),

  updateFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),

  resetForm: () => set({ currentStep: 1, formData: {} }),

  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, 7),
    })),

  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 1),
    })),
}));
```

### Task 2.2: Create Form Steps (8 hours - spread across Day 2-3)

**File**: `frontend/app/properties/new/page.tsx`

```typescript
'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PropertyFormWizard } from '@/components/properties/PropertyFormWizard';

function CreatePropertyContent() {
  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">List Your Property</h1>
      <p className="text-muted-foreground mb-8">
        Fill in the details to create your property listing
      </p>
      <PropertyFormWizard />
    </div>
  );
}

export default function CreatePropertyPage() {
  return (
    <ProtectedRoute>
      <CreatePropertyContent />
    </ProtectedRoute>
  );
}
```

**File**: `frontend/components/properties/PropertyFormWizard.tsx`

```typescript
'use client';

import { usePropertyFormStore } from '@/lib/store/property-form-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Step1PropertyType } from './form-steps/Step1PropertyType';
import { Step2BasicDetails } from './form-steps/Step2BasicDetails';
import { Step3Location } from './form-steps/Step3Location';
import { Step4Amenities } from './form-steps/Step4Amenities';
import { Step5Photos } from './form-steps/Step5Photos';
import { Step6AdditionalDetails } from './form-steps/Step6AdditionalDetails';
import { Step7Review } from './form-steps/Step7Review';

const STEPS = [
  { number: 1, title: 'Property Type', component: Step1PropertyType },
  { number: 2, title: 'Basic Details', component: Step2BasicDetails },
  { number: 3, title: 'Location', component: Step3Location },
  { number: 4, title: 'Amenities', component: Step4Amenities },
  { number: 5, title: 'Photos', component: Step5Photos },
  { number: 6, title: 'Additional Details', component: Step6AdditionalDetails },
  { number: 7, title: 'Review & Submit', component: Step7Review },
];

export function PropertyFormWizard() {
  const currentStep = usePropertyFormStore((state) => state.currentStep);
  const progress = (currentStep / STEPS.length) * 100;

  const CurrentStepComponent = STEPS[currentStep - 1].component;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {currentStep} of {STEPS.length}</span>
          <span>{STEPS[currentStep - 1].title}</span>
        </div>
        <Progress value={progress} />
      </div>

      {/* Step Indicator */}
      <div className="flex justify-between">
        {STEPS.map((step) => (
          <div
            key={step.number}
            className={`flex flex-col items-center ${
              step.number <= currentStep ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step.number <= currentStep
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {step.number}
            </div>
            <span className="text-xs mt-2 hidden md:block">{step.title}</span>
          </div>
        ))}
      </div>

      {/* Current Step */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CurrentStepComponent />
        </CardContent>
      </Card>
    </div>
  );
}
```

**File**: `frontend/components/properties/form-steps/Step1PropertyType.tsx`

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { usePropertyFormStore } from '@/lib/store/property-form-store';
import { PropertyType, ListingType } from '@/types';
import { Home, Building, TreesIcon, Store } from 'lucide-react';

const schema = z.object({
  propertyType: z.nativeEnum(PropertyType),
  listingType: z.nativeEnum(ListingType),
});

type FormData = z.infer<typeof schema>;

const PROPERTY_TYPES = [
  { value: PropertyType.APARTMENT, label: 'Apartment/Flat', icon: Building },
  { value: PropertyType.HOUSE, label: 'Independent House', icon: Home },
  { value: PropertyType.VILLA, label: 'Villa', icon: Home },
  { value: PropertyType.PLOT, label: 'Plot/Land', icon: TreesIcon },
  { value: PropertyType.COMMERCIAL, label: 'Commercial', icon: Store },
];

const LISTING_TYPES = [
  { value: ListingType.RENT, label: 'For Rent', description: 'I want to rent out this property' },
  { value: ListingType.SALE, label: 'For Sale', description: 'I want to sell this property' },
];

export function Step1PropertyType() {
  const { formData, updateFormData, nextStep } = usePropertyFormStore();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      propertyType: formData.propertyType,
      listingType: formData.listingType,
    },
  });

  const onSubmit = (data: FormData) => {
    updateFormData(data);
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-4">
        <Label>Property Type</Label>
        <RadioGroup
          value={watch('propertyType')}
          onValueChange={(value) => setValue('propertyType', value as PropertyType)}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {PROPERTY_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <label
                  key={type.value}
                  className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    watch('propertyType') === type.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value={type.value} className="sr-only" />
                  <Icon className="h-8 w-8 mb-2" />
                  <span className="text-sm font-medium text-center">{type.label}</span>
                </label>
              );
            })}
          </div>
        </RadioGroup>
        {errors.propertyType && (
          <p className="text-sm text-destructive">{errors.propertyType.message}</p>
        )}
      </div>

      <div className="space-y-4">
        <Label>Listing Type</Label>
        <RadioGroup
          value={watch('listingType')}
          onValueChange={(value) => setValue('listingType', value as ListingType)}
        >
          <div className="grid gap-4">
            {LISTING_TYPES.map((type) => (
              <label
                key={type.value}
                className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  watch('listingType') === type.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value={type.value} className="mt-1" />
                <div className="ml-3">
                  <div className="font-medium">{type.label}</div>
                  <div className="text-sm text-muted-foreground">{type.description}</div>
                </div>
              </label>
            ))}
          </div>
        </RadioGroup>
        {errors.listingType && (
          <p className="text-sm text-destructive">{errors.listingType.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit">Next</Button>
      </div>
    </form>
  );
}
```

**File**: `frontend/components/properties/form-steps/Step2BasicDetails.tsx`

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePropertyFormStore } from '@/lib/store/property-form-store';
import { ListingType } from '@/types';

const schema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(200),
  price: z.number().min(1, 'Price is required'),
  deposit: z.number().optional(),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  areaSqft: z.number().min(1, 'Area is required'),
});

type FormData = z.infer<typeof schema>;

export function Step2BasicDetails() {
  const { formData, updateFormData, nextStep, prevStep } = usePropertyFormStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: formData.title,
      price: formData.price,
      deposit: formData.deposit,
      bedrooms: formData.bedrooms,
      bathrooms: formData.bathrooms,
      areaSqft: formData.areaSqft,
    },
  });

  const onSubmit = (data: FormData) => {
    updateFormData(data);
    nextStep();
  };

  const isRent = formData.listingType === ListingType.RENT;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Property Title</Label>
        <Input
          id="title"
          placeholder="e.g., Spacious 2BHK Apartment in Downtown"
          {...register('title')}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">{isRent ? 'Monthly Rent' : 'Sale Price'} (₹)</Label>
          <Input
            id="price"
            type="number"
            placeholder="e.g., 25000"
            {...register('price', { valueAsNumber: true })}
          />
          {errors.price && (
            <p className="text-sm text-destructive">{errors.price.message}</p>
          )}
        </div>

        {isRent && (
          <div className="space-y-2">
            <Label htmlFor="deposit">Security Deposit (₹)</Label>
            <Input
              id="deposit"
              type="number"
              placeholder="e.g., 50000"
              {...register('deposit', { valueAsNumber: true })}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Input
            id="bedrooms"
            type="number"
            placeholder="e.g., 2"
            {...register('bedrooms', { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Input
            id="bathrooms"
            type="number"
            placeholder="e.g., 2"
            {...register('bathrooms', { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="areaSqft">Area (sq ft)</Label>
          <Input
            id="areaSqft"
            type="number"
            placeholder="e.g., 1200"
            {...register('areaSqft', { valueAsNumber: true })}
          />
          {errors.areaSqft && (
            <p className="text-sm text-destructive">{errors.areaSqft.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={prevStep}>
          Back
        </Button>
        <Button type="submit">Next</Button>
      </div>
    </form>
  );
}
```

Due to length constraints, I'll create a continuation file for the remaining steps.

---

## 📊 WEEK 3 PARTIAL CHECKLIST

**Backend**:
- [ ] Cloudinary setup
- [ ] Properties module created
- [ ] Create property endpoint
- [ ] Update property endpoint
- [ ] Get properties endpoint
- [ ] Image upload endpoint
- [ ] Amenities seeded

**Frontend** (Partial):
- [ ] Property form store created
- [ ] Form wizard component
- [ ] Step 1: Property Type ✅
- [ ] Step 2: Basic Details ✅
- [ ] Step 3: Location (next)
- [ ] Step 4: Amenities (next)
- [ ] Step 5: Photos (next)
- [ ] Step 6: Additional Details (next)
- [ ] Step 7: Review & Submit (next)

**To Continue**: Remaining form steps, property card, property detail page, and testing.

