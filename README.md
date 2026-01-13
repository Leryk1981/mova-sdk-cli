# MOVA SDK CLI

Command-line interface for MOVA Agent: scaffolding projects, validating plans, running locally or via MCP, managing drivers, policies, and episodes.

## Installation
```bash
npm i -g @leryk1981/mova-sdk-cli
```

## Quick start
```bash
mova init my-project
cd my-project
mova plan -s env.mova_agent_plan_v1.json plans/plan.sample.json
mova run plans/plan.sample.json
```

## Commands
- `init [project]` — create scaffold (`configs`, `episodes`, `plans/plan.sample.json`).
- `plan -s <schema> <planFile>` — validate a plan against schema id/path.
- `run [--endpoint <url>] <planFile>` — execute locally (ts-node tools/mova-agent.ts) or POST to MCP endpoint.
- `driver:add <name>` — generate driver skeleton in `src/drivers/` and register in index.
- `policy:set --role <role> --verb <verb> (--allow|--deny)` — set policy rule in `configs/instruction_profile.default.json`.
- `policy:show` — display current policy profile.
- `episode:list [--verb <verb>] [--tool <tool>]` — list episodes from `episodes/`.
- `episode:export <episodeId> [--format json|csv] [--output <path>]` — export a specific episode.

## Scripts
```bash
npm run lint            # ESLint
npm test                # Jest + ts-jest
npm run build           # tsc -> dist/
npm run check:docs      # optional doc check (if added)
```

## Publishing & CI
- `prepublishOnly`: runs `npm test` and `npm run lint`.
- GitHub Actions (`.github/workflows/ci.yml`): lint → test → build; publishes on tags `v*` if `NPM_TOKEN` is provided.

## Development
```bash
npm install
npm run build
npm link
mova --help
```
