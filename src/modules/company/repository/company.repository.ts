import { PrismaClient } from "@prisma/client";
import { CompanyGateway } from "../gateway/company.gateway";
import { CompanyFilter } from "../gateway/company.filter";
import { Company } from "../domain/company.entity";
import CompaniesQueryBuilder from "./companies.query.builder";
import { SearchParams } from "@/modules/@shared/repository/search-params";
import { SearchResult } from "@/modules/@shared/repository/search-result";
import { TransactionContext } from "@/modules/@shared/domain/transaction/transaction-manager.interface";
import { normalizeSlug } from "@/modules/@shared/domain/utils/slug";
import { resolvePrismaClient } from "@/infra/database/prisma-transaction.context";
import { CompanyModelMapper } from "./company.model.mapper";
import { EntityValidationError } from "@/modules/@shared/domain/errors/validation.error";
import { executeWithUniqueConstraintTranslation } from "@/infra/database/prisma-operation";

const slugAlreadyInUse = () =>
  new EntityValidationError([
    { field: "slug", message: "Slug already in use" },
  ]);

export default class CompanyRepository implements CompanyGateway {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(
    id: string,
    trx?: TransactionContext,
  ): Promise<Company | null> {
    const row = await resolvePrismaClient(this.prisma, trx).company.findFirst({
      where: { id, deletedAt: null },
    });
    return row ? CompanyModelMapper.toEntity(row) : null;
  }

  async findBySlug(
    slug: string,
    trx?: TransactionContext,
  ): Promise<Company | null> {
    const row = await resolvePrismaClient(this.prisma, trx).company.findFirst({
      where: { slug: normalizeSlug(slug), deletedAt: null },
    });
    return row ? CompanyModelMapper.toEntity(row) : null;
  }

  async search(
    params: SearchParams<CompanyFilter>,
    trx?: TransactionContext,
  ): Promise<SearchResult<Company>> {
    const client = resolvePrismaClient(this.prisma, trx);
    const builder = new CompaniesQueryBuilder(params);
    const query = builder.build();
    const where = { ...query.where, deletedAt: null };

    const [rows, total] = await Promise.all([
      client.company.findMany({
        where,
        ...(query.orderBy ? { orderBy: query.orderBy } : {}),
        skip: query.skip,
        take: query.take,
      }),
      client.company.count({ where }),
    ]);

    return new SearchResult({
      items: rows.map(CompanyModelMapper.toEntity),
      total,
      currentPage: params.page,
      perPage: params.perPage,
    });
  }

  async create(company: Company, trx?: TransactionContext): Promise<void> {
    const client = resolvePrismaClient(this.prisma, trx);
    await executeWithUniqueConstraintTranslation(
      () =>
        client.company.create({
          data: {
            id: company.id,
            name: company.name,
            slug: company.slug,
            active: company.active,
            createdAt: company.createdAt,
            updatedAt: company.updatedAt,
          },
        }),
      "slug",
      slugAlreadyInUse,
    );
  }

  async update(company: Company, trx?: TransactionContext): Promise<void> {
    const client = resolvePrismaClient(this.prisma, trx);
    await executeWithUniqueConstraintTranslation(
      () =>
        client.company.update({
          where: { id: company.id },
          data: {
            name: company.name,
            slug: company.slug,
            active: company.active,
            updatedAt: company.updatedAt,
            deletedAt: company.deletedAt,
          },
        }),
      "slug",
      slugAlreadyInUse,
    );
  }
}
