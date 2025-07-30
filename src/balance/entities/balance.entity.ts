import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BalanceUtil } from '../../common/utils/balance.util';

@Entity('balances')
export class Balance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Храним баланс в минорных единицах как строку для совместимости с БД
  @Column('varchar', { 
    default: '0',
    comment: 'Баланс в минорных единицах (например, копейки)' 
  })
  amountMinorUnits: string;

  @Column()
  userId: string;

  @OneToOne(() => User, user => user.balance)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Виртуальное поле для работы с балансом как BigInt
  get amount(): bigint {
    return BigInt(this.amountMinorUnits || '0');
  }

  set amount(value: bigint) {
    this.amountMinorUnits = value.toString();
  }

  // Виртуальное поле для отображения баланса в основных единицах
  get displayAmount(): number {
    return BalanceUtil.minorToMajor(this.amount);
  }

  // Метод для форматированного отображения
  get formattedAmount(): string {
    return BalanceUtil.format(this.amount);
  }
}