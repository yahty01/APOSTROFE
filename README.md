# APOSTROFE

Проект на `Next.js 16` + `Supabase`: публичный реестр цифровых сущностей и админка для управления контентом.

Сущности реестра:
- `model`
- `creator`
- `influencer`

## Для чего проект
- Публичная часть: просмотр каталога, фильтры, карточки/таблица, детальные страницы.
- Админка: создание/редактирование/публикация сущностей, загрузка медиа в Supabase Storage, настройка marquee.
- Безопасность: доступ регулируется через Supabase Auth + `profiles.role` + RLS-политики.

## Быстрый старт (локально)
1. Установи зависимости:
```bash
pnpm install
```
2. Создай локальные переменные окружения:
```bash
cp .env.example .env.local
```
3. Заполни `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (или `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; в текущем коде не обязателен для базового сценария)
4. Примени миграции Supabase (SQL Editor или Supabase CLI):
- `supabase/migrations/20260201000000_init.sql`
- `supabase/migrations/20260202021000_add_column_comments.sql`
- `supabase/migrations/20260216190000_add_asset_entity_fields.sql`
- `supabase/migrations/20260217123000_add_influencer_social_links_v2.sql`
- `supabase/migrations/20260217164000_add_influencer_music_links.sql`
- `supabase/migrations/20260218163525_add_catalog_media_kind.sql`
5. Создай пользователя в Supabase Auth (email/password), затем выдай роль `admin`:
```sql
update public.profiles
set role = 'admin'
where id = '<auth.users.id>';
```
6. Запусти проект:
```bash
pnpm dev
```
7. Проверь:
- `http://localhost:3000/models`
- `http://localhost:3000/admin/login`

## Скрипты
- `pnpm dev` — локальная разработка.
- `pnpm build` — production build.
- `pnpm start` — запуск production build.
- `pnpm lint` — ESLint.
- `pnpm i18n:check` — проверка синхронизации и использования ключей переводов.

## Ключевые маршруты
Публичные:
- `/models`, `/models/[document_id]`
- `/creators`, `/creators/[document_id]`
- `/influencers`, `/influencers/[document_id]`
- `/generators` (заглушка)
- `/policy`

Админка:
- `/admin/login`
- `/admin/models`, `/admin/models/new`, `/admin/models/[id]`
- `/admin/creators`, `/admin/creators/new`, `/admin/creators/[id]`
- `/admin/influencers`, `/admin/influencers/new`, `/admin/influencers/[id]`
- `/admin/settings/marquee`

API:
- `/api/marquee`
- `/api/locale`

## Где что лежит в коде
- `src/app` — роуты и layout'ы App Router.
- `src/components` — UI-компоненты (публичные, админские, shell).
- `src/lib/supabase` — клиенты Supabase (public/server/read-only) и image helper.
- `src/lib/assets/entity.ts` — маппинг entity type к роутам.
- `src/messages/*.json` — i18n словари RU/EN.
- `supabase/migrations` — схема, RLS, storage-политики, эволюция БД.

## Документация
Новый комплект docs для передачи проекта джуну:
- `docs/README.md` — навигация по документации.
- `docs/01-project-overview.md` — обзор продукта и основных потоков.
- `docs/02-architecture.md` — архитектура, data flow, ответственность модулей.
- `docs/03-database-and-rls.md` — БД, RLS, Storage, SQL-подсказки.
- `docs/04-development-guide.md` — процесс разработки и чеклисты.
- `docs/05-technology-mini-guides.md` — мини‑гайды по стеку с практикой из проекта.
- `docs/06-deployment-and-ops.md` — деплой и эксплуатация.
- `docs/07-documentation-review.md` — оценка качества документации и внесённые правки.

## Частые проблемы
1. `Supabase env is missing...`
- Проверь `.env.local` и перезапусти `pnpm dev`.

2. В админке `Access denied`
- Проверь строку в `public.profiles` для текущего `auth.users.id`.

3. Не отображаются изображения в карточках/деталке
- Проверь bucket `assets`, RLS/policies в `storage.objects`, и что `is_published=true` у сущности.

4. После сохранения в админке публичная страница не обновилась
- Проверь, что action вызывает `revalidatePath(...)` для нужного маршрута.

## Сноска по стеку
| Слой | Технология | Как используется в проекте |
|---|---|---|
| Fullstack framework | `next@16.1.6` | App Router, Server Components, Route Handlers, Server Actions, `proxy.ts` |
| UI | `react@19.2.3` | клиентские интерактивные компоненты, transitions, forms |
| Типизация | `typescript@5` | строгая типизация формы, entity, DB-моделей |
| Backend BaaS | `@supabase/supabase-js@2.57.4` | чтение/запись в Postgres и Storage |
| SSR auth bridge | `@supabase/ssr@0.7.0` | cookie-based auth в server/runtime контексте |
| i18n | `next-intl@4.3.6` | RU/EN словари, server/client translations |
| Формы | `react-hook-form@7.62.0` + `zod@4.1.5` | клиентская валидация + безопасные payload'ы в actions |
| Notification UI | `sonner@2.0.7` | toast в админских действиях |
| Виртуализация | `@tanstack/react-virtual@3.13.12` | список в табличном режиме каталога |
| Styling | `tailwindcss@4` + CSS modules/classes | базовые utility + собственный ui-layer |

