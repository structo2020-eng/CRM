import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UnitType } from 'src/DB/enums/projects.enum';

export class CreateUnitDto {
  @IsMongoId()
  @IsNotEmpty()
  projectId!: string;

  @IsMongoId()
  @IsNotEmpty()
  buildingId!: string;

  @IsString()
  @IsNotEmpty()
  unitNumber!: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  floorNumber!: number;

  @IsEnum(UnitType)
  @IsNotEmpty()
  type!: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price!: number;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  areaSqFt!: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  bedrooms?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  bathrooms?: number;

  @IsString()
  @IsOptional()
  view?: string;

  @IsString()
  @IsOptional()
  orientation?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  downPayment?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  installmentYears?: number;

  @IsString()
  @IsOptional()
  description?: string;
}
