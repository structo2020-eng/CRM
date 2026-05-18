import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'leads' })
export class Lead extends Document {
  // --- Contact Info ---
  @Prop({ required: true, trim: true })
  firstName!: string;

  @Prop({ required: true, trim: true })
  lastName!: string;

  @Prop({ required: true, trim: true })
  phone!: string;

  @Prop({ lowercase: true, trim: true })
  email?: string;

  // --- Preferences ---
  @Prop({ required: true, type: String })
  propertyType!: string;

  @Prop({ required: true, type: String })
  purpose!: string;

  @Prop({ trim: true })
  preferredLocation?: string;

  @Prop({ type: Number })
  bedroomsNeeded?: number;

  @Prop({ type: Number })
  bathroomsNeeded?: number;

  @Prop({ type: Number })
  areaMin?: number;

  @Prop({ type: Number })
  areaMax?: number;

  @Prop({ type: [String], default: [] })
  amenitiesNeeded?: string[];

  // --- Budget ---
  @Prop({ required: true, type: Number })
  minBudget!: number;

  @Prop({ required: true, type: Number })
  maxBudget!: number;

  // --- Meta Data ---
  @Prop({ type: String })
  source?: string;

  @Prop({ type: String })
  urgencyLevel?: string;

  @Prop({ trim: true })
  notes?: string;

  // --- System & Tracking Data ---
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true, index: true })
  company_id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assigned_agent_id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  created_by!: Types.ObjectId;

  @Prop({ type: String, default: 'new' })
  status?: string;

  @Prop({ type: String })
  lostReason?: string;

  @Prop({ default: false, index: true })
  isDeleted!: boolean;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);

LeadSchema.index({ company_id: 1, phone: 1 }, { unique: true });

export const LeadModelName = Lead.name;
