import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { UserRole } from '../auth/decorators/roles.decorator';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';

async function createAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const dataSource = app.get(DataSource);

  console.log('🔧 Создание администратора...');

  try {
    // Создаем админа
    const adminData = {
      email: 'admin@example.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
    };

    let admin;
    try {
      admin = await usersService.create(adminData);
      console.log(`✅ Создан администратор: ${admin.email}`);
    } catch {
      console.log(`⚠️  Администратор уже существует, обновляем роль...`);

      // Если пользователь уже существует, обновляем его роль
      const userRepository = dataSource.getRepository(User);
      admin = await userRepository.findOne({
        where: { email: adminData.email },
      });

      if (admin) {
        admin.role = UserRole.ADMIN;
        await userRepository.save(admin);
        console.log(`✅ Роль администратора обновлена для: ${admin.email}`);
      }
    }

    console.log('\n🎉 Администратор готов!');
    console.log('\nДанные для входа:');
    console.log(`Email: ${adminData.email}`);
    console.log(`Password: ${adminData.password}`);
    console.log('\nДоступные админские операции:');
    console.log('- POST /promocodes - создание промокодов');
    console.log('- GET /promocodes/:id/usages - просмотр истории активаций');
    console.log('- PATCH /promocodes/:id/deactivate - деактивация промокодов');
  } catch (error) {
    console.error('❌ Ошибка при создании администратора:', error);
  } finally {
    await app.close();
  }
}

createAdmin();
