import FindAllUsersUseCase from "../../../usecase/find-all/find-all.usecase";
import { User } from "../../../domain/user.entity";
import { SearchParams } from "@/modules/@shared/repository/search-params";
import { SearchResult } from "@/modules/@shared/repository/search-result";
import { UserRole } from "@/modules/@shared/domain/enums";

const makeSut = () => {
  const users = [
    User.create({
      name: "Maria Souza",
      email: "maria@backend.com.br",
      password: "$2b$12$hash",
      role: UserRole.ADMIN,
    }),
    User.create({
      name: "Carlos Lima",
      email: "carlos@backend.com.br",
      password: "$2b$12$hash",
      role: UserRole.EDITOR,
    }),
  ];
  const searchResult = new SearchResult({
    items: users,
    total: 2,
    currentPage: 1,
    perPage: 20,
  });
  const userGateway = {
    search: jest.fn().mockResolvedValue(searchResult),
  };

  const useCase = new FindAllUsersUseCase(userGateway as any);

  return { useCase, users, userGateway };
};

describe("FindAllUsersUseCase", () => {
  it("returns paginated users serialized via toJSON", async () => {
    const { useCase, users } = makeSut();

    const output = await useCase.execute({});

    expect(output.total).toBe(2);
    expect(output.currentPage).toBe(1);
    expect(output.perPage).toBe(20);
    expect(output.lastPage).toBe(1);
    expect(output.items[0]).toEqual(users[0].toJSON());
    expect(output.items[0]).not.toHaveProperty("password");
  });

  it("forwards pagination, sorting and filters as SearchParams", async () => {
    const { useCase, userGateway } = makeSut();

    await useCase.execute({
      page: 2,
      perPage: 10,
      sort: "name",
      sortDir: "desc",
      name: "maria",
      role: UserRole.ADMIN,
      active: "true",
    });

    const params = userGateway.search.mock.calls[0][0] as SearchParams;
    expect(params).toBeInstanceOf(SearchParams);
    expect(params.page).toBe(2);
    expect(params.perPage).toBe(10);
    expect(params.sort).toBe("name");
    expect(params.sortDir).toBe("desc");
    expect(params.filter).toEqual({
      name: "maria",
      role: UserRole.ADMIN,
      active: "true",
    });
  });
});
