import * as xlsx from 'xlsx';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { LeadRepository } from 'src/DB/repositories/lead.repository';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { Role } from 'src/DB/enums/user.enum';

@Injectable()
export class LeadService {
  constructor(
    private readonly leadRepository: LeadRepository,
    private readonly i18n: I18nService,
  ) {}

  async create(
    createLeadDto: CreateLeadDto,
    companyId: Types.ObjectId,
    createdBy: Types.ObjectId,
  ) {
    return await this.leadRepository.create({
      ...createLeadDto,
      company_id: companyId,
      created_by: createdBy,
    });
  }

  async importFromExcel(
    fileBuffer: Buffer,
    companyId: Types.ObjectId,
    createdBy: Types.ObjectId,
  ) {
    try {
      const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data: any[] = xlsx.utils.sheet_to_json(sheet);

      if (!data || data.length === 0) {
        throw new BadRequestException('The excel file is empty.');
      }

      // تنظيف البيانات وتوزيعها على الحقول الجديدة
      const leadsToInsert = data
        .map((row) => {
          const rawName = row['Name'] || row['الاسم'] || '';
          const nameParts = rawName.trim().split(' ');
          const firstName = nameParts[0];
          const lastName =
            nameParts.length > 1 ? nameParts.slice(1).join(' ') : '-';

          return {
            firstName: firstName,
            lastName: lastName,
            // تم التعديل
            phone:
              row['Phone'] || row['رقم الهاتف']
                ? String(row['Phone'] || row['رقم الهاتف']).trim()
                : undefined,
            email: row['Email'] || row['البريد الإلكتروني'], // تم التعديل
            leadSource: row['Source'] || row['المصدر'] || 'walk_in',
            status: 'new',
            company_id: companyId,
            created_by: createdBy,
          };
        })
        .filter((lead) => lead.firstName && lead.phone); // تم التعديل

      if (leadsToInsert.length === 0) {
        throw new BadRequestException(
          'No valid data found. Make sure columns are named: Name, Phone',
        );
      }

      const result = await this.leadRepository.modelInstance.insertMany(
        leadsToInsert,
        { ordered: false },
      );

      return {
        success: true,
        message: `Successfully imported ${result.length} leads.`,
        insertedCount: result.length,
      };
    } catch (error: any) {
      if (error.code === 11000) {
        const insertedCount = error.insertedDocs
          ? error.insertedDocs.length
          : 0;
        const failedCount = error.writeErrors ? error.writeErrors.length : 0;
        return {
          success: true,
          message: `Import partially successful. ${insertedCount} leads added, ${failedCount} leads skipped due to duplicate phone numbers.`,
          insertedCount,
          skippedCount: failedCount,
        };
      }
      throw new BadRequestException(
        'Failed to process Excel file. Please check the format.',
      );
    }
  }

  async findAll(user: JwtPayload, page: number = 1, limit: number = 10) {
    const filter: any = { isDeleted: false };

    // التحقق من أدوار المبيعات
    if ([Role.sales_agent, Role.agent].includes(user.role as Role)) {
      filter.$or = [{ assigned_agent_id: user.sub }, { created_by: user.sub }]; // تم التعديل
    }

    return await this.leadRepository.findAll({
      filter,
      companyId: user.company_id,
      paginate: { page, limit },
      sort: { createdAt: -1 },
      populate: { path: 'assigned_agent_id', select: 'fullName email' }, // تم التعديل
    });
  }

  async findOne(id: Types.ObjectId, companyId: Types.ObjectId) {
    const lead = await this.leadRepository.findOne({
      filter: { _id: id, isDeleted: false },
      companyId,
      populate: { path: 'assigned_agent_id', select: 'fullName email' }, // تم التعديل
    });

    if (!lead) {
      throw new NotFoundException(this.i18n.t('events.LEAD_NOT_FOUND'));
    }

    return lead;
  }

  async update(
    id: Types.ObjectId,
    updateLeadDto: UpdateLeadDto,
    companyId: Types.ObjectId,
  ) {
    const updatedLead = await this.leadRepository.update({
      filter: { _id: id, isDeleted: false },
      update: { $set: updateLeadDto },
      companyId,
    });

    if (!updatedLead) {
      throw new NotFoundException(this.i18n.t('events.LEAD_NOT_FOUND'));
    }
    return updatedLead;
  }

  async softDelete(id: Types.ObjectId, companyId: Types.ObjectId) {
    const deletedLead = await this.leadRepository.update({
      filter: { _id: id },
      update: { $set: { isDeleted: true } },
      companyId,
    });

    if (!deletedLead) {
      throw new NotFoundException(this.i18n.t('events.LEAD_NOT_FOUND'));
    }
    return { message: 'Lead deleted successfully' };
  }

  async assignToAgent(
    leadId: Types.ObjectId,
    agentId: Types.ObjectId,
    companyId: Types.ObjectId,
  ) {
    const updatedLead = await this.leadRepository.update({
      filter: { _id: leadId, isDeleted: false },
      update: { $set: { assigned_agent_id: agentId, status: 'contacted' } }, // تم التعديل
      companyId,
    });

    if (!updatedLead) {
      throw new NotFoundException(this.i18n.t('events.LEAD_NOT_FOUND'));
    }

    return updatedLead;
  }
}
