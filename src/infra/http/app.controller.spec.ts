import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

describe("AppController", () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe("root", () => {
    it("returns API metadata", () => {
      expect(appController.getInfo()).toEqual({
        name: "NestJS Clean Architecture API",
        description: "DDD and Clean Architecture backend template",
        version: "0.0.1",
      });
    });
  });
});
