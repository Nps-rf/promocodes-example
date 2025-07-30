import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PromocodesService } from '../promocodes/promocodes.service';
import { PromocodeType } from '../promocodes/entities/promocode.entity';

async function seedData() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const promocodesService = app.get(PromocodesService);

  console.log('🌱 Создание тестовых промокодов...');

  try {
    // Создаем тестовые промокоды
    const promocodes = [
      {
        code: 'WELCOME100',
        amount: 100,
        type: PromocodeType.SINGLE_USE,
        description: 'Приветственный бонус 100 рублей',
      },
      {
        code: 'SUMMER500',
        amount: 500,
        type: PromocodeType.SINGLE_USE,
        expiresAt: new Date('2024-08-31T23:59:59.000Z').toISOString(),
        usageLimit: 50,
        description: 'Летняя акция - 500 рублей до 31 августа',
      },
      {
        code: 'REPEAT50',
        amount: 50,
        type: PromocodeType.MULTIPLE_USE,
        description: 'Многоразовый промокод на 50 рублей',
      },
      {
        code: 'LIMITED10',
        amount: 1000,
        type: PromocodeType.SINGLE_USE,
        usageLimit: 10,
        description: 'Ограниченный промокод на 1000 рублей (только 10 активаций)',
      },
      {
        code: 'EXPIRED',
        amount: 200,
        type: PromocodeType.SINGLE_USE,
        expiresAt: new Date('2023-12-31T23:59:59.000Z').toISOString(),
        description: 'Истекший промокод для тестирования',
      },
    ];

    for (const promocodeData of promocodes) {
      try {
        const promocode = await promocodesService.create(promocodeData);
        console.log(`✅ Создан промокод: ${promocode.code}`);
      } catch {
        console.log(`⚠️  Промокод ${promocodeData.code} уже существует`);
      }
    }

    console.log('\n🎉 Создание тестовых данных завершено!');
    console.log('\nДоступные промокоды для тестирования:');
    console.log('- WELCOME100 (100₽, одноразовый)');
    console.log('- SUMMER500 (500₽, одноразовый, истекает 31.08.2024, лимит 50)');
    console.log('- REPEAT50 (50₽, многоразовый)');
    console.log('- LIMITED10 (1000₽, одноразовый, лимит 10 активаций)');
    console.log('- EXPIRED (200₽, истекший, для тестирования ошибок)');
  } catch (error) {
    console.error('❌ Ошибка при создании тестовых данных:', error);
  } finally {
    await app.close();
  }
}

seedData();
