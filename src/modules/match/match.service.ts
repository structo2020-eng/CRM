import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { MatchRepository } from 'src/DB/repositories/match.repository';
import { LeadRepository } from 'src/DB/repositories/lead.repository';
import { PropertyRepository } from 'src/DB/repositories/property.repository';
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
        // 1. الغرض (بيع / إيجار)
        const isPurposeMatch =
          !lead.purpose || lead.purpose === property.purpose;
        if (!isPurposeMatch) continue;

        // 2. نوع العقار
        const isTypeMatch =
          !lead.propertyType || lead.propertyType === property.propertyType;
        if (!isTypeMatch) continue;

        // 3. المساحة (Area) - دعم الـ areaMin و areaMax الجديدين
        const isAreaMatch =
          (!lead.areaMin || property.area >= lead.areaMin) &&
          (!lead.areaMax || property.area <= lead.areaMax);
        if (!isAreaMatch) continue;

        // 4. الموقع (البحث بالنص الجديد preferredLocation داخل المحافظة والمدينة للعقار)
        const leadLoc = lead.preferredLocation?.toLowerCase() || '';
        const propGov = property.governorate?.toLowerCase() || '';
        const propCity = property.city?.toLowerCase() || '';

        const isLocationMatch =
          !leadLoc ||
          propGov.includes(leadLoc) ||
          propCity.includes(leadLoc) ||
          leadLoc.includes(propCity);

        // 5. الميزانية
        const leadMaxBudget = lead.maxBudget || 0;
        const isBudgetMatch = leadMaxBudget >= property.price * 0.9;

        if (isLocationMatch && isBudgetMatch) {
          const existingMatch = await this.matchRepository.findOne({
            filter: { lead: lead._id, property: property._id },
            companyId,
          });

          if (!existingMatch) {
            let matchScore = 100;

            if (leadMaxBudget < property.price) {
              matchScore -= 10;
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
