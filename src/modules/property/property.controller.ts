import { ParseObjectIdPipe } from '@nestjs/mongoose';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Types } from 'mongoose';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { FindPropertiesDto } from './dto/find-properties.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { User } from 'src/common/decorators/user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/DB/enums/user.enum';

@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post()
  @Roles(Role.company_admin, Role.manager, Role.agent, Role.data_entry)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'media', maxCount: 10 }, // بحد أقصى 10 صور للعقار
      { name: 'floorPlan', maxCount: 1 }, // مخطط هندسي واحد
    ]),
  )
  async create(
    @Body() data: CreatePropertyDto,
    @UploadedFiles()
    files: { media?: Express.Multer.File[]; floorPlan?: Express.Multer.File[] },
    @User('company_id') companyId: Types.ObjectId,
    @User('sub') userId: Types.ObjectId,
  ) {
    // التأكد من أن files ليس undefined لتجنب أخطاء Multer
    const safeFiles = files || { media: [], floorPlan: [] };

    // 🚀 التعديل: تمرير الملفات إلى السيرفيس لكي لا تضيع!
    return this.propertyService.create(data, safeFiles, companyId, userId);
  }

  @Get()
  @Roles(Role.company_admin, Role.manager, Role.agent)
  async findAll(
    @User('company_id') companyId: Types.ObjectId,
    @Query() query: FindPropertiesDto,
  ) {
    return this.propertyService.findAll(companyId, query.page, query.limit);
  }

  @Get(':id')
  @Roles(Role.company_admin, Role.manager, Role.agent)
  async findOne(
    @Param('id') propertyId: Types.ObjectId, // تم إزالة البايب مؤقتاً لتجنب مشاكل الاستيراد
    @User('company_id') companyId: Types.ObjectId,
  ) {
    return this.propertyService.findOne(propertyId, companyId);
  }

  @Patch(':id')
  @Roles(Role.company_admin, Role.manager, Role.agent)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'media', maxCount: 10 },
      { name: 'floorPlan', maxCount: 1 },
    ]),
  )
  async update(
    @Param('id') id: Types.ObjectId,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @User('company_id') companyId: Types.ObjectId,
    @UploadedFiles()
    files: { media?: Express.Multer.File[]; floorPlan?: Express.Multer.File[] },
  ) {
    return this.propertyService.update(id, updatePropertyDto, companyId);
  }

  @Delete(':id')
  @Roles(Role.company_admin, Role.manager)
  async remove(
    @Param('id') id: Types.ObjectId,
    @User('company_id') companyId: Types.ObjectId,
  ) {
    return this.propertyService.softDelete(id, companyId);
  }
}
