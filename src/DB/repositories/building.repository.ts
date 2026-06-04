import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Building } from '../models/building.model';
import { AbstractRepository } from './abstract.repository';

@Injectable()
export class BuildingRepository extends AbstractRepository<Building> {
  constructor(@InjectModel(Building.name) buildingModel: Model<Building>) {
    super(buildingModel);
  }
}
