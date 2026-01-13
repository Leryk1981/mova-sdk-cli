# MOVA SDK CLI (v0.1.0)

Command-line interface for MOVA Agent: scaffold projects, validate plans, run locally or via MCP gateway, manage drivers, policies, and episodes.

- npm: https://www.npmjs.com/package/@leryk1981/mova-sdk-cli  
- repo: https://github.com/Leryk1981/mova_agent/tree/main/sdk-cli  
- spec package: https://www.npmjs.com/package/@leryk1981/mova-spec

## Installation
```bash
# global install
npm i -g @leryk1981/mova-sdk-cli

# local + link (alternative)
git clone https://github.com/Leryk1981/mova_agent.git
cd mova_agent/sdk-cli
npm install
npm run build
npm link   # exposes `mova` globally from this checkout
```

## Quick start
```bash
mova init my-project
cd my-project
mova plan -s env.mova_agent_plan_v1.json plans/plan.sample.json
mova run plans/plan.sample.json
```

## Commands (with examples)
- `init [project]`  
  Создаёт scaffold: `configs/`, `episodes/`, `plans/plan.sample.json`. Если имя не указано, использует текущую директорию.  
  ```bash
  mova init demo
  ```

- `plan -s <schemaIdOrFile> <planFile>`  
  Валидирует план через @leryk1981/mova-spec. Коды выхода: `0` – PASS, `2` – FAIL валидации, `1` – ошибка выполнения.  
  ```bash
  mova plan -s env.mova_agent_plan_v1.json plans/plan.sample.json
  ```

- `run [--endpoint <url>] <planFile>`  
  Без `--endpoint` запускает локально (`npx ts-node tools/mova-agent.ts --plan <file>`). С `--endpoint` шлёт POST в MCP gateway.  
  ```bash
  mova run plans/plan.sample.json
  mova run --endpoint http://localhost:3000/run plans/plan.sample.json
  ```

- `driver:add <name>`  
  Генерирует скелет драйвера в `src/drivers/<name>.ts` и регистрирует в `src/drivers/index.ts`.  
  ```bash
  mova driver:add http
  ```

- `policy:set --role <role> --verb <verb> (--allow|--deny)` / `policy:show`  
  Обновляет `configs/instruction_profile.default.json` (RBAC/whitelist).  
  ```bash
  mova policy:set --role admin --verb noop --allow
  mova policy:show
  ```

- `episode:list [--verb <verb>] [--tool <toolId>]`  
  Выводит содержимое `episodes/`, фильтруя по verb/tool.  
  ```bash
  mova episode:list --verb noop
  ```

- `episode:export <episodeId> [--format json|csv] [--output <path>]`  
  Экспортирует выбранный эпизод в JSON/CSV.  
  ```bash
  mova episode:export ep-1 --format csv --output ./out.csv
  ```

## Project layout
- `src/cli.ts` — точка входа CLI.
- `src/commands/` — реализации init/plan/run/driver/policy/episode.
- `src/utils/validator.ts` — обёртка над @leryk1981/mova-spec.
- `bin/mova-cli.js` — исполняемый entry для npm bin.
- `configs/`, `episodes/`, `plans/` — создаются командой `init`.
- Примеры схем и планов — в пакете `@leryk1981/mova-spec` (папка `examples/`).

## Troubleshooting
- «Plan file not found» — проверьте путь к плану относительно текущей директории.
- «Schema not found / failed to load» — передайте корректный `$id` или путь к схеме (`-s schema.json`), убедитесь, что пакет `@leryk1981/mova-spec` установлен.
- MCP endpoint ошибки — уточните URL (`--endpoint`), проверьте доступность и корректный формат запроса.
- Генерация драйвера повторно — если файл уже есть, команда завершится ошибкой; удалите или выберите другое имя.

## Development scripts
```bash
npm run lint     # ESLint
npm test         # Jest + ts-jest
npm run build    # tsc -> dist/
npm run ci       # lint + test + build
npm run release:check  # ci + npm pack
```

## Publishing & CI
- `prepublishOnly`: `npm test && npm run lint`.
- GitHub Actions: `.github/workflows/ci.yml` — lint → test → build; публикует на тегах `v*`, если задан `NPM_TOKEN`.

## See also
- MOVA Agent core: https://github.com/Leryk1981/mova_agent
- MOVA spec & schemas: https://www.npmjs.com/package/@leryk1981/mova-spec

## License
Apache-2.0
