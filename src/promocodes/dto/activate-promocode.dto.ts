import { IsString } from 'class-validator';

export class ActivatePromocodeDto {
  @IsString({ message: 'Код промокода должен быть строкой' })
  code: string;
}
