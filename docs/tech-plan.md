# Черновой MVP-план: задеплоенный сайт + рабочий каталог + админ-ЛК

---

## 1) Что будет в MVP (демо-готово)

### Публичная часть

- [x] `/` → редирект на `/models`
- [x] `/models`
  - [x] переключатель **CARDS/LIST**
  - [x] фильтр по категории (минимум: табы/селект)
  - [x] пагинация (`limit/offset`) + счётчик
  - [x] **CARDS**: карточка (превью + метаданные + CTA)
  - [x] **LIST**: таблица + **виртуализация** (`react-virtual`)
- [x] `/models/[document_id]`
  - [x] hero (главное изображение) + мини-галерея
  - [x] description + measurements + details (минимальный набор полей)
  - [x] CTA: открыть Telegram с предзаполненным сообщением
- [x] Marquee под header
  - [x] текст из админки
  - [x] обновление **сразу** (на MVP — polling/focus-refetch)

### Админка (`/admin`)

- [x] `/admin/login` (email/password)
- [x] Guard: без сессии → редирект на login
- [x] Роли `admin/editor` (через `profiles.role`)
- [x] `/admin/models`
  - [x] список моделей
  - [x] создать / редактировать
  - [x] `publish/unpublish`
  - [x] `archive` (status=ARCHIVED + is_published=false)
- [x] Загрузка медиа (hero + gallery) + reorder (order_index)
- [x] `/admin/settings/marquee` (text/enabled/speed/direction — speed/direction можно оставить “в интерфейсе”, но применить минимально)

---

## 2) MVP-граница: что сознательно откладываем (но без ломания архитектуры)

Откладываем до следующего этапа, чтобы быстрее “показать работающую систему”:

- Realtime для marquee (оставляем polling → потом заменим на Realtime без переделки UI)
- Продвинутый SEO/OG (в MVP — базовые мета)
- Сложная фильтрация/поиск/сортировки (в MVP — категории + пагинация)
- Полировка дизайна “пиксель в пиксель” (в MVP — корректная сетка/таблица и чистый UI)

---

## 3) План работ (минимально и по порядку)

### Шаг 0 — Подготовка окружений

- [x] Создать репозиторий (Next.js App Router + TS)
- [x] Создать проект в Supabase (один на staging/preview достаточно для MVP) _(подключение проверено запросами по `.env.local`)_
- [ ] Создать приложение в Timeweb Cloud (App Platform → Dockerfile) и подключить GitHub‑репозиторий _(см. `docs/deploy/01-timeweb.md`)_
- [x] Завести env vars:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (или `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
  - (серверно, если понадобится) `SUPABASE_SERVICE_ROLE_KEY` — **только сервер**, не в клиент

---

### Шаг 1 — База данных + Auth + RLS (чтобы сразу “правильно”)

_(✅ схема/политики и bucket реализованы миграцией в `supabase/migrations/`; таблицы доступны по текущему Supabase‑подключению из `.env.local`.)_

**Таблицы (минимум)**

- `profiles`
  - `id (uuid, = auth.users.id)`
  - `role ('admin'|'editor')`
- `assets`
  - `id (uuid)`
  - `document_id (text, unique)`
  - `title`, `description`
  - `category`
  - `license_type`, `status`
  - `measurements` (text или jsonb)
  - `details` (jsonb)
  - `is_published (bool)`
  - `created_at/updated_at`
- `asset_media`
  - `id`
  - `asset_id (fk)`
  - `path` (storage path)
  - `kind ('hero'|'gallery')`
  - `order_index (int)`
- `settings_marquee`
  - `id=1`
  - `enabled (bool)`
  - `text_ru`, `text_en`
  - `speed`, `direction`

**Storage**

- Bucket: `assets` (или `media`)
- Папки по `document_id/…` (удобно для порядка)

**RLS политики (минимум)**

- Public:
  - `SELECT assets` только `is_published=true`
  - `SELECT asset_media` только для опубликованных assets
- Admin/editor:
  - CRUD `assets`, `asset_media`, `settings_marquee` при `profiles.role in ('admin','editor')`
- Storage:
  - Public read: только для медиа опубликованных ассетов (на MVP допускается просто public read bucket, но лучше сразу правильно)
  - Write: только для admin/editor

> Важно: сразу делаем так, чтобы публичная часть физически не могла читать не опубликованное.

---

### Шаг 2 — Каркас фронта (App Router структура как в техплане)

- [x] `app/(public)/layout.tsx` — Header + Marquee + Footer
- [x] `app/(public)/models/page.tsx`
- [x] `app/(public)/models/[document_id]/page.tsx`
- [x] `app/(admin)/admin/layout.tsx`
- [x] `app/(admin)/admin/login/page.tsx`
- [x] `app/(admin)/admin/models/page.tsx`
- [x] `app/(admin)/admin/models/new/page.tsx`
- [x] `app/(admin)/admin/models/[id]/page.tsx`
- [x] `app/(admin)/admin/settings/marquee/page.tsx`

Подключить:

- [x] `@supabase/ssr` для SSR-auth через cookies
- [x] `next-intl` (минимально RU/EN, чтобы показать “готовность” к i18n)

---

### Шаг 3 — Публичный каталог (показать ценность за 1 экран)

**/models (Server Component)**

- [x] fetch опубликованных `assets` + `count`
- [x] режим `view=cards|list` в URL (+ sessionStorage fallback)
- [x] пагинация `page` в URL
- [x] CARDS:
  - `AssetCard` (thumb, title, doc_id, status/license, CTA)
- [x] LIST:
  - `AssetsTable` + `react-virtual`

**Marquee**

- [x] Server fetch настроек + на клиенте polling/focus-refetch (раз в N секунд) → “обновляется сразу” для демо

---

### Шаг 4 — Детальная страница (минимально, но убедительно)

**/models/[document_id] (Server Component)**

- [x] fetch asset + media
- [x] hero image + gallery strip
- [x] meta blocks (license/status/measurements/details)
- [x] CTA → Telegram deep link с текстом: document_id + название

---

### Шаг 5 — Админка (основные функции без лишнего)

**Auth**

- [x] `/admin/login` email/password
- [x] Guard на сервере: нет сессии → redirect
- [x] Проверка `profiles.role`

**/admin/models**

- [x] таблица ассетов (SSR first paint)
- [x] действия:
  - create
  - edit
  - publish/unpublish
  - archive
- [x] после каждого действия → `revalidatePath('/models')` + `revalidatePath(`/models/${document_id}`)`

**/admin/models/new и /admin/models/[id]**

- [x] форма: React Hook Form + Zod
- [x] поля: document_id, title, description, category, license_type, status, measurements, details, is_published
- [x] MediaUploader:
  - загрузка hero
  - загрузка gallery
  - reorder (drag/drop или кнопки up/down — на MVP можно проще)

**/admin/settings/marquee**

- [x] форма настроек marquee (text_ru/text_en + enabled + опционально speed/direction)

---

### Шаг 6 — Изображения “быстро” без усложнения MVP

- [x] В публичном UI **не тянуть оригиналы**
- [x] Использовать Supabase render endpoint (width/quality) + `next/image` loader

  _(это даёт хороший “вау-эффект” в демо и не мешает продолжению разработки)_

---

### Шаг 7 — Деплой и финальная демонстрация

- [ ] Timeweb: App Platform автодеплой из GitHub (ветка `main`) _(см. `docs/deploy/01-timeweb.md`)_
- [x] Проверить редирект `/` → `/models` _(проверено локально через Playwright)_
- [ ] Проверить env vars на Timeweb (и, если есть staging, отдельно для staging/prod)

---

## 4) Демо-чеклист “показ заказчику”

- [x] Зайти в `/admin/login`
- [ ] Создать модель (document_id, базовые поля)
- [ ] Загрузить hero + 3–5 фото в галерею, поменять порядок
- [ ] Нажать Publish
- [x] Открыть `/models` → модель появилась
- [x] Переключить CARDS/LIST → работает
- [x] Открыть `/models/[document_id]` → детальная + CTA
- [ ] Изменить marquee в админке → на публичной части обновилось “сразу”
