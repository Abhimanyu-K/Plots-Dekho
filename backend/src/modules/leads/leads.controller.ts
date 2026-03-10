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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Leads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Post('property/:propertyId')
  @ApiOperation({ summary: 'Send inquiry for a property' })
  @ApiResponse({ status: 201, description: 'Lead created successfully' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async create(
    @CurrentUser() user: any,
    @Param('propertyId') propertyId: string,
    @Body() createDto: CreateLeadDto,
  ) {
    return this.leadsService.create(user.id, propertyId, createDto);
  }

  @Get('received')
  @ApiOperation({ summary: 'Get leads received (for property owners)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Received leads retrieved successfully' })
  async getReceivedLeads(
    @CurrentUser() user: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.leadsService.getReceivedLeads(user.id, parseInt(page), parseInt(limit));
  }

  @Get('sent')
  @ApiOperation({ summary: 'Get leads sent (for seekers)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Sent leads retrieved successfully' })
  async getSentLeads(
    @CurrentUser() user: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.leadsService.getSentLeads(user.id, parseInt(page), parseInt(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lead by ID' })
  @ApiResponse({ status: 200, description: 'Lead retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async findById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.leadsService.findById(id, user.id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update lead status (property owner only)' })
  @ApiResponse({ status: 200, description: 'Lead status updated successfully' })
  @ApiResponse({ status: 403, description: 'Only owner can update status' })
  async updateStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.leadsService.updateStatus(id, user.id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete lead' })
  @ApiResponse({ status: 204, description: 'Lead deleted successfully' })
  @ApiResponse({ status: 403, description: 'You can only delete your own leads' })
  async delete(@CurrentUser() user: any, @Param('id') id: string) {
    await this.leadsService.delete(id, user.id);
  }
}
