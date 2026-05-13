import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider';
import { CloudinaryService } from './cloudinary.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule], // لضمان قراءة مفاتيح Cloudinary من ملف .env
  providers: [CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryProvider, CloudinaryService], //  التصدير ضروري لتستخدمه الموديولات الأخرى
})
export class CloudinaryModule {}
