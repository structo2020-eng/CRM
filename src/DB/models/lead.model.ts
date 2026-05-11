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
  phone!: string; // تم التعديل

  @Prop({ lowercase: true, trim: true })
  email!: string; // تم التعديل

  @Prop({ trim: true })
  nationality!: string;

  @Prop({ type: String })
  leadSource!: string;

  // --- Preferences ---
  @Prop({ type: String })
  propertyType!: string;

  @Prop({ type: String })
  purpose!: string; // الحقل الجديد

  @Prop({ trim: true })
  location!: string; // تم التعديل

  @Prop({ type: Number })
  bedrooms!: number;

  @Prop({ type: Number })
  bathrooms!: number;

  @Prop({ type: [String], default: [] })
  amenities!: string[]; // تم التعديل

  // --- Budget ---
  @Prop({ type: Number })
  minBudget!: number;

  @Prop({ type: Number })
  maxBudget!: number;

  @Prop({ type: String })
  moveIn!: string; // تم التعديل

  @Prop({ type: String })
  urgency!: string; // تم التعديل

  @Prop({ trim: true })
  notes!: string; // تم التعديل

  // --- System & Tracking Data ---
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true, index: true })
  company_id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assigned_agent_id!: Types.ObjectId; // تم التعديل

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  created_by!: Types.ObjectId;

  @Prop({ type: String, default: 'new' })
  status!: string;

  @Prop({ type: String })
  lostReason?: string;

  @Prop({ default: false, index: true })
  isDeleted!: boolean;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);

// تم تحديث الـ Index المركب ليطابق اسم حقل الهاتف الجديد (phone)
LeadSchema.index({ company_id: 1, phone: 1 }, { unique: true });

export const LeadModelName = Lead.name;
