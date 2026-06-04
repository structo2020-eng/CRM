import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'audit_logs' })
export class AuditLog extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true, index: true })
  company_id!: Types.ObjectId;

  @Prop({ required: true })
  entityId!: string;

  @Prop({
    required: true,
    enum: ['Project', 'Building', 'Unit', 'Reservation'],
  })
  entityType!: string;

  @Prop({ required: true })
  action!: string;

  @Prop({
    type: [{ field: String, oldValue: String, newValue: String }],
    default: [],
  })
  changes!: any[];

  @Prop({ type: Object, required: true })
  performedBy!: {
    _id: Types.ObjectId;
    name: string;
    email: string;
    role: string;
  };
}

export const AuditLogModel = SchemaFactory.createForClass(AuditLog);
