# Деплой APOSTROFE: Timeweb + домен + Supabase + CI/CD

Этот раздел — пошаговый гайд по выкладке проекта на **Timeweb Cloud**, подключению домена (то, что часто называют “купленный IP”), связке с Supabase и быстрой настройке CI/CD через GitHub.

## Что читать и в каком порядке

1) [01-timeweb.md](01-timeweb.md) — деплой на Timeweb (App Platform/Dockerfile или VPS) + автодеплой из GitHub
2) [02-domain.md](02-domain.md) — подключение домена и DNS (апекс + `www`)
3) [03-supabase.md](03-supabase.md) — Supabase: env, миграции, Auth, Storage, проверки
4) [04-ci-cd.md](04-ci-cd.md) — быстрый CI (GitHub Actions) + CD на Timeweb

## Мини-чеклист (после прочтения)

- [ ] Supabase проект создан, схема применена, Storage bucket и политики на месте
- [ ] В Timeweb создано приложение и подключён GitHub репозиторий
- [ ] Env vars добавлены в Timeweb и применены (после restart/redeploy)
- [ ] Деплой успешен, `/models` открывается
- [ ] Кастомный домен подключён и подтверждён через DNS
- [ ] (Опционально) GitHub Actions: `pnpm lint` и `pnpm build` проходят на PR
