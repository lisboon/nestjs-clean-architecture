import { UserRole } from "@/modules/@shared/domain/enums";

export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
  avatarUrl?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export class UsersPageResponseDto {
  items: UserResponseDto[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}

export class AuthenticatedUserResponseDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export class LoginResponseDto {
  accessToken: string;
  user: AuthenticatedUserResponseDto;
}

export class ChangePasswordResponseDto {
  id: string;
  updatedAt: Date;
}

export class DeleteUserResponseDto {
  id: string;
  deletedAt: Date;
}
