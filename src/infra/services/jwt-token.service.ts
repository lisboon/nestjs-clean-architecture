import * as jwt from "jsonwebtoken";
import type { Algorithm, SignOptions } from "jsonwebtoken";
import {
  JwtTokenService,
  JwtPayloadData,
} from "@/modules/@shared/domain/services/jwt-token.service";
import { JwtConfig } from "@/infra/config/application.config";

const ALGORITHM: Algorithm = "HS256";

export class JwtTokenServiceImpl implements JwtTokenService {
  private readonly secret: string;
  private readonly expiresIn: SignOptions["expiresIn"];

  constructor(config: JwtConfig) {
    this.secret = config.secret;
    this.expiresIn = config.expiresIn;
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
