import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Favorite } from '@prisma/client';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async addFavorite(userId: string, propertyId: string): Promise<Favorite> {
    // Check if property exists
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // Check if already favorited
    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Property already in favorites');
    }

    // Add to favorites
    return this.prisma.favorite.create({
      data: {
        userId,
        propertyId,
      },
      include: {
        property: {
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
        },
      },
    });
  }

  async removeFavorite(userId: string, propertyId: string): Promise<void> {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId,
        },
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.prisma.favorite.delete({
      where: {
        userId_propertyId: {
          userId,
          propertyId,
        },
      },
    });
  }

  async getUserFavorites(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const total = await this.prisma.favorite.count({
      where: { userId },
    });

    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        property: {
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
        },
      },
    });

    return {
      data: favorites,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async isFavorite(userId: string, propertyId: string): Promise<boolean> {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId,
        },
      },
    });

    return !!favorite;
  }
}
