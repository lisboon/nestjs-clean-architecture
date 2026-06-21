export type SortDirection = 'asc' | 'desc';

export type SearchParamsConstructorProps<Filter = string> = {
  page?: number;
  perPage?: number;
  sort?: string | null;
  sortDir?: SortDirection | null;
  filter?: Filter | null;
};

export class SearchParams<Filter = string> {
  protected _page: number;
  protected _perPage: number;
  protected _sort: string | null;
  protected _sortDir: SortDirection | null;
  protected _filter: Filter | null;

  constructor(props: SearchParamsConstructorProps<Filter> = {}) {
    this._page = this._validatePage(props.page);
    this._perPage = this._validatePerPage(props.perPage);
    this._sort = props.sort ?? null;
    this._sortDir = this._sort ? (props.sortDir ?? 'asc') : null;
    this._filter = props.filter ?? null;
  }

  get page(): number {
    return this._page;
  }

  get perPage(): number {
    return this._perPage;
  }

  get sort(): string | null {
    return this._sort;
  }

  get sortDir(): SortDirection | null {
    return this._sortDir;
  }

  get filter(): Filter | null {
    return this._filter;
  }

  private _validatePage(value?: number): number {
    const page = Number(value);
    if (Number.isNaN(page) || page < 1 || !Number.isInteger(page)) return 1;
    return page;
  }

  private _validatePerPage(value?: number): number {
    const perPage = Number(value);
    if (Number.isNaN(perPage) || perPage < 1 || !Number.isInteger(perPage)) return 20;
    return Math.min(perPage, 100);
  }
}
