import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog } from '../models/audit-log.model';
import { AbstractRepository } from './abstract.repository';

@Injectable()
export class AuditRepository extends AbstractRepository<AuditLog> {
  constructor(@InjectModel(AuditLog.name) auditLogModel: Model<AuditLog>) {
    super(auditLogModel);
  }
}
