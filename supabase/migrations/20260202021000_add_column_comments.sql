-- Human-readable comments for Supabase dashboard (MVP)

comment on table public.profiles is 'User profiles linked to auth.users. Stores role for admin area.';
comment on column public.profiles.id is 'FK to auth.users.id';
comment on column public.profiles.role is 'Role for admin area: admin | editor';
comment on column public.profiles.created_at is 'Row creation timestamp';

comment on table public.assets is 'Catalog items (models). Public pages show only is_published=true.';
comment on column public.assets.id is 'Internal UUID (primary key)';
comment on column public.assets.document_id is 'External identifier used in URLs (/models/[document_id]) and as Storage folder name';
comment on column public.assets.title is 'Public title';
comment on column public.assets.description is 'Public description (optional)';
comment on column public.assets.category is 'Public category used for /models filter (optional)';
comment on column public.assets.license_type is 'License label (optional, free text)';
comment on column public.assets.status is 'Internal status label (optional, free text)';
comment on column public.assets.measurements is 'JSON object of measurements (optional)';
comment on column public.assets.details is 'JSON object of extra details (optional)';
comment on column public.assets.is_published is 'If true: visible on public pages and media can be read per storage policy';
comment on column public.assets.created_at is 'Row creation timestamp';
comment on column public.assets.updated_at is 'Row update timestamp (auto via trigger)';

comment on table public.asset_media is 'Media entries for assets (hero + gallery). Points to Storage path.';
comment on column public.asset_media.id is 'Internal UUID (primary key)';
comment on column public.asset_media.asset_id is 'FK to public.assets.id';
comment on column public.asset_media.path is 'Storage object path inside bucket assets, without bucket prefix';
comment on column public.asset_media.kind is 'Media kind: hero | gallery';
comment on column public.asset_media.order_index is 'Ordering for gallery (ascending)';
comment on column public.asset_media.created_at is 'Row creation timestamp';

comment on table public.settings_marquee is 'Single-row table (id=1) for header marquee settings.';
comment on column public.settings_marquee.id is 'Constant id=1';
comment on column public.settings_marquee.enabled is 'Show/hide marquee';
comment on column public.settings_marquee.text_ru is 'Marquee text (RU)';
comment on column public.settings_marquee.text_en is 'Marquee text (EN)';
comment on column public.settings_marquee.speed is 'Optional speed setting (client may apply minimally)';
comment on column public.settings_marquee.direction is 'Optional direction setting (left|right)';

