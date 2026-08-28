<h1 align="center">NestJS Clean Architecture</h1>

<p align="center">
  Template de backend pronto para produção com DDD, arquitetura hexagonal e NestJS.<br />
  As regras de negócio ficam em TypeScript puro; NestJS, Prisma e HTTP ficam nas bordas.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white" alt="NestJS 11" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5.9" />
  <img src="https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white" alt="Prisma 7" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL 16" />
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="Licença MIT" />
</p>

<p align="center"><a href="./README.md">English</a> · <strong>Português</strong></p>

## Por que este template?

A maioria dos starters ensina a sintaxe do framework. Este demonstra como proteger as regras de negócio enquanto o sistema cresce: entidades e casos de uso dependem de portas, enquanto controllers NestJS, repositórios Prisma, JWT e bcrypt são adaptadores substituíveis.

Os módulos User, Auth e Company exercitam regras reais entre agregados, transações e concorrência — não apenas um CRUD isolado.

## Destaques

- Domínio e casos de uso sem dependências de NestJS, Prisma ou HTTP; o ESLint fiscaliza essa fronteira.
- Portas de repositório tipadas, adaptadores Prisma, mappers, query builders, facades e factories.
- Transações serializáveis com retentativas limitadas para conflitos de escrita do PostgreSQL.
- Unicidade segura contra concorrência e proteção de invariantes entre agregados.
- Sessões validadas no banco, revogação de tokens, papéis, bcrypt e rate limiting.
- Configuração validada, allowlist de CORS, Helmet e IDs de correlação.
- Contratos OpenAPI, probes de liveness/readiness e graceful shutdown.
- Testes unitários, E2E isolados no PostgreSQL e testes de concorrência.
- Imagens separadas de produção e migração, CI, Dependabot e hooks de commit.

## Arquitetura

```text
src/
├── modules/
│   ├── @shared/          # primitivas, erros e portas de repositório/transação
│   ├── user/             # domínio, casos de uso, gateway, Prisma, facade e factory
│   └── company/          # segundo agregado e regras entre agregados
└── infra/
    ├── http/             # controllers, DTOs, guards, filters e bootstrap NestJS
    ├── database/         # cliente Prisma e adaptador de transações
    └── services/         # adaptadores JWT e bcrypt
```

DTOs HTTP controlam a validação do transporte. Casos de uso recebem entradas simples. Interfaces de repositório retornam entidades do domínio, e mappers isolam os registros Prisma. Um contexto opaco permite que repositórios compartilhem a mesma transação sem vazar tipos do ORM para o núcleo.

Essa estrutura possui cerimônia intencional. Ela compensa quando regras, integrações e equipes crescem; para um CRUD pequeno sem expectativa de crescimento, pode ser arquitetura além do necessário.

## Início rápido

Requisitos: Node.js 24, pnpm e PostgreSQL 16 — ou Docker.

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

A API roda em `http://localhost:3001`; o Swagger fica disponível em `/api-docs` fora de produção.

### Docker

```bash
cp .env.example .env
docker compose up --build
```

Isso inicia o PostgreSQL, aplica as migrations e executa a API. Rode `pnpm exec prisma studio` no host para inspecionar o banco em `http://localhost:5555`.

## Comandos

| Comando                         | Finalidade                               |
| ------------------------------- | ---------------------------------------- |
| `pnpm start:dev`                | Executar em modo watch                   |
| `pnpm build && pnpm start:prod` | Compilar e executar a versão de produção |
| `pnpm lint` / `pnpm typecheck`  | Verificações estáticas                   |
| `pnpm test`                     | Testes unitários                         |
| `pnpm test:e2e`                 | E2E com PostgreSQL isolado na porta 5433 |
| `pnpm test:openapi`             | Verificar o contrato gerado da API       |
| `pnpm test:cov`                 | Gerar relatório de cobertura             |

## Contrato de execução

As configurações obrigatórias estão em [`.env.example`](./.env.example) e são validadas antes da inicialização. Endpoints e comportamentos importantes:

- `GET /health/live` verifica o processo; `GET /health/ready` verifica o PostgreSQL.
- Toda resposta possui `X-Request-Id`; logs de produção são estruturados e omitem dados sensíveis.
- Erros esperados usam `{ statusCode, error, message }`; erros de validação retornam os campos inválidos.
- O Swagger é desativado em produção.

O seed cria a empresa e o administrador iniciais a partir de `SEED_COMPANY_*` e `SEED_ADMIN_*`.

## Deploy

O target Docker padrão é uma imagem de execução com usuário sem privilégios. O target `migrator` contém o Prisma e o histórico de migrations:

```bash
docker build --target migrator -t nestjs-app-migrator .
docker run --rm --env DATABASE_URL="$DATABASE_URL" nestjs-app-migrator
docker build --target runner -t nestjs-app-backend .
```

Execute o migrator uma vez antes de publicar a mesma revisão da aplicação. O CI compila as duas imagens, aplica migrations reais, verifica schema drift, executa todos os testes e rejeita vulnerabilidades graves em produção.

## Trade-offs

- A sessão consulta o PostgreSQL em toda requisição autenticada para aplicar imediatamente revogações e mudanças de papel. Sistemas com tráfego alto podem adicionar cache com invalidação.
- Callbacks transacionais devem manter efeitos externos não idempotentes fora da transação sujeita a retentativa.
- O template entrega fundamentos arquiteturais, não abstrações genéricas para toda necessidade futura.

## Contribuição e segurança

Consulte [CONTRIBUTING.md](./CONTRIBUTING.md) para o fluxo de desenvolvimento e [SECURITY.md](./SECURITY.md) para relatar vulnerabilidades de forma privada.

Distribuído sob a [Licença MIT](./LICENSE).
