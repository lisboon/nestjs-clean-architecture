import { SearchParams } from "@/modules/@shared/repository/search-params";
import { CompanyFilter } from "../../gateway/company.filter";
import CompaniesQueryBuilder from "../../repository/companies.query.builder";

describe("CompaniesQueryBuilder", () => {
  it("maps supported filters, sorting and pagination to a Prisma query", () => {
    const params = new SearchParams({
      page: 2,
      perPage: 5,
      sort: "createdAt",
      sortDir: "desc",
      filter: {
        name: "Acme",
        slug: "acme",
        active: true,
      },
    });

    const query = new CompaniesQueryBuilder(params).build();

    expect(query).toEqual({
      where: {
        name: { contains: "Acme" },
        slug: { contains: "acme" },
        active: true,
      },
      orderBy: { createdAt: "desc" },
      skip: 5,
      take: 5,
    });
  });

  it("ignores unsupported sort fields", () => {
    const params = new SearchParams<CompanyFilter>({ sort: "deletedAt" });

    const query = new CompaniesQueryBuilder(params).build();

    expect(query.orderBy).toBeUndefined();
    expect(query).toMatchObject({ where: {}, skip: 0, take: 20 });
  });

  it.each([true, false])("maps the active filter %p", (active) => {
    const params = new SearchParams({ filter: { active } });

    expect(new CompaniesQueryBuilder(params).build().where.active).toBe(active);
  });
});
