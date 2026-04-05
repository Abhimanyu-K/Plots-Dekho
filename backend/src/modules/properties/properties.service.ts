import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { QueryPropertyDto } from './dto/query-property.dto';
import { UploadImageDto } from './dto/upload-image.dto';
import { Property, UserRole, Prisma } from '@prisma/client';

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createPropertyDto: CreatePropertyDto): Promise<Property> {
    const { amenities, images, ...propertyData } = createPropertyDto;

    // Create property with images if provided
    const property = await this.prisma.property.create({
      data: {
        ...propertyData,
        userId,
        ...(images && images.length > 0 && {
          images: {
            create: images.map((url, index) => ({
              imageUrl: url,
              isPrimary: index === 0,
              order: index,
            })),
          },
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        images: true,
        amenities: {
          include: {
            amenity: true,
          },
        },
      },
    });

    // Add amenities if provided
    if (amenities && amenities.length > 0) {
      await this.addAmenities(property.id, amenities);
    }

    return this.findById(property.id);
  }

  async findAll(queryDto: QueryPropertyDto) {
    const { page, limit, sortBy, sortOrder, search, ...filters } = queryDto;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.PropertyWhereInput = {
      AND: [
        // Search in title, description, or address
        search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { address: { contains: search, mode: 'insensitive' } },
                { city: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},

        // Property type filter
        filters.propertyType ? { propertyType: filters.propertyType } : {},

        // Listing type filter
        filters.listingType ? { listingType: filters.listingType } : {},

        // City filter
        filters.city ? { city: { equals: filters.city, mode: 'insensitive' } } : {},

        // Price range
        filters.minPrice || filters.maxPrice
          ? {
              price: {
                ...(filters.minPrice && { gte: filters.minPrice }),
                ...(filters.maxPrice && { lte: filters.maxPrice }),
              },
            }
          : {},

        // Bedrooms range
        filters.minBedrooms || filters.maxBedrooms
          ? {
              bedrooms: {
                ...(filters.minBedrooms && { gte: filters.minBedrooms }),
                ...(filters.maxBedrooms && { lte: filters.maxBedrooms }),
              },
            }
          : {},

        // Area range
        filters.minArea || filters.maxArea
          ? {
              areaSqft: {
                ...(filters.minArea && { gte: filters.minArea }),
                ...(filters.maxArea && { lte: filters.maxArea }),
              },
            }
          : {},

        // Furnishing filter
        filters.furnishing ? { furnishing: filters.furnishing } : {},

        // Status filter (default to ACTIVE if not specified)
        { status: filters.status || 'ACTIVE' },
      ],
    };

    // Get total count
    const total = await this.prisma.property.count({ where });

    // Get properties
    const properties = await this.prisma.property.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        images: {
          orderBy: {
            order: 'asc',
          },
        },
        amenities: {
          include: {
            amenity: true,
          },
        },
        _count: {
          select: {
            favorites: true,
            reviews: true,
          },
        },
      },
    });

    return {
      data: properties,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<Property> {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
        images: {
          orderBy: {
            order: 'asc',
          },
        },
        amenities: {
          include: {
            amenity: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            favorites: true,
            reviews: true,
            leads: true,
          },
        },
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return property;
  }

  async update(
    id: string,
    userId: string,
    userRole: UserRole,
    updatePropertyDto: UpdatePropertyDto,
  ): Promise<Property> {
    const property = await this.findById(id);

    // Check ownership (unless admin)
    if (property.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only update your own properties');
    }

    const { amenities, images, ...propertyData } = updatePropertyDto;

    // Update property
    const updatedProperty = await this.prisma.property.update({
      where: { id },
      data: propertyData,
    });

    // Update amenities if provided
    if (amenities) {
      // Remove existing amenities
      await this.prisma.propertyAmenity.deleteMany({
        where: { propertyId: id },
      });

      // Add new amenities
      if (amenities.length > 0) {
        await this.addAmenities(id, amenities);
      }
    }

    return this.findById(id);
  }

  async delete(id: string, userId: string, userRole: UserRole): Promise<void> {
    const property = await this.findById(id);

    // Check ownership (unless admin)
    if (property.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete your own properties');
    }

    await this.prisma.property.delete({
      where: { id },
    });
  }

  async addAmenities(propertyId: string, amenityNames: string[]): Promise<void> {
    for (const name of amenityNames) {
      // Get or create amenity
      let amenity = await this.prisma.amenity.findUnique({
        where: { name },
      });

      if (!amenity) {
        amenity = await this.prisma.amenity.create({
          data: { name },
        });
      }

      // Link to property
      await this.prisma.propertyAmenity.create({
        data: {
          propertyId,
          amenityId: amenity.id,
        },
      });
    }
  }

  async getMyProperties(userId: string, queryDto: QueryPropertyDto) {
    const { page, limit, sortBy, sortOrder } = queryDto;
    const skip = (page - 1) * limit;

    const total = await this.prisma.property.count({
      where: { userId },
    });

    const properties = await this.prisma.property.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        images: {
          orderBy: {
            order: 'asc',
          },
        },
        amenities: {
          include: {
            amenity: true,
          },
        },
        _count: {
          select: {
            favorites: true,
            reviews: true,
            leads: true,
          },
        },
      },
    });

    return {
      data: properties,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async incrementViews(id: string): Promise<void> {
    await this.prisma.property.update({
      where: { id },
      data: {
        viewsCount: {
          increment: 1,
        },
      },
    });
  }

  async addImages(
    propertyId: string,
    userId: string,
    userRole: UserRole,
    images: UploadImageDto[],
  ) {
    const property = await this.findById(propertyId);

    // Check ownership (unless admin)
    if (property.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only add images to your own properties');
    }

    // Create images
    const createdImages = await Promise.all(
      images.map((image, index) =>
        this.prisma.propertyImage.create({
          data: {
            propertyId,
            imageUrl: image.imageUrl,
            thumbnailUrl: image.thumbnailUrl,
            isPrimary: image.isPrimary ?? false,
            order: image.order ?? index,
          },
        }),
      ),
    );

    return createdImages;
  }

  async deleteImage(
    imageId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<void> {
    const image = await this.prisma.propertyImage.findUnique({
      where: { id: imageId },
      include: { property: true },
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    // Check ownership (unless admin)
    if (image.property.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete images from your own properties');
    }

    await this.prisma.propertyImage.delete({
      where: { id: imageId },
    });
  }
}
