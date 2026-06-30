<p align="center">
  <h1 align="center">Backend API · NestJS + Clean Architecture</h1>
</p>

<p align="center">
  NestJS backend starter built with Domain-Driven Design and Clean Architecture. The business rules stay in plain TypeScript and the framework stays at the edges.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white" alt="NestJS 11" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5.9" />
  <img src="https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white" alt="Prisma 7" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL 16" />
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License MIT" />
</p>

<p align="center">
  <strong>English</strong> · <a href="./README.pt-BR.md">Português</a>
</p>

## Description

NestJS backend built with DDD and Clean Architecture. The domain layer doesn't depend on Nest, Prisma or HTTP: the business rules are plain TypeScript classes and the framework stays at the boundary. Controllers, guards, the Prisma adapter and the JWT/bcrypt implementations are all infrastructure plugged into interfaces (ports).

The code implements the User, Auth and Company domains. They work as a reference for how the other modules should be built. The infrastructure (CI, Docker, migrations, validation, linting, commit hooks) is already set up, so adding a new domain doesn't mean redoing the foundation.

## Architecture

The code is split into a framework-agnostic core and an infrastructure shell.

```
src/
├── modules/                # application core (no framework imports)
│   ├── @shared/            # base entity & value objects, domain errors,
│   │                       # events, validation (Notification), repository
│   │                       # abstractions, transaction manager interface
│   ├── user/               # auth + user CRUD (a User belongs to one Company)
│   │   ├── domain/         # User entity + validators
│   │   ├── usecase/        # one class per use case (login, create, update,
│   │   │                   # delete, find, change-password, validate-session)
│   │   ├── gateway/        # repository interface (the port)
│   │   ├── repository/     # Prisma adapter + query builder
│   │   ├── facade/         # module entry point
│   │   └── factory/        # dependency wiring
│   └── company/            # company CRUD; a User belongs to one Company (1:N)
│       ├── domain/         # Company entity + validators
│       ├── usecase/        # create, find, update, delete (with cross-aggregate
│       │                   # rules: a user needs a valid company, and a company
│       │                   # with active users cannot be deleted)
│       ├── gateway/        # repository interface (the port)
│       ├── repository/     # Prisma adapter + query builder
│       ├── facade/         # module entry point
│       └── factory/        # dependency wiring
└── infra/                  # the framework lives here
    ├── http/               # Nest bootstrap, controllers, guards, filters
    ├── database/           # Prisma client + transaction manager
    └── services/           # bcrypt and JWT implementations
```

Some decisions behind the structure:

- The domain layer never imports Nest or Prisma. The PR template checks for it, so it isn't left to good intentions. That keeps the business logic easy to test on its own and the framework replaceable.
- Validation runs through a `Notification` object instead of throwing on the first error, so an entity can report every invalid field at once.
- Each use case is a single class behind an interface, composed by a facade and wired in a factory, which keeps the controllers thin.
- Auth is strict on purpose. Session validation reads the role from the database instead of trusting the token, changing a password invalidates tokens issued before the change (`tokenValidAfter`), and the login route has a tighter rate limit than the rest.

A couple of honest trade-offs worth naming:

- The ceremony (a use case, DTO, gateway, repository, facade and factory per operation) is deliberately expensive for a plain CRUD. The payoff (testability and a replaceable framework) only shows up as the domain grows. That is why `Company` and its 1:N link to `User` are here: to show the structure holding across a second, related aggregate instead of a single isolated entity. For one small entity it would be overkill, and that is fine to admit.
- `validate-session` hits the database on every request on purpose, so a revoked or demoted user loses access immediately. At higher traffic a Redis cache keyed by user and busted through `tokenValidAfter` would cut that load. It is left out on purpose: this is a template, and the extra infrastructure does not pay for itself yet.

## Stack

- **Runtime:** Node.js 24, pnpm
- **Framework:** NestJS 11, TypeScript 5.9 (built with SWC)
- **Database:** PostgreSQL 16 via Prisma 7 (`@prisma/adapter-pg`)
- **Auth & security:** JWT (HS256), bcrypt, Helmet, `@nestjs/throttler`, CORS allowlist
- **Validation:** class-validator / class-transformer
- **Docs:** Swagger (OpenAPI)
- **Tests:** Jest 30, Supertest (unit + e2e)
- **Tooling:** ESLint 9 (flat config) + Prettier, Husky, commitlint, lint-staged, Dependabot, GitHub Actions, Docker

## Prerequisites

- Node.js 24 (an `.nvmrc` is provided, run `nvm use`)
- pnpm
- PostgreSQL 16, or Docker if you'd rather not install it locally

## Project setup

```bash
pnpm install
cp .env.example .env   # then fill in the values
```

Generate the Prisma client and apply the migrations:

```bash
pnpm prisma:generate
pnpm prisma:migrate
```

Seed the first admin user (uses the `SEED_ADMIN_*` variables from your `.env`):

```bash
pnpm prisma:seed
```

## Compile and run the project

```bash
# development (watch mode)
pnpm start:dev

# production
pnpm build
pnpm start:prod
```

The API starts on the port defined by `PORT` (default `3001`).

### With Docker

The compose file brings up the API together with a PostgreSQL container and runs the migrations on startup:

```bash
docker compose up --build
```

- API at `http://localhost:3001`
- Prisma Studio at `http://localhost:5555`

## Environment variables

| Variable              | Description                                              |
| --------------------- | -------------------------------------------------------- |
| `NODE_ENV`            | `development`, `test` or `production`                    |
| `PORT`                | HTTP port (default `3001`)                               |
| `DATABASE_URL`        | PostgreSQL connection string                             |
| `CORS_ORIGINS`        | Comma-separated list of allowed origins                  |
| `JWT_SECRET`          | JWT signing secret (min. 32 chars in non-test envs)      |
| `JWT_EXPIRES_IN`      | Token lifetime (e.g. `7d`)                               |
| `BCRYPT_ROUNDS`       | bcrypt cost factor (min. 10)                             |
| `THROTTLE_LIMIT`      | Default request limit per window                         |
| `THROTTLE_WINDOW_MS`  | Rate-limit window in milliseconds                        |
| `SEED_ADMIN_EMAIL`    | Email of the admin created by the seed                   |
| `SEED_ADMIN_PASSWORD` | Password of the seeded admin                             |
| `SEED_ADMIN_NAME`     | Display name of the seeded admin                         |

## Run tests

```bash
# unit tests
pnpm test

# e2e tests (requires a running PostgreSQL)
pnpm test:e2e

# coverage
pnpm test:cov
```

Unit tests cover the entities, use cases and guards. The e2e suite exercises the auth, user and company routes against a real database, including the cases that matter: revoked tokens, protecting the last active admin, role enforcement, and blocking deletion of a company that still has active users.

## API documentation

In non-production environments, Swagger is served at:

```
http://localhost:3001/api-docs
```

## Code quality

```bash
pnpm lint        # ESLint + Prettier
pnpm typecheck   # tsc --noEmit
```

Commits follow the [Conventional Commits](https://www.conventionalcommits.org/) spec, enforced by commitlint through a Husky hook, and lint-staged runs ESLint on staged files before each commit. CI runs lint, type-check, build, the full test suite, a Docker build and a Prisma schema-drift check on every push and pull request.

## Deployment

Build the production image with the multi-stage `Dockerfile` (it compiles, prunes dev dependencies and runs as a non-root user with a healthcheck). On deploy, apply migrations before starting the app:

```bash
pnpm exec prisma migrate deploy
```

Provide the environment variables through your orchestrator; they're never baked into the image.

## License

[MIT](./LICENSE).
