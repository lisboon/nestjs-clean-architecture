import * as bcrypt from "bcrypt";
import { PasswordHashService } from "@/modules/@shared/domain/services/password-hash.service";

export class BcryptPasswordHashService implements PasswordHashService {
  private readonly saltRounds: number;

  constructor(saltRounds: number) {
    this.saltRounds = saltRounds;
  }

  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.saltRounds);
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
