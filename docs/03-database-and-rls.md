# 03. База данных, RLS и Storage

## 1) Порядок миграций
1. `20260201000000_init.sql`
2. `20260202021000_add_column_comments.sql`
3. `20260216190000_add_asset_entity_fields.sql`
4. `20260217123000_add_influencer_social_links_v2.sql`
5. `20260217164000_add_influencer_music_links.sql`
6. `20260218163525_add_catalog_media_kind.sql`

## 2) Основные таблицы
### `public.profiles`
- `id` (FK на `auth.users.id`)
- `role`: `admin | editor`
- `created_at`

### `public.assets`
- Базовые поля: `id`, `entity_type`, `document_id`, `title`, `description`
- Публичная классификация: `model_type | creator_direction | influencer_topic`
- Для influencer: `influencer_platforms` и соц. URL поля
- Публикация: `is_published`
- Метаданные: `measurements`, `details`, timestamps

### `public.asset_media`
- `asset_id`
- `path`
- `kind`: `catalog | hero | gallery`
- `order_index`

### `public.settings_marquee`
- Single row (`id=1`)
- `enabled`, `text_ru`, `text_en`, `speed`, `direction`

## 3) Триггеры/функции
- `set_updated_at()` + trigger на `assets.updated_at`
- `handle_new_user()` + trigger на `auth.users` для авто-создания `profiles`
- `is_admin_or_editor()` — helper для политик

## 4) RLS политики
### 4.1 Public
- `assets`: select только `is_published = true`
- `asset_media`: select только если связанный asset опубликован
- `settings_marquee`: select разрешён

### 4.2 Admin/Editor
- CRUD для `assets`, `asset_media`, `settings_marquee` через `is_admin_or_editor()`.

### 4.3 Почему так
Даже если кто-то получил anon key, unpublished данные не должны читаться из БД/Storage.

## 5) Storage
- Bucket: `assets` (private bucket).
- Путь файлов:
- `{document_id}/catalog/{uuid}.{ext}`
- `{document_id}/hero/{uuid}.{ext}`
- `{document_id}/gallery/{uuid}.{ext}`

Политики:
- Read: только когда в `assets` запись опубликована.
- Write: только admin/editor.

## 6) Практические SQL-запросы
### Проверить роль пользователя
```sql
select p.id, p.role
from public.profiles p
where p.id = '<auth.users.id>';
```

### Найти непубликованные записи
```sql
select id, entity_type, document_id, title
from public.assets
where is_published = false
order by updated_at desc;
```

### Проверить сиротские медиа (на случай ручных правок)
```sql
select m.id, m.asset_id, m.path
from public.asset_media m
left join public.assets a on a.id = m.asset_id
where a.id is null;
```

## 7) Типичные проблемы и диагностика
1. Пользователь логинится, но не может редактировать:
- проверь `profiles.role`.

2. Изображение загружено, но не отображается в публичной части:
- проверь `is_published` у ассета;
- проверь path и storage policy.

3. Ошибка при вставке ассета (уникальность):
- в create flow уже есть retry на `document_id`, но при ручных insert проверяй `assets_document_id_key`.

## 8) Что не стоит делать
- Не отключай RLS "временно" в проде.
- Не используй `service_role` в клиентском коде.
- Не меняй структуру path без обновления policy и media-actions.

