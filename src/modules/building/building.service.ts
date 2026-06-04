import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { BuildingRepository } from 'src/DB/repositories/building.repository';
import { UnitRepository } from 'src/DB/repositories/unit.repository';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';

@Injectable()
export class BuildingService {
  constructor(
    private readonly buildingRepository: BuildingRepository,
    private readonly unitRepository: UnitRepository,
  ) {}

  async create(
    createBuildingDto: CreateBuildingDto,
    companyId: Types.ObjectId,
    userId: Types.ObjectId,
  ) {
    return await this.buildingRepository.create({
      ...createBuildingDto,
      company_id: companyId,
      created_by: userId,
      projectName: 'Placeholder', // في البيئة الحقيقية يمكن جلب اسم المشروع هنا من الـ ProjectRepository
    });
  }

  async findAllBuildings(query: any, companyId: Types.ObjectId) {
    const { projectId, status, search, page = 1, limit = 50 } = query;
    const filter: any = {};

    if (projectId) filter.projectId = new Types.ObjectId(projectId);
    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { buildingCode: { $regex: search, $options: 'i' } },
      ];
    }

    return await this.buildingRepository.findAll({
      filter,
      paginate: { page: Number(page), limit: Number(limit) },
      sort: { createdAt: -1 },
      companyId,
    });
  }

  async updateBuilding(
    buildingId: Types.ObjectId,
    updateData: UpdateBuildingDto,
    companyId: Types.ObjectId,
  ) {
    const building = await this.buildingRepository.update({
      filter: { _id: buildingId },
      update: { $set: updateData },
      companyId,
    });

    if (!building) throw new NotFoundException('Building not found');

    // 🚀 Denormalization باستخدام modelInstance للـ Bulk Update
    if (updateData.name) {
      await this.unitRepository.modelInstance.updateMany(
        { buildingId: buildingId, company_id: companyId },
        { $set: { buildingName: updateData.name } },
      );
    }
    return building;
  }

  async deleteBuilding(buildingId: Types.ObjectId, companyId: Types.ObjectId) {
    const building = await this.buildingRepository.findOne({
      filter: { _id: buildingId },
      companyId,
    });
    if (!building) throw new NotFoundException('Building not found');

    const unitsCount = await this.unitRepository.modelInstance.countDocuments({
      buildingId: buildingId,
      company_id: companyId,
    });

    if (unitsCount > 0) {
      throw new BadRequestException(
        `Cannot delete building '${building.name}'. It currently houses ${unitsCount} units. Please delete or reassign them first.`,
      );
    }

    // 🚀 لاحظ طريقة استدعاء دالة الـ delete الخاصة بالـ Abstract
    return await this.buildingRepository.delete(
      { _id: buildingId },
      undefined,
      companyId,
    );
  }
}
