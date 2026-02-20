# Документация проекта APOSTROFE

Этот раздел переписан как рабочая документация для передачи проекта другому разработчику (в том числе джуну).

## В каком порядке читать
1. `docs/01-project-overview.md`
2. `docs/02-architecture.md`
3. `docs/03-database-and-rls.md`
4. `docs/04-development-guide.md`
5. `docs/05-technology-mini-guides.md`
6. `docs/06-deployment-and-ops.md`
7. `docs/07-documentation-review.md`

## Что где искать
- Если нужно понять продукт и сценарии: `docs/01-project-overview.md`
- Если нужно чинить баг: `docs/02-architecture.md`
- Если вопрос про данные/безопасность: `docs/03-database-and-rls.md`
- Если ты начинаешь писать новый код: `docs/04-development-guide.md`
- Если надо быстро освоить конкретную технологию из стека: `docs/05-technology-mini-guides.md`
- Если готовишь релиз/деплой: `docs/06-deployment-and-ops.md`

## Принцип этой документации
- Пишем с позиции "передаём проект": где смотреть код, почему сделано так, какие ограничения.
- Не дублируем исходники целиком — объясняем ответственность модулей и flow.
- Отмечаем, где высок риск ошибок (auth, RLS, storage, revalidation).

