import { BuildingModel, Building } from 'src/DB/models/building.model';
import { UnitModel, Unit } from 'src/DB/models/unit.model';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectModel } from 'src/DB/models/project.model';
import { UnitRepository } from 'src/DB/repositories/unit.repository';
import { BuildingRepository } from 'src/DB/repositories/building.repository';
import { ProjectRepository } from 'src/DB/repositories/project.repository';
import { UnitService } from './unit.service';
import { UnitController } from './unit.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Unit.name, schema: UnitModel },
      { name: Building.name, schema: BuildingModel }, // 🚀 لتحديث العدادات
      { name: Project.name, schema: ProjectModel }, // 🚀 لتحديث العدادات
    ]),
  ],
  controllers: [UnitController],
  providers: [
    UnitRepository,
    BuildingRepository, // 🚀 تسجيل الـ Repositories المطلوبة
    ProjectRepository,
    UnitService,
  ],
  exports: [UnitService, UnitRepository],
})
export class UnitModule {}
