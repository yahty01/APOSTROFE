-- Добавляем дополнительные музыкальные ссылки инфлюенсера.
-- Поля опциональны: пустые значения не отображаются в публичной карточке.

alter table public.assets
  add column if not exists influencer_yandex_music_url text null,
  add column if not exists influencer_spotify_url text null;

comment on column public.assets.influencer_yandex_music_url is 'Influencer social link: Yandex Music URL (optional)';
comment on column public.assets.influencer_spotify_url is 'Influencer social link: Spotify URL (optional)';
