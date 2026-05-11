import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { CompanyModelName } from './company.model';
import { UserModelName } from './user.model';
import { PropertyType, Purpose } from '../enums/lead.enum';
import { PropertyStatus } from '../enums/property.enum';
import type { Image } from 'src/common/types/image.type';

@Schema({ timestamps: true })
export class Property {
  @Prop({ type: Types.ObjectId, ref: CompanyModelName, required: true })
  company_id!: Types.ObjectId;

  @Prop({ type: String, required: true })
  title!: string;

  // 🚀 إضافة حقل الـ ref (يفضل أن يكون unique داخل نفس الشركة لو أمكن)
  @Prop({ type: String })
  ref?: string;

  // 🚀 توحيد الاسم
  @Prop({ type: String, enum: PropertyType, required: true })
  propertyType!: PropertyType;

  @Prop({ type: String, enum: Purpose, required: true })
  purpose!: Purpose;

  @Prop({
    type: String,
    enum: PropertyStatus,
    default: PropertyStatus.available,
  })
  status!: PropertyStatus;

  @Prop({ type: Number, required: true })
  price!: number;

  // 🚀 توحيد الاسم
  @Prop({ type: Number, required: true })
  area!: number;

  @Prop({ type: Number })
  bedrooms?: number;

  @Prop({ type: Number })
  bathrooms?: number;

  @Prop({ type: Number })
  floor?: number;

  @Prop({ type: [String], default: [] })
  amenities!: string[];

  // 🚀 توحيد الاسم ليكون location فقط
  @Prop({ type: String, required: true })
  location!: string;

  @Prop({ type: Number })
  latitude?: number;

  @Prop({ type: Number })
  longitude?: number;

  // --- الميديا (يتم التعامل معها عبر الـ Interceptor والـ Service) ---
  @Prop({ type: [{ secure_url: String, public_id: String }], default: [] })
  media!: Image[];

  @Prop({ type: { secure_url: String, public_id: String } })
  floorPlan?: Image;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: UserModelName, required: true })
  listedByAgent!: Types.ObjectId;

  @Prop({ type: String })
  videoUrl?: string;
}

export const PropertySchema = SchemaFactory.createForClass(Property);

export const PropertyModelName = Property.name;
export const PropertyModel = MongooseModule.forFeature([
  { name: PropertyModelName, schema: PropertySchema },
]);
export type PropertyDocument = HydratedDocument<Property>;
