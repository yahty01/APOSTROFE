# 04 — Быстрый CI/CD (GitHub → Timeweb + проверки)

В этой архитектуре удобно разделять понятия:
- **CI** (проверки) — почти всегда GitHub Actions (lint/build/проверки миграций).
- **CD** (деплой) — зависит от того, как ты хостишь фронт/приложение на Timeweb:
  - **App Platform**: CD “из коробки” (автодеплой по пушу в выбранную ветку).
  - **VPS**: CD делаем сами (обычно через GitHub Actions → SSH на сервер).

## 1) CD на Timeweb App Platform (самый быстрый вариант)

Если приложение задеплоено в App Platform и подключён GitHub (см. [01-timeweb.md](01-timeweb.md)), то:
- деплой можно запускать вручную из панели
- автодеплой включается настройкой “собирать по последнему выполненному коммиту” (название может отличаться)

Чтобы сделать это надёжнее, добавь branch protection:
1) GitHub → Settings → Branches → Branch protection rules
2) Для `main` включи:
   - Require a pull request before merging
   - Require status checks to pass before merging (подключим ниже)

## 2) CI: минимальный GitHub Actions (lint + build)

Создай файл `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  lint_build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10.11.0

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm build
```

Дальше:
1) Сделай commit/push.
2) Убедись, что workflow стартует на PR.
3) В branch protection добавь обязательный чек `CI / lint_build`.

## 3) CI: проверка Supabase миграций (опционально, но очень полезно)

Это нужно, чтобы миграции не “падали” после мержа.
Под капотом Supabase CLI запускает локальный стек (нужен Docker).

Добавь второй job в `ci.yml` (или отдельный workflow), пример:

```yaml
  supabase_migrations:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Start local Supabase
        run: supabase db start

      - name: Verify generated types are checked in
        run: |
          supabase gen types typescript --local > types.gen.ts
          if ! git diff --ignore-space-at-eol --exit-code --quiet types.gen.ts; then
            echo "Detected uncommitted changes after build:"
            git diff
            exit 1
          fi
```

Заметки, чтобы это реально работало в этом репозитории:
- Если в проекте ещё нет `supabase/config.toml`, сначала сделай `supabase init` и закоммить конфиг (см. `03-supabase.md`).
- Вместо `types.gen.ts` можно генерировать прямо в `src/lib/supabase/database.types.ts` и проверять diff.

## 4) CD на Timeweb VPS через GitHub Actions (если ты не на App Platform)

Идея: при пуше в `main` GitHub Actions заходит по SSH на сервер, обновляет код и перезапускает сервис.

Минимальные требования на сервере:
- репозиторий уже клонирован
- настроен процесс‑менеджер (systemd/pm2) для `pnpm start`

Пример workflow `.github/workflows/deploy.yml` (скелет):

```yaml
name: Deploy (VPS)

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.TIMEWEB_HOST }}
          username: ${{ secrets.TIMEWEB_USER }}
          key: ${{ secrets.TIMEWEB_SSH_KEY }}
          port: ${{ secrets.TIMEWEB_SSH_PORT }}
          script: |
            set -e
            cd /var/www/apostrofe
            git fetch --all
            git reset --hard origin/main
            pnpm install --frozen-lockfile
            pnpm build
            sudo systemctl restart apostrofe
```

Секреты в GitHub:
- `TIMEWEB_HOST`, `TIMEWEB_USER`, `TIMEWEB_SSH_KEY`, `TIMEWEB_SSH_PORT`

## 5) Что делать с “деплоем БД” (пока просто и безопасно)

Для MVP самый безопасный подход:
- миграции прогоняются в CI локально (п.3)
- в облако Supabase изменения применяешь вручную (SQL Editor) или через CLI осознанно (когда готов)

Так ты не получишь ситуацию “код задеплоился, а схема в базе ещё старая”.
