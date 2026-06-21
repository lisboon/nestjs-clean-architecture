import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { UnauthorizedError } from "@/modules/@shared/domain/errors/unauthorized.error";
import { UserRole } from "@/modules/@shared/domain/enums";
import UserFacade from "@/modules/user/facade/user.facade";

export interface JwtPayload {
  userId: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(UserFacade) private readonly userFacade: UserFacade,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedError("Authentication token not provided");
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_SECRET,
        algorithms: ["HS256"],
      });
    } catch {
      throw new UnauthorizedError("Invalid or expired token");
    }

    const session = await this.userFacade.validateSession({
      userId: payload.userId,
      issuedAt: payload.iat,
    });

    request["user"] = session;
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
