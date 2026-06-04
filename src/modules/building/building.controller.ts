import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BuildingService } from './building.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { Types } from 'mongoose';

@ApiTags('Buildings')
@ApiBearerAuth()
@Controller('buildings')
export class BuildingController {
  constructor(private readonly buildingService: BuildingService) {}

  @Post()
  @ApiOperation({ summary: 'Create new building' })
  async create(@Body() createBuildingDto: CreateBuildingDto, @Req() req: any) {
    const companyId = new Types.ObjectId(req.user.companyId);
    const userId = new Types.ObjectId(req.user.sub);
    return await this.buildingService.create(
      createBuildingDto,
      companyId,
      userId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all buildings' })
  async findAll(@Query() query: any, @Req() req: any) {
    const companyId = new Types.ObjectId(req.user.companyId);
    return await this.buildingService.findAllBuildings(query, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update building details' })
  async update(
    @Param('id') id: string,
    @Body() updateBuildingDto: UpdateBuildingDto,
    @Req() req: any,
  ) {
    const companyId = new Types.ObjectId(req.user.companyId);
    return await this.buildingService.updateBuilding(
      new Types.ObjectId(id),
      updateBuildingDto,
      companyId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete building' })
  async remove(@Param('id') id: string, @Req() req: any) {
    const companyId = new Types.ObjectId(req.user.companyId);
    return await this.buildingService.deleteBuilding(
      new Types.ObjectId(id),
      companyId,
    );
  }
}
