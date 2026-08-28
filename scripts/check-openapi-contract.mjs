import assert from "node:assert/strict";
import { createRequire } from "node:module";

process.env.NODE_ENV = "test";
process.env.DATABASE_URL =
  "postgresql://openapi:openapi@localhost:5432/openapi";
process.env.JWT_SECRET = "openapi-contract-test-secret";

const require = createRequire(import.meta.url);
require("reflect-metadata");

const { Test } = require("@nestjs/testing");
const { DocumentBuilder, SwaggerModule } = require("@nestjs/swagger");
const metadata = require("../dist/metadata.js").default;
const { AppModule } = require("../dist/infra/http/app.module.js");

const moduleRef = await Test.createTestingModule({
  imports: [AppModule],
}).compile();
const app = moduleRef.createNestApplication();

try {
  await SwaggerModule.loadPluginMetadata(metadata);
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder().addBearerAuth().build(),
  );

  const requiredSchemas = [
    "LoginBodyDto",
    "CreateUserBodyDto",
    "UpdateUserBodyDto",
    "UserResponseDto",
    "UsersPageResponseDto",
    "CreateCompanyBodyDto",
    "UpdateCompanyBodyDto",
    "CompanyResponseDto",
    "CompaniesPageResponseDto",
  ];

  for (const name of requiredSchemas) {
    assert(
      document.components?.schemas?.[name],
      `OpenAPI schema ${name} is missing`,
    );
  }

  for (const [name, schema] of Object.entries(
    document.components?.schemas ?? {},
  )) {
    assert(
      "properties" in schema && Object.keys(schema.properties ?? {}).length > 0,
      `OpenAPI schema ${name} has no properties`,
    );
  }

  const documentedOperations = [
    ["/auth/login", "post", "200"],
    ["/auth/me", "get", "200"],
    ["/users", "post", "201"],
    ["/users", "get", "200"],
    ["/users/me/password", "patch", "200"],
    ["/users/{id}", "get", "200"],
    ["/users/{id}", "patch", "200"],
    ["/users/{id}", "delete", "200"],
    ["/companies", "post", "201"],
    ["/companies", "get", "200"],
    ["/companies/{id}", "get", "200"],
    ["/companies/{id}", "patch", "200"],
    ["/companies/{id}", "delete", "200"],
  ];

  for (const [path, method, status] of documentedOperations) {
    const operation = document.paths[path]?.[method];
    assert(
      operation,
      `OpenAPI operation ${method.toUpperCase()} ${path} is missing`,
    );
    assert(
      operation.responses[status]?.content?.["application/json"]?.schema,
      `OpenAPI response ${status} for ${method.toUpperCase()} ${path} has no schema`,
    );
  }

  const userSchema = document.components?.schemas?.UserResponseDto;
  assert(userSchema && "properties" in userSchema);
  assert(!("password" in (userSchema.properties ?? {})));
} finally {
  await app.close();
}
