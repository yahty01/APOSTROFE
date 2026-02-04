# 03 — Подключение Supabase (DB/Auth/Storage) + миграции

Этот проект использует Supabase для:
- Postgres (таблицы `assets`, `asset_media`, `profiles`, `settings_marquee`)
- Auth (email/password для админки)
- Storage (bucket `assets` для hero/gallery)

## 0) Создать Supabase проект

1) Supabase Dashboard → **New project**
2) Выбери организацию, имя проекта и регион
3) Задай пароль к базе (сохрани его в менеджер секретов)

## 1) Взять URL и ключи (нужно для Next.js и Timeweb)

Supabase Dashboard → Project Settings → **API**:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon/public` или `publishable` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY` *(или `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)*

Локально (пример):

```bash
cp .env.example .env.local
```

Заполни в `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=... # опционально и только сервер
```

## 2) Применить схему/политики (миграции)

В репозитории миграции лежат в `supabase/migrations/`.

### Вариант A (быстро для MVP): через SQL Editor

1) Supabase Dashboard → **SQL Editor**
2) Открой файл `supabase/migrations/20260201000000_init.sql`
3) Вставь SQL и выполни
4) (Если нужно) выполни остальные миграции по порядку

Плюс: быстро.
Минус: легко забыть, что именно и где применялось.

### Вариант B (лучше для CI/CD): через Supabase CLI

Цель — чтобы миграции применялись одинаково локально/в CI/на облаке.

1) Инициализируй Supabase в репозитории (создаст конфиг):

```bash
supabase init
```

2) Авторизуйся и привяжи репозиторий к проекту:

```bash
supabase login
supabase link --project-ref <PROJECT_REF>
```

`PROJECT_REF` — это часть URL проекта в Supabase Dashboard (в адресе вида `https://supabase.com/dashboard/project/<project-ref>`).

3) Применить миграции в облако:

```bash
supabase db push
```

## 3) Auth: включить email/password и создать пользователя

1) Supabase Dashboard → **Authentication** → Providers
2) Включи **Email** (Email/Password)
3) Создай пользователя для админки (email/password)

В миграции есть триггер, который создаёт `public.profiles` для нового пользователя.
Чтобы сделать пользователя `admin`, выполни в SQL Editor:

```sql
update public.profiles
set role = 'admin'
where id = '<auth.users.id>';
```

## 4) Auth: Site URL и Redirect URLs (важно для продакшена)

Даже если сейчас только email/password, лучше сразу выставить корректные URL, чтобы не “сломались” письма/редиректы при расширении логина (magic link/OAuth).

1) Supabase Dashboard → Authentication → URL Configuration
2) Укажи:
   - **Site URL**: `https://<твой-домен>`
   - **Redirect URLs**: добавь
     - `http://localhost:3000`
     - `https://<технический-домен-timeweb>.timeweb.cloud` (если используешь технический домен)
     - `https://<твой-домен>` (production)

## 5) Storage: bucket и политики

Миграция создаёт bucket `assets` и политики, чтобы:
- публично читались только медиа опубликованных ассетов
- писать/удалять могли только роли `admin/editor`

Проверка:
1) Supabase Dashboard → Storage → `assets`
2) Попробуй загрузить файл через админку проекта:
   - `/admin/models` → создать модель → загрузить hero/gallery

## 6) SSR и cookies (важно для админки)

Проект использует `@supabase/ssr` и серверные cookies для сессии.
Ключевой момент: **обновление сессии должно происходить на уровне request middleware/proxy**, иначе cookies могут не обновляться в Server Components.

В Next.js 16 можно использовать `proxy.ts` (Node.js runtime) вместо `middleware.ts` (Edge runtime).
В этом репозитории уже есть `src/proxy.ts` — он обновляет Supabase session cookies на каждом запросе.

Важно: не добавляй `src/middleware.ts` вместе с `src/proxy.ts` — Next.js не позволит иметь оба файла одновременно.

## 7) Что добавить в Timeweb для Supabase

### App Platform

Timeweb Cloud → приложение → **Переменные окружения**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` *(или publishable)*

Важно: после изменения env vars в Timeweb обычно нужен restart/redeploy приложения, чтобы они применились.

### VPS

На VPS достаточно, чтобы переменные были доступны процессу `pnpm build` и `pnpm start` (например, через `.env.local` или через systemd environment).

Если хочешь разделить staging/preview и production — создай 2 Supabase проекта и используй разные env vars на разных окружениях/приложениях.

## 8) Быстрая проверка связки

1) Локально: `pnpm dev` → `/models` открывается, `/admin/login` открывается.
2) После деплоя: на Timeweb URL
   - `/admin/login` → логин проходит
   - `/admin/models` → CRUD работает
   - `/models` → опубликованные модели видны публично
