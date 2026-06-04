import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { UnitRepository } from 'src/DB/repositories/unit.repository';
import { BuildingRepository } from 'src/DB/repositories/building.repository';
import { ProjectRepository } from 'src/DB/repositories/project.repository';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitService {
  constructor(
    private readonly unitRepository: UnitRepository,
    private readonly buildingRepository: BuildingRepository,
    private readonly projectRepository: ProjectRepository,
  ) {}

  async createUnit(
    createUnitDto: CreateUnitDto,
    companyId: Types.ObjectId,
    userId: Types.ObjectId,
  ) {
    const building = await this.buildingRepository.findOne({
      filter: { _id: createUnitDto.buildingId },
      companyId,
    });
    if (!building) throw new NotFoundException('Building not found');

    const pricePerMeter = createUnitDto.price / createUnitDto.areaSqFt;

    const newUnit = await this.unitRepository.create({
      ...createUnitDto,
      projectName: building.projectName,
      buildingName: building.name,
      basePrice: createUnitDto.price,
      pricePerMeter,
      company_id: companyId,
      created_by: userId,
    });

    await this.updateCascadeCounters(building._id, building.projectId);
    return newUnit;
  }

  async findAllUnits(query: any, companyId: Types.ObjectId) {
    const {
      projectId,
      buildingId,
      floorNumber,
      status,
      type,
      bedrooms,
      bathrooms,
      priceMin,
      priceMax,
      search,
      page = 1,
      limit = 50,
    } = query;
    const filter: any = {};

    if (projectId) filter.projectId = new Types.ObjectId(projectId);
    if (buildingId) filter.buildingId = new Types.ObjectId(buildingId);
    if (floorNumber) filter.floorNumber = Number(floorNumber);
    if (status && status !== 'all') filter.status = status;
    if (type) filter.type = type;
    if (bedrooms) filter.bedrooms = Number(bedrooms);
    if (bathrooms) filter.bathrooms = Number(bathrooms);

    if (priceMin || priceMax) {
      filter.price = {};
      if (priceMin) filter.price.$gte = Number(priceMin);
      if (priceMax) filter.price.$lte = Number(priceMax);
    }

    if (search) {
      filter.$or = [
        { unitNumber: { $regex: search, $options: 'i' } },
        { buildingName: { $regex: search, $options: 'i' } },
        { reservedByLeadName: { $regex: search, $options: 'i' } },
      ];
    }

    return await this.unitRepository.findAll({
      filter,
      paginate: { page: Number(page), limit: Number(limit) },
      sort: { createdAt: -1 },
      companyId,
    });
  }

  async findOneUnit(unitId: Types.ObjectId, companyId: Types.ObjectId) {
    const unit = await this.unitRepository.findOne({
      filter: { _id: unitId },
      companyId,
    });
    if (!unit) throw new NotFoundException('Unit not found');
    return unit;
  }

  async updateUnit(
    unitId: Types.ObjectId,
    updateData: UpdateUnitDto,
    companyId: Types.ObjectId,
  ) {
    const unit = await this.unitRepository.update({
      filter: { _id: unitId },
      update: { $set: updateData },
      companyId,
    });
    if (!unit) throw new NotFoundException('Unit not found');
    return unit;
  }

  async deleteUnit(unitId: Types.ObjectId, companyId: Types.ObjectId) {
    const unit = await this.unitRepository.findOne({
      filter: { _id: unitId },
      companyId,
    });
    if (!unit) throw new NotFoundException('Unit not found');

    await this.unitRepository.delete({ _id: unitId }, undefined, companyId);
    await this.updateCascadeCounters(unit.buildingId, unit.projectId);

    return { message: 'Unit deleted successfully' };
  }

  async reserveUnit(
    unitId: Types.ObjectId,
    reserveDto: any,
    companyId: Types.ObjectId,
    agentId: Types.ObjectId,
  ) {
    const unit = await this.unitRepository.findOne({
      filter: { _id: unitId },
      companyId,
    });
    if (!unit || unit.status !== 'available') {
      throw new BadRequestException('Unit is not available for reservation');
    }

    const now = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(now.getDate() + 14);

    const updatedUnit = await this.unitRepository.update({
      filter: { _id: unitId },
      update: {
        $set: {
          status: 'reserved',
          reservationStatus: 'active',
          reservedByLeadId: reserveDto.leadId,
          reservedByLeadName: reserveDto.leadName,
          assignedAgentId: agentId,
          reservationDate: now,
          reservationExpiryDate: expiryDate,
          reservationNumber: `RES-${Date.now().toString().slice(-4)}`,
        },
      },
      companyId,
    });

    await this.updateCascadeCounters(unit.buildingId, unit.projectId);
    return updatedUnit;
  }

  async releaseUnit(unitId: Types.ObjectId, companyId: Types.ObjectId) {
    const unit = await this.unitRepository.update({
      filter: { _id: unitId },
      update: {
        $set: { status: 'available' },
        $unset: {
          reservedByLeadId: 1,
          reservedByLeadName: 1,
          assignedAgentId: 1,
          assignedAgentName: 1,
          reservationNumber: 1,
          reservationDate: 1,
          reservationExpiryDate: 1,
          reservationStatus: 1,
        },
      },
      companyId,
    });
    if (!unit) throw new NotFoundException('Unit not found');

    await this.updateCascadeCounters(unit.buildingId, unit.projectId);
    return unit;
  }

  async blockUnit(
    unitId: Types.ObjectId,
    reason: string,
    companyId: Types.ObjectId,
  ) {
    const unit = await this.unitRepository.update({
      filter: { _id: unitId, status: 'available' },
      update: { $set: { status: 'blocked', description: reason } },
      companyId,
    });
    if (!unit) throw new BadRequestException('Unit cannot be blocked');

    await this.updateCascadeCounters(unit.buildingId, unit.projectId);
    return unit;
  }

  async sellUnit(
    unitId: Types.ObjectId,
    reserveDto: any,
    companyId: Types.ObjectId,
  ) {
    const unit = await this.unitRepository.update({
      filter: { _id: unitId },
      update: {
        $set: {
          status: 'sold',
          reservationStatus: 'converted_to_sale',
          reservedByLeadId: reserveDto.leadId,
          reservedByLeadName: reserveDto.leadName,
        },
      },
      companyId,
    });
    if (!unit) throw new NotFoundException('Unit not found');

    await this.updateCascadeCounters(unit.buildingId, unit.projectId);
    return unit;
  }

  async approveReservation(unitId: Types.ObjectId, companyId: Types.ObjectId) {
    const unit = await this.unitRepository.update({
      filter: { _id: unitId, status: 'reserved' },
      update: { $set: { reservationStatus: 'active' } },
      companyId,
    });
    if (!unit) throw new BadRequestException('Cannot approve this reservation');
    return unit;
  }

  async extendReservation(
    unitId: Types.ObjectId,
    days: number,
    companyId: Types.ObjectId,
  ) {
    const unit = await this.unitRepository.findOne({
      filter: { _id: unitId },
      companyId,
    });
    if (!unit || unit.status !== 'reserved')
      throw new BadRequestException('Unit is not currently reserved');

    const newExpiry = new Date(unit.reservationExpiryDate || new Date());
    newExpiry.setDate(newExpiry.getDate() + (days || 7));

    return await this.unitRepository.update({
      filter: { _id: unitId },
      update: { $set: { reservationExpiryDate: newExpiry } },
      companyId,
    });
  }

  async cancelReservation(unitId: Types.ObjectId, companyId: Types.ObjectId) {
    const unit = await this.unitRepository.update({
      filter: { _id: unitId },
      update: {
        $set: { status: 'available', reservationStatus: 'cancelled' },
        $unset: {
          reservedByLeadId: 1,
          reservedByLeadName: 1,
          assignedAgentId: 1,
          assignedAgentName: 1,
          reservationNumber: 1,
          reservationExpiryDate: 1,
        },
      },
      companyId,
    });
    if (!unit) throw new NotFoundException('Unit not found');

    await this.updateCascadeCounters(unit.buildingId, unit.projectId);
    return unit;
  }

  async updatePrice(
    unitId: Types.ObjectId,
    newPrice: number,
    adminName: string,
    companyId: Types.ObjectId,
  ) {
    const unit = await this.unitRepository.findOne({
      filter: { _id: unitId },
      companyId,
    });
    if (!unit) throw new NotFoundException('Unit not found');

    const newPricePerMeter = newPrice / unit.areaSqFt;
    const historyEntry = {
      date: new Date(),
      basePrice: unit.price,
      eventName: 'Manual Price Update',
      performedBy: adminName,
    };

    return await this.unitRepository.update({
      filter: { _id: unitId },
      update: {
        $set: {
          price: newPrice,
          basePrice: newPrice,
          pricePerMeter: newPricePerMeter,
        },
        $push: { priceHistory: historyEntry },
      },
      companyId,
    });
  }

  async applyDiscount(
    unitId: Types.ObjectId,
    discountDto: { label: string; percentage: number },
    companyId: Types.ObjectId,
  ) {
    const unit = await this.unitRepository.findOne({
      filter: { _id: unitId },
      companyId,
    });
    if (!unit) throw new NotFoundException('Unit not found');

    const discountAmount = unit.basePrice * (discountDto.percentage / 100);
    const newPrice = unit.basePrice - discountAmount;
    const discountEntry = {
      label: discountDto.label,
      percentage: discountDto.percentage,
      amount: discountAmount,
    };

    return await this.unitRepository.update({
      filter: { _id: unitId },
      update: {
        $set: { price: newPrice, pricePerMeter: newPrice / unit.areaSqFt },
        $push: { discounts: discountEntry },
      },
      companyId,
    });
  }

  async addDocument(
    unitId: Types.ObjectId,
    documentData: any,
    companyId: Types.ObjectId,
  ) {
    const newDoc = {
      ...documentData,
      _id: new Types.ObjectId(),
      createdAt: new Date(),
    };
    const unit = await this.unitRepository.update({
      filter: { _id: unitId },
      update: { $push: { documents: newDoc } },
      companyId,
    });
    if (!unit) throw new NotFoundException('Unit not found');
    return unit;
  }

  async bulkImportUnits(
    bulkData: any,
    companyId: Types.ObjectId,
    userId: Types.ObjectId,
  ) {
    const success: any[] = [];
    const errors: any[] = [];

    const building = await this.buildingRepository.findOne({
      filter: { _id: bulkData.buildingId, projectId: bulkData.projectId },
      companyId,
    });
    if (!building)
      throw new BadRequestException('Invalid building or project ID');

    for (const unitData of bulkData.units) {
      try {
        const exists = await this.unitRepository.findOne({
          filter: { buildingId: building._id, unitNumber: unitData.unitNumber },
          companyId,
        });
        if (exists) {
          errors.push({
            unitNumber: unitData.unitNumber,
            error: 'Unit number already exists in this building',
          });
          continue;
        }

        const pricePerMeter = unitData.price / unitData.areaSqFt;

        await this.unitRepository.create({
          ...unitData,
          projectId: building.projectId,
          projectName: building.projectName,
          buildingId: building._id,
          buildingName: building.name,
          basePrice: unitData.price,
          pricePerMeter,
          company_id: companyId,
          created_by: userId,
        });

        success.push(unitData.unitNumber);
      } catch (err: any) {
        errors.push({ unitNumber: unitData.unitNumber, error: err.message });
      }
    }

    if (success.length > 0) {
      await this.updateCascadeCounters(building._id, building.projectId);
    }

    return {
      message: 'Bulk import completed',
      importedCount: success.length,
      failedCount: errors.length,
      errors,
    };
  }

  // 🚀 استخدام modelInstance للـ Aggregations المعقدة
  private async updateCascadeCounters(
    buildingId: Types.ObjectId,
    projectId: Types.ObjectId,
  ) {
    const stats = await this.unitRepository.modelInstance.aggregate([
      { $match: { buildingId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          available: {
            $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] },
          },
          reserved: {
            $sum: { $cond: [{ $eq: ['$status', 'reserved'] }, 1, 0] },
          },
          sold: { $sum: { $cond: [{ $eq: ['$status', 'sold'] }, 1, 0] } },
        },
      },
    ]);

    const bStats = stats[0] || { total: 0, available: 0, reserved: 0, sold: 0 };

    await this.buildingRepository.update({
      filter: { _id: buildingId },
      update: {
        $set: {
          totalUnits: bStats.total,
          availableUnits: bStats.available,
          reservedUnits: bStats.reserved,
          soldUnits: bStats.sold,
        },
      },
    });

    const pStats = await this.buildingRepository.modelInstance.aggregate([
      { $match: { projectId } },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalUnits' },
          available: { $sum: '$availableUnits' },
        },
      },
    ]);

    await this.projectRepository.update({
      filter: { _id: projectId },
      update: {
        $set: {
          totalUnits: pStats[0]?.total || 0,
          availableUnits: pStats[0]?.available || 0,
        },
      },
    });
  }
}
