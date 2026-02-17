-- Split public assets registry into multiple entity types:
-- model | creator | influencer

alter table public.assets
  add column if not exists entity_type text not null default 'model',
  add column if not exists model_type text null,
  add column if not exists creator_direction text null,
  add column if not exists influencer_topic text null,
  add column if not exists influencer_platforms text null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'assets_entity_type_check'
  ) then
    alter table public.assets
      add constraint assets_entity_type_check
      check (entity_type in ('model', 'creator', 'influencer'));
  end if;
end $$;

update public.assets
set entity_type = 'model'
where entity_type is distinct from 'model'
  and entity_type not in ('creator', 'influencer');

-- Keep existing model data readable by the new public page filters.
update public.assets
set model_type = coalesce(nullif(trim(model_type), ''), nullif(trim(category), ''))
where entity_type = 'model';

create index if not exists assets_entity_type_published_created_idx
  on public.assets (entity_type, is_published, created_at desc);

comment on column public.assets.entity_type is 'Registry entity type: model | creator | influencer';
comment on column public.assets.model_type is 'Model type (used on /models cards and filter)';
comment on column public.assets.creator_direction is 'Creator direction (used on /creators cards and filter)';
comment on column public.assets.influencer_topic is 'Influencer topic (used on /influencers cards and filter)';
comment on column public.assets.influencer_platforms is 'Influencer platforms list (used on /influencers cards)';
