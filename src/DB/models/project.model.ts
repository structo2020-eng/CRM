import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ProjectStatus } from '../enums/projects.enum';

@Schema({ timestamps: true, collection: 'projects' })
export class Project extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true, index: true })
  company_id!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true })
  location!: string;

  @Prop({ default: ProjectStatus.PLANNING, enum: ProjectStatus })
  status!: string;

  @Prop({ required: true, min: 1 })
  totalBuildings!: number;

  @Prop({ default: 0, min: 0 })
  totalUnits!: number;

  @Prop({ default: 0, min: 0 })
  availableUnits!: number;

  @Prop({ default: 0, min: 0, max: 100 })
  completionRate!: number;

  @Prop({ required: true, min: 0 })
  budget!: number;

  @Prop({ trim: true, maxlength: 1000 })
  description?: string;

  @Prop()
  imageUrl?: string;

  @Prop()
  developer?: string;

  @Prop()
  startDate?: Date;

  @Prop()
  expectedDelivery?: Date;

  @Prop({ type: [String], default: [] })
  amenities!: string[];

  @Prop({ type: [String], default: [] })
  gallery!: string[];

  @Prop()
  masterPlanImage?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  created_by!: Types.ObjectId;
}

export const ProjectModel = SchemaFactory.createForClass(Project);
