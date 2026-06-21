import * as jwt from "jsonwebtoken";
import type { Algorithm, SignOptions } from "jsonwebtoken";
import {
  JwtTokenService,
  JwtPayloadData,
} from "@/modules/@shared/domain/services/jwt-token.service";

const ALGORITHM: Algorithm = "HS256";
const MIN_SECRET_LENGTH = 32;

export class JwtTokenServiceImpl implements JwtTokenService {
  private readonly secret: string;
  private readonly expiresIn: SignOptions["expiresIn"];

  constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is required");
    }
    if (process.env.NODE_ENV !== "test" && secret.length < MIN_SECRET_LENGTH) {
      throw new Error(
        `JWT_SECRET must be at least ${MIN_SECRET_LENGTH} characters`,
      );
    }
    this.secret = secret;
    this.expiresIn = (process.env.JWT_EXPIRES_IN ||
      "7d") as SignOptions["expiresIn"];
  }

  sign(payload: JwtPayloadData): string {
    return jwt.sign(
      { userId: payload.userId, role: payload.role },
      this.secret,
      {
        expiresIn: this.expiresIn,
        algorithm: ALGORITHM,
      },
    );
  }

  verify(token: string): JwtPayloadData {
    return jwt.verify(token, this.secret, {
      algorithms: [ALGORITHM],
    }) as JwtPayloadData;
  }
}
