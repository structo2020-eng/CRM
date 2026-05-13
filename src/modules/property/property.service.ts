import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { PropertyRepository } from 'src/DB/repositories/property.repository';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Injectable()
export class PropertyService {
  constructor(
    private readonly propertyRepository: PropertyRepository,
    private readonly i18n: I18nService,
    // 💡 يمكنك حقن CloudinaryService هنا لاحقاً لرفع الصور
    // private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    createPropertyDto: CreatePropertyDto,
    files: { media?: Express.Multer.File[]; floorPlan?: Express.Multer.File[] }, // 🚀 استقبال الملفات
    companyId: Types.ObjectId,
    userId: Types.ObjectId,
  ) {
    // 🚀 التعديل السحري: معالجة الـ Amenities القادمة من form-data
    let parsedAmenities: string[] = [];
    if (typeof createPropertyDto.amenities === 'string') {
      // إذا أرسلها الفرونت إند كنص مفصول بفاصلة، نحولها لمصفوفة وننظف المسافات
      parsedAmenities = createPropertyDto.amenities
        .split(',')
        .map((item) => item.trim());
    } else if (Array.isArray(createPropertyDto.amenities)) {
      parsedAmenities = createPropertyDto.amenities;
    }

    // 💡 TODO: كود رفع الصور مستقبلاً
    // const uploadedMedia = files.media ? await this.cloudinaryService.uploadMultiple(files.media) : [];
    // const uploadedFloorPlan = files.floorPlan ? await this.cloudinaryService.uploadSingle(files.floorPlan[0]) : null;

    return await this.propertyRepository.create({
      ...createPropertyDto,
      amenities: parsedAmenities, // حفظ المصفوفة النظيفة بدلاً من القيمة الخام
      company_id: companyId,
      listedByAgent: userId,
      // media: uploadedMedia,
      // floorPlan: uploadedFloorPlan,
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
      companyId, // 🚀 الأمان الإجباري: حقن معرف الشركة
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
    const updatedProperty = await this.propertyRepository.update({
      filter: { _id: id, isDeleted: { $ne: true } },
      update: { $set: updatePropertyDto },
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
