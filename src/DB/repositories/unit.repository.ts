import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Unit } from '../models/unit.model';
import { AbstractRepository } from './abstract.repository';

@Injectable()
export class UnitRepository extends AbstractRepository<Unit> {
  constructor(@InjectModel(Unit.name) unitModel: Model<Unit>) {
    super(unitModel);
  }
}
