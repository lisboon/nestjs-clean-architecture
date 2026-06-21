import { SearchResult } from "../search-result";
import { expect, it, describe } from "@jest/globals";

describe("SearchResult", () => {
  it("exposes items, total and pagination metadata in camelCase", () => {
    const result = new SearchResult({
      items: [{ id: 1 }, { id: 2 }],
      total: 25,
      currentPage: 2,
      perPage: 10,
    });

    expect(result.items).toEqual([{ id: 1 }, { id: 2 }]);
    expect(result.total).toBe(25);
    expect(result.currentPage).toBe(2);
    expect(result.perPage).toBe(10);
  });

  it("computes lastPage = ceil(total / perPage)", () => {
    expect(
      new SearchResult({ items: [], total: 25, currentPage: 1, perPage: 10 })
        .lastPage,
    ).toBe(3);
    expect(
      new SearchResult({ items: [], total: 20, currentPage: 1, perPage: 10 })
        .lastPage,
    ).toBe(2);
    expect(
      new SearchResult({ items: [], total: 0, currentPage: 1, perPage: 10 })
        .lastPage,
    ).toBe(0);
  });

  it("toJSON serializes with camelCase keys", () => {
    const result = new SearchResult({
      items: [{ id: 1 }],
      total: 1,
      currentPage: 1,
      perPage: 10,
    });

    expect(result.toJSON()).toEqual({
      items: [{ id: 1 }],
      total: 1,
      currentPage: 1,
      perPage: 10,
      lastPage: 1,
    });
  });
});
