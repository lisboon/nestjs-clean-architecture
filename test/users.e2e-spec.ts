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
const EMAILS = {
  adminA: "e2e-users-admin-a@backend.com.br",
  adminB: "e2e-users-admin-b@backend.com.br",
  member: "e2e-users-member@backend.com.br",
};

const seedUser = async (email: string, role: UserRole) => {
  const user = await prisma.user.create({
    data: {
      id: randomUUID(),
      name: email,
      email,
      password: await bcrypt.hash(PASSWORD, 10),
      role,
    },
  });
  return user.id;
};

describe("Users (e2e)", () => {
  let app: INestApplication<App>;
  let adminAId: string;
  let adminBId: string;
  let adminAToken: string;
  let memberToken: string;

  const login = async (email: string): Promise<string> => {
    const res = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email, password: PASSWORD });
    return res.body.accessToken;
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();

    await prisma.user.deleteMany({
      where: { email: { in: Object.values(EMAILS) } },
    });

    adminAId = await seedUser(EMAILS.adminA, UserRole.ADMIN);
    adminBId = await seedUser(EMAILS.adminB, UserRole.ADMIN);
    await seedUser(EMAILS.member, UserRole.USER);

    adminAToken = await login(EMAILS.adminA);
    memberToken = await login(EMAILS.member);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: Object.values(EMAILS) } },
    });
    await app.close();
    await prisma.$disconnect();
  });

  it("forbids a non-admin (USER) from listing users (403)", async () => {
    await request(app.getHttpServer())
      .get("/users")
      .set("Authorization", `Bearer ${memberToken}`)
      .expect(403);
  });

  it("rejects listing users without authentication (401)", async () => {
    await request(app.getHttpServer()).get("/users").expect(401);
  });

  it("allows an admin to list users (200)", async () => {
    await request(app.getHttpServer())
      .get("/users")
      .set("Authorization", `Bearer ${adminAToken}`)
      .expect(200);
  });

  it("allows an admin to delete another admin while others remain (200)", async () => {
    await request(app.getHttpServer())
      .delete(`/users/${adminBId}`)
      .set("Authorization", `Bearer ${adminAToken}`)
      .expect(200);
  });

  it("forbids deleting the last active admin (403)", async () => {
    await request(app.getHttpServer())
      .delete(`/users/${adminAId}`)
      .set("Authorization", `Bearer ${adminAToken}`)
      .expect(403);
  });
});
