import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectStatus } from 'src/DB/enums/projects.enum';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name!: string;

  @IsString()
  @IsNotEmpty()
  location!: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  totalBuildings!: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  budget!: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  developer?: string;

  @IsOptional()
  startDate?: Date;

  @IsOptional()
  expectedDelivery?: Date;
}
