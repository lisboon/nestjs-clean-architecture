import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import { randomUUID } from "crypto";
import * as bcrypt from "bcrypt";
import { AppModule } from "../src/infra/http/app.module";
import { configureApp } from "../src/infra/http/app.setup";
import prisma from "../src/infra/database/prisma.instance";
import { UserRole } from "../src/modules/@shared/domain/enums";

const ADMIN = {
  email: "e2e-auth-admin@backend.com.br",
  password: "Sup3rSecret!",
  name: "E2E Auth Admin",
};
const COMPANY_SLUG = "e2e-auth-company";

describe("Auth (e2e)", () => {
  let app: INestApplication<App>;
  let companyId: string;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();

    await prisma.user.deleteMany({ where: { email: ADMIN.email } });
    await prisma.company.deleteMany({ where: { slug: COMPANY_SLUG } });

    const company = await prisma.company.create({
      data: { id: randomUUID(), name: "E2E Auth Company", slug: COMPANY_SLUG },
    });
    companyId = company.id;

    await prisma.user.create({
      data: {
        id: randomUUID(),
        name: ADMIN.name,
        email: ADMIN.email,
        password: await bcrypt.hash(ADMIN.password, 10),
        role: UserRole.ADMIN,
        companyId,
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: ADMIN.email } });
    await prisma.company.deleteMany({ where: { slug: COMPANY_SLUG } });
    await app.close();
    await prisma.$disconnect();
  });

  it("logs in with valid credentials and returns an access token", async () => {
    const res = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: ADMIN.email, password: ADMIN.password })
      .expect(201);

    expect(res.body.accessToken).toEqual(expect.any(String));
    accessToken = res.body.accessToken;
    expect(res.body.user).toMatchObject({
      email: ADMIN.email,
      role: UserRole.ADMIN,
    });
  });

  it("rejects login with the wrong password (400)", async () => {
    const response = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: ADMIN.email, password: "wrong-password" })
      .expect(400);

    expect(response.body).toEqual({
      statusCode: 400,
      error: "Bad Login",
      message: "Incorrect email address or password",
    });
  });

  it("rejects login with an invalid email payload (422)", async () => {
    await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: "not-an-email", password: "whatever" })
      .expect(422);
  });

  it("returns the current user on GET /auth/me with a valid token", async () => {
    const res = await request(app.getHttpServer())
      .get("/auth/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.email).toBe(ADMIN.email);
    expect(res.body.password).toBeUndefined();
  });

  it("blocks login and existing sessions while the company is inactive", async () => {
    await prisma.company.update({
      where: { id: companyId },
      data: { active: false },
    });

    try {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: ADMIN.email, password: ADMIN.password })
        .expect(400);

      await request(app.getHttpServer())
        .get("/auth/me")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(401);
    } finally {
      await prisma.company.update({
        where: { id: companyId },
        data: { active: true },
      });
    }

    await request(app.getHttpServer())
      .get("/auth/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
  });

  it("rejects GET /auth/me without a token (401)", async () => {
    const response = await request(app.getHttpServer())
      .get("/auth/me")
      .expect(401);

    expect(response.body).toEqual({
      statusCode: 401,
      error: "Unauthorized",
      message: "Authentication token not provided",
    });
  });

  it("rejects GET /auth/me with a malformed token (401)", async () => {
    await request(app.getHttpServer())
      .get("/auth/me")
      .set("Authorization", "Bearer not-a-real-jwt")
      .expect(401);
  });

  it("returns the documented error contract when login is throttled", async () => {
    let response: request.Response | undefined;

    for (let attempt = 0; attempt < 6; attempt += 1) {
      response = await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: "not-an-email", password: "whatever" });
      if (response.status === 429) break;
    }

    expect(response?.status).toBe(429);
    expect(response?.body).toEqual({
      statusCode: 429,
      error: "Too Many Requests",
      message: "Too many requests",
    });
  });
});
