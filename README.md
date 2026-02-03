# APOSTROFE (MVP)

Next.js (App Router) + Supabase (DB/Auth/Storage) + Vercel.

## Что реализовано

- Публичный каталог: `/models` (CARDS/LIST + категории + пагинация) и `/models/[document_id]`
- Marquee под header (получает текст из БД, обновляется polling/focus-refetch)
- Админка: `/admin/login`, guard, роли `admin/editor`, CRUD моделей, загрузка медиа, настройки marquee

## Локальный запуск (pnpm)

```bash
pnpm install
pnpm dev
```

## Supabase: настройка проекта

### 1) Применить схему + RLS

Открой Supabase Dashboard → SQL Editor и выполни SQL из:

- `supabase/migrations/20260201000000_init.sql`

### 2) Auth

- Включи Email/Password auth.
- Создай пользователя (email/password) для админки.

Триггер в миграции автоматически создаёт запись `public.profiles` с ролью `editor`.
Если хочешь сделать пользователя `admin`, выполни в SQL Editor:

```sql
update public.profiles
set role = 'admin'
where id = '<auth.users.id>';
```

### 3) Storage

Миграция создаёт bucket `assets` и политики:
- Read: только для опубликованных ассетов (по `document_id` в пути)
- Write: только для `admin/editor`

Файлы кладутся по структуре:
- `assets/{document_id}/hero/{uuid}.{ext}`
- `assets/{document_id}/gallery/{uuid}.{ext}`

## ENV

Создай `.env.local` по образцу `.env.example`:

```bash
cp .env.example .env.local
```

Нужно заполнить:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (или `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, в текущем MVP не обязателен)

## Роуты

- Публичные: `/models`, `/models/[document_id]`
- Админка: `/admin/login`, `/admin/models`, `/admin/settings/marquee`

## Deploy (Vercel)

В Vercel добавь те же env vars (Preview/Production) и деплой автоматически заработает.
