import type { User as UserModel } from "@prisma/client";
import { UserRole } from "@/modules/@shared/domain/enums";
import { User } from "../domain/user.entity";

export class UserModelMapper {
  static toEntity(data: UserModel): User {
    return new User({
      id: data.id,
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role as UserRole,
      companyId: data.companyId,
      avatarUrl: data.avatarUrl ?? undefined,
      tokenValidAfter: data.tokenValidAfter ?? undefined,
      active: data.active,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      deletedAt: data.deletedAt ?? undefined,
    });
  }
}
