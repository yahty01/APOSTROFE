# 06. Деплой и эксплуатация

## 1) Что нужно перед деплоем
1. Рабочий Supabase проект (миграции применены).
2. Пользователь с ролью `admin`.
3. Заполненные env в целевой среде.
4. Успешные локальные проверки: `pnpm lint`, `pnpm build`, `pnpm i18n:check`.

## 2) ENV checklist
Обязательные:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (или `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)

Опционально (server-only):
- `SUPABASE_SERVICE_ROLE_KEY`

Правило:
- `NEXT_PUBLIC_*` доступно в браузере.
- `SUPABASE_SERVICE_ROLE_KEY` только сервер.

## 3) Docker
Проект содержит `Dockerfile` на базе `node:20-alpine`.

Локальная проверка контейнера:
```bash
docker build -t apostrofe:local .
docker run --rm -p 3000:3000 --env-file .env.local apostrofe:local
```

## 4) Релизный smoke после деплоя
1. Открывается `/models`.
2. Открывается `/admin/login`.
3. Логин admin работает.
4. Create + publish + media upload работает.
5. Новая запись видна на публичной странице.
6. Смена языка не ломает текущий URL.

## 5) Мониторинг и диагностика
### Что смотреть в первую очередь
1. Логи приложения (500/throw в actions).
2. Supabase logs (Postgres/Auth/Storage).
3. RLS policy miss (ошибки доступа).

### Быстрые проверки
- Проверить роль пользователя:
```sql
select id, role from public.profiles where id = '<auth.users.id>';
```
- Проверить публикацию:
```sql
select document_id, is_published from public.assets order by updated_at desc limit 20;
```

## 6) Эксплуатационные риски
1. Рост объёма Storage из-за крупных медиа.
2. Ручные правки в SQL без миграций.
3. Локализация без обновления второго языка.

## 7) Минимальный runbook при инциденте
1. Зафиксируй симптом и конкретный URL.
2. Повтори локально/на staging.
3. Проверь auth + role.
4. Проверь RLS/policies.
5. Проверь логи server action/route.
6. Сделай hotfix и отдельный postmortem (что именно предотвратит повтор).

