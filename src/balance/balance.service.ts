import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Balance } from './entities/balance.entity';
import { BalanceUtil } from '../common/utils/balance.util';

@Injectable()
export class BalanceService {
  constructor(
    @InjectRepository(Balance)
    private balanceRepository: Repository<Balance>,
    private dataSource: DataSource,
  ) {}

  /**
   * Добавляет сумму к балансу пользователя
   * @param userId ID пользователя
   * @param amountMajor Сумма в основных единицах
   * @returns Обновленный баланс
   */
  async addToBalance(userId: string, amountMajor: number): Promise<Balance> {
    // Валидируем входную сумму
    if (!BalanceUtil.isValidMajorUnits(amountMajor)) {
      throw new BadRequestException('Некорректная сумма для добавления к балансу');
    }

    const amountMinor = BalanceUtil.majorToMinor(amountMajor);

    return this.dataSource.transaction(async (manager) => {
      let balance = await manager.findOne(Balance, {
        where: { userId },
        lock: { mode: 'pessimistic_write' }, // Блокируем строку для предотвращения race conditions
      });

      if (!balance) {
        // Создаем баланс если его нет
        balance = manager.create(Balance, {
          userId,
          amountMinorUnits: '0',
        });
      }

      // Безопасное сложение с проверкой переполнения
      const newAmount = BalanceUtil.add(balance.amount, amountMinor);
      balance.amount = newAmount;

      return manager.save(balance);
    });
  }

  /**
   * Получает баланс пользователя
   * @param userId ID пользователя
   * @returns Баланс пользователя
   */
  async getBalance(userId: string): Promise<Balance> {
    const balance = await this.balanceRepository.findOne({
      where: { userId },
    });

    if (!balance) {
      throw new NotFoundException('Баланс не найден');
    }

    return balance;
  }

  /**
   * Вычитает сумму из баланса пользователя
   * @param userId ID пользователя
   * @param amountMajor Сумма в основных единицах
   * @returns Обновленный баланс
   */
  async subtractFromBalance(userId: string, amountMajor: number): Promise<Balance> {
    // Валидируем входную сумму
    if (!BalanceUtil.isValidMajorUnits(amountMajor)) {
      throw new BadRequestException('Некорректная сумма для списания с баланса');
    }

    const amountMinor = BalanceUtil.majorToMinor(amountMajor);

    return this.dataSource.transaction(async (manager) => {
      const balance = await manager.findOne(Balance, {
        where: { userId },
        lock: { mode: 'pessimistic_write' }, // Блокируем строку
      });

      if (!balance) {
        throw new NotFoundException('Баланс не найден');
      }

      // Безопасное вычитание с проверкой достаточности средств
      const newAmount = BalanceUtil.subtract(balance.amount, amountMinor);
      balance.amount = newAmount;

      return manager.save(balance);
    });
  }

  /**
   * Создает баланс для нового пользователя
   * @param userId ID пользователя
   * @returns Созданный баланс
   */
  async createBalance(userId: string): Promise<Balance> {
    const balance = this.balanceRepository.create({
      userId,
      amountMinorUnits: '0',
    });

    return this.balanceRepository.save(balance);
  }

  /**
   * Проверяет достаточность средств на балансе
   * @param userId ID пользователя
   * @param amountMajor Требуемая сумма в основных единицах
   * @returns true если средств достаточно
   */
  async hasSufficientFunds(userId: string, amountMajor: number): Promise<boolean> {
    try {
      const balance = await this.getBalance(userId);
      const requiredAmount = BalanceUtil.majorToMinor(amountMajor);
      return balance.amount >= requiredAmount;
    } catch {
      return false;
    }
  }
}