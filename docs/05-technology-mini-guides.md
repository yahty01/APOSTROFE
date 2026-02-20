# 05. Мини‑гайды по технологиям

Кратко и по делу: что это за инструмент, как он применяется именно в этом проекте, и что чаще всего ломают.

## 1) Next.js 16 (App Router)
### Зачем в проекте
- Файловый роутинг.
- Server Components для SSR-загрузки данных.
- Server Actions для мутаций.
- Route Handlers для API (`/api/locale`, `/api/marquee`).

### Как использовать в проекте
- Страницы в `src/app/.../page.tsx`.
- Layout'ы оборачивают сегменты `public/admin`.
- Server Actions лежат рядом с фичей (`actions.ts`, `model-actions.ts`, `media-actions.ts`).

### Важные правила
1. `revalidatePath` делай после мутаций.
2. Для мгновенного обновления UI лучше вызывать revalidate из Server Action.
3. Не вызывай `revalidatePath` из Client Component.
4. Для динамического паттерна пути используй корректный формат.

### Типичные ошибки джуна
- Сохранил данные, но забыл revalidate.
- Перенёс server-only код в client component.
- Смешал auth-проверку UI и auth-проверку в server action (нужны обе).

## 2) Supabase (DB/Auth/Storage) + `@supabase/ssr`
### Зачем в проекте
- Единый backend для данных, авторизации и файлов.

### Как использовать в проекте
- Public read client: `src/lib/supabase/public.ts`
- Server client (с записью cookies): `src/lib/supabase/server.ts`
- Read-only server client для Server Components: там же.

### Что важно
1. Никогда не светить `service_role` в клиенте.
2. RLS — обязательна, это не "опция".
3. Storage policy должна соответствовать реальным путям файлов.
4. Если cookies не обновляются, проверь цепочку `createServerClient` + `proxy.ts`.

### Частые проблемы
- Пользователь есть в Auth, но нет строки в `profiles`.
- Путь в Storage изменили, policy забыли.
- Публикация включена, а медиа недоступны из-за policy mismatch.

## 3) React Hook Form + Zod
### Зачем в проекте
- Быстрые формы с минимальными ререндерами.
- Прозрачная типизация и валидация полей.

### Как использовать в проекте
- `AssetForm.tsx`, `MarqueeForm.tsx`.
- `resolver: zodResolver(schema)`.
- Ошибки из `formState.errors`.
- Асинхронный submit через `useTransition` + server action.

### Практика
1. Всегда задавай `defaultValues`.
2. Для чисел/nullable значений делай `setValueAs`.
3. Client validation не заменяет server validation.
4. Для server ошибок используй единый toast/error contract.

## 4) next-intl
### Зачем в проекте
- RU/EN локализация без изменения структуры URL.

### Как использовать в проекте
- Server: `getTranslations(...)`.
- Client: `useTranslations(...)`.
- Locale switch: `/api/locale` + cookie `locale`.

### Правила
1. Любой новый ключ дублируй в RU/EN.
2. Не хардкодь строки в UI.
3. Держи namespace логичным (`public`, `admin.models`, `common` и т.д.).

## 5) `@tanstack/react-virtual`
### Зачем в проекте
- В режиме `LIST` рендерится только видимая часть строк таблицы.

### Как использовать в проекте
- `src/components/models/AssetsTable.tsx`.
- Настройки: `estimateSize`, `measureElement`, `overscan`.

### На что смотреть
- При правках высоты строк не забудь проверить `estimateSize`.
- Если строки "скачут", проверь `measureElement` и CSS высоты.

## 6) Sonner (toast)
### Зачем в проекте
- Единый UX обратной связи после действий в админке.

### Как используется
- `toast.success/error(...)` после server action.
- Глобальный `<Toaster />` подключён в `src/app/layout.tsx`.

## 7) Tailwind 4 + собственный UI слой
### Зачем
- Tailwind для utility.
- Собственные `ui-*` классы и CSS variables для консистентной темы.

### Где менять
- Глобальные переменные: `src/app/globals.css`
- UI-классы: `src/styles/ui.css`

## 8) Подтверждённые best practices (по Context7)
Ниже — тезисы, которые учтены в этой документации на основе официальных источников:
1. Next.js: `revalidatePath` в Server Actions даёт корректное обновление кэшей/роутера после мутации.
2. Supabase SSR: server client должен работать с cookie store; в read-only server context обновление cookies должно идти через middleware/proxy-подход.
3. Supabase RLS/Storage: policy должны быть role-aware и bucket-scoped.
4. React Hook Form: использовать `zodResolver`, типизировать форму через `z.infer`, держать ошибки в `formState.errors`, аккуратно обрабатывать async submit.

## 9) Полезные официальные ссылки
- Next.js `revalidatePath`: https://nextjs.org/docs/app/api-reference/functions/revalidatePath
- Next.js caching guide: https://nextjs.org/docs/app/guides/caching
- Supabase SSR auth (Next.js): https://supabase.com/docs/guides/auth/server-side/nextjs
- Supabase RLS guide: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Storage security: https://supabase.com/docs/guides/storage/security/access-control
- React Hook Form `useForm`: https://react-hook-form.com/docs/useform
- React Hook Form resolvers: https://github.com/react-hook-form/resolvers
- Zod docs: https://zod.dev/

