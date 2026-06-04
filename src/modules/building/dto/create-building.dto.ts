import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBuildingDto {
  @IsMongoId()
  @IsNotEmpty()
  projectId!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9-]+$/, {
    message: 'Building code must be alphanumeric and can contain hyphens',
  })
  buildingCode!: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  totalFloors!: number;
}
