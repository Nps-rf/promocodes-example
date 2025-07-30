.PHONY: help build start stop restart logs clean dev-start dev-stop test docker-build docker-push

# Показать справку
help:
	@echo "Доступные команды:"
	@echo "  build        - Собрать Docker образ"
	@echo "  start        - Запустить все сервисы"
	@echo "  stop         - Остановить все сервисы"
	@echo "  restart      - Перезапустить все сервисы"
	@echo "  logs         - Показать логи"
	@echo "  clean        - Очистить все контейнеры и volumes"
	@echo "  dev-start    - Запустить только БД для разработки"
	@echo "  dev-stop     - Остановить сервисы разработки"
	@echo "  test         - Запустить тесты"
	@echo "  seed         - Создать тестовые данные"
	@echo "  docker-build - Собрать Docker образ"

# Собрать Docker образ
build:
	docker-compose build

# Запустить все сервисы
start:
	docker-compose up -d

# Остановить все сервисы
stop:
	docker-compose down

# Перезапустить все сервисы
restart:
	docker-compose restart

# Показать логи
logs:
	docker-compose logs -f

# Показать логи приложения
logs-app:
	docker-compose logs -f app

# Очистить все контейнеры и volumes
clean:
	docker-compose down -v --remove-orphans
	docker system prune -f

# Запустить только БД для разработки
dev-start:
	docker-compose -f docker-compose.dev.yml up -d

# Остановить сервисы разработки
dev-stop:
	docker-compose -f docker-compose.dev.yml down

# Запустить тесты
test:
	npm test

# Создать тестовые данные
seed:
	npm run seed

# Собрать Docker образ
docker-build:
	docker build -t promocodes-app:latest .

# Запустить приложение в режиме разработки
dev:
	npm run start:dev

# Установить зависимости
install:
	npm install

# Проверить линтером
lint:
	npm run lint

# Собрать приложение
compile:
	npm run build

# Полная сборка и запуск
full-start: docker-build start

# Обновить зависимости
update:
	npm update

# Показать статус контейнеров
status:
	docker-compose ps

# Подключиться к контейнеру приложения
shell:
	docker-compose exec app sh

# Подключиться к PostgreSQL
psql:
	docker-compose exec postgres psql -U postgres -d promocodes_db