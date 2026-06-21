import { ExecutionContext } from "@nestjs/common";
import { AuthGuard, JwtPayload } from "../auth-guard";
import { UnauthorizedError } from "@/modules/@shared/domain/errors/unauthorized.error";
import { UserRole } from "@/modules/@shared/domain/enums";

const makeContext = (authorization?: string) => {
  const request: { headers: { authorization?: string }; user?: unknown } = {
    headers: authorization ? { authorization } : {},
  };
  const context = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(request),
    }),
  } as unknown as ExecutionContext;

  return { context, request };
};

const makeSut = ({
  payload = { userId: "user-1", role: UserRole.ADMIN, iat: 1000 } as JwtPayload,
  session = { userId: "user-1", role: UserRole.ADMIN },
} = {}) => {
  const jwtService = {
    verifyAsync: jest.fn().mockResolvedValue(payload),
  };
  const userFacade = {
    validateSession: jest.fn().mockResolvedValue(session),
  };

  const guard = new AuthGuard(jwtService as any, userFacade as any);

  return { guard, jwtService, userFacade, payload, session };
};

describe("AuthGuard", () => {
  it("throws UnauthorizedError when no authorization header is provided", async () => {
    const { guard } = makeSut();
    const { context } = makeContext();

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });

  it("throws UnauthorizedError when the header is not a Bearer token", async () => {
    const { guard } = makeSut();
    const { context } = makeContext("Basic abc123");

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });

  it("throws UnauthorizedError when the token is invalid or expired", async () => {
    const { guard, jwtService } = makeSut();
    jwtService.verifyAsync.mockRejectedValue(new Error("jwt malformed"));
    const { context } = makeContext("Bearer bad-token");

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });

  it("returns true and attaches the session to the request on a valid token", async () => {
    const { guard, session } = makeSut();
    const { context, request } = makeContext("Bearer good-token");

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(request.user).toEqual(session);
  });

  it("forwards the token issuedAt (iat) to validateSession", async () => {
    const { guard, userFacade } = makeSut({
      payload: { userId: "user-1", role: UserRole.ADMIN, iat: 1700000000 },
    });
    const { context } = makeContext("Bearer good-token");

    await guard.canActivate(context);

    expect(userFacade.validateSession).toHaveBeenCalledWith({
      userId: "user-1",
      issuedAt: 1700000000,
    });
  });

  it("passes issuedAt as undefined when the token has no iat claim", async () => {
    const { guard, userFacade } = makeSut({
      payload: { userId: "user-1", role: UserRole.ADMIN },
    });
    const { context } = makeContext("Bearer good-token");

    await guard.canActivate(context);

    expect(userFacade.validateSession).toHaveBeenCalledWith({
      userId: "user-1",
      issuedAt: undefined,
    });
  });

  it("propagates the error when session validation fails", async () => {
    const { guard, userFacade } = makeSut();
    userFacade.validateSession.mockRejectedValue(
      new UnauthorizedError("Session expired"),
    );
    const { context } = makeContext("Bearer good-token");

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });
});
