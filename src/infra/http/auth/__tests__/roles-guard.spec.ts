import { ExecutionContext } from "@nestjs/common";
import { RolesGuard } from "../roles-guard";
import { Roles, RolePermission } from "../../shared/roles.decorator";
import { JwtPayload } from "../auth-guard";
import { ForbiddenError } from "@/modules/@shared/domain/errors/forbidden.error";
import { UserRole } from "@/modules/@shared/domain/enums";

const makeContext = (user?: Partial<JwtPayload>) => {
  const handler = () => undefined;
  const getRequest = jest.fn().mockReturnValue({ user });
  const context = {
    getHandler: jest.fn().mockReturnValue(handler),
    switchToHttp: jest.fn().mockReturnValue({ getRequest }),
  } as unknown as ExecutionContext;

  return { context, getRequest };
};

const makeSut = (requiredPermission?: RolePermission) => {
  const reflector = {
    get: jest.fn().mockReturnValue(requiredPermission),
  };

  const guard = new RolesGuard(reflector as any);

  return { guard, reflector };
};

describe("RolesGuard", () => {
  it("allows access when handler has no @Roles metadata", () => {
    const { guard, reflector } = makeSut(undefined);
    const { context, getRequest } = makeContext();

    expect(guard.canActivate(context)).toBe(true);
    expect(reflector.get).toHaveBeenCalledWith(Roles, expect.any(Function));
    expect(getRequest).not.toHaveBeenCalled();
  });

  it("allows access when user role equals the required role", () => {
    const { guard } = makeSut({ role: UserRole.EDITOR });
    const { context } = makeContext({ role: UserRole.EDITOR });

    expect(guard.canActivate(context)).toBe(true);
  });

  it("allows access when user role outranks the required role", () => {
    const { guard } = makeSut({ role: UserRole.EDITOR });
    const { context } = makeContext({ role: UserRole.ADMIN });

    expect(guard.canActivate(context)).toBe(true);
  });

  it("throws ForbiddenError when user role is below the required role", () => {
    const { guard } = makeSut({ role: UserRole.ADMIN });
    const { context } = makeContext({ role: UserRole.USER });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenError);
  });

  it("throws ForbiddenError when user role is unknown (outside the hierarchy)", () => {
    const { guard } = makeSut({ role: UserRole.USER });
    const { context } = makeContext({ role: "GUEST" as UserRole });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenError);
  });

  it("includes required and current role in the error message", () => {
    const { guard } = makeSut({ role: UserRole.ADMIN });
    const { context } = makeContext({ role: UserRole.USER });

    expect(() => guard.canActivate(context)).toThrow(
      "Access denied. Required role: ADMIN. Your role: USER.",
    );
  });
});
