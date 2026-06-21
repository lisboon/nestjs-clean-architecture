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

describe("Auth (e2e)", () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();

    await prisma.user.deleteMany({ where: { email: ADMIN.email } });
    await prisma.user.create({
      data: {
        id: randomUUID(),
        name: ADMIN.name,
        email: ADMIN.email,
        password: await bcrypt.hash(ADMIN.password, 10),
        role: UserRole.ADMIN,
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: ADMIN.email } });
    await app.close();
    await prisma.$disconnect();
  });

  it("logs in with valid credentials and returns an access token", async () => {
    const res = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: ADMIN.email, password: ADMIN.password })
      .expect(201);

    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({
      email: ADMIN.email,
      role: UserRole.ADMIN,
    });
  });

  it("rejects login with the wrong password (401)", async () => {
    await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: ADMIN.email, password: "wrong-password" })
      .expect(401);
  });

  it("rejects login with an invalid email payload (422)", async () => {
    await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: "not-an-email", password: "whatever" })
      .expect(422);
  });

  it("returns the current user on GET /auth/me with a valid token", async () => {
    const login = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: ADMIN.email, password: ADMIN.password });

    const res = await request(app.getHttpServer())
      .get("/auth/me")
      .set("Authorization", `Bearer ${login.body.accessToken}`)
      .expect(200);

    expect(res.body.email).toBe(ADMIN.email);
    expect(res.body.password).toBeUndefined();
  });

  it("rejects GET /auth/me without a token (401)", async () => {
    await request(app.getHttpServer()).get("/auth/me").expect(401);
  });

  it("rejects GET /auth/me with a malformed token (401)", async () => {
    await request(app.getHttpServer())
      .get("/auth/me")
      .set("Authorization", "Bearer not-a-real-jwt")
      .expect(401);
  });
});
