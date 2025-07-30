/**
 * Утилиты для безопасной работы с балансом
 * Все суммы хранятся в минорных единицах (целые числа)
 * Например: 1.00 = 100 минорных единиц
 */

export class BalanceUtil {
  private static readonly MINOR_UNITS_PER_MAJOR = 100;
  private static readonly MAX_BALANCE_VALUE = 9223372036854775807n; // BigInt max value
  private static readonly MIN_BALANCE_VALUE = 0n;

  /**
   * Конвертирует основные единицы в минорные
   * @param majorUnits Сумма в основных единицах (может быть дробной)
   * @returns Сумма в минорных единицах (целое число)
   */
  static majorToMinor(majorUnits: number): bigint {
    if (!Number.isFinite(majorUnits)) {
      throw new Error('Некорректная сумма баланса');
    }

    if (majorUnits < 0) {
      throw new Error('Сумма баланса не может быть отрицательной');
    }

    // Округляем до минорных единиц для избежания проблем с точностью float
    const minorUnits = Math.round(majorUnits * this.MINOR_UNITS_PER_MAJOR);
    const result = BigInt(minorUnits);

    if (result > this.MAX_BALANCE_VALUE) {
      throw new Error('Превышена максимальная сумма баланса');
    }

    return result;
  }

  /**
   * Конвертирует минорные единицы в основные
   * @param minorUnits Сумма в минорных единицах
   * @returns Сумма в основных единицах
   */
  static minorToMajor(minorUnits: bigint): number {
    if (minorUnits < this.MIN_BALANCE_VALUE) {
      throw new Error('Сумма баланса не может быть отрицательной');
    }

    if (minorUnits > this.MAX_BALANCE_VALUE) {
      throw new Error('Превышена максимальная сумма баланса');
    }

    return Number(minorUnits) / this.MINOR_UNITS_PER_MAJOR;
  }

  /**
   * Безопасное сложение сумм баланса
   * @param a Первая сумма в минорных единицах
   * @param b Вторая сумма в минорных единицах
   * @returns Результат сложения в минорных единицах
   */
  static add(a: bigint, b: bigint): bigint {
    const result = a + b;

    if (result > this.MAX_BALANCE_VALUE) {
      throw new Error('Переполнение при сложении сумм баланса');
    }

    return result;
  }

  /**
   * Безопасное вычитание сумм баланса
   * @param a Уменьшаемое в минорных единицах
   * @param b Вычитаемое в минорных единицах
   * @returns Результат вычитания в минорных единицах
   */
  static subtract(a: bigint, b: bigint): bigint {
    if (a < b) {
      throw new Error('Недостаточно средств для выполнения операции');
    }

    return a - b;
  }

  /**
   * Проверяет валидность суммы в основных единицах
   * @param majorUnits Сумма в основных единицах
   * @returns true если сумма валидна
   */
  static isValidMajorUnits(majorUnits: number): boolean {
    try {
      this.majorToMinor(majorUnits);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Проверяет валидность суммы в минорных единицах
   * @param minorUnits Сумма в минорных единицах
   * @returns true если сумма валидна
   */
  static isValidMinorUnits(minorUnits: bigint): boolean {
    return minorUnits >= this.MIN_BALANCE_VALUE && minorUnits <= this.MAX_BALANCE_VALUE;
  }

  /**
   * Форматирует сумму баланса для отображения
   * @param minorUnits Сумма в минорных единицах
   * @returns Отформатированная строка в формате "1234.56"
   */
  static format(minorUnits: bigint): string {
    const majorUnits = this.minorToMajor(minorUnits);
    return majorUnits.toFixed(2);
  }

  /**
   * Парсит строку с суммой баланса
   * @param input Строка вида "1234.56" или "1234,56"
   * @returns Сумма в минорных единицах
   */
  static parse(input: string): bigint {
    const normalized = input.replace(',', '.').trim();
    const majorUnits = parseFloat(normalized);

    if (isNaN(majorUnits)) {
      throw new Error('Некорректный формат суммы баланса');
    }

    return this.majorToMinor(majorUnits);
  }
}
