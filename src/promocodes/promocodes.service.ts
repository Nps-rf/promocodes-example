import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Promocode, PromocodeType } from './entities/promocode.entity';
import { PromocodeUsage } from './entities/promocode-usage.entity';
import { BalanceService } from '../balance/balance.service';
import { CreatePromocodeDto } from './dto/create-promocode.dto';
import { ActivatePromocodeDto } from './dto/activate-promocode.dto';
import { BalanceUtil } from '../common/utils/balance.util';

@Injectable()
export class PromocodesService {
  constructor(
    @InjectRepository(Promocode)
    private promocodeRepository: Repository<Promocode>,
    @InjectRepository(PromocodeUsage)
    private promocodeUsageRepository: Repository<PromocodeUsage>,
    private balanceService: BalanceService,
    private dataSource: DataSource,
  ) {}

  async create(createPromocodeDto: CreatePromocodeDto): Promise<Promocode> {
    const existingPromocode = await this.promocodeRepository.findOne({
      where: { code: createPromocodeDto.code },
    });

    if (existingPromocode) {
      throw new ConflictException('Промокод с таким кодом уже существует');
    }

    // Конвертируем сумму в минорные единицы
    const amountMinor = BalanceUtil.majorToMinor(createPromocodeDto.amount);

    const promocode = this.promocodeRepository.create({
      code: createPromocodeDto.code,
      amountMinorUnits: amountMinor.toString(),
      type: createPromocodeDto.type || PromocodeType.SINGLE_USE,
      expiresAt: createPromocodeDto.expiresAt ? new Date(createPromocodeDto.expiresAt) : null,
      usageLimit: createPromocodeDto.usageLimit,
      description: createPromocodeDto.description,
    });

    return this.promocodeRepository.save(promocode);
  }

  async findAll(): Promise<Promocode[]> {
    return this.promocodeRepository.find({
      relations: ['usages'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByCode(code: string): Promise<Promocode> {
    const promocode = await this.promocodeRepository.findOne({
      where: { code },
      relations: ['usages'],
    });

    if (!promocode) {
      throw new NotFoundException('Промокод не найден');
    }

    return promocode;
  }

  async activate(userId: string, activatePromocodeDto: ActivatePromocodeDto) {
    const { code } = activatePromocodeDto;

    // Находим промокод
    const promocode = await this.promocodeRepository.findOne({
      where: { code },
    });

    if (!promocode) {
      throw new NotFoundException('Промокод не найден');
    }

    // Проверяем активность промокода
    if (!promocode.isActive) {
      throw new BadRequestException('Промокод неактивен');
    }

    // Проверяем срок действия
    if (promocode.expiresAt && new Date() > promocode.expiresAt) {
      throw new BadRequestException('Срок действия промокода истек');
    }

    // Проверяем лимит использований
    if (promocode.usageLimit && promocode.usageCount >= promocode.usageLimit) {
      throw new BadRequestException('Достигнут лимит использований промокода');
    }

    // Проверяем, использовал ли пользователь этот промокод ранее
    if (promocode.type === PromocodeType.SINGLE_USE) {
      const existingUsage = await this.promocodeUsageRepository.findOne({
        where: {
          userId,
          promocodeId: promocode.id,
        },
      });

      if (existingUsage) {
        throw new ConflictException('Вы уже использовали этот промокод');
      }
    }

    const amountMinor = BigInt(promocode.amountMinorUnits);
    const amountMajor = Number(amountMinor) / 100; // Делим на 100 для получения основных единиц
    
    const updatedBalance = await this.balanceService.addToBalance(userId, amountMajor);

    const usage = this.promocodeUsageRepository.create({
      userId,
      promocodeId: promocode.id,
      amountAddedMinorUnits: promocode.amountMinorUnits,
    });

    const savedUsage = await this.promocodeUsageRepository.save(usage);

    promocode.usageCount++;
    await this.promocodeRepository.save(promocode);

    return {
      message: 'Промокод успешно активирован',
      amountAddedMinorUnits: promocode.amountMinorUnits,
      newBalanceMinorUnits: updatedBalance.amountMinorUnits,
      promocodeId: promocode.id,
      usageId: savedUsage.id,
    };
  }

  async getUserUsages(userId: string): Promise<PromocodeUsage[]> {
    return this.promocodeUsageRepository.find({
      where: { userId },
      relations: ['promocode'],
      order: { usedAt: 'DESC' },
    });
  }

  async getPromocodeUsages(promocodeId: string): Promise<PromocodeUsage[]> {
    return this.promocodeUsageRepository.find({
      where: { promocodeId },
      relations: ['user'],
      order: { usedAt: 'DESC' },
    });
  }

  async deactivate(id: string): Promise<Promocode> {
    const promocode = await this.promocodeRepository.findOne({
      where: { id },
    });

    if (!promocode) {
      throw new NotFoundException('Промокод не найден');
    }

    promocode.isActive = false;
    return this.promocodeRepository.save(promocode);
  }
}