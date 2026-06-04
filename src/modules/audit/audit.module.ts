import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLog, AuditLogModel } from 'src/DB/models/audit-log.model';
import { AuditRepository } from '../../DB/repositories/audit.repository';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';

@Global() // 🚀 جعله عاماً ليعمل في أي مكان في المشروع
@Module({
  imports: [
    MongooseModule.forFeature([{ name: AuditLog.name, schema: AuditLogModel }]),
  ],
  controllers: [AuditController],
  providers: [
    AuditRepository, // 🚀 تسجيل الـ Repository
    AuditService,
  ],
  exports: [AuditRepository, AuditService], // تصديرهم لتستفيد منهم الموديولات الأخرى
})
export class AuditModule {}
