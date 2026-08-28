import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "../src/infra/http/app.module";
import { configureApp } from "../src/infra/http/app.setup";

describe("AppController (e2e)", () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  it("/ (GET)", () => {
    return request(app.getHttpServer())
      .get("/")
      .expect(200)
      .expect("Hello World!");
  });

  it("/health/live (GET)", () => {
    return request(app.getHttpServer())
      .get("/health/live")
      .expect(200)
      .expect({ status: "up" });
  });

  it("returns the supplied request id in the response", () => {
    return request(app.getHttpServer())
      .get("/health/live")
      .set("x-request-id", "e2e-request-123")
      .expect("x-request-id", "e2e-request-123")
      .expect(200);
  });

  it("/health/ready (GET)", () => {
    return request(app.getHttpServer())
      .get("/health/ready")
      .expect(200)
      .expect({ status: "up", checks: { database: "up" } });
  });

  afterEach(async () => {
    await app.close();
  });
});
