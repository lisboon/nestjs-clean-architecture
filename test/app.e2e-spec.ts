import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "../src/infra/http/app.module";
import { configureApp, configureCors } from "../src/infra/http/app.setup";
import { API_INFO } from "../src/infra/http/api-info.response.dto";

describe("AppController (e2e)", () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    configureCors(app, ["http://localhost:3000"]);
    await app.init();
  });

  it("/ (GET)", () => {
    return request(app.getHttpServer()).get("/").expect(200).expect(API_INFO);
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

  it("allows browser clients to send and read the request id", () => {
    return request(app.getHttpServer())
      .options("/health/live")
      .set("Origin", "http://localhost:3000")
      .set("Access-Control-Request-Method", "GET")
      .set("Access-Control-Request-Headers", "X-Request-Id")
      .expect("Access-Control-Allow-Headers", /X-Request-Id/i)
      .expect("Access-Control-Expose-Headers", /X-Request-Id/i)
      .expect(204);
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
