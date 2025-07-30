import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Некорректный email адрес' })
  email: string;

  @IsString({ message: 'Пароль должен быть строкой' })
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  password: string;

  @IsOptional()
  @IsString({ message: 'Имя должно быть строкой' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Фамилия должна быть строкой' })
  lastName?: string;
}