# Используем официальный Node.js образ
FROM node:18-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем все зависимости (включая dev для сборки)
RUN npm ci && npm cache clean --force

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Продакшн образ
FROM node:18-alpine AS production

# Устанавливаем wget для health check
RUN apk add --no-cache wget

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем только продакшн зависимости
RUN npm ci --only=production && npm cache clean --force

# Копируем собранное приложение из builder стадии
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Переключаемся на пользователя nestjs
USER nestjs

# Открываем порт
EXPOSE 3000

# Команда для запуска приложения
CMD ["node", "dist/main.js"]