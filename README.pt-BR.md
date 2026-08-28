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

O código implementa os domínios de User, Auth e Company. Eles servem de referência de como os outros módulos devem ser construídos. A infraestrutura (CI, Docker, migrations, validação, lint, hooks de commit) já está montada, então adicionar um novo domínio não exige refazer a fundação.

## Arquitetura

O código é organizado em módulos verticais. Cada módulo mantém seu domínio e casos de uso
independentes de framework ao lado de suas portas, adaptadores e composição, enquanto
`infra/http` hospeda a camada de transporte NestJS.

```
src/
├── modules/                # módulos verticais: core, portas, adaptadores e composição
│   ├── @shared/            # base entity & value objects, erros de domínio,
│   │                       # eventos, validação (Notification), abstrações
│   │                       # de repositório, interface de transaction manager
│   ├── user/               # auth + CRUD de User (um User pertence a uma Company)
│   │   ├── domain/         # entidade User + validators
│   │   ├── usecase/        # uma classe por caso de uso (login, create, update,
│   │   │                   # delete, find, change-password, validate-session)
│   │   ├── gateway/        # interface do repositório (a port)
│   │   ├── repository/     # adapter do Prisma + query builder
│   │   ├── facade/         # ponto de entrada do módulo
│   │   └── factory/        # montagem das dependências
│   └── company/            # CRUD de Company; um User pertence a uma Company (1:N)
│       ├── domain/         # entidade Company + validators
│       ├── usecase/        # create, find, update, delete (com regras cross-
│       │                   # agregado: um user precisa de company válida, e uma
│       │                   # company com users ativos não pode ser deletada)
│       ├── gateway/        # interface do repositório (a port)
│       ├── repository/     # adapter do Prisma + query builder
│       ├── facade/         # ponto de entrada do módulo
│       └── factory/        # montagem das dependências
└── infra/                  # o framework vive aqui
    ├── http/               # bootstrap Nest, DTOs de transporte, controllers, guards, filters
    ├── database/           # client do Prisma + transaction manager
    └── services/           # implementações de bcrypt e JWT
```

Algumas decisões por trás da estrutura:

- A camada de domínio nunca importa Nest ou Prisma. O ESLint bloqueia (`no-restricted-imports` aplicado a todo arquivo em `src/modules/**/domain/**`) e o CI roda a checagem como um gate próprio a cada push e pull request, então não fica só na boa intenção. Isso mantém a lógica de negócio fácil de testar isolada e o framework substituível.
- Os casos de uso recebem inputs TypeScript simples e dependem apenas de tipos de domínio e portas. Os DTOs HTTP concentram os decorators de `class-validator`/`class-transformer`, permitindo que fila, CLI ou outro adaptador use a mesma API de aplicação sem herdar detalhes HTTP. O ESLint reforça essa fronteira em `src/modules/**/usecase/**`.
- Os gateways definem as portas de persistência, enquanto os adapters de repositório traduzem `SearchParams` em queries específicas de cada módulo, tipadas com os inputs gerados pelo Prisma. Assim, detalhes do ORM permanecem na borda sem uma DSL dinâmica compartilhada por domínios sem relação. As verificações de unicidade na aplicação fornecem retorno antecipado, enquanto os adapters traduzem corridas de constraint única do PostgreSQL nos mesmos erros de validação do domínio, sem vazar falhas do Prisma.
- Casos de uso transacionais recebem um contexto opaco do core. Leituras e escritas de uma invariante compartilham esse contexto, e buscas paginadas podem adotá-lo quando uma transação consistente for necessária. A criação de usuário e a exclusão de empresa reverificam sua invariante entre agregados em transações serializáveis, impedindo que requisições concorrentes deixem um usuário ativo ligado a uma empresa excluída. O adapter Prisma encapsula e valida seu `TransactionClient` gerado, enquanto mappers tipados isolam os registros de persistência das entidades de domínio. Nenhum tipo do ORM atravessa para as camadas de domínio ou casos de uso. Conflitos de escrita do Prisma (`P2034`) repetem a transação inteira com backoff exponencial limitado, portanto efeitos externos não idempotentes devem permanecer fora do callback transacional.
- A validação passa por um objeto `Notification` em vez de lançar erro no primeiro problema, então a entidade reporta todos os campos inválidos de uma vez.
- Cada caso de uso é uma classe única atrás de uma interface, composta por um facade e montada numa factory, o que mantém os controllers enxutos.
- A autenticação é rígida de propósito. A validação de sessão lê o role e o status da empresa no banco em vez de confiar no token, empresas inativas bloqueiam login e sessões existentes, trocar a senha invalida os tokens emitidos antes da troca (`tokenValidAfter`), e a rota de login tem um rate limit mais apertado que o resto.

Dois trade-offs que vale a pena assumir com sinceridade:

- A cerimônia (um caso de uso, DTO, gateway, repositório, facade e factory por operação) é cara de propósito para um CRUD simples. O retorno (testabilidade e framework substituível) só aparece conforme o domínio cresce. Por isso `Company` e seu vínculo 1:N com `User` estão aqui: para mostrar a estrutura se sustentando num segundo agregado relacionado, em vez de uma entidade isolada. Para uma única entidade pequena seria exagero, e tudo bem reconhecer isso.
- O `validate-session` lê o banco a cada request de propósito, para que um usuário revogado ou rebaixado perca o acesso na hora. Em tráfego maior, um cache Redis por usuário invalidado via `tokenValidAfter` reduziria essa carga. Foi deixado de fora de propósito: isto é um template, e a infra extra ainda não se paga.

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

Para inspecionar o banco do container com o Prisma Studio, execute-o no host em outro terminal:

```bash
pnpm exec prisma studio
```

Ele usa a `DATABASE_URL` do `.env` e fica disponível em `http://localhost:5555`.

As sondas operacionais ficam disponíveis sem autenticação:

- `GET /health/live` informa se o processo HTTP está em execução.
- `GET /health/ready` verifica a conexão com o PostgreSQL e retorna `503` enquanto a aplicação não puder receber tráfego.

A imagem de produção usa o endpoint de readiness no healthcheck do Docker. Ao receber `SIGTERM` ou `SIGINT`, o Nest encerra graciosamente e fecha o pool de conexões do Prisma.

Toda resposta HTTP inclui um `X-Request-Id`. Um identificador válido enviado pelo cliente é preservado; caso contrário, a API gera um UUID. O CORS permite que clientes web enviem esse header e o expõe ao código do frontend. As requisições são registradas com esse identificador, método, caminho, status e duração, usando JSON estruturado em produção. Corpos, query strings e headers de autorização nunca são registrados.

## Variáveis de ambiente

| Variável              | Descrição                                                |
| --------------------- | -------------------------------------------------------- |
| `NODE_ENV`            | `development`, `test` ou `production`                    |
| `PORT`                | Porta HTTP (padrão `3001`)                               |
| `DATABASE_URL`        | String de conexão do PostgreSQL                          |
| `E2E_DATABASE_URL`    | Banco E2E externo opcional; ignora o Docker local        |
| `CORS_ORIGINS`        | Lista de origens permitidas, separadas por vírgula       |
| `JWT_SECRET`          | Segredo de assinatura do JWT (mín. 32 chars fora de test)|
| `JWT_EXPIRES_IN`      | Tempo de vida do token (ex.: `7d`)                       |
| `BCRYPT_ROUNDS`       | Custo do bcrypt (de 10 a 15)                             |
| `THROTTLE_LIMIT`      | Limite padrão de requisições por janela                  |
| `THROTTLE_WINDOW_MS`  | Janela do rate limit em milissegundos                    |
| `SEED_ADMIN_EMAIL`    | Email do admin criado pelo seed                          |
| `SEED_ADMIN_PASSWORD` | Senha do admin criado pelo seed                          |
| `SEED_ADMIN_NAME`     | Nome de exibição do admin do seed                        |

A configuração de runtime é interpretada e validada antes da aplicação iniciar. Valores inválidos são informados juntos, incluindo URLs, durações e intervalos numéricos malformados.

## Testes

```bash
# testes unitários
pnpm test

# testes e2e (sobe um PostgreSQL isolado na porta 5433)
pnpm test:e2e

# para o banco E2E local
pnpm test:e2e:down

# cobertura
pnpm test:cov
```

O comando E2E recria o serviço Compose `backend-test-db`, aguarda o PostgreSQL, aplica as migrations e executa o Jest com variáveis exclusivas de teste. O banco temporário novo usa a porta `5433` e nunca compartilha o volume de desenvolvimento. Defina `E2E_DATABASE_URL` para usar um banco de teste externo; no CI, o runner reutiliza automaticamente o serviço PostgreSQL existente.

Os testes unitários cobrem as entidades, casos de uso e guards. A suíte e2e exercita as rotas de auth, user e company contra um banco real, incluindo os casos que importam: tokens revogados, proteção do último admin ativo, checagem de role e o bloqueio de deletar uma company que ainda tem usuários ativos. A suíte de persistência também verifica mapeamento dos repositories, rollback, conflito real de escrita serializável com retry e proteção concorrente do último admin ativo no PostgreSQL.

## Documentação da API

Em ambientes que não são de produção, o Swagger fica em:

```
http://localhost:3001/api-docs
```

Os schemas OpenAPI são gerados a partir dos DTOs de transporte durante o build. A CI verifica que os schemas de entrada e saída continuem presentes e que campos sensíveis, como senhas, não sejam expostos nos modelos de resposta.

Os erros esperados do cliente são documentados por operação. Erros simples usam `{ statusCode, error, message }`; erros de validação mantêm o mesmo envelope e retornam uma lista de problemas `{ field, message }`. Os erros de domínio permanecem independentes de status HTTP e são traduzidos por exception filters na borda de transporte.

## Qualidade de código

```bash
pnpm lint        # ESLint + Prettier
pnpm lint:fix    # aplica correções automáticas seguras localmente
pnpm typecheck   # tsc --noEmit
```

Os commits seguem o padrão [Conventional Commits](https://www.conventionalcommits.org/), cobrado pelo commitlint via hook do Husky, e o lint-staged roda o ESLint nos arquivos em stage antes de cada commit. A CI roda lint, type-check, build, a suíte de testes completa, um build de Docker e uma checagem de schema drift do Prisma em todo push e pull request.

A CI também rejeita vulnerabilidades de severidade alta nas dependências de produção. A CLI do Prisma e o gerador `@prisma/client` permanecem em `devDependencies`; a imagem de produção contém somente o client gerado e seus utilitários de runtime. O build Docker falha se qualquer um dos pacotes de desenvolvimento voltar a vazar para a camada de execução.

## Deploy

O `Dockerfile` multi-stage expõe dois artefatos independentes de deploy:

- o target padrão `runner` contém a aplicação, dependências de produção, usuário não-root e healthcheck;
- o target `migrator` contém a CLI do Prisma e o histórico de migrations, com `prisma migrate deploy` como entrypoint.

Gere ambos a partir da mesma revisão e execute a imagem de migration uma vez como release job antes de atualizar a aplicação:

```bash
docker build --target migrator -t nestjs-app-migrator .
docker run --rm --env DATABASE_URL="$DATABASE_URL" nestjs-app-migrator

docker build --target runner -t nestjs-app-backend .
```

Isso mantém as ferramentas de build fora da imagem da API sem depender de um checkout de desenvolvimento durante o deploy. A CI gera os dois targets e aplica as migrations pela imagem de migration contra o PostgreSQL. Passe as variáveis de ambiente pelo seu orquestrador; elas nunca são embutidas em nenhuma das imagens.

## Licença

[MIT](./LICENSE).
