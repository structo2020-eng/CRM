import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ProjectRepository } from 'src/DB/repositories/project.repository';
import { BuildingRepository } from 'src/DB/repositories/building.repository';
import { UnitRepository } from 'src/DB/repositories/unit.repository';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService {
  archiveProject(arg0: Types.ObjectId, companyId: Types.ObjectId) {
    throw new Error('Method not implemented.');
  }
  getProjectCharts(arg0: Types.ObjectId, companyId: Types.ObjectId) {
    throw new Error('Method not implemented.');
  }
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly buildingRepository: BuildingRepository,
    private readonly unitRepository: UnitRepository,
  ) {}

  async create(
    createProjectDto: CreateProjectDto,
    companyId: Types.ObjectId,
    userId: Types.ObjectId,
  ) {
    return await this.projectRepository.create({
      ...createProjectDto,
      company_id: companyId,
      created_by: userId,
    });
  }

  async findAllProjects(query: any, companyId: Types.ObjectId) {
    const { search, status, page = 1, limit = 50 } = query;
    const filter: any = {};

    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    // 🚀 الاستفادة من الترقيم التلقائي في الـ Abstract
    return await this.projectRepository.findAll({
      filter,
      paginate: { page: Number(page), limit: Number(limit) },
      sort: { createdAt: -1 },
      companyId,
    });
  }

  async findOneProject(projectId: Types.ObjectId, companyId: Types.ObjectId) {
    const project = await this.projectRepository.findOne({
      filter: { _id: projectId },
      companyId,
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async updateProject(
    projectId: Types.ObjectId,
    updateData: UpdateProjectDto,
    companyId: Types.ObjectId,
  ) {
    const project = await this.projectRepository.update({
      filter: { _id: projectId },
      update: { $set: updateData },
      companyId,
    });

    if (!project) throw new NotFoundException('Project not found');

    // تحديث الاسم في المباني والوحدات (نستخدم modelInstance للعمليات المجمعة)
    if (updateData.name) {
      await this.buildingRepository.modelInstance.updateMany(
        { projectId: projectId, company_id: companyId },
        { $set: { projectName: updateData.name } },
      );
      await this.unitRepository.modelInstance.updateMany(
        { projectId: projectId, company_id: companyId },
        { $set: { projectName: updateData.name } },
      );
    }

    return project;
  }

  async deleteProject(projectId: Types.ObjectId, companyId: Types.ObjectId) {
    const project = await this.projectRepository.findOne({
      filter: { _id: projectId },
      companyId,
    });
    if (!project) throw new NotFoundException('Project not found');

    const activeBuildingsCount =
      await this.buildingRepository.modelInstance.countDocuments({
        projectId,
        company_id: companyId,
      });
    const activeUnitsCount =
      await this.unitRepository.modelInstance.countDocuments({
        projectId,
        company_id: companyId,
      });

    if (activeBuildingsCount > 0 || activeUnitsCount > 0) {
      throw new BadRequestException(
        `Cannot delete project. It contains ${activeBuildingsCount} buildings and ${activeUnitsCount} units. You must delete or reassign them first.`,
      );
    }

    return await this.projectRepository.delete(
      { _id: projectId },
      undefined,
      companyId,
    );
  }

  // استخدام modelInstance للـ Aggregation المعقد
  async getDashboardStats(
    projectId: Types.ObjectId,
    companyId: Types.ObjectId,
  ) {
    const stats = await this.unitRepository.modelInstance.aggregate([
      {
        $match: {
          projectId: new Types.ObjectId(projectId),
          company_id: companyId,
        },
      },
      {
        $group: {
          _id: null,
          totalUnits: { $sum: 1 },
          availableUnits: {
            $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] },
          },
          reservedUnits: {
            $sum: { $cond: [{ $eq: ['$status', 'reserved'] }, 1, 0] },
          },
          soldUnits: { $sum: { $cond: [{ $eq: ['$status', 'sold'] }, 1, 0] } },
          blockedUnits: {
            $sum: { $cond: [{ $eq: ['$status', 'blocked'] }, 1, 0] },
          },
          totalInventoryValue: { $sum: '$price' },
          expectedRevenue: {
            $sum: {
              $cond: [{ $in: ['$status', ['sold', 'reserved']] }, '$price', 0],
            },
          },
        },
      },
    ]);

    const result = stats[0] || {
      totalUnits: 0,
      availableUnits: 0,
      reservedUnits: 0,
      soldUnits: 0,
      blockedUnits: 0,
      totalInventoryValue: 0,
      expectedRevenue: 0,
    };
    const occupancyRate =
      result.totalUnits > 0
        ? ((result.soldUnits + result.reservedUnits) / result.totalUnits) * 100
        : 0;
    const availableUnitsRatio =
      result.totalUnits > 0
        ? (result.availableUnits / result.totalUnits) * 100
        : 0;

    return {
      ...result,
      occupancyRate: Math.round(occupancyRate),
      availableUnitsRatio: Math.round(availableUnitsRatio),
    };
  }
}
