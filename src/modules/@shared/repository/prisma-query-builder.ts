export default abstract class PrismaQueryBuilder {
  abstract subItems: object;
  abstract whereFields: string[];
  protected jsonWhere?: { field: string }[];
  abstract inFields: string[];
  protected notInFields?: { field: string; key: string; relation?: string }[];
  protected notInFieldsInclude?: {
    field: string;
    key: string;
    relation?: string;
  }[];
  abstract orFields: (string | { name: string })[];
  abstract searchFields: string[];
  protected numberSearchFields: { field: string; type: 'decimal' | 'equals' }[];
  protected relationSearchFields?: {
    field: string;
    relation: string;
    starts?: boolean;
    multiple?: boolean;
  }[];
  abstract sortableFields: string[];
  abstract relationFields: string[];
  abstract relationFilter?: {
    relation: string;
    multiple?: boolean;
    exists?: boolean;
    field: string;
    array?: boolean;
    subRelation?: string;
  }[];
  protected gteAndLteFields: {
    field: string;
    gte: string;
    lte: string;
    isDate: boolean;
    or?: boolean;
    relation?: string;
    isNumber?: boolean;
  }[];
  abstract include: any;
  protected filterParam: any;
  protected sortParam: { sort?: string | null; sortDir?: string | null };
  protected paginationParam: { page: number; perPage: number };

  constructor(
    filterParam: any,
    sortParam: { sort?: string | null; sortDir?: string | null },
    paginationParam: { page: number; perPage: number },
  ) {
    this.filterParam = filterParam;
    this.sortParam = sortParam;
    this.paginationParam = paginationParam;
  }

  buildWhere() {
    const where: any = {};

    this.whereFields.forEach((field) => {
      if (this.filterParam[field] !== undefined || this.filterParam[field] === false) {
        switch (true) {
          case this.filterParam[field] === 'true' || this.filterParam[field] === true:
            where[field] = true;
            break;
          case this.filterParam[field] === 'false' || this.filterParam[field] === false:
            where[field] = false;
            break;
          case this.filterParam[field] === 'null':
            where[field] = null;
            break;
          case !Number.isNaN(+this.filterParam[field]):
            where[field] = +this.filterParam[field];
            break;
          default:
            where[field] = this.filterParam[field];
        }
      }
    });

    return where;
  }

  buildJsonWhere() {
    const where: any = {};

    this.jsonWhere?.forEach(({ field }) => {
      if (this.filterParam[field]) {
        where[field] = { array_contains: this.filterParam[field] };
      }
    });

    return where;
  }

  buildOr() {
    const or: any = [];

    this.orFields.forEach((field) => {
      if (typeof field !== 'string' && this.filterParam[field.name]) {
        or.push(this.filterParam[field.name]);
        return;
      }
      if (typeof field === 'string' && this.filterParam[field] !== undefined) {
        or.push({ [field]: this.filterParam[field] });
      }
    });

    return or;
  }

  buildSearch() {
    const search: any = {};

    this.searchFields.forEach((field) => {
      if (this.filterParam[field]) {
        search[field] = {
          contains: this.filterParam[field],
        };
      }
    });

    return search;
  }

  buildSearchNumber() {
    const search: any = {};
    this.numberSearchFields?.forEach(({ field, type }) => {
      if (this.filterParam[field]) {
        switch (type) {
          case 'decimal':
            search[field] = {
              gte: Math.trunc(+this.filterParam[field]),
              lt: Math.trunc(+this.filterParam[field]) + 1,
            };
            break;
          case 'equals':
            search[field] = +this.filterParam[field];
            break;
        }
      }
    });
    return search;
  }

  buildRelationSearch() {
    const search: any = {};

    this.relationSearchFields?.forEach(({ relation, field, starts, multiple }) => {
      if (this.filterParam[`${relation}_${field}`]) {
        search[relation] = multiple
          ? {
              some: {
                [field]: {
                  [starts ? 'startsWith' : 'contains']: this.filterParam[`${relation}_${field}`],
                },
              },
            }
          : {
              [field]: {
                [starts ? 'startsWith' : 'contains']: this.filterParam[`${relation}_${field}`],
              },
            };
      }
    });

    return search;
  }

  buildRelationFields() {
    const include: any = {};

    this.relationFields.forEach((field) => {
      if (this.filterParam[field]) {
        include[field] = { id: this.filterParam[field] };
      }
    });

    return include;
  }

  buildRelationFilter() {
    if (!this.relationFilter) {
      return {};
    }

    const include: any = {};

    this.relationFilter.forEach(({ relation, field, multiple, exists, array, subRelation }) => {
      if (exists && this.filterParam[relation]) {
        include[relation] = multiple ? { some: {} } : { isNot: null };
        return include;
      }

      if (exists && subRelation && this.filterParam[`${relation}_${subRelation}`]) {
        include[relation] = include[relation] || {};
        include[relation][subRelation] = multiple ? { some: {} } : { isNot: null };
        return include;
      }

      if (this.filterParam[`${relation}_${field}`] !== undefined) {
        include[relation] = multiple
          ? {
              some: {
                ...include[relation]?.is,
                ...include[relation]?.some,
                [field]: array
                  ? {
                      in: this.filterParam[`${relation}_${field}`].split(','),
                    }
                  : this.filterParam[`${relation}_${field}`],
              },
            }
          : {
              ...include[relation],
              [field]: array
                ? {
                    in: this.filterParam[`${relation}_${field}`].split(','),
                  }
                : this.filterParam[`${relation}_${field}`],
            };
      }
    });

    return include;
  }

  buildSort() {
    const sort: any = {};

    if (this.sortParam.sort && this.sortableFields.includes(this.sortParam.sort)) {
      sort[this.sortParam.sort] = this.sortParam.sortDir || 'asc';
    }

    return sort;
  }

  buildPagination() {
    const pagination: any = {};

    if (this.paginationParam.page) {
      pagination.skip = (this.paginationParam.page - 1) * this.paginationParam.perPage;
    }

    if (this.paginationParam.perPage) {
      pagination.take = this.paginationParam.perPage;
    }

    return pagination;
  }

  buildIn() {
    const inFilters: any = {};

    this.inFields.forEach((field) => {
      if (this.filterParam[field] && typeof this.filterParam[field] === 'string') {
        inFilters[field] = { in: this.filterParam[field].split(',') };
      }
    });

    return inFilters;
  }

  buildIncludeNotIn() {
    const notInFiltersInclude: any = {};

    this.notInFieldsInclude?.forEach((field) => {
      if (this.filterParam[field.key]) {
        if (field.relation) {
          notInFiltersInclude[field.relation] = {
            ...this.include[field.relation],
            where: {
              ...this.include[field.relation]?.where,
              [field.field]: {
                notIn: this.filterParam[field.key].split(','),
              },
            },
          };
          return;
        }
        notInFiltersInclude[field.field] = {
          notIn: this.filterParam[field.key].split(','),
        };
      }
    });

    return notInFiltersInclude;
  }

  buildNotIn() {
    const notInFilters: any = {};

    this.notInFields?.forEach((field) => {
      if (this.filterParam[field.key]) {
        if (field.relation) {
          return (notInFilters[field.relation] = {});
        }
        notInFilters[field.field] = {
          notIn: this.filterParam[field.key].split(','),
        };
      }
    });

    return notInFilters;
  }

  buildSubItems() {
    const subItems: any = {};

    Object.entries(this.subItems).forEach(([key, value]) => {
      value.forEach((field) => {
        if (this.filterParam[field]) {
          subItems[key] = { some: { [field]: this.filterParam[field] } };
        }
      });
    });
    return subItems;
  }

  buildGteAndLte(where: any = {}) {
    const originalOr = where.OR || [];
    let newOrFields: any = [];

    this.gteAndLteFields?.forEach(({ field, gte, lte, isDate, or, relation, isNumber }) => {
      if (!this.filterParam[gte] && !this.filterParam[lte]) {
        return;
      }

      let newOr = [...originalOr];
      if (this.filterParam[gte]) {
        const newField = {
          ...where[field],
          gte: isDate
            ? new Date(this.filterParam[gte])
            : isNumber
              ? +this.filterParam[gte]
              : this.filterParam[gte],
        };

        if (or) {
          const newFilters = newOr.map((item, index) => {
            if (newOr[index][field]) {
              newOr[index][field] = {
                ...newOr[index][field],
                ...newField,
              };
              return newOr[index];
            } else {
              newOr[index] = { ...newOr[index], [field]: newField };
              return newOr[index];
            }
          });

          if (newFilters.length) {
            newOr = newFilters;
          } else {
            newOr = [{ [field]: newField }];
          }
        } else {
          if (relation) {
            where[relation] = where[relation] || {};
            where[relation][field] = {
              ...where[relation][field],
              ...newField,
            };
          } else {
            where[field] = { ...where[field], ...newField };
          }
        }
      }

      if (this.filterParam[lte]) {
        const newField = {
          ...where[field],
          lte: isDate
            ? new Date(this.filterParam[lte])
            : isNumber
              ? +this.filterParam[lte]
              : this.filterParam[lte],
        };

        if (or) {
          const newFilters = newOr.map((item, index) => {
            if (newOr[index][field]) {
              newOr[index][field] = {
                ...newOr[index][field],
                ...newField,
              };
              return newOr[index];
            } else {
              newOr[index] = { ...newOr[index], [field]: newField };
              return newOr[index];
            }
          });

          if (newFilters.length) {
            newOr = newFilters;
          } else {
            newOr = [{ [field]: newField }];
          }
        } else {
          if (relation) {
            where[relation] = where[relation] || {};
            where[relation][field] = {
              ...where[relation][field],
              ...newField,
            };
          } else {
            where[field] = { ...where[field], ...newField };
          }
        }
      }

      if (or) {
        newOrFields = [...newOrFields, ...newOr];
      }
    });
    if (newOrFields.length) {
      where.OR = newOrFields;
    }
    return where;
  }

  buildManualOr() {
    const manualOrFilters = this.filterParam?.manualOrFilters;
    if (!manualOrFilters?.length) return [];

    return manualOrFilters.map((filter: Record<string, any>) => {
      const condition: any = {};
      for (const [key, value] of Object.entries(filter)) {
        const gteMatch = this.gteAndLteFields?.find((f) => f.gte === key);
        const lteMatch = this.gteAndLteFields?.find((f) => f.lte === key);

        if (gteMatch) {
          condition[gteMatch.field] = {
            ...(condition[gteMatch.field] || {}),
            gte: gteMatch.isDate ? new Date(value as string) : gteMatch.isNumber ? +value : value,
          };
        } else if (lteMatch) {
          condition[lteMatch.field] = {
            ...(condition[lteMatch.field] || {}),
            lte: lteMatch.isDate ? new Date(value as string) : lteMatch.isNumber ? +value : value,
          };
        } else {
          condition[key] = value;
        }
      }
      return condition;
    });
  }

  // Não usar spread - Melhorar performance
  build() {
    const where = {
      ...this.buildIn(),
      ...this.buildNotIn(),
      ...this.buildWhere(),
      ...this.buildJsonWhere(),
      ...this.buildSearch(),
      ...this.buildSearchNumber(),
      ...this.buildRelationFields(),
      ...this.buildSubItems(),
      ...this.buildRelationFilter(),
      ...this.buildRelationSearch(),
    };

    const include = {
      ...this.include,
      ...this.buildIncludeNotIn(),
    };

    const manualOr = this.buildManualOr();
    if (manualOr.length > 0) {
      where.OR = manualOr;
    } else if (this.buildOr().length > 0) {
      const newOr: any = [];
      if (where.OR) {
        where.OR.forEach((or) => {
          this.buildOr().map((b) => {
            newOr.push({ ...or, ...b });
          });
        });
      } else {
        this.buildOr().map((or) => newOr.push(or));
      }
      where.OR = newOr;
    }

    return {
      where: this.buildGteAndLte(where),
      include: Object.values(include)?.length > 0 && include,
      ...(Object.values(this.buildSort()).length && {
        orderBy: this.buildSort(),
      }),
      ...this.buildPagination(),
    };
  }
}
