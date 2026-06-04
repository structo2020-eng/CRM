import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { AuditRepository } from 'src/DB/repositories/audit.repository';

@Injectable()
export class AuditService {
  constructor(private readonly auditRepository: AuditRepository) {}

  async logAction(
    companyId: Types.ObjectId,
    entityId: string,
    entityType: 'Project' | 'Building' | 'Unit' | 'Reservation',
    action: string,
    performedBy: {
      _id: Types.ObjectId;
      name: string;
      email: string;
      role: string;
    },
    changes: any[] = [],
  ) {
    return await this.auditRepository.create({
      company_id: companyId,
      entityId,
      entityType,
      action,
      performedBy,
      changes,
    });
  }

  async getLogs(query: any, companyId: Types.ObjectId) {
    const { entityId, entityType, action, page = 1, limit = 50 } = query;
    const filter: any = {};

    if (entityId) filter.entityId = entityId;
    if (entityType) filter.entityType = entityType;
    if (action) filter.action = action;

    // 🚀 جلب البيانات مع الترقيم وعزل الـ Tenant من الـ Abstract
    return await this.auditRepository.findAll({
      filter,
      paginate: { page: Number(page), limit: Number(limit) },
      sort: { createdAt: -1 },
      companyId,
    });
  }
}
