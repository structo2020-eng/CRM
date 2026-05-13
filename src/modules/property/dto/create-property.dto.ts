import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateIf,
} from 'class-validator';
import { PropertyType, Purpose } from 'src/DB/enums/lead.enum';
import { PropertyStatus } from 'src/DB/enums/property.enum';

export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  // 🚀 إضافة حقل الـ ref
  @IsString()
  @IsOptional()
  ref?: string;

  // 🚀 توحيد الاسم ليطابق الفرونت إند
  @IsEnum(PropertyType)
  @IsNotEmpty()
  propertyType!: PropertyType;

  @IsEnum(Purpose)
  @IsNotEmpty()
  purpose!: Purpose;

  @IsEnum(PropertyStatus)
  @IsOptional()
  status?: PropertyStatus;

  @IsNumber()
  @Min(0)
  @Type(() => Number) // مهم جداً لأن form-data ترسل الأرقام كنصوص
  price!: number;

  // 🚀 توحيد الاسم ليطابق الفرونت إند
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  area!: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  bedrooms?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  bathrooms?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  floor?: number;

  // 🚀 توحيد الاسم ليطابق الفرونت إند (دمجنا المدينة والمنطقة في حقل واحد)
  @IsString()
  @IsNotEmpty()
  location!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  amenities?: string[] | string;

  @ValidateIf((object, value) => value !== '')
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Please provide a valid URL for the video' })
  videoUrl?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  latitude?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  longitude?: number;
}
