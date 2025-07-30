import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromocodesService } from './promocodes.service';
import { PromocodesController } from './promocodes.controller';
import { Promocode } from './entities/promocode.entity';
import { PromocodeUsage } from './entities/promocode-usage.entity';
import { Balance } from '../balance/entities/balance.entity';
import { BalanceModule } from '../balance/balance.module';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Promocode, PromocodeUsage, Balance]),
    BalanceModule,
  ],
  controllers: [PromocodesController],
  providers: [PromocodesService, RolesGuard],
  exports: [PromocodesService],
})
export class PromocodesModule {}