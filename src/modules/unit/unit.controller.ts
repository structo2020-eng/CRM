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
import { UnitService } from './unit.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { Types } from 'mongoose';

@ApiTags('Units')
@ApiBearerAuth()
@Controller('units')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Post()
  @ApiOperation({ summary: 'Create new unit' })
  async create(@Body() createUnitDto: CreateUnitDto, @Req() req: any) {
    const companyId = new Types.ObjectId(req.user.companyId);
    const userId = new Types.ObjectId(req.user.sub);
    return await this.unitService.createUnit(createUnitDto, companyId, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all units with filters' })
  async findAll(@Query() query: any, @Req() req: any) {
    const companyId = new Types.ObjectId(req.user.companyId);
    return await this.unitService.findAllUnits(query, companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get unit details by ID' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const companyId = new Types.ObjectId(req.user.companyId);
    return await this.unitService.findOneUnit(
      new Types.ObjectId(id),
      companyId,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update unit details' })
  async update(
    @Param('id') id: string,
    @Body() updateUnitDto: UpdateUnitDto,
    @Req() req: any,
  ) {
    const companyId = new Types.ObjectId(req.user.companyId);
    return await this.unitService.updateUnit(
      new Types.ObjectId(id),
      updateUnitDto,
      companyId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete unit' })
  async remove(@Param('id') id: string, @Req() req: any) {
    const companyId = new Types.ObjectId(req.user.companyId);
    return await this.unitService.deleteUnit(new Types.ObjectId(id), companyId);
  }

  @Post(':id/reserve')
  @ApiOperation({ summary: 'Reserve a unit for a lead' })
  async reserve(
    @Param('id') id: string,
    @Body() reserveDto: any,
    @Req() req: any,
  ) {
    const companyId = new Types.ObjectId(req.user.companyId);
    const agentId = new Types.ObjectId(req.user.sub);
    return await this.unitService.reserveUnit(
      new Types.ObjectId(id),
      reserveDto,
      companyId,
      agentId,
    );
  }

  @Post(':id/release')
  @ApiOperation({ summary: 'Release unit reservation' })
  async release(@Param('id') id: string, @Req() req: any) {
    const companyId = new Types.ObjectId(req.user.companyId);
    return await this.unitService.releaseUnit(
      new Types.ObjectId(id),
      companyId,
    );
  }

  @Post(':id/block')
  @ApiOperation({ summary: 'Block a unit' })
  async block(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    const companyId = new Types.ObjectId(req.user.companyId);
    return await this.unitService.blockUnit(
      new Types.ObjectId(id),
      reason,
      companyId,
    );
  }

  @Post(':id/sell')
  @ApiOperation({ summary: 'Convert reservation or block to sale' })
  async sell(
    @Param('id') id: string,
    @Body() reserveDto: any,
    @Req() req: any,
  ) {
    const companyId = new Types.ObjectId(req.user.companyId);
    return await this.unitService.sellUnit(
      new Types.ObjectId(id),
      reserveDto,
      companyId,
    );
  }

  @Post(':id/reservation/approve')
  @ApiOperation({ summary: 'Approve active reservation' })
  async approveReservation(@Param('id') id: string, @Req() req: any) {
    const companyId = new Types.ObjectId(req.user.companyId);
    return await this.unitService.approveReservation(
      new Types.ObjectId(id),
      companyId,
    );
  }

  @Post(':id/reservation/extend')
  @ApiOperation({ summary: 'Extend active reservation' })
  async extendReservation(
    @Param('id') id: string,
    @Body('days') days: number,
    @Req() req: any,
  ) {
    const companyId = new Types.ObjectId(req.user.companyId);
    return await this.unitService.extendReservation(
      new Types.ObjectId(id),
      days,
      companyId,
    );
  }

  @Post(':id/reservation/cancel')
  @ApiOperation({ summary: 'Cancel active reservation' })
  async cancelReservation(@Param('id') id: string, @Req() req: any) {
    const companyId = new Types.ObjectId(req.user.companyId);
    return await this.unitService.cancelReservation(
      new Types.ObjectId(id),
      companyId,
    );
  }

  @Patch(':id/price')
  @ApiOperation({ summary: 'Update unit base price' })
  async updatePrice(
    @Param('id') id: string,
    @Body('price') price: number,
    @Req() req: any,
  ) {
    const companyId = new Types.ObjectId(req.user.companyId);
    const adminName = req.user.name || 'Admin';
    return await this.unitService.updatePrice(
      new Types.ObjectId(id),
      price,
      adminName,
      companyId,
    );
  }

  @Post(':id/discounts')
  @ApiOperation({ summary: 'Apply discount to unit' })
  async applyDiscount(
    @Param('id') id: string,
    @Body() discountDto: { label: string; percentage: number },
    @Req() req: any,
  ) {
    const companyId = new Types.ObjectId(req.user.companyId);
    return await this.unitService.applyDiscount(
      new Types.ObjectId(id),
      discountDto,
      companyId,
    );
  }

  @Post(':id/documents')
  @ApiOperation({ summary: 'Add document to unit' })
  async addDocument(
    @Param('id') id: string,
    @Body() documentData: any,
    @Req() req: any,
  ) {
    const companyId = new Types.ObjectId(req.user.companyId);
    return await this.unitService.addDocument(
      new Types.ObjectId(id),
      documentData,
      companyId,
    );
  }

  @Post('bulk-import')
  @ApiOperation({ summary: 'Bulk import units' })
  async bulkImport(@Body() bulkData: any, @Req() req: any) {
    const companyId = new Types.ObjectId(req.user.companyId);
    const userId = new Types.ObjectId(req.user.sub);
    return await this.unitService.bulkImportUnits(bulkData, companyId, userId);
  }
}
