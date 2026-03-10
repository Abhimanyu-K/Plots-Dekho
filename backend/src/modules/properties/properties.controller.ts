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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { QueryPropertyDto } from './dto/query-property.dto';
import { AddImagesDto } from './dto/upload-image.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Properties')
@Controller('properties')
export class PropertiesController {
  constructor(private propertiesService: PropertiesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new property listing' })
  @ApiResponse({ status: 201, description: 'Property created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Only owners can create properties' })
  async create(@CurrentUser() user: any, @Body() createPropertyDto: CreatePropertyDto) {
    return this.propertiesService.create(user.id, createPropertyDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all properties with filters' })
  @ApiResponse({ status: 200, description: 'Properties retrieved successfully' })
  async findAll(@Query() queryDto: QueryPropertyDto) {
    return this.propertiesService.findAll(queryDto);
  }

  @Get('my-properties')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get properties owned by current user' })
  @ApiResponse({ status: 200, description: 'Properties retrieved successfully' })
  async getMyProperties(@CurrentUser() user: any, @Query() queryDto: QueryPropertyDto) {
    return this.propertiesService.getMyProperties(user.id, queryDto);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get property by ID' })
  @ApiResponse({ status: 200, description: 'Property retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async findById(@Param('id') id: string) {
    const property = await this.propertiesService.findById(id);
    // Increment view count asynchronously
    this.propertiesService.incrementViews(id).catch(() => {});
    return property;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update property' })
  @ApiResponse({ status: 200, description: 'Property updated successfully' })
  @ApiResponse({ status: 403, description: 'You can only update your own properties' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertiesService.update(id, user.id, user.role, updatePropertyDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete property' })
  @ApiResponse({ status: 204, description: 'Property deleted successfully' })
  @ApiResponse({ status: 403, description: 'You can only delete your own properties' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    await this.propertiesService.delete(id, user.id, user.role);
  }

  @Post(':id/images')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add images to property' })
  @ApiResponse({ status: 201, description: 'Images added successfully' })
  @ApiResponse({ status: 403, description: 'You can only add images to your own properties' })
  async addImages(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() addImagesDto: AddImagesDto,
  ) {
    return this.propertiesService.addImages(id, user.id, user.role, addImagesDto.images);
  }

  @Delete('images/:imageId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete property image' })
  @ApiResponse({ status: 204, description: 'Image deleted successfully' })
  @ApiResponse({ status: 403, description: 'You can only delete images from your own properties' })
  async deleteImage(@Param('imageId') imageId: string, @CurrentUser() user: any) {
    await this.propertiesService.deleteImage(imageId, user.id, user.role);
  }
}
