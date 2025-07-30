import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  IsPositive,
  Min,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PromocodeType } from '../entities/promocode.entity';
import { BalanceUtil } from '../../common/utils/balance.util';

@ValidatorConstraint({ name: 'validBalance', async: false })
export class ValidBalanceConstraint implements ValidatorConstraintInterface {
  validate(amount: number, _args: ValidationArguments) {
    return BalanceUtil.isValidMajorUnits(amount);
  }

  defaultMessage(_args: ValidationArguments) {
    return 'Некорректная сумма. Сумма должна быть положительной и не превышать максимально допустимое значение';
  }
}

export class CreatePromocodeDto {
  @IsString({ message: 'Код промокода должен быть строкой' })
  code: string;

  @IsNumber({}, { message: 'Сумма должна быть числом' })
  @IsPositive({ message: 'Сумма должна быть положительной' })
  @Validate(ValidBalanceConstraint)
  amount: number;

  @IsOptional()
  @IsEnum(PromocodeType, { message: 'Неверный тип промокода' })
  type?: PromocodeType;

  @IsOptional()
  @IsDateString({}, { message: 'Неверный формат даты окончания' })
  expiresAt?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Лимит использований должен быть числом' })
  @Min(1, { message: 'Лимит использований должен быть больше 0' })
  usageLimit?: number;

  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  description?: string;
}
