# Contributing

Thanks for helping improve this template. Keep changes focused, explain the architectural reason behind them and avoid abstractions without a concrete use case.

## Development workflow

1. Create a branch from `main` using a descriptive prefix such as `feat/`, `fix/`, `refactor/`, `test/` or `docs/`.
2. Copy `.env.example` to `.env`, run `pnpm install` and generate the Prisma client with `pnpm prisma:generate`.
3. Add or update tests for changed behavior.
4. Before opening a pull request, run:

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test
pnpm test:e2e
pnpm test:openapi
```

5. Use Conventional Commits and complete the pull request checklist.

## Architectural boundaries

- Domain code must remain independent of NestJS, Prisma and transport concerns.
- Use cases depend on ports and plain inputs, not HTTP DTOs.
- Persistence models are translated through mappers and must not escape adapters.
- Cross-aggregate invariant checks and their writes belong to the same transaction.
- Prefer explicit module-specific code over generic abstractions without proven reuse.

Schema changes must include a migration. New environment variables must be validated and added to `.env.example`. Never include credentials or production data in issues, fixtures or logs.

By participating, you agree to follow the [Code of Conduct](./.github/CODE_OF_CONDUCT.md). Security vulnerabilities must be reported through [SECURITY.md](./SECURITY.md), not a public issue.
