import { ArgumentMetadata, ValidationPipe } from "@nestjs/common";
import { FindUsersQueryDto } from "../../user/dto/find-users.query.dto";
import { UuidParamDto } from "./uuid-param.dto";

describe("HTTP transport DTOs", () => {
  const pipe = new ValidationPipe({
    errorHttpStatusCode: 422,
    forbidNonWhitelisted: true,
    transform: true,
    whitelist: true,
  });

  it("converts pagination query values before they reach the application", async () => {
    const metadata: ArgumentMetadata = {
      data: undefined,
      metatype: FindUsersQueryDto,
      type: "query",
    };

    const query = await pipe.transform(
      { page: "2", perPage: "10", active: "false" },
      metadata,
    );

    expect(query).toBeInstanceOf(FindUsersQueryDto);
    expect(query).toMatchObject({ page: 2, perPage: 10, active: false });
  });

  it("rejects an invalid boolean query value", async () => {
    const metadata: ArgumentMetadata = {
      data: undefined,
      metatype: FindUsersQueryDto,
      type: "query",
    };

    await expect(
      pipe.transform({ active: "yes" }, metadata),
    ).rejects.toMatchObject({ status: 422 });
  });

  it("rejects an invalid UUID before it reaches the application", async () => {
    const metadata: ArgumentMetadata = {
      data: undefined,
      metatype: UuidParamDto,
      type: "param",
    };

    await expect(
      pipe.transform({ id: "not-a-uuid" }, metadata),
    ).rejects.toMatchObject({
      status: 422,
    });
  });
});
