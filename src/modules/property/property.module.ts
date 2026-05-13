import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { PropertyRepository } from 'src/DB/repositories/property.repository';
import { PropertyModel } from 'src/DB/models/property.model';
import { CloudinaryModule } from 'src/modules/cloudinary/cloudinary.module';
@Module({
  imports: [
    PropertyModel,
    CloudinaryModule, //  لتشغيل رفع الصور على كلاوديناري
  ],
  controllers: [PropertyController],
  providers: [PropertyService, PropertyRepository],
  exports: [PropertyService, PropertyRepository],
})
export class PropertyModule {}
