import { UserRole } from "@/modules/@shared/domain/enums";
import { SearchParams } from "@/modules/@shared/repository/search-params";
import { UserFilter } from "../../gateway/user.filter";
import UsersQueryBuilder from "../../repository/users.query.builder";

describe("UsersQueryBuilder", () => {
  it("maps supported filters, sorting and pagination to a Prisma query", () => {
    const params = new SearchParams({
      page: 3,
      perPage: 10,
      sort: "email",
      sortDir: "desc",
      filter: {
        name: "Maria",
        email: "@example.com",
        role: UserRole.ADMIN,
        active: false,
      },
    });

    const query = new UsersQueryBuilder(params).build();

    expect(query).toEqual({
      where: {
        name: { contains: "Maria" },
        email: { contains: "@example.com" },
        role: UserRole.ADMIN,
        active: false,
      },
      orderBy: { email: "desc" },
      skip: 20,
      take: 10,
    });
  });

  it("ignores unsupported sort fields", () => {
    const params = new SearchParams<UserFilter>({ sort: "password" });

    const query = new UsersQueryBuilder(params).build();

    expect(query.orderBy).toBeUndefined();
    expect(query).toMatchObject({ where: {}, skip: 0, take: 20 });
  });

  it.each([true, false])("maps the active filter %p", (active) => {
    const params = new SearchParams({ filter: { active } });

    expect(new UsersQueryBuilder(params).build().where.active).toBe(active);
  });
});
