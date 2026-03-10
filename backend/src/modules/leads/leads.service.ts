import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { Lead } from '@prisma/client';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async create(
    seekerId: string,
    propertyId: string,
    createDto: CreateLeadDto,
  ): Promise<Lead> {
    // Check if property exists
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // Create lead
    const lead = await this.prisma.lead.create({
      data: {
        seekerId,
        ownerId: property.userId,
        propertyId,
        message: createDto.message,
        status: 'NEW',
      },
      include: {
        property: {
          include: {
            images: {
              orderBy: {
                order: 'asc',
              },
              take: 1,
            },
          },
        },
        seeker: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // TODO: Send notification to property owner via email/SMS

    return lead;
  }

  async getReceivedLeads(ownerId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const total = await this.prisma.lead.count({
      where: { ownerId },
    });

    const leads = await this.prisma.lead.findMany({
      where: { ownerId },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        property: {
          include: {
            images: {
              orderBy: {
                order: 'asc',
              },
              take: 1,
            },
          },
        },
        seeker: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return {
      data: leads,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSentLeads(seekerId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const total = await this.prisma.lead.count({
      where: { seekerId },
    });

    const leads = await this.prisma.lead.findMany({
      where: { seekerId },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        property: {
          include: {
            images: {
              orderBy: {
                order: 'asc',
              },
              take: 1,
            },
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return {
      data: leads,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, userId: string): Promise<Lead> {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        property: {
          include: {
            images: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
        seeker: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    // Check if user is either the seeker or owner
    if (lead.seekerId !== userId && lead.ownerId !== userId) {
      throw new ForbiddenException('You can only access your own leads');
    }

    return lead;
  }

  async updateStatus(
    id: string,
    ownerId: string,
    status: string,
  ): Promise<Lead> {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    // Only owner can update status
    if (lead.ownerId !== ownerId) {
      throw new ForbiddenException('Only property owner can update lead status');
    }

    return this.prisma.lead.update({
      where: { id },
      data: { status },
      include: {
        property: true,
        seeker: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    // Only seeker can delete their own leads
    if (lead.seekerId !== userId) {
      throw new ForbiddenException('You can only delete your own leads');
    }

    await this.prisma.lead.delete({
      where: { id },
    });
  }
}
