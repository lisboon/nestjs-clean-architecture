import { PrismaClient } from "@prisma/client";
import { CompanyGateway } from "../gateway/company.gateway";
import { CompanyFilter } from "../gateway/company.filter";
import { Company } from "../domain/company.entity";
import CompaniesQueryBuilder from "./companies.query.builder";
import { SearchParams } from "@/modules/@shared/repository/search-params";
import { SearchResult } from "@/modules/@shared/repository/search-result";
import { TransactionContext } from "@/modules/@shared/domain/transaction/transaction-manager.interface";
import { normalizeSlug } from "@/modules/@shared/domain/utils/slug";

export default class CompanyRepository implements CompanyGateway {
  constructor(private readonly prisma: PrismaClient) {}

  private getClient(trx?: TransactionContext): PrismaClient {
    return (trx as PrismaClient) ?? this.prisma;
  }

  private toEntity(data: any): Company {
    return new Company({
      id: data.id,
      name: data.name,
      slug: data.slug,
      active: data.active,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      deletedAt: data.deletedAt ?? undefined,
    });
  }

  async findById(id: string): Promise<Company | null> {
    const row = await this.prisma.company.findFirst({
      where: { id, deletedAt: null },
    });
    return row ? this.toEntity(row) : null;
  }

  async findBySlug(slug: string): Promise<Company | null> {
    const row = await this.prisma.company.findFirst({
      where: { slug: normalizeSlug(slug), deletedAt: null },
    });
    return row ? this.toEntity(row) : null;
  }

  async search(
    params: SearchParams<CompanyFilter>,
  ): Promise<SearchResult<Company>> {
    const builder = new CompaniesQueryBuilder(params);
    const query = builder.build();
    const where = { ...query.where, deletedAt: null };

    const [rows, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        ...(query.orderBy ? { orderBy: query.orderBy } : {}),
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.company.count({ where }),
    ]);

    return new SearchResult({
      items: rows.map((row) => this.toEntity(row)),
      total,
      currentPage: params.page,
      perPage: params.perPage,
    });
  }

  async create(company: Company, trx?: TransactionContext): Promise<void> {
    const client = this.getClient(trx);
    await client.company.create({
      data: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        active: company.active,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
      },
    });
  }

  async update(company: Company, trx?: TransactionContext): Promise<void> {
    const client = this.getClient(trx);
    await client.company.update({
      where: { id: company.id },
      data: {
        name: company.name,
        slug: company.slug,
        active: company.active,
        updatedAt: company.updatedAt,
        deletedAt: company.deletedAt,
      },
    });
  }
}
