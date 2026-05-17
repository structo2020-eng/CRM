import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { MatchRepository } from 'src/DB/repositories/match.repository';
import { LeadRepository } from 'src/DB/repositories/lead.repository';
import { PropertyRepository } from 'src/DB/repositories/property.repository';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchStatusDto } from './dto/update-match-status.dto';
import { MatchStatus } from 'src/DB/models/match.model';

@Injectable()
export class MatchService {
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly leadRepository: LeadRepository,
    private readonly propertyRepository: PropertyRepository,
    private readonly i18n: I18nService,
  ) {}

  // 1. خوارزمية المطابقة التلقائية (النسخة المتوافقة تماماً مع الـ Schema)
  async generateAutoMatches(companyId: Types.ObjectId) {
    const leadsResult = await this.leadRepository.findAll({
      filter: { status: 'new' },
      companyId,
    });

    const propertiesResult = await this.propertyRepository.findAll({
      filter: { status: 'available' as any },
      companyId,
    });

    const leads = leadsResult.data;
    const properties = propertiesResult.data;
    let newMatchesCount = 0;

    for (const lead of leads) {
      for (const property of properties) {
        // 🚀 1. التأكد من الغرض (بيع / إيجار) - خطوة حيوية لمنع الأخطاء الكارثية
        const isPurposeMatch =
          !lead.purpose || lead.purpose === property.purpose;

        if (!isPurposeMatch) continue;

        // 🚀 2. التحسين الأول: نوع العقار (Property Type)
        const isTypeMatch =
          !lead.propertyType || lead.propertyType === property.propertyType;

        if (!isTypeMatch) continue;

        // 🚀 3. التحسين الثاني: مرونة الموقع (Partial Location Match)
        const leadLoc = lead.location?.toLowerCase() || '';
        const propLoc = property.location?.toLowerCase() || '';
        const isLocationMatch =
          propLoc.includes(leadLoc) || leadLoc.includes(propLoc);

        // 🚀 4. التحسين الثالث: مرونة الميزانية بناءً على الحد الأقصى (maxBudget)
        const leadMaxBudget = lead.maxBudget || 0;
        const isBudgetMatch = leadMaxBudget >= property.price * 0.9;

        // إذا تحققت الشروط المرنة معاً
        // 🚀 جهاز التنصت: لمعرفة لماذا ترفض الخوارزمية المطابقة
        console.log(
          `\n--- جاري فحص العميل: ${lead.firstName} مع العقار: ${property.title} ---`,
        );
        console.log(
          `1. تطابق الغرض (بيع/إيجار): ${isPurposeMatch} | (${lead.purpose} == ${property.purpose})`,
        );
        console.log(
          `2. تطابق النوع (فيلا/شقة): ${isTypeMatch} | (${lead.propertyType} == ${property.propertyType})`,
        );
        console.log(
          `3. تطابق الموقع: ${isLocationMatch} | (${leadLoc} vs ${propLoc})`,
        );
        console.log(
          `4. تطابق الميزانية: ${isBudgetMatch} | (ميزانية العميل: ${leadMaxBudget} >= سعر العقار المرن: ${property.price * 0.9})`,
        );
        console.log(`--------------------------------------------------\n`);

        // إذا تحققت الشروط المرنة معاً
        if (isLocationMatch && isBudgetMatch) {
          const existingMatch = await this.matchRepository.findOne({
            filter: { lead: lead._id, property: property._id },
            companyId,
          });

          if (!existingMatch) {
            // 🚀 حساب نسبة التوافق (Match Score) بشكل ديناميكي ذكي
            let matchScore = 100;

            // خصم 10 درجات إذا كانت الميزانية أقل من السعر واضطررنا لاستخدام "المرونة"
            if (leadMaxBudget < property.price) {
              matchScore -= 10;
            }

            // خصم 5 درجات إذا كان التطابق في الموقع جزئياً وليس تطابقاً تاماً
            if (propLoc !== leadLoc) {
              matchScore -= 5;
            }

            await this.matchRepository.create({
              lead: lead._id,
              property: property._id,
              company_id: companyId,
              score: matchScore,
              status: MatchStatus.suggested,
            });
            newMatchesCount++;
          }
        }
      }
    }

    return {
      message: `Auto-matching completed. ${newMatchesCount} new matches found.`,
    };
  }

  // 2. جلب المطابقات الخاصة بعميل معين
  async getMatchesForLead(
    leadId: Types.ObjectId,
    companyId: Types.ObjectId,
    page: number = 1,
    limit: number = 10,
  ) {
    return await this.matchRepository.findAll({
      filter: { lead: leadId },
      populate: 'property',
      paginate: { page, limit },
      sort: { score: -1 },
      companyId,
    });
  }

  // 3. تحديث حالة المطابقة
  async updateMatchStatus(
    matchId: Types.ObjectId,
    updateMatchStatusDto: UpdateMatchStatusDto,
    companyId: Types.ObjectId,
  ) {
    const updatedMatch = await this.matchRepository.update({
      filter: { _id: matchId },
      update: { $set: { status: updateMatchStatusDto.status } },
      companyId,
    });

    if (!updatedMatch) {
      throw new NotFoundException(this.i18n.t('events.MATCH_NOT_FOUND'));
    }

    return updatedMatch;
  }
}
