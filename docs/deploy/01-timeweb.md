# 01 — Деплой на Timeweb (App Platform / VPS)

В этом проекте Next.js используется **не как статичный сайт**, а как приложение с серверной частью (SSR + server actions + админка). Поэтому важный нюанс:

- В Timeweb “Frontend → Next.js” поддерживается только **static build**.
- Для **SSR Next.js** (этот проект) используй **App Platform → деплой из Dockerfile** или **VPS**.

Полезные ссылки Timeweb:
- Деплой из Dockerfile: https://timeweb.cloud/docs/apps/deploying-apps/deploying-from-dockerfile
- Переменные окружения: https://timeweb.cloud/docs/apps/variables
- Управление приложениями (домены/SSL/автодеплой): https://timeweb.cloud/docs/apps/upravlenie-apps-v-paneli

---

## Вариант 1 — Timeweb Cloud App Platform (рекомендуемый)

### Шаг 0. Подготовка репозитория

1) Убедись, что проект собирается локально:

```bash
pnpm install
pnpm lint
pnpm build
```

2) Для SSR‑деплоя на Timeweb нужен `Dockerfile` в корне репозитория (в этом репо он добавлен; см. корень проекта).

### Шаг 1. Создать приложение из GitHub (Dockerfile)

1) Timeweb Cloud → **App Platform** → **Создать приложение**
2) Способ деплоя: **Dockerfile**
3) Подключи GitHub → выбери репозиторий → выбери ветку автодеплоя (обычно `main`)
4) Проверь порт:
   - Timeweb берёт порт из `EXPOSE` в `Dockerfile` (если не указано — будет `8080` по умолчанию).

### Шаг 2. Переменные окружения (обязательно)

Timeweb Cloud → приложение → **Переменные окружения**.

Добавь:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` *(или `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)*
- `SUPABASE_SERVICE_ROLE_KEY` *(опционально; только если нужно на сервере)*

Если в других гайдах ты видишь переменные вида `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — это **для Vite** (они читаются как `import.meta.env.*`). В этом проекте (Next.js) используй имена из `.env.example`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` *(или publishable)*

Важно:
- `NEXT_PUBLIC_*` будут доступны в браузере (это ок для anon/publishable ключа).
- `SUPABASE_SERVICE_ROLE_KEY` никогда не используй на клиенте.
- `NEXT_PUBLIC_SUPABASE_URL` нужна на **runtime** (серверу) для подключения к Supabase. Для `next/image` в конфиге уже разрешён `**.supabase.co`; если у тебя кастомный домен Supabase — проверь, что он добавлен в allowlist изображений.

Про “автоматически подставятся при сборке”: для Next.js это справедливо для `NEXT_PUBLIC_*`, если они используются в коде, который попадает в браузерный бандл. Поэтому самый простой и надёжный путь на App Platform — задавать env vars в UI и делать redeploy после изменений.

### Шаг 3. Запустить деплой и включить автодеплой

1) Нажми “Deploy/Собрать” (или аналогичную кнопку).
2) После первого успешного деплоя включи автодеплой “по последнему выполненному коммиту” (название может отличаться) — тогда каждое изменение в ветке будет пересобираться автоматически.

### Шаг 4. Проверка

1) Открой технический домен, который выдаст Timeweb (вида `*.timeweb.cloud`).
2) Проверь:
   - `/models` открывается
   - `/admin/login` открывается и логин работает
   - после публикации модели она видна на `/models`

Если что-то не работает:
- проверь переменные окружения (и что они применились — иногда нужен redeploy)
- проверь, что миграции Supabase применены (см. [03-supabase.md](03-supabase.md))

---

## Вариант 2 — VPS на Timeweb (максимум контроля)

Этот вариант нужен, если ты хочешь полностью управлять сервером (nginx/systemd, кастомные конфиги, свои правила деплоя).

Минимальная схема:
1) Подними VPS (Ubuntu) и привяжи домен (см. [02-domain.md](02-domain.md)).
2) Установи Node.js (рекомендуемо Node 20+) и `pnpm`.
3) Клонируй репозиторий → поставь зависимости → `pnpm build`.
4) Запусти `pnpm start` под процесс‑менеджером (systemd/pm2).
5) Поставь nginx как reverse proxy + HTTPS (Let's Encrypt).
6) Настрой CD через GitHub Actions (см. [04-ci-cd.md](04-ci-cd.md)).
