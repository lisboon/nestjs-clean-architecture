import * as bcrypt from "bcrypt";
import { PasswordHashService } from "@/modules/@shared/domain/services/password-hash.service";

const DEFAULT_SALT_ROUNDS = 12;
const MIN_SALT_ROUNDS = 10;

export class BcryptPasswordHashService implements PasswordHashService {
  private readonly saltRounds: number;

  constructor() {
    const raw = process.env.BCRYPT_ROUNDS;
    const parsed = raw ? Number.parseInt(raw, 10) : DEFAULT_SALT_ROUNDS;
    if (!Number.isInteger(parsed) || parsed < MIN_SALT_ROUNDS) {
      throw new Error(
        `BCRYPT_ROUNDS must be an integer >= ${MIN_SALT_ROUNDS}, got ${raw ?? "undefined"}`,
      );
    }
    this.saltRounds = parsed;
  }

  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.saltRounds);
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
