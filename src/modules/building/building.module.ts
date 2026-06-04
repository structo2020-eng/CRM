import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Building, BuildingModel } from 'src/DB/models/building.model';
import { Unit, UnitModel } from 'src/DB/models/unit.model';
import { BuildingRepository } from 'src/DB/repositories/building.repository';
import { UnitRepository } from 'src/DB/repositories/unit.repository';
import { BuildingService } from './building.service';
import { BuildingController } from './building.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Building.name, schema: BuildingModel },
      { name: Unit.name, schema: UnitModel }, //  مطلوب لعملية الحذف الآمن
    ]),
  ],
  controllers: [BuildingController],
  providers: [
    BuildingRepository,
    UnitRepository, //  تسجيل الـ Repository الخاص بالوحدات هنا
    BuildingService,
  ],
  exports: [BuildingService, BuildingRepository],
})
export class BuildingModule {}
