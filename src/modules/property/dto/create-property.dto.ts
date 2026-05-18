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

  @IsString()
  @IsOptional()
  ref?: string;

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
  @Type(() => Number)
  price!: number;

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

  // 🚀 التعديل: إجبار إرسال المحافظة والمدينة
  @IsString()
  @IsNotEmpty()
  governorate!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsOptional()
  fullAddress?: string;

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
