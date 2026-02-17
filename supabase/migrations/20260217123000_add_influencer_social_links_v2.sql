-- Add fixed influencer social URL fields (optional).
-- Used only for entity_type='influencer'; values are nullable and hidden if empty.

alter table public.assets
  add column if not exists influencer_instagram_url text null,
  add column if not exists influencer_youtube_url text null,
  add column if not exists influencer_tiktok_url text null,
  add column if not exists influencer_telegram_url text null,
  add column if not exists influencer_website_url text null,
  add column if not exists influencer_vk_url text null,
  add column if not exists influencer_other_url text null;

comment on column public.assets.influencer_instagram_url is 'Influencer social link: Instagram URL (optional)';
comment on column public.assets.influencer_youtube_url is 'Influencer social link: YouTube URL (optional)';
comment on column public.assets.influencer_tiktok_url is 'Influencer social link: TikTok URL (optional)';
comment on column public.assets.influencer_telegram_url is 'Influencer social link: Telegram URL (optional)';
comment on column public.assets.influencer_website_url is 'Influencer social link: Website URL (optional)';
comment on column public.assets.influencer_vk_url is 'Influencer social link: VK URL (optional)';
comment on column public.assets.influencer_other_url is 'Influencer social link: Other URL (optional)';
