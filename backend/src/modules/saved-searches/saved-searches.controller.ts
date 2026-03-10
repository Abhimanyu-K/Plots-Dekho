import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SavedSearchesService } from './saved-searches.service';
import { CreateSavedSearchDto } from './dto/create-saved-search.dto';
import { UpdateSavedSearchDto } from './dto/update-saved-search.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Saved Searches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('saved-searches')
export class SavedSearchesController {
  constructor(private savedSearchesService: SavedSearchesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a saved search' })
  @ApiResponse({ status: 201, description: 'Saved search created successfully' })
  async create(@CurrentUser() user: any, @Body() createDto: CreateSavedSearchDto) {
    return this.savedSearchesService.create(user.id, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all saved searches' })
  @ApiResponse({ status: 200, description: 'Saved searches retrieved successfully' })
  async findAll(@CurrentUser() user: any) {
    return this.savedSearchesService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get saved search by ID' })
  @ApiResponse({ status: 200, description: 'Saved search retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Saved search not found' })
  async findById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.savedSearchesService.findById(id, user.id);
  }

  @Get(':id/execute')
  @ApiOperation({ summary: 'Execute saved search and get results' })
  @ApiResponse({ status: 200, description: 'Search executed successfully' })
  async executeSearch(@CurrentUser() user: any, @Param('id') id: string) {
    return this.savedSearchesService.executeSearch(id, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update saved search' })
  @ApiResponse({ status: 200, description: 'Saved search updated successfully' })
  @ApiResponse({ status: 404, description: 'Saved search not found' })
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateSavedSearchDto,
  ) {
    return this.savedSearchesService.update(id, user.id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete saved search' })
  @ApiResponse({ status: 204, description: 'Saved search deleted successfully' })
  @ApiResponse({ status: 404, description: 'Saved search not found' })
  async delete(@CurrentUser() user: any, @Param('id') id: string) {
    await this.savedSearchesService.delete(id, user.id);
  }
}
