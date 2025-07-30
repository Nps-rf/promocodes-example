import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Promocode } from './promocode.entity';
import { BalanceUtil } from '../../common/utils/balance.util';

@Entity('promocode_usages')
// Убираем уникальный индекс для поддержки многоразовых промокодов
// Контроль использования single_use промокодов осуществляется в сервисе
@Index(['userId', 'promocodeId']) // Обычный индекс для быстрого поиска
export class PromocodeUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  promocodeId: string;

  // Храним сумму добавленную к балансу в минорных единицах
  @Column('varchar', { 
    comment: 'Сумма добавленная к балансу в минорных единицах' 
  })
  amountAddedMinorUnits: string;

  @CreateDateColumn()
  usedAt: Date;

  @ManyToOne(() => User, user => user.promocodeUsages)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Promocode, promocode => promocode.usages)
  @JoinColumn({ name: 'promocodeId' })
  promocode: Promocode;

  // Виртуальное поле для работы с суммой как BigInt
  get amountAdded(): bigint {
    return BigInt(this.amountAddedMinorUnits || '0');
  }

  set amountAdded(value: bigint) {
    this.amountAddedMinorUnits = value.toString();
  }

  // Виртуальное поле для отображения суммы в основных единицах
  get displayAmountAdded(): number {
    return BalanceUtil.minorToMajor(this.amountAdded);
  }

  // Метод для форматированного отображения
  get formattedAmountAdded(): string {
    return BalanceUtil.format(this.amountAdded);
  }
}