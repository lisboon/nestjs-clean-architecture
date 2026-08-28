<h1 align="center">NestJS Clean Architecture</h1>

<p align="center">
  Production-ready backend template built with DDD, hexagonal architecture and NestJS.<br />
  Business rules stay in plain TypeScript; NestJS, Prisma and HTTP stay at the edges.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white" alt="NestJS 11" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5.9" />
  <img src="https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white" alt="Prisma 7" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL 16" />
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="MIT License" />
</p>

<p align="center"><strong>English</strong> · <a href="./README.pt-BR.md">Português</a></p>

## Why this template?

Most backend starters show framework syntax. This one demonstrates how to protect business rules as the system grows: domain entities and use cases depend on ports, while NestJS controllers, Prisma repositories, JWT and bcrypt are replaceable adapters.

The included User, Auth and Company modules exercise real cross-aggregate rules, transactions and concurrency—not only isolated CRUD.

## Highlights

- Domain and use cases have no NestJS, Prisma or HTTP dependencies; ESLint enforces the boundary.
- Typed repository ports, Prisma adapters, mappers, query builders, facades and factories.
- Serializable transactions with bounded retry for PostgreSQL write conflicts.
- Race-safe uniqueness and protection of cross-aggregate invariants.
- Database-backed session validation, token revocation, roles, bcrypt and rate limiting.
- Validated runtime configuration, CORS allowlist, Helmet and request correlation IDs.
- OpenAPI contracts, liveness/readiness probes and graceful shutdown.
- Unit tests plus isolated PostgreSQL E2E and concurrency tests.
- Multi-stage production and migration images, CI, Dependabot and commit hooks.

## Architecture

```text
src/
├── modules/
│   ├── @shared/          # domain primitives, errors, repository and transaction ports
│   ├── user/             # domain, use cases, gateway, Prisma adapter, facade and factory
│   └── company/          # second aggregate and cross-aggregate rules
└── infra/
    ├── http/             # NestJS controllers, DTOs, guards, filters and bootstrap
    ├── database/         # Prisma client and transaction adapter
    └── services/         # JWT and bcrypt adapters
```

HTTP DTOs own transport validation. Use cases receive plain inputs. Repository interfaces return domain entities, and persistence mappers isolate Prisma records. An opaque transaction context lets related repositories share one atomic transaction without leaking ORM types into the application core.

This structure has deliberate ceremony. It pays off when business rules, integrations and teams grow; for a small CRUD with no expected growth, it may be more architecture than necessary.

## Quick start

Requirements: Node.js 24, pnpm and PostgreSQL 16—or Docker.

```bash
git clone https://github.com/lisboon/nestjs-clean-architecture.git
cd nestjs-clean-architecture
pnpm install
cp .env.example .env
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
pnpm start:dev
```

The API runs at `http://localhost:3001`; Swagger is available at `/api-docs` outside production.

### Docker

```bash
cp .env.example .env
docker compose up --build
```

This starts PostgreSQL, applies migrations and runs the API. Run `pnpm exec prisma studio` on the host to inspect the database at `http://localhost:5555`.

## Commands

| Command                         | Purpose                                    |
| ------------------------------- | ------------------------------------------ |
| `pnpm start:dev`                | Run with watch mode                        |
| `pnpm build && pnpm start:prod` | Build and run production code              |
| `pnpm lint` / `pnpm typecheck`  | Static quality gates                       |
| `pnpm test`                     | Unit tests                                 |
| `pnpm test:e2e`                 | Isolated PostgreSQL E2E tests on port 5433 |
| `pnpm test:openapi`             | Verify the generated API contract          |
| `pnpm test:cov`                 | Generate coverage report                   |

## Runtime contract

Required settings are documented in [`.env.example`](./.env.example) and validated before startup. Important endpoints and behaviors:

- `GET /health/live` checks the process; `GET /health/ready` checks PostgreSQL.
- Every response carries `X-Request-Id`; production logs are structured and omit sensitive data.
- Expected errors use `{ statusCode, error, message }`; validation errors return field issues.
- Swagger is disabled in production.

The seed creates the initial company and admin from `SEED_COMPANY_*` and `SEED_ADMIN_*` values.

## Deployment

The default Docker target is a non-root runtime image. The `migrator` target contains Prisma tooling and migration history:

```bash
docker build --target migrator -t nestjs-app-migrator .
docker run --rm --env DATABASE_URL="$DATABASE_URL" nestjs-app-migrator
docker build --target runner -t nestjs-app-backend .
```

Run the migrator once before rolling out the matching application revision. CI builds both images, applies real migrations, verifies schema drift, runs all tests and rejects high-severity production vulnerabilities.

## Trade-offs

- Session validation queries PostgreSQL on every authenticated request so revocation and role changes take effect immediately. High-traffic systems can add an invalidation-aware cache.
- Transaction callbacks must keep non-idempotent external effects outside the retryable transaction.
- This template provides architectural foundations, not domain-agnostic abstractions for every future requirement.

## Contributing and security

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the development workflow and [SECURITY.md](./SECURITY.md) for private vulnerability reporting.

Licensed under the [MIT License](./LICENSE).
