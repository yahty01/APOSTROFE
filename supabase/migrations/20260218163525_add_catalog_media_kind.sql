alter table public.asset_media
  drop constraint if exists asset_media_kind_check;

alter table public.asset_media
  add constraint asset_media_kind_check
  check (kind in ('hero', 'gallery', 'catalog'));

comment on column public.asset_media.kind is 'Media kind: catalog | hero | gallery';
