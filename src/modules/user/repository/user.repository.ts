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
import { resolvePrismaClient } from "@/infra/database/prisma-transaction.context";
import { UserModelMapper } from "./user.model.mapper";
import { EntityValidationError } from "@/modules/@shared/domain/errors/validation.error";
import { executeWithUniqueConstraintTranslation } from "@/infra/database/prisma-operation";

const emailAlreadyInUse = () =>
  new EntityValidationError([
    { field: "email", message: "Email already in use" },
  ]);

export default class UserRepository implements UserGateway {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string, trx?: TransactionContext): Promise<User | null> {
    const row = await resolvePrismaClient(this.prisma, trx).user.findFirst({
      where: { id, deletedAt: null },
    });
    return row ? UserModelMapper.toEntity(row) : null;
  }

  async findByEmail(
    email: string,
    trx?: TransactionContext,
  ): Promise<User | null> {
    const row = await resolvePrismaClient(this.prisma, trx).user.findFirst({
      where: { email: normalizeEmail(email), deletedAt: null },
    });
    return row ? UserModelMapper.toEntity(row) : null;
  }

  async search(
    params: SearchParams<UserFilter>,
    trx?: TransactionContext,
  ): Promise<SearchResult<User>> {
    const client = resolvePrismaClient(this.prisma, trx);
    const builder = new UsersQueryBuilder(params);
    const query = builder.build();
    const where = { ...query.where, deletedAt: null };

    const [rows, total] = await Promise.all([
      client.user.findMany({
        where,
        ...(query.orderBy ? { orderBy: query.orderBy } : {}),
        skip: query.skip,
        take: query.take,
      }),
      client.user.count({ where }),
    ]);

    return new SearchResult({
      items: rows.map(UserModelMapper.toEntity),
      total,
      currentPage: params.page,
      perPage: params.perPage,
    });
  }

  async countActiveAdmins(trx?: TransactionContext): Promise<number> {
    const client = resolvePrismaClient(this.prisma, trx);
    return client.user.count({
      where: { role: UserRole.ADMIN, active: true, deletedAt: null },
    });
  }

  async countActiveByCompany(
    companyId: string,
    trx?: TransactionContext,
  ): Promise<number> {
    const client = resolvePrismaClient(this.prisma, trx);
    return client.user.count({
      where: { companyId, active: true, deletedAt: null },
    });
  }

  async create(user: User, trx?: TransactionContext): Promise<void> {
    const client = resolvePrismaClient(this.prisma, trx);
    await executeWithUniqueConstraintTranslation(
      () =>
        client.user.create({
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
            password: user.password,
            role: user.role,
            companyId: user.companyId,
            avatarUrl: user.avatarUrl,
            active: user.active,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        }),
      "email",
      emailAlreadyInUse,
    );
  }

  async update(user: User, trx?: TransactionContext): Promise<void> {
    const client = resolvePrismaClient(this.prisma, trx);
    await executeWithUniqueConstraintTranslation(
      () =>
        client.user.update({
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
        }),
      "email",
      emailAlreadyInUse,
    );
  }
}
