import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { PromocodeUsage } from './promocode-usage.entity';
import { BalanceUtil } from '../../common/utils/balance.util';

export enum PromocodeType {
  SINGLE_USE = 'single_use',
  MULTIPLE_USE = 'multiple_use',
}

@Entity('promocodes')
export class Promocode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  // Храним сумму промокода в минорных единицах
  @Column('varchar', {
    comment: 'Сумма промокода в минорных единицах',
  })
  amountMinorUnits: string;

  @Column({
    type: 'enum',
    enum: PromocodeType,
    default: PromocodeType.SINGLE_USE,
  })
  type: PromocodeType;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ nullable: true })
  usageLimit?: number;

  @Column({ default: 0 })
  usageCount: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => PromocodeUsage, usage => usage.promocode)
  usages: PromocodeUsage[];

  // Виртуальное поле для работы с суммой как BigInt
  get amount(): bigint {
    return BigInt(this.amountMinorUnits || '0');
  }

  set amount(value: bigint) {
    this.amountMinorUnits = value.toString();
  }

  // Виртуальное поле для отображения суммы в основных единицах
  get displayAmount(): number {
    return BalanceUtil.minorToMajor(this.amount);
  }

  // Метод для форматированного отображения
  get formattedAmount(): string {
    return BalanceUtil.format(this.amount);
  }
}
