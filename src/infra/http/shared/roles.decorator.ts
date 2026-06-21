import { Reflector } from "@nestjs/core";
import { UserRole } from "@/modules/@shared/domain/enums";

export interface RolePermission {
  role: UserRole;
}

export const Roles = Reflector.createDecorator<RolePermission>();
