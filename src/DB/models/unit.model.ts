import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  UnitType,
  UnitStatus,
  ReservationStatus,
} from '../enums/projects.enum';

@Schema({ timestamps: true, collection: 'units' })
export class Unit extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true, index: true })
  company_id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId!: Types.ObjectId;

  @Prop({ required: true })
  projectName!: string;

  @Prop({ type: Types.ObjectId, ref: 'Building', required: true })
  buildingId!: Types.ObjectId;

  @Prop({ required: true })
  buildingName!: string;

  @Prop({ required: true })
  unitNumber!: string;

  @Prop({ required: true, min: 1 })
  floorNumber!: number;

  @Prop({ required: true, enum: UnitType })
  type!: string;

  @Prop({ default: UnitStatus.AVAILABLE, enum: UnitStatus })
  status!: string;

  @Prop({ required: true, min: 0 })
  price!: number;

  @Prop({ default: 1, min: 0 })
  bedrooms!: number;

  @Prop({ default: 1, min: 0 })
  bathrooms!: number;

  @Prop({ required: true, min: 1 })
  areaSqFt!: number;

  @Prop({ min: 0 }) gardenAreaSqFt?: number;
  @Prop({ min: 0 }) roofAreaSqFt?: number;
  @Prop() view?: string;
  @Prop() orientation?: string;
  @Prop({ min: 0 }) downPayment?: number;
  @Prop({ min: 0 }) installmentYears?: number;
  @Prop() description?: string;

  @Prop() reservationNumber?: string;
  @Prop() reservationDate?: Date;
  @Prop() reservationExpiryDate?: Date;
  @Prop({ enum: ReservationStatus }) reservationStatus?: string;
  @Prop({ type: Types.ObjectId, ref: 'Lead' })
  reservedByLeadId?: Types.ObjectId;
  @Prop() reservedByLeadName?: string;
  @Prop({ type: Types.ObjectId, ref: 'User' }) assignedAgentId?: Types.ObjectId;
  @Prop() assignedAgentName?: string;

  @Prop({ required: true }) basePrice!: number;
  @Prop({ required: true }) pricePerMeter!: number;
  @Prop() promoOffers?: string;

  @Prop({
    type: [{ label: String, percentage: Number, amount: Number }],
    default: [],
  })
  discounts!: any[];

  @Prop({
    type: [
      { date: Date, basePrice: Number, eventName: String, performedBy: String },
    ],
    default: [],
  })
  priceHistory!: any[];

  @Prop({
    type: [
      {
        _id: Types.ObjectId,
        name: String,
        type: { type: String },
        fileUrl: String,
        size: String,
        createdAt: Date,
      },
    ],
    default: [],
  })
  documents!: any[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  created_by!: Types.ObjectId;
}

export const UnitModel = SchemaFactory.createForClass(Unit);
