import { UserRole } from "../enums";

export interface JwtPayloadData {
  userId: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface JwtTokenService {
  sign(payload: JwtPayloadData): string;
  verify(token: string): JwtPayloadData;
}
