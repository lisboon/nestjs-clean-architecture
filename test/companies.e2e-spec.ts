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

const PASSWORD = "Sup3rSecret!";
const ADMIN_EMAIL = "e2e-companies-admin@backend.com.br";
const MEMBER_EMAIL = "e2e-companies-member@backend.com.br";
const SLUGS = {
  admin: "e2e-companies-admin-co",
  target: "e2e-companies-target",
  empty: "e2e-companies-empty",
};

describe("Companies (e2e)", () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let targetCompanyId: string;
  let emptyCompanyId: string;

  const cleanup = async () => {
    await prisma.user.deleteMany({
      where: { email: { in: [ADMIN_EMAIL, MEMBER_EMAIL] } },
    });
    await prisma.company.deleteMany({
      where: { slug: { in: Object.values(SLUGS) } },
    });
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();

    await cleanup();

    const adminCompany = await prisma.company.create({
      data: {
        id: randomUUID(),
        name: "E2E Companies Admin Co",
        slug: SLUGS.admin,
      },
    });
    await prisma.user.create({
      data: {
        id: randomUUID(),
        name: "E2E Companies Admin",
        email: ADMIN_EMAIL,
        password: await bcrypt.hash(PASSWORD, 10),
        role: UserRole.ADMIN,
        companyId: adminCompany.id,
      },
    });

    const login = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: ADMIN_EMAIL, password: PASSWORD });
    adminToken = login.body.accessToken;
  });

  afterAll(async () => {
    await cleanup();
    await app.close();
    await prisma.$disconnect();
  });

  it("rejects creating a company without authentication (401)", async () => {
    await request(app.getHttpServer())
      .post("/companies")
      .send({ name: "Nope", slug: SLUGS.target })
      .expect(401);
  });

  it("rejects an invalid company id at the HTTP boundary (422)", async () => {
    await request(app.getHttpServer())
      .get("/companies/not-a-uuid")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(422);
  });

  it("allows an admin to create a company (201)", async () => {
    const res = await request(app.getHttpServer())
      .post("/companies")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Target Company", slug: SLUGS.target })
      .expect(201);

    expect(res.body).toMatchObject({ slug: SLUGS.target, active: true });
    targetCompanyId = res.body.id;
  });

  it("rejects creating a company with a duplicate slug (422)", async () => {
    await request(app.getHttpServer())
      .post("/companies")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Dup", slug: SLUGS.target })
      .expect(422);
  });

  it("allows an admin to create a user inside the company (201)", async () => {
    await request(app.getHttpServer())
      .post("/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Company Member",
        email: MEMBER_EMAIL,
        password: PASSWORD,
        role: UserRole.USER,
        companyId: targetCompanyId,
      })
      .expect(201);
  });

  it("rejects creating a user with a non-existent companyId (422)", async () => {
    await request(app.getHttpServer())
      .post("/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Orphan",
        email: "e2e-companies-orphan@backend.com.br",
        password: PASSWORD,
        role: UserRole.USER,
        companyId: randomUUID(),
      })
      .expect(422);
  });

  it("forbids deleting a company that still has active users (403)", async () => {
    await request(app.getHttpServer())
      .delete(`/companies/${targetCompanyId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(403);
  });

  it("soft deletes a company with no active users (200)", async () => {
    const created = await request(app.getHttpServer())
      .post("/companies")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Empty Company", slug: SLUGS.empty })
      .expect(201);
    emptyCompanyId = created.body.id;

    await request(app.getHttpServer())
      .delete(`/companies/${emptyCompanyId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/companies/${emptyCompanyId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(404);
  });
});
