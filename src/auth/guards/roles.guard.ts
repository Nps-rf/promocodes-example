import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, UserRole } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user?.email) {
      return false;
    }

    // Временно для демонстрации - пользователи с email admin@* считаются админами
    // В реальном проекте здесь должна быть проверка роли из токена
    const userRole = user.email.startsWith('admin@') ? UserRole.ADMIN : UserRole.USER;

    return requiredRoles.some((role) => userRole === role);
  }
}