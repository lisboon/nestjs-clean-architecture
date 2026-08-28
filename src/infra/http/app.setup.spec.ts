import { INestApplication } from "@nestjs/common";
import { configureCors } from "./app.setup";

describe("configureCors", () => {
  it("allows browser clients to propagate request ids", () => {
    const enableCors = jest.fn();
    const app = { enableCors } as unknown as INestApplication;
    const origins = ["https://app.example.com"];

    configureCors(app, origins);

    expect(enableCors).toHaveBeenCalledWith({
      origin: origins,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
      exposedHeaders: ["X-Request-Id"],
    });
  });
});
