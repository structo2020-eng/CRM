import {
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsPositive,
} from 'class-validator';
import { Types } from 'mongoose';
import {
  LeadSource,
  LeadStatus,
  PropertyType,
  UrgencyLevel,
} from 'src/DB/enums/lead.enum';
import { Type } from 'class-transformer';

export class FindLeadsDto {
  @IsOptional()
  @IsString()
  k?: string; //كلمة البحث (الاسم الأول، الأخير، أو رقم الهاتف)

  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @IsOptional()
  @IsEnum(LeadSource)
  leadSource?: LeadSource; // تم التعديل لتطابق التسمية الجديدة

  // فلاتر إضافية مبنية على التحديث الجديد
  @IsOptional()
  @IsEnum(PropertyType)
  propertyType?: PropertyType;

  @IsOptional()
  @IsEnum(UrgencyLevel)
  urgencyLevel?: UrgencyLevel;

  @IsOptional()
  @IsMongoId()
  assignedAgent?: Types.ObjectId; // لفلترة عملاء موظف معين

  @IsOptional()
  @IsInt()
  @Min(1)
  @IsPositive()
  @Type(() => Number)
  page?: number;
}
