import { UserRole } from "@/modules/@shared/domain/enums";

export interface UserFilter {
  name?: string;
  email?: string;
  role?: UserRole;
  active?: boolean | string;
}
