# MCP → Supabase в Cursor (доступ для Codex/агента)

Эта заметка — как подключить **Supabase MCP** к **Cursor**, чтобы агент мог получать список таблиц, выполнять SQL, смотреть логи и т.д. через MCP tools.

## Вариант A (рекомендуется): Hosted MCP + OAuth (без токена)

Supabase больше **не требует** Personal Access Token (PAT) для MCP — Cursor откроет браузер и попросит авторизацию.

1) Создай файл `.cursor/mcp.json` в корне репозитория:

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp"
    }
  }
}
```

2) Перезапусти Cursor.
3) Проверь подключение: **Settings → Cursor Settings → Tools & MCP**.
4) Для проверки в чате попроси что-то вроде: `What tables are there in the database? Use MCP tools.`

### (Опционально) Ограничить доступ одним проектом

Можно скоупнуть MCP на проект через `project_ref`:

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=${SUPABASE_PROJECT_REF}"
    }
  }
}
```

Где `SUPABASE_PROJECT_REF` — это поддомен в `https://<project_ref>.supabase.co` (или часть URL в Dashboard вида `/project/<project_ref>`).

## Вариант B: по токену (PAT) через заголовок Authorization

Подходит, если OAuth по какой-то причине не срабатывает или нужен headless-подход.

1) Создай/обнови `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=${SUPABASE_PROJECT_REF}",
      "headers": {
        "Authorization": "Bearer ${SUPABASE_ACCESS_TOKEN}"
      }
    }
  }
}
```

2) Убедись, что переменные окружения доступны **самому Cursor** (а не только `pnpm dev`):
   - `SUPABASE_PROJECT_REF` — ref проекта
   - `SUPABASE_ACCESS_TOKEN` — Supabase Personal Access Token

### macOS: как прокинуть env в GUI-приложение Cursor

Проще всего:

1) Полностью закрой Cursor (**Quit**, не просто закрыть окно).
2) Запусти Cursor из терминала, предварительно экспортировав env:

```bash
cd /path/to/APOSTROFE
set -a
source .env.local
set +a

# если project_ref не задан отдельной переменной — задай вручную
export SUPABASE_PROJECT_REF="<project_ref>"

open -na Cursor .
```

Если инструменты не появились — перезапусти Cursor ещё раз и проверь **Tools & MCP**.

## Замечания по безопасности

- Начинай с **Read-only** в настройках MCP (и включай write-инструменты только если реально нужно).
- Не добавляй токены в git: храни их в `.env.local`/секрет-хранилище и используй `${...}` подстановку.

