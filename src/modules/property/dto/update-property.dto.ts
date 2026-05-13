import { IsOptional, IsString, IsNumber, Min, IsArray } from 'class-validator';

export class UpdatePropertyDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  area?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsString()
  @IsOptional()
  ref?: string;
}
