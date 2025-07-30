import { Controller, Get, Post, Body, Param, UseGuards, Req, Patch } from '@nestjs/common';
import { PromocodesService } from './promocodes.service';
import { CreatePromocodeDto } from './dto/create-promocode.dto';
import { ActivatePromocodeDto } from './dto/activate-promocode.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';

@Controller('promocodes')
export class PromocodesController {
  constructor(private readonly promocodesService: PromocodesService) {}

  // Создание промокода - только для админов
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() createPromocodeDto: CreatePromocodeDto) {
    return this.promocodesService.create(createPromocodeDto);
  }

  // Просмотр списка промокодов - для авторизованных пользователей
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.promocodesService.findAll();
  }

  // Получение информации о промокоде - для авторизованных пользователей
  @UseGuards(JwtAuthGuard)
  @Get(':code')
  async findByCode(@Param('code') code: string) {
    return this.promocodesService.findByCode(code);
  }

  // Активация промокода - для авторизованных пользователей
  @UseGuards(JwtAuthGuard)
  @Post('activate')
  async activate(@Req() req, @Body() activatePromocodeDto: ActivatePromocodeDto) {
    try {
      return this.promocodesService.activate(req.user.id, activatePromocodeDto);
    } catch (error) {
      console.error('Ошибка активации промокода:', error);
      throw error;
    }
  }

  // Простой тест эндпоинт
  @UseGuards(JwtAuthGuard)
  @Post('test')
  async test(@Req() req) {
    return {
      message: 'Тест успешен',
      userId: req.user.id,
      timestamp: new Date(),
    };
  }

  // История активаций пользователя - для авторизованных пользователей
  @UseGuards(JwtAuthGuard)
  @Get('my/usages')
  async getMyUsages(@Req() req) {
    return this.promocodesService.getUserUsages(req.user.id);
  }

  // История активаций промокода - только для админов (конфиденциальная информация)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get(':id/usages')
  async getPromocodeUsages(@Param('id') id: string) {
    return this.promocodesService.getPromocodeUsages(id);
  }

  // Деактивация промокода - только для админов
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/deactivate')
  async deactivate(@Param('id') id: string) {
    return this.promocodesService.deactivate(id);
  }
}