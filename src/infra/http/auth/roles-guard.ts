import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Roles, RolePermission } from "../shared/roles.decorator";
import { JwtPayload } from "./auth-guard";
import { ForbiddenError } from "@/modules/@shared/domain/errors/forbidden.error";

const ROLE_HIERARCHY: Record<string, number> = {
  USER: 1,
  VIEWER: 2,
  EDITOR: 3,
  ADMIN: 4,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.get<RolePermission>(
      Roles,
      context.getHandler(),
    );

    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: JwtPayload }>();
    const user = request.user;

    const userLevel = ROLE_HIERARCHY[user.role] ?? 0;
    const requiredLevel = ROLE_HIERARCHY[requiredPermission.role] ?? 0;

    if (userLevel < requiredLevel) {
      throw new ForbiddenError(
        `Access denied. Required role: ${requiredPermission.role}. Your role: ${user.role}.`,
      );
    }

    return true;
  }
}
