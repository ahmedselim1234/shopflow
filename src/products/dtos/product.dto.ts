import { PartialType } from '@nestjs/mapped-types';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsString() @IsNotEmpty() name: string;
  @IsInt() @Min(0) priceCents: number;
  @IsInt() @Min(0) stock: number;
}
export class UpdateProductDto extends PartialType(CreateProductDto) {}