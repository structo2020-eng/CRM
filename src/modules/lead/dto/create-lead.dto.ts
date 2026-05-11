import {
  IsArray,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';
import {
  LeadSource,
  PropertyType,
  MoveInTimeframe,
  UrgencyLevel,
} from 'src/DB/enums/lead.enum';

export class CreateLeadDto {
  // --- Step 1: Contact Info ---
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  firstName!: string;

  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  lastName!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string; // تم التعديل

  @IsEmail()
  @IsOptional()
  email?: string; // تم التعديل

  @IsString()
  @IsOptional()
  nationality?: string;

  @IsEnum(LeadSource)
  @IsOptional()
  leadSource?: LeadSource;

  // --- Step 2: Preferences ---
  @IsEnum(PropertyType)
  @IsOptional()
  propertyType?: PropertyType;

  @IsString()
  @IsIn(['buy', 'rent', 'invest']) // الحقل الجديد
  @IsOptional()
  purpose?: string;

  @IsString()
  @IsOptional()
  location?: string; // تم التعديل

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  bedrooms?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  bathrooms?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[]; // تم التعديل

  // --- Step 3: Budget ---
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  minBudget?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxBudget?: number;

  @IsEnum(MoveInTimeframe)
  @IsOptional()
  moveIn?: MoveInTimeframe; // تم التعديل

  @IsEnum(UrgencyLevel)
  @IsOptional()
  urgency?: UrgencyLevel; // تم التعديل

  @IsString()
  @IsOptional()
  notes?: string; // تم التعديل

  // --- Step 4: Assignment ---
  @IsMongoId()
  @IsOptional()
  assigned_agent_id?: Types.ObjectId; // تم التعديل
}
