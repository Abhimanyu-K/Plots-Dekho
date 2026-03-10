import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Post(':propertyId')
  @ApiOperation({ summary: 'Add property to favorites' })
  @ApiResponse({ status: 201, description: 'Property added to favorites' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @ApiResponse({ status: 409, description: 'Property already in favorites' })
  async addFavorite(@CurrentUser() user: any, @Param('propertyId') propertyId: string) {
    return this.favoritesService.addFavorite(user.id, propertyId);
  }

  @Delete(':propertyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove property from favorites' })
  @ApiResponse({ status: 204, description: 'Property removed from favorites' })
  @ApiResponse({ status: 404, description: 'Favorite not found' })
  async removeFavorite(@CurrentUser() user: any, @Param('propertyId') propertyId: string) {
    await this.favoritesService.removeFavorite(user.id, propertyId);
  }

  @Get()
  @ApiOperation({ summary: 'Get user favorites' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Favorites retrieved successfully' })
  async getUserFavorites(
    @CurrentUser() user: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.favoritesService.getUserFavorites(
      user.id,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get('check/:propertyId')
  @ApiOperation({ summary: 'Check if property is favorited' })
  @ApiResponse({ status: 200, description: 'Favorite status retrieved' })
  async isFavorite(@CurrentUser() user: any, @Param('propertyId') propertyId: string) {
    const isFavorite = await this.favoritesService.isFavorite(user.id, propertyId);
    return { isFavorite };
  }
}
