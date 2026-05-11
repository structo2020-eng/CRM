import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LeadService } from './lead.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { User } from 'src/common/decorators/user.decorator';
import type { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { Types } from 'mongoose';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/DB/enums/user.enum';

@Controller('leads')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Post()
  @Roles(Role.company_admin, Role.sales_manager, Role.sales_agent, Role.agent)
  async create(@Body() createLeadDto: CreateLeadDto, @User() user: JwtPayload) {
    return await this.leadService.create(
      createLeadDto,
      user.company_id,
      user.sub,
    );
  }

  // 🚀 مسار استيراد الإكسيل
  @Post('import')
  @Roles(Role.company_admin, Role.sales_manager) // المدراء فقط من يرفعون الداتا
  @UseInterceptors(FileInterceptor('file'))
  async importLeads(
    @UploadedFile() file: Express.Multer.File,
    @User('company_id') companyId: Types.ObjectId,
    @User('sub') userId: Types.ObjectId,
  ) {
    if (!file) {
      throw new BadRequestException('Please provide an Excel file');
    }

    const allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Only Excel files are allowed (.xlsx, .xls)',
      );
    }

    return await this.leadService.importFromExcel(
      file.buffer,
      companyId,
      userId,
    );
  }

  @Get()
  @Roles(Role.company_admin, Role.sales_manager, Role.sales_agent, Role.agent)
  async findAll(
    @User() user: JwtPayload,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.leadService.findAll(user, page, limit);
  }

  @Get(':id')
  @Roles(Role.company_admin, Role.sales_manager, Role.sales_agent, Role.agent)
  async findOne(@Param('id') id: Types.ObjectId, @User() user: JwtPayload) {
    return await this.leadService.findOne(id, user.company_id);
  }

  @Patch(':id')
  @Roles(Role.company_admin, Role.sales_manager, Role.sales_agent, Role.agent)
  async update(
    @Param('id') id: Types.ObjectId,
    @Body() updateLeadDto: UpdateLeadDto,
    @User() user: JwtPayload,
  ) {
    return await this.leadService.update(id, updateLeadDto, user.company_id);
  }

  // 🚀 المسار الجديد: تعيين عميل لمندوب مبيعات
  @Patch(':id/assign')
  @Roles(Role.company_admin, Role.sales_manager) // المدراء فقط من يوزعون العملاء
  async assignToAgent(
    @Param('id') leadId: Types.ObjectId,
    @Body('assigned_agent_id') agentId: Types.ObjectId,
    @User('company_id') companyId: Types.ObjectId,
  ) {
    return await this.leadService.assignToAgent(leadId, agentId, companyId);
  }

  @Delete(':id')
  @Roles(Role.company_admin, Role.sales_manager)
  async remove(@Param('id') id: Types.ObjectId, @User() user: JwtPayload) {
    return await this.leadService.softDelete(id, user.company_id);
  }
}
