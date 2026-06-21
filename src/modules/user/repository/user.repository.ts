import { PrismaClient } from "@prisma/client";
import { UserGateway } from "../gateway/user.gateway";
import { UserFilter } from "../gateway/user.filter";
import { User } from "../domain/user.entity";
import UsersQueryBuilder from "./users.query.builder";
import { UserRole } from "@/modules/@shared/domain/enums";
import { SearchParams } from "@/modules/@shared/repository/search-params";
import { SearchResult } from "@/modules/@shared/repository/search-result";
import { TransactionContext } from "@/modules/@shared/domain/transaction/transaction-manager.interface";
import { normalizeEmail } from "@/modules/@shared/domain/utils/email";

export default class UserRepository implements UserGateway {
  constructor(private readonly prisma: PrismaClient) {}

  private getClient(trx?: TransactionContext): PrismaClient {
    return (trx as PrismaClient) ?? this.prisma;
  }

  private toEntity(data: any): User {
    return new User({
      id: data.id,
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role as UserRole,
      avatarUrl: data.avatarUrl ?? undefined,
      tokenValidAfter: data.tokenValidAfter ?? undefined,
      active: data.active,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      deletedAt: data.deletedAt ?? undefined,
    });
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
    return row ? this.toEntity(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findFirst({
      where: { email: normalizeEmail(email), deletedAt: null },
    });
    return row ? this.toEntity(row) : null;
  }

  async search(params: SearchParams<UserFilter>): Promise<SearchResult<User>> {
    const builder = new UsersQueryBuilder(
      params.filter ?? {},
      { sort: params.sort, sortDir: params.sortDir },
      { page: params.page, perPage: params.perPage },
    );
    const query = builder.build();
    const where = { ...query.where, deletedAt: null };

    const [rows, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        ...(query.orderBy ? { orderBy: query.orderBy } : {}),
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.user.count({ where }),
    ]);

    return new SearchResult({
      items: rows.map((row) => this.toEntity(row)),
      total,
      currentPage: params.page,
      perPage: params.perPage,
    });
  }

  async countActiveAdmins(trx?: TransactionContext): Promise<number> {
    const client = this.getClient(trx);
    return client.user.count({
      where: { role: UserRole.ADMIN, active: true, deletedAt: null },
    });
  }

  async create(user: User, trx?: TransactionContext): Promise<void> {
    const client = this.getClient(trx);
    await client.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        avatarUrl: user.avatarUrl,
        active: user.active,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  }

  async update(user: User, trx?: TransactionContext): Promise<void> {
    const client = this.getClient(trx);
    await client.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        avatarUrl: user.avatarUrl,
        tokenValidAfter: user.tokenValidAfter,
        active: user.active,
        updatedAt: user.updatedAt,
        deletedAt: user.deletedAt,
      },
    });
  }
}
