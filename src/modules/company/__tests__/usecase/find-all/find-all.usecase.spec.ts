import FindAllCompaniesUseCase from "../../../usecase/find-all/find-all.usecase";
import { Company } from "../../../domain/company.entity";
import { SearchParams } from "@/modules/@shared/repository/search-params";
import { SearchResult } from "@/modules/@shared/repository/search-result";

const makeSut = () => {
  const companies = [
    Company.create({ name: "Acme Corp", slug: "acme-corp" }),
    Company.create({ name: "Globex", slug: "globex" }),
  ];
  const searchResult = new SearchResult({
    items: companies,
    total: 2,
    currentPage: 1,
    perPage: 20,
  });
  const companyGateway = {
    search: jest.fn().mockResolvedValue(searchResult),
  };

  const useCase = new FindAllCompaniesUseCase(companyGateway as any);

  return { useCase, companies, companyGateway };
};

describe("FindAllCompaniesUseCase", () => {
  it("returns paginated companies serialized via toJSON", async () => {
    const { useCase, companies } = makeSut();

    const output = await useCase.execute({});

    expect(output.total).toBe(2);
    expect(output.currentPage).toBe(1);
    expect(output.perPage).toBe(20);
    expect(output.lastPage).toBe(1);
    expect(output.items[0]).toEqual(companies[0].toJSON());
  });

  it("forwards pagination, sorting and filters as SearchParams", async () => {
    const { useCase, companyGateway } = makeSut();

    await useCase.execute({
      page: 2,
      perPage: 10,
      sort: "name",
      sortDir: "desc",
      name: "acme",
      slug: "acme-corp",
      active: true,
    });

    const params = companyGateway.search.mock.calls[0][0] as SearchParams;
    expect(params).toBeInstanceOf(SearchParams);
    expect(params.page).toBe(2);
    expect(params.perPage).toBe(10);
    expect(params.sort).toBe("name");
    expect(params.sortDir).toBe("desc");
    expect(params.filter).toEqual({
      name: "acme",
      slug: "acme-corp",
      active: true,
    });
  });
});
