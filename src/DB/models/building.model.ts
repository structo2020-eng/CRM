import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BuildingStatus } from '../enums/projects.enum';

@Schema({ timestamps: true, collection: 'buildings' })
export class Building extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true, index: true })
  company_id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId!: Types.ObjectId;

  @Prop({ required: true })
  projectName!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true, unique: true })
  buildingCode!: string;

  @Prop({ required: true, min: 1 })
  totalFloors!: number;

  @Prop({ default: 0, min: 0 })
  totalUnits!: number;

  @Prop({ default: 0, min: 0 })
  availableUnits!: number;

  @Prop({ default: 0, min: 0 })
  reservedUnits!: number;

  @Prop({ default: 0, min: 0 })
  soldUnits!: number;

  @Prop({ default: BuildingStatus.PLANNING, enum: BuildingStatus })
  status!: string;

  @Prop({ trim: true, maxlength: 500 })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  created_by!: Types.ObjectId;
}

export const BuildingModel = SchemaFactory.createForClass(Building);
