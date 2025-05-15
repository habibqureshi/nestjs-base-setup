import { IsOptional, IsString, MinLength } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class FilterRoleDto extends PaginationDto {
  @IsOptional()
  @MinLength(1)
  @IsString()
  name?: string;
}
