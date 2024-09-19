import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  IsEmail,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  name: string;

  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  password: string;

  roles: Array<string>;
}
