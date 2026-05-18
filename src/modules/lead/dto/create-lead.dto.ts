import {
  IsArray,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLeadDto {
  // --- Contact Info ---
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  // --- Preferences ---
  @IsString()
  @IsNotEmpty()
  propertyType!: string;

  @IsString()
  @IsIn(['buy', 'rent', 'invest'])
  @IsNotEmpty()
  purpose!: string;

  @IsString()
  @IsOptional()
  preferredLocation?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  bedroomsNeeded?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  bathroomsNeeded?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  areaMin?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  areaMax?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenitiesNeeded?: string[];

  // --- Budget ---
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  minBudget!: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  maxBudget!: number;

  // --- Meta Data ---
  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  urgencyLevel?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  status?: string;

  // --- System ---
  @IsMongoId()
  @IsOptional()
  assigned_agent_id?: string;
}
