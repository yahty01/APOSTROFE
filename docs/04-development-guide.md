# 04. Гайд по разработке

Документ для ежедневной работы: как вносить изменения безопасно и предсказуемо.

## 1) Базовый workflow
1. Создай ветку.
2. Реализуй изменение.
3. Проверь линт и i18n:
```bash
pnpm lint
pnpm i18n:check
```
4. Прогони ручной smoke по затронутому flow.
5. Создай PR с описанием, что поменялось на публичной/админской стороне.

## 2) Где менять код в типовых задачах
### Добавить поле в форму сущности
1. БД: новая миграция.
2. Типы: `src/lib/supabase/database.types.ts`.
3. UI: `AssetForm.tsx` + соответствующие страницы edit/new.
4. Actions: `model-actions.ts` (валидация/нормализация/сохранение).
5. Публичный вывод: `PublicRegistryPage`/detail page.
6. i18n ключи: `src/messages/ru.json` + `src/messages/en.json`.

### Изменить правила загрузки медиа
- `src/app/(admin)/admin/(protected)/models/media-actions.ts`
- `src/app/(admin)/admin/(protected)/models/MediaManager.tsx`
- при изменении path/kind обязательно проверить SQL policy в `storage.objects`.

### Изменить CTA-тексты Telegram
- `src/lib/telegram.ts`

## 3) Паттерн для форм в проекте
1. Client form на `react-hook-form` + `zodResolver`.
2. Client validation для UX.
3. Server action validation для безопасности.
4. Toast + `router.refresh()` после успеха.
5. Revalidation нужных путей на сервере.

## 4) Паттерн для Server Actions
- Всегда делай role-gate в начале (`requireAdminOrEditor`).
- Валидируй вход (`zod`).
- Возвращай понятный результат `{ok,error}`.
- Вызывай `revalidatePath` для затронутых страниц.
- Не пробрасывай сырые внутренние ошибки в UI без фильтрации.

## 5) i18n дисциплина
- Любой новый текст в UI идёт в RU и EN.
- Нельзя добавлять ключ только в один словарь.
- Перед PR обязательно `pnpm i18n:check`.

## 6) Ручной smoke-checklist (минимум)
1. Публичные страницы открываются без 500.
2. Админ логин работает.
3. Create/edit/publish/delete работает для одной сущности.
4. Medиа upload/reorder/delete работает.
5. Изменение marquee видно на публичной части.
6. Переключение языка RU/EN работает без потери текущего URL.

## 7) Что особенно аккуратно при рефакторинге
- Любой код, связанный с cookies auth (`server.ts`, `proxy.ts`).
- Любой код вокруг RLS и storage path.
- Любой код вокруг `revalidatePath` (иначе получишь "устаревший UI").

## 8) Рекомендованный формат PR
- Что изменено.
- Почему изменено.
- Какие маршруты затронуты.
- Какие миграции/ENV нужны.
- Как протестировано (конкретные шаги).

