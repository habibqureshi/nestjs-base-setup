import { MinLength } from 'class-validator';

export class CreateRoleDto {
  @MinLength(1)
  name: string;
}
