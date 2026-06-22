<p align="center">
  <h1 align="center">Backend API · NestJS + Clean Architecture</h1>
</p>

<p align="center">
  Starter de backend em NestJS feito com Domain-Driven Design e Clean Architecture. As regras de negócio ficam em TypeScript puro e o framework fica nas bordas.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white" alt="NestJS 11" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5.9" />
  <img src="https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white" alt="Prisma 7" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL 16" />
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License MIT" />
</p>

<p align="center">
  <a href="./README.md">English</a> · <strong>Português</strong>
</p>

## Descrição

Backend em NestJS feito com DDD e Clean Architecture. A camada de domínio não depende de Nest, Prisma nem HTTP: as regras de negócio são classes de TypeScript puro e o framework fica na borda. Controllers, guards, o adapter do Prisma e as implementações de JWT/bcrypt são tudo infraestrutura plugada em interfaces (ports).

Por enquanto o código implementa os domínios de User e Auth. Eles servem de referência de como os outros módulos devem ser construídos. A infraestrutura (CI, Docker, migrations, validação, lint, hooks de commit) já está montada, então adicionar um novo domínio não exige refazer a fundação.

## Arquitetura

O código é dividido entre um core independente de framework e uma casca de infraestrutura.

```
src/
├── modules/                # core da aplicação (sem imports de framework)
│   ├── @shared/            # base entity & value objects, erros de domínio,
│   │                       # eventos, validação (Notification), abstrações
│   │                       # de repositório, interface de transaction manager
│   └── user/
│       ├── domain/         # entidade User + validators
│       ├── usecase/        # uma classe por caso de uso (login, create, update,
│       │                   # delete, find, change-password, validate-session)
│       ├── gateway/        # interface do repositório (a port)
│       ├── repository/     # adapter do Prisma + query builder
│       ├── facade/         # ponto de entrada do módulo
│       └── factory/        # montagem das dependências
└── infra/                  # o framework vive aqui
    ├── http/               # bootstrap do Nest, controllers, guards, filters
    ├── database/           # client do Prisma + transaction manager
    └── services/           # implementações de bcrypt e JWT
```

Algumas decisões por trás da estrutura:

- A camada de domínio nunca importa Nest ou Prisma. O template de PR cobra isso, então não fica só na boa intenção. Isso mantém a lógica de negócio fácil de testar isolada e o framework substituível.
- A validação passa por um objeto `Notification` em vez de lançar erro no primeiro problema, então a entidade reporta todos os campos inválidos de uma vez.
- Cada caso de uso é uma classe única atrás de uma interface, composta por um facade e montada numa factory, o que mantém os controllers enxutos.
- A autenticação é rígida de propósito. A validação de sessão lê o role do banco em vez de confiar no token, trocar a senha invalida os tokens emitidos antes da troca (`tokenValidAfter`), e a rota de login tem um rate limit mais apertado que o resto.

## Stack

- **Runtime:** Node.js 24, pnpm
- **Framework:** NestJS 11, TypeScript 5.9 (build com SWC)
- **Banco de dados:** PostgreSQL 16 via Prisma 7 (`@prisma/adapter-pg`)
- **Auth e segurança:** JWT (HS256), bcrypt, Helmet, `@nestjs/throttler`, allowlist de CORS
- **Validação:** class-validator / class-transformer
- **Docs:** Swagger (OpenAPI)
- **Testes:** Jest 30, Supertest (unitários + e2e)
- **Ferramentas:** ESLint 9 (flat config) + Prettier, Husky, commitlint, lint-staged, Dependabot, GitHub Actions, Docker

## Pré-requisitos

- Node.js 24 (tem um `.nvmrc`, rode `nvm use`)
- pnpm
- PostgreSQL 16, ou Docker se preferir não instalar localmente

## Setup do projeto

```bash
pnpm install
cp .env.example .env   # depois preencha os valores
```

Gere o client do Prisma e aplique as migrations:

```bash
pnpm prisma:generate
pnpm prisma:migrate
```

Crie o primeiro admin (usa as variáveis `SEED_ADMIN_*` do seu `.env`):

```bash
pnpm prisma:seed
```

## Build e execução

```bash
# desenvolvimento (watch mode)
pnpm start:dev

# produção
pnpm build
pnpm start:prod
```

A API sobe na porta definida em `PORT` (padrão `3001`).

### Com Docker

O compose sobe a API junto com um container PostgreSQL e roda as migrations no start:

```bash
docker compose up --build
```

- API em `http://localhost:3001`
- Prisma Studio em `http://localhost:5555`

## Variáveis de ambiente

| Variável              | Descrição                                                |
| --------------------- | -------------------------------------------------------- |
| `NODE_ENV`            | `development`, `test` ou `production`                    |
| `PORT`                | Porta HTTP (padrão `3001`)                               |
| `DATABASE_URL`        | String de conexão do PostgreSQL                          |
| `CORS_ORIGINS`        | Lista de origens permitidas, separadas por vírgula       |
| `JWT_SECRET`          | Segredo de assinatura do JWT (mín. 32 chars fora de test)|
| `JWT_EXPIRES_IN`      | Tempo de vida do token (ex.: `7d`)                       |
| `BCRYPT_ROUNDS`       | Custo do bcrypt (mín. 10)                                |
| `THROTTLE_LIMIT`      | Limite padrão de requisições por janela                  |
| `THROTTLE_WINDOW_MS`  | Janela do rate limit em milissegundos                    |
| `SEED_ADMIN_EMAIL`    | Email do admin criado pelo seed                          |
| `SEED_ADMIN_PASSWORD` | Senha do admin criado pelo seed                          |
| `SEED_ADMIN_NAME`     | Nome de exibição do admin do seed                        |

## Testes

```bash
# testes unitários
pnpm test

# testes e2e (precisa de um PostgreSQL rodando)
pnpm test:e2e

# cobertura
pnpm test:cov
```

Os testes unitários cobrem as entidades, casos de uso e guards. A suíte e2e exercita as rotas de auth e user contra um banco real, incluindo os casos que importam: tokens revogados, proteção do último admin ativo e checagem de role.

## Documentação da API

Em ambientes que não são de produção, o Swagger fica em:

```
http://localhost:3001/api-docs
```

## Qualidade de código

```bash
pnpm lint        # ESLint + Prettier
pnpm typecheck   # tsc --noEmit
```

Os commits seguem o padrão [Conventional Commits](https://www.conventionalcommits.org/), cobrado pelo commitlint via hook do Husky, e o lint-staged roda o ESLint nos arquivos em stage antes de cada commit. A CI roda lint, type-check, build, a suíte de testes completa, um build de Docker e uma checagem de schema drift do Prisma em todo push e pull request.

## Deploy

Gere a imagem de produção com o `Dockerfile` multi-stage (ele compila, remove as dependências de dev e roda com usuário não-root e healthcheck). No deploy, aplique as migrations antes de subir a aplicação:

```bash
pnpm exec prisma migrate deploy
```

Passe as variáveis de ambiente pelo seu orquestrador; elas nunca são embutidas na imagem.

## Licença

[MIT](./LICENSE).
