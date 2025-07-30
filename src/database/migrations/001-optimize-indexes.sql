-- Оптимизация индексов для масштабируемости

-- Индексы для таблицы users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Индексы для таблицы promocodes
CREATE INDEX IF NOT EXISTS idx_promocodes_code ON promocodes(code);
CREATE INDEX IF NOT EXISTS idx_promocodes_is_active ON promocodes(is_active);
CREATE INDEX IF NOT EXISTS idx_promocodes_expires_at ON promocodes(expires_at);
CREATE INDEX IF NOT EXISTS idx_promocodes_type ON promocodes(type);
CREATE INDEX IF NOT EXISTS idx_promocodes_usage_count ON promocodes(usage_count);

-- Индексы для таблицы promocode_usages
CREATE INDEX IF NOT EXISTS idx_promocode_usages_user_id ON promocode_usages(user_id);
CREATE INDEX IF NOT EXISTS idx_promocode_usages_promocode_id ON promocode_usages(promocode_id);
CREATE INDEX IF NOT EXISTS idx_promocode_usages_used_at ON promocode_usages(used_at);

-- Композитный индекс для быстрой проверки использования промокода пользователем
-- Уже создан в entity, но дублируем для явности
CREATE UNIQUE INDEX IF NOT EXISTS idx_promocode_usages_unique_user_promocode 
ON promocode_usages(user_id, promocode_id);

-- Индексы для таблицы balances
CREATE INDEX IF NOT EXISTS idx_balances_user_id ON balances(user_id);
CREATE INDEX IF NOT EXISTS idx_balances_amount ON balances(amount);

-- Частичные индексы для улучшения производительности
CREATE INDEX IF NOT EXISTS idx_promocodes_active_unexpired 
ON promocodes(code, amount, type) 
WHERE is_active = true AND (expires_at IS NULL OR expires_at > NOW());

-- Индекс для промокодов с лимитом использований
CREATE INDEX IF NOT EXISTS idx_promocodes_with_limit 
ON promocodes(id, usage_count, usage_limit) 
WHERE usage_limit IS NOT NULL;