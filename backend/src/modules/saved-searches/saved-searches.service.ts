import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateSavedSearchDto } from './dto/create-saved-search.dto';
import { UpdateSavedSearchDto } from './dto/update-saved-search.dto';
import { SavedSearch } from '@prisma/client';

@Injectable()
export class SavedSearchesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateSavedSearchDto): Promise<SavedSearch> {
    return this.prisma.savedSearch.create({
      data: {
        userId,
        name: createDto.name,
        searchCriteria: createDto.criteria as any,
        alertEnabled: createDto.enableNotifications || false,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.savedSearch.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string, userId: string): Promise<SavedSearch> {
    const savedSearch = await this.prisma.savedSearch.findUnique({
      where: { id },
    });

    if (!savedSearch) {
      throw new NotFoundException('Saved search not found');
    }

    if (savedSearch.userId !== userId) {
      throw new ForbiddenException('You can only access your own saved searches');
    }

    return savedSearch;
  }

  async update(
    id: string,
    userId: string,
    updateDto: UpdateSavedSearchDto,
  ): Promise<SavedSearch> {
    await this.findById(id, userId);

    return this.prisma.savedSearch.update({
      where: { id },
      data: {
        ...(updateDto.name && { name: updateDto.name }),
        ...(updateDto.criteria && { searchCriteria: updateDto.criteria as any }),
        ...(updateDto.enableNotifications !== undefined && {
          alertEnabled: updateDto.enableNotifications,
        }),
      },
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.findById(id, userId);

    await this.prisma.savedSearch.delete({
      where: { id },
    });
  }

  async executeSearch(id: string, userId: string) {
    const savedSearch = await this.findById(id, userId);
    const criteria = savedSearch.searchCriteria as any;

    // Build where clause based on saved criteria
    const where: any = {
      AND: [
        criteria.propertyType ? { propertyType: criteria.propertyType } : {},
        criteria.listingType ? { listingType: criteria.listingType } : {},
        criteria.city ? { city: { equals: criteria.city, mode: 'insensitive' } } : {},
        criteria.minPrice || criteria.maxPrice
          ? {
              price: {
                ...(criteria.minPrice && { gte: criteria.minPrice }),
                ...(criteria.maxPrice && { lte: criteria.maxPrice }),
              },
            }
          : {},
        criteria.minBedrooms || criteria.maxBedrooms
          ? {
              bedrooms: {
                ...(criteria.minBedrooms && { gte: criteria.minBedrooms }),
                ...(criteria.maxBedrooms && { lte: criteria.maxBedrooms }),
              },
            }
          : {},
        criteria.minArea || criteria.maxArea
          ? {
              areaSqft: {
                ...(criteria.minArea && { gte: criteria.minArea }),
                ...(criteria.maxArea && { lte: criteria.maxArea }),
              },
            }
          : {},
        criteria.furnishing ? { furnishing: criteria.furnishing } : {},
        { status: 'ACTIVE' },
      ],
    };

    const properties = await this.prisma.property.findMany({
      where,
      take: 20,
      orderBy: {
        createdAt: 'desc',
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
          take: 1,
        },
        amenities: {
          include: {
            amenity: true,
          },
        },
      },
    });

    return {
      savedSearch,
      results: properties,
      count: properties.length,
    };
  }
}
