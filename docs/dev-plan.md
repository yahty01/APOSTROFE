# Dev plan (MVP): задеплоенный сайт + рабочий каталог + админ‑ЛК

Этот документ — **детализированный dev‑plan**, полностью покрывающий требования из `docs/tech-plan.md`.

---

## 0) Цель MVP и определения

### Цель
Сделать демонстрационно‑готовый продукт:
- публичный каталог моделей `/models` + детальная `/models/[document_id]`;
- админ‑часть `/admin` для управления моделями и marquee;
- деплой на Timeweb + Supabase (DB/Auth/Storage) с корректной безопасностью (RLS).

### Термины
- **Model / Asset**: запись в таблице `assets` (далее “модель”).
- **document_id**: внешний идентификатор модели, **используется в URL** (`/models/[document_id]`) и как папка в Storage.
- **hero**: главное изображение модели.
- **gallery**: набор изображений модели (порядок задаётся `order_index`).

---

## 1) Требования MVP (из tech‑plan) с ID

Ниже — требования, извлечённые из `docs/tech-plan.md`, с идентификаторами. Дальше в плане задачи будут ссылаться на эти ID.

### 1.1 Публичная часть

- **PUB-001**: `/` редиректит на `/models`.
- **PUB-002**: `/models` содержит переключатель **CARDS/LIST** (с сохранением выбранного режима).
- **PUB-003**: `/models` содержит фильтр по категории (минимум: tabs/select).
- **PUB-004**: `/models` содержит пагинацию `limit/offset` + общий `count`.
- **PUB-005**: режим **CARDS** — карточки (превью + метаданные + CTA).
- **PUB-006**: режим **LIST** — таблица + **виртуализация** (`react-virtual`).
- **PUB-007**: `/models/[document_id]` показывает hero + мини‑галерею.
- **PUB-008**: `/models/[document_id]` показывает description + measurements + details (минимальный набор).
- **PUB-009**: `/models/[document_id]` CTA открывает Telegram с предзаполненным сообщением (document_id + название).
- **PUB-010**: Marquee под header; текст приходит из админки.
- **PUB-011**: Marquee обновляется “сразу” для демо (на MVP — polling/focus‑refetch).

### 1.2 Админка

- **ADM-001**: `/admin/login` (email/password).
- **ADM-002**: Guard: без сессии → редирект на `/admin/login`.
- **ADM-003**: роли `admin/editor` через `profiles.role`.
- **ADM-004**: `/admin/models` — список моделей.
- **ADM-005**: `/admin/models` — создать/редактировать модель.
- **ADM-006**: `/admin/models` — `publish/unpublish`.
- **ADM-007**: `/admin/models` — `delete` (удаление модели и её медиа).
- **ADM-008**: загрузка медиа (hero + gallery) + reorder (order_index).
- **ADM-009**: `/admin/settings/marquee` — настройки (text/enabled/speed/direction; speed/direction можно применить минимально).

### 1.3 Инфра/данные/безопасность (как в tech‑plan)

- **INF-001**: Next.js App Router + TypeScript репозиторий.
- **INF-002**: Supabase проект (на MVP достаточно одного для staging/preview, но желательно сразу продумать prod).
- **INF-003**: Timeweb Cloud App Platform (Dockerfile/SSR) + автодеплой из GitHub. _(опционально: отдельное staging‑приложение на ветке `develop`/`staging`)_
- **INF-004**: env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (или `NEXT_PUBLIC_SUPABASE_ANON_KEY`), серверно `SUPABASE_SERVICE_ROLE_KEY` (только сервер).
- **DB-001**: таблицы: `profiles`, `assets`, `asset_media`, `settings_marquee` (минимальная схема — ниже).
- **DB-002**: Storage bucket `assets` (или `media`) и структура `document_id/...`.
- **SEC-001**: RLS: публичная часть видит только опубликованные; админ/editor имеют CRUD.

---

## 2) MVP‑граница (что откладываем, но не ломаем архитектуру)

Эти пункты **не делаем в MVP**, но в dev‑plan закладываем решения, чтобы не было переделок:

- **FUT-001**: Realtime для marquee (MVP: polling → позже заменить на Realtime без смены UI‑контракта).
- **FUT-002**: продвинутый SEO/OG (MVP: базовые мета + корректные canonical/robots по необходимости).
- **FUT-003**: сложные фильтры/поиск/сортировки (MVP: категории + пагинация).
- **FUT-004**: “пиксель‑перфект” дизайн (MVP: чистый UI, корректная сетка/таблица).

---

## 3) Архитектурные решения (чтобы план был реализуемым)

### 3.1 Стек
- Next.js (App Router) + TypeScript.
- Supabase: Postgres + Auth + Storage.
- Timeweb: App Platform деплой из Dockerfile (SSR) + автодеплой из GitHub. _(опционально: staging/prod как два приложения)_
- `@supabase/ssr`: SSR‑auth через cookies для `/admin`.
- `next-intl`: минимальная RU/EN локализация (без изменения публичных URL, чтобы сохранить `/models/...`).
- Формы админки: React Hook Form + Zod.
- Виртуализация списка: `@tanstack/react-virtual` (или совместимый `react-virtual`).

### 3.2 Принципы доступа к данным
- Публичная часть — **только Server Components** для чтения каталога (минимум client‑state).
- Админка:
  - Guard/role‑check делаем на сервере (в layout/route) до рендера страниц.
  - Мутации — через Server Actions или Route Handlers (важно: **не** раскрывать service role key клиенту).
- Кэширование и обновления:
  - Публичные страницы могут кэшироваться; после админ‑мутаций используем `revalidatePath('/models')` и ``revalidatePath(`/models/${document_id}`)``.
  - Marquee: отдельный “контракт” чтения настроек (чтобы потом заменить polling на realtime без переписывания UI).

### 3.3 Ошибки и UX
- `notFound()` для несуществующих `document_id`.
- В админке: явные состояния загрузки, toast‑уведомления об успехе/ошибке.
- Файлы медиа: валидация типа/размера на клиенте + серверная проверка (минимум).

---

## 4) План работ (детализация tech‑plan §3)

Ниже — по шагам из `docs/tech-plan.md`, но с подзадачами, выходами и критериями готовности.

### Шаг 0 — Подготовка окружений (INF-001…INF-004)

**Задачи**
- [x] Инициализировать Next.js App Router + TS (eslint, базовая структура, `src/` — по вкусу).
- [x] Выбрать пакетный менеджер (желательно `pnpm`) и зафиксировать в README (минимально).
- [x] Создать Supabase проект и сохранить параметры подключения. _(проверено: публичный клиент читает `settings_marquee`/`assets` по `.env.local`)_
- [ ] Создать приложение в Timeweb Cloud (App Platform → Dockerfile) и подключить GitHub‑репозиторий. _(вне репозитория; нет артефактов, позволяющих подтвердить)_
- [ ] Настроить env vars в Timeweb (и, если есть два приложения, отдельно для staging/prod): _(локально настроено через `.env.local`/`.env.example`, но в Timeweb нужно подтвердить отдельно)_
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (или `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
  - `SUPABASE_SERVICE_ROLE_KEY` (только server runtime)
- [x] Подготовить локальный `.env.local` (не коммитить).

**Definition of Done**
- `pnpm dev`/`npm run dev` запускается локально.
- Timeweb деплой (App Platform/Dockerfile) успешно собирается и открывается на техническом домене `*.timeweb.cloud`.

---

### Шаг 1 — База данных + Auth + RLS (DB-001, DB-002, SEC-001, ADM-003)

#### 1.1 Схема БД (минимум)

**`profiles`**
- `id uuid primary key references auth.users(id) on delete cascade`
- `role text not null check (role in ('admin','editor'))`
- `created_at timestamptz default now()`

**`assets`**
- `id uuid primary key default gen_random_uuid()`
- `document_id text not null unique`
- `title text not null`
- `description text null`
- `category text null`
- `license_type text null`
- `status text null`
- `measurements jsonb null` (или `text`, но для “не ломать архитектуру” лучше `jsonb`)
- `details jsonb null`
- `is_published boolean not null default false`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()` (+ trigger на обновление)

**`asset_media`**
- `id uuid primary key default gen_random_uuid()`
- `asset_id uuid not null references assets(id) on delete cascade`
- `path text not null` (storage path)
- `kind text not null check (kind in ('hero','gallery'))`
- `order_index int not null default 0`
- `created_at timestamptz default now()`
- индекс `(asset_id, kind, order_index)`

**`settings_marquee`**
- `id int primary key` (фиксируем `id=1`)
- `enabled boolean not null default true`
- `text_ru text not null default ''`
- `text_en text not null default ''`
- `speed int null`
- `direction text null`

#### 1.2 Storage (DB-002)

**Bucket**
- имя: `assets` (или `media`, но фиксируем одно).

**Пути**
- `assets/{document_id}/hero/{uuid}.{ext}`
- `assets/{document_id}/gallery/{uuid}.{ext}`

#### 1.3 Auth и начальный доступ (ADM-001…ADM-003)

**Задачи**
- [ ] Включить Email/Password auth. _(вне репозитория; делается в Supabase Dashboard)_
- [ ] Создать одного admin‑пользователя. _(вне репозитория; делается в Supabase Auth)_
- [ ] Заполнить `profiles` для этого пользователя (миграцией/ручной вставкой). _(вне репозитория; нужен апдейт `profiles.role` → `admin`)_
- [x] (Опционально) Триггер: при создании пользователя добавлять `profiles` со значением по умолчанию (например `editor`) — если это не мешает админ‑контролю.

#### 1.4 RLS политики (SEC-001)

**Задачи**
- [x] Включить RLS на `assets`, `asset_media`, `settings_marquee`.
- [x] Public policies:
  - [x] `SELECT assets` только `is_published = true`.
  - [x] `SELECT asset_media` только если связанный `asset.is_published = true`.
  - [x] `SELECT settings_marquee` (read‑only; достаточно одной строки `id=1`).
- [x] Admin/editor policies (через `profiles.role in ('admin','editor')`):
  - [x] CRUD для `assets`, `asset_media`, `settings_marquee`.
- [x] Storage policies:
  - [x] Write только admin/editor.
  - [x] Read: либо “public read bucket” (быстро), либо policy “читать только если asset опубликован” (правильно).

**Definition of Done**
- Публичный anon‑ключ не читает не опубликованные записи.
- Admin/editor может создавать/обновлять записи и загружать медиа.

---

### Шаг 2 — Каркас фронта (роутинг/лейауты) (PUB-001…PUB-011, ADM-001…ADM-009)

#### 2.1 Структура роутов (как в tech‑plan)

**Задачи**
- [x] `app/(public)/layout.tsx`: Header + Marquee + Footer.
- [x] `app/(public)/page.tsx`: редирект на `/models` (PUB-001).
- [x] `app/(public)/models/page.tsx` (PUB-002…PUB-006, PUB-010…PUB-011).
- [x] `app/(public)/models/[document_id]/page.tsx` (PUB-007…PUB-009).
- [x] `app/(admin)/admin/layout.tsx`: общий админ‑лейаут + серверный guard (ADM-002, ADM-003). _(guard реализован в сегменте `(protected)`)_
- [x] `app/(admin)/admin/login/page.tsx` (ADM-001).
- [x] `app/(admin)/admin/models/page.tsx` (ADM-004).
- [x] `app/(admin)/admin/models/new/page.tsx` (ADM-005).
- [x] `app/(admin)/admin/models/[id]/page.tsx` (ADM-005…ADM-008).
- [x] `app/(admin)/admin/settings/marquee/page.tsx` (ADM-009).

#### 2.2 Supabase клиент(ы)

**Задачи**
- [x] Настроить `@supabase/ssr`:
  - серверный клиент для чтения/мутаций с учётом cookies‑сессии (админка);
  - публичный серверный клиент для чтения published контента.
- [x] Сформировать единый модуль `supabaseClient`/`supabaseServerClient` (чтобы не плодить).

#### 2.3 i18n (минимально) (PUB-010, ADM-009)

**Задачи**
- [x] Подключить `next-intl` без изменения URL структуры.
- [x] Добавить минимальные словари RU/EN для UI‑лейблов + marquee.

**Definition of Done**
- Публичные страницы открываются без 500.
- `/admin` без сессии редиректит на `/admin/login`.

---

### Шаг 3 — Публичный каталог `/models` (PUB-002…PUB-006, PUB-010…PUB-011)

#### 3.1 Данные и запросы

**Задачи**
- [x] Запрос списка опубликованных `assets` с `count` (PUB-004).
- [x] Пагинация по `page` в URL → `limit/offset`.
- [x] Категории:
  - [x] MVP‑вариант: список категорий как `distinct category` из опубликованных записей, + опция “All” (PUB-003).

#### 3.2 UI: Cards/List

**Задачи**
- [x] Сохранение режима `view=cards|list` в URL (и `sessionStorage` как fallback) (PUB-002).
- [x] Компонент `AssetCard` (PUB-005):
  - превью (hero или первое gallery);
  - title + метаданные (category/license/status — как минимум).
  - CTA: перейти на `/models/[document_id]`.
- [x] Компонент таблицы `AssetsTable` (PUB-006):
  - `@tanstack/react-virtual` для виртуализации строк;
  - колонки: превью/название/document_id/категория/лицензия/статус.

#### 3.3 Marquee (PUB-010, PUB-011)

**Задачи**
- [x] Server fetch `settings_marquee` в `layout`.
- [x] Client component (внутри layout) с polling/focus‑refetch:
  - интервал (например 5–10 сек) + refetch при `window.focus`;
  - минимальная анимация (CSS marquee) и флаг `enabled`.
- [x] Применить `speed/direction` минимально (ADM-009).

**Definition of Done**
- `/models` показывает опубликованные модели.
- Переключение Cards/List работает и сохраняется.
- Категории фильтруют список.
- Marquee меняется после обновления настройки (без перезагрузки страницы; в пределах polling).

---

### Шаг 4 — Детальная `/models/[document_id]` (PUB-007…PUB-009)

**Задачи**
- [x] Server fetch `assets` по `document_id` + связанный `asset_media`.
- [x] Hero image + gallery strip (PUB-007).
- [x] Блоки мета‑информации (PUB-008):
  - description (текст);
  - measurements (рендерить как key/value, если json);
  - details (рендерить как key/value, если json).
- [x] CTA Telegram deep link (PUB-009):
  - текст: `document_id` + `title` (и, при желании, URL страницы).
- [x] `notFound()` если запись отсутствует или не опубликована.

**Definition of Done**
- Открытие детальной страницы стабильно и без “дыр” в безопасности (unpublished не видны).

---

### Шаг 5 — Админка `/admin` (ADM-001…ADM-009)

#### 5.1 Login + Guard + Role (ADM-001…ADM-003)

**Задачи**
- [x] `/admin/login`: форма email/password, обработка ошибок.
- [x] Guard на сервере в `app/(admin)/admin/layout.tsx`:
  - нет сессии → redirect на `/admin/login` (ADM-002);
  - есть сессия, но нет `profiles`/роль не подходит → показать “Access denied” (ADM-003).

#### 5.2 `/admin/models` список и действия (ADM-004, ADM-006, ADM-007)

**Задачи**
- [x] SSR‑таблица ассетов:
  - колонки: document_id/title/category/is_published/status/updated_at.
- [x] Действия:
  - [x] Publish/Unpublish (ADM-006).
  - [x] Delete: удалить запись `assets`, связанные `asset_media` и файлы в Storage (ADM-007).
  - [x] Edit → `/admin/models/[id]`.
  - [x] Create → `/admin/models/new`.
- [x] После мутаций:
  - [x] `revalidatePath('/models')`
  - [x] ``revalidatePath(`/models/${document_id}`)`` (по конкретному `document_id`, когда он известен)

#### 5.3 Create/Edit формы (ADM-005)

**Задачи**
- [x] React Hook Form + Zod:
  - поля: `document_id`, `title`, `description`, `category`, `license_type`, `status`, `measurements`, `details`, `is_published`.
- [x] Валидации:
  - `document_id` обязателен, уникальный, без пробелов (regex).
  - `title` обязателен.
  - `measurements/details` — JSON‑валидация (если используем jsonb) либо простая структура (MVP).

#### 5.4 MediaUploader (ADM-008)

**Задачи**
- [x] Загрузка hero:
  - удалить/заменить предыдущий hero (по бизнес‑логике) или хранить один активный (простое решение: хранить одну запись `kind='hero'`).
- [x] Загрузка gallery (множественная).
- [x] Reorder:
  - MVP вариант: кнопки “up/down” (без DnD) или DnD, если быстро.
  - сохранять `order_index` на сервере.
- [x] Удаление media записи (+ опционально удаление файла из storage).

#### 5.5 `/admin/settings/marquee` (ADM-009)

**Задачи**
- [x] Форма: `enabled`, `text_ru`, `text_en`, (опционально) `speed`, `direction`.
- [x] Сохранение в `settings_marquee` (строка `id=1`).
- [x] Публичная часть видит изменения в пределах polling (PUB-011).

**Definition of Done**
- Админ может полностью выполнить демо‑сценарий из tech‑plan: создать модель, загрузить медиа, опубликовать, увидеть на публичной части, изменить marquee.

---

### Шаг 6 — Изображения “быстро” (оптимизация без усложнения) (из tech‑plan)

**Задачи**
- [x] В публичном UI не тянуть оригиналы (ограничить ширину/качество).
- [x] Использовать Supabase render endpoint (transform) + `next/image` loader.
- [x] Для hero/detail: разные размеры (list/card/detail) для скорости.

**Definition of Done**
- Lighthouse/ощущение скорости: картинки грузятся быстро, нет огромных оригиналов в сети.

---

### Шаг 7 — Деплой и финальная демонстрация (из tech‑plan)

**Задачи**
- [ ] Настроить Timeweb автодеплой из GitHub (INF-003). _(опционально: staging‑приложение отдельной веткой)_
- [x] Проверить редирект `/` → `/models` (PUB-001). _(проверено локально через Playwright)_
- [ ] Проверить env vars на Timeweb (INF-004). _(локально есть `.env.local`, но в Timeweb не проверено)_
- [ ] Smoke‑проверки:
  - [x] публичные страницы открываются;
  - [ ] админ‑логин работает;
  - [ ] CRUD и загрузка файлов работают.

---

## 5) Демо‑чеклист “показ заказчику” (как в tech‑plan)

- [x] Зайти в `/admin/login`
- [ ] Создать модель (document_id, базовые поля)
- [ ] Загрузить hero + 3–5 фото в галерею, поменять порядок
- [ ] Нажать Publish
- [x] Открыть `/models` → модель появилась
- [x] Переключить CARDS/LIST → работает
- [x] Открыть `/models/[document_id]` → детальная + CTA
- [ ] Изменить marquee в админке → на публичной части обновилось “сразу”

---

## 6) Coverage / трассировка tech‑plan → dev‑plan

Эта таблица показывает, что каждый пункт из `docs/tech-plan.md` имеет соответствующий requirement ID и реализуется конкретным шагом в dev‑plan.

| Tech-plan раздел | Пункт | Requirement ID | Где реализуется в dev‑plan |
|---|---|---|---|
| §1 Публичная часть | `/` → редирект на `/models` | PUB-001 | Шаг 2.1, Шаг 7 |
| §1 Публичная часть | `/models` CARDS/LIST | PUB-002 | Шаг 3.2 |
| §1 Публичная часть | фильтр по категории | PUB-003 | Шаг 3.1 |
| §1 Публичная часть | пагинация + count | PUB-004 | Шаг 3.1 |
| §1 Публичная часть | cards: карточка + CTA | PUB-005 | Шаг 3.2 |
| §1 Публичная часть | list: таблица + виртуализация | PUB-006 | Шаг 3.2 |
| §1 Публичная часть | detail: hero + мини‑галерея | PUB-007 | Шаг 4 |
| §1 Публичная часть | detail: description/measurements/details | PUB-008 | Шаг 4 |
| §1 Публичная часть | detail: Telegram CTA | PUB-009 | Шаг 4 |
| §1 Публичная часть | marquee: текст из админки | PUB-010 | Шаг 3.3 + Шаг 5.5 |
| §1 Публичная часть | marquee: обновление “сразу” (polling) | PUB-011 | Шаг 3.3 + Шаг 5.5 |
| §1 Админка | `/admin/login` email/password | ADM-001 | Шаг 5.1 |
| §1 Админка | guard: без сессии → login | ADM-002 | Шаг 2.1 + Шаг 5.1 |
| §1 Админка | роли admin/editor (profiles.role) | ADM-003 | Шаг 1.3 + Шаг 5.1 |
| §1 Админка | `/admin/models` список | ADM-004 | Шаг 5.2 |
| §1 Админка | создать/редактировать | ADM-005 | Шаг 5.3 |
| §1 Админка | publish/unpublish | ADM-006 | Шаг 5.2 |
| §1 Админка | delete | ADM-007 | Шаг 5.2 |
| §1 Админка | upload + reorder | ADM-008 | Шаг 5.4 |
| §1 Админка | settings marquee | ADM-009 | Шаг 5.5 |
| §3 План работ | окружения/env/deploy | INF-001…INF-004 | Шаг 0 + Шаг 7 |
| §3 План работ | DB/Auth/RLS/Storage | DB-001, DB-002, SEC-001 | Шаг 1 |
| §3 План работ | каркас App Router | (routes) | Шаг 2 |
| §3 План работ | публичный каталог | PUB-002…PUB-006 | Шаг 3 |
| §3 План работ | детальная страница | PUB-007…PUB-009 | Шаг 4 |
| §3 План работ | админка | ADM-001…ADM-009 | Шаг 5 |
| §3 План работ | оптимизация изображений | (images) | Шаг 6 |
| §3 План работ | финальный деплой/демо | (deploy) | Шаг 7 |
| §4 Демо‑чеклист | весь сценарий | (см. IDs) | Раздел 5 |
