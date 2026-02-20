# 02. Архитектура

## 1) Высокоуровневая схема
1. Браузер запрашивает route в App Router.
2. Server Component читает данные через Supabase (`public` или `read-only server client`).
3. Клиентские компоненты обрабатывают интерактивность (filter/view switch/form submit).
4. Мутации идут через Server Actions.
5. После мутаций вызывается `revalidatePath`.

## 2) Структура кода по ответственности
- `src/app`:
- маршруты, layout, route handlers.
- `src/components`:
- UI-компоненты и композиция экранов.
- `src/lib`:
- инфраструктурные модули (Supabase clients, entity routing, Telegram helpers).
- `src/messages`:
- RU/EN словари.
- `supabase/migrations`:
- схема данных и безопасность RLS/Storage.

## 3) Auth/authorization flow
### 3.1 Логин
- `src/app/(admin)/admin/login/actions.ts` вызывает `supabase.auth.signInWithPassword(...)`.
- Cookie сессии выставляется через SSR client (`createSupabaseServerClient`).

### 3.2 Guard
- `src/app/(admin)/admin/(protected)/layout.tsx`:
- проверяет `supabase.auth.getUser()`;
- загружает `profiles.role`;
- даёт доступ только для `admin/editor`.

### 3.3 Почему есть 2 server-клиента Supabase
- `createSupabaseServerClient()` — когда нужно писать cookies (actions/route handlers).
- `createSupabaseServerClientReadOnly()` — для Server Components, где cookies менять нельзя.

## 4) Data fetching стратегия
### 4.1 Публичный список
`PublicRegistryPage`:
- читает assets с пагинацией;
- читает фильтры (distinct-like по колонке);
- для превью берёт `catalog`, fallback на `hero`;
- генерирует signed URL через `createSignedImageUrl`.

### 4.2 Детальные страницы
- ищут ассет по `document_id` + `entity_type`;
- загружают media;
- при ошибке/отсутствии делают `notFound()`.

## 5) Мутации и revalidation
### 5.1 Где мутации
- publish/delete: `src/app/(admin)/admin/(protected)/models/actions.ts`
- save asset: `src/app/(admin)/admin/(protected)/models/model-actions.ts`
- media upload/reorder/delete: `src/app/(admin)/admin/(protected)/models/media-actions.ts`
- marquee settings: `src/app/(admin)/admin/(protected)/settings/marquee/actions.ts`

### 5.2 Критично помнить
- `revalidatePath` должен вызываться в Server Action/Route Handler, но для мгновенного обновления роутер-кэша в UI лучше Server Action.
- Для динамических паттернов требуется корректный путь и, при необходимости, `type`.

## 6) Proxy и сессия
- Используется `src/proxy.ts`.
- Задача: синхронизировать auth cookies и триггерить refresh сессии (`supabase.auth.getSession()`).
- Если env не задано, proxy gracefully no-op.

## 7) UI shell и состояние pending
- `AppShell` подключает:
- `NavigationPendingReporter` (глобальный перехват внутренних переходов),
- `PendingLoadingBarHost` (глобальный loading bar).
- Глобальный pending-counter хранится в `src/lib/pending.ts`.

## 8) i18n архитектура
- `next-intl` plugin подключён в `next.config.ts`.
- Request config: `src/i18n/request.ts`.
- Локаль хранится в cookie `locale`; переключатель через `/api/locale`.
- Ключи проверяются `pnpm i18n:check`.

## 9) Где чаще всего возникают баги
1. Неправильный entity type в action (`model/creator/influencer`).
2. Пропущенный `revalidatePath` после мутации.
3. Неконсистентные translation keys RU/EN.
4. Ошибки policy в Storage (файлы загружены, но не читаются публично).

## 10) Если нужно добавить новую сущность
1. Добавить значение `entity_type` в БД и TS типы.
2. Добавить route pages (public/admin).
3. Подключить в `getAssetEntitySection`/`getPublicBasePathForEntity`.
4. Добавить i18n ключи RU/EN.
5. Обновить формы и списки.
6. Добавить/проверить RLS и Storage policy для новых правил видимости.

