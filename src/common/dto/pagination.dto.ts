import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @MinLength(1)
  @IsString()
  q?: string;
}
