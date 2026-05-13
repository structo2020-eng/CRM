import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { PropertyRepository } from 'src/DB/repositories/property.repository';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class PropertyService {
  constructor(
    private readonly propertyRepository: PropertyRepository,
    private readonly i18n: I18nService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  async create(
    createPropertyDto: CreatePropertyDto,
    files: { media?: Express.Multer.File[]; floorPlan?: Express.Multer.File[] },
    companyId: Types.ObjectId,
    userId: Types.ObjectId,
  ) {
    let parsedAmenities: string[] = [];
    if (typeof createPropertyDto.amenities === 'string') {
      parsedAmenities = createPropertyDto.amenities
        .split(',')
        .map((item) => item.trim());
    } else if (Array.isArray(createPropertyDto.amenities)) {
      parsedAmenities = createPropertyDto.amenities;
    }

    //  التعديل هنا: استخدام uploadFile لرفع الميديا (بشكل متوازٍ لتسريع الرفع)
    const uploadedMedia =
      files?.media && files.media.length > 0
        ? await Promise.all(
            files.media.map((file) => this.cloudinaryService.uploadFile(file)),
          )
        : [];

    //  التعديل هنا: استخدام uploadFile لرفع المخطط الهندسي
    const uploadedFloorPlan =
      files?.floorPlan && files.floorPlan.length > 0
        ? await this.cloudinaryService.uploadFile(files.floorPlan[0])
        : null;

    return await this.propertyRepository.create({
      ...createPropertyDto,
      amenities: parsedAmenities,
      company_id: companyId,
      listedByAgent: userId,
      media: uploadedMedia,
      floorPlan: uploadedFloorPlan,
    });
  }
  async findAll(
    companyId: Types.ObjectId,
    page: number = 1,
    limit: number = 10,
  ) {
    return await this.propertyRepository.findAll({
      filter: { isDeleted: { $ne: true } },
      paginate: { page, limit },
      sort: { createdAt: -1 },
      companyId, //  الأمان الإجباري: حقن معرف الشركة
      populate: { path: 'listedByAgent', select: 'fullName email phone' }, // جلب بيانات الوكيل الذي أضاف العقار
    });
  }

  async findOne(id: Types.ObjectId, companyId: Types.ObjectId) {
    const property = await this.propertyRepository.findOne({
      filter: { _id: id, isDeleted: { $ne: true } },
      companyId,
      populate: { path: 'listedByAgent', select: 'fullName email phone' },
    });

    if (!property) {
      throw new NotFoundException(this.i18n.t('events.PROPERTY_NOT_FOUND'));
    }

    return property;
  }

  async update(
    id: Types.ObjectId,
    updatePropertyDto: UpdatePropertyDto,
    companyId: Types.ObjectId,
  ) {
    // 🚀 معالجة المصفوفات القادمة من form-data (مع إرضاء TypeScript)
    const updateData: any = updatePropertyDto;

    if (updateData.amenities) {
      if (typeof updateData.amenities === 'string') {
        updateData.amenities = updateData.amenities
          .split(',')
          .map((item: string) => item.trim());
      }
    }

    const updatedProperty = await this.propertyRepository.update({
      filter: { _id: id, isDeleted: { $ne: true } },
      update: { $set: updateData },
      companyId,
    });

    if (!updatedProperty) {
      throw new NotFoundException(this.i18n.t('events.PROPERTY_NOT_FOUND'));
    }

    return updatedProperty;
  }
  async softDelete(id: Types.ObjectId, companyId: Types.ObjectId) {
    const deletedProperty = await this.propertyRepository.update({
      filter: { _id: id },
      update: { $set: { isDeleted: true } },
      companyId,
    });

    if (!deletedProperty) {
      throw new NotFoundException(this.i18n.t('events.PROPERTY_NOT_FOUND'));
    }
    return { message: 'Property deleted successfully' };
  }
}
