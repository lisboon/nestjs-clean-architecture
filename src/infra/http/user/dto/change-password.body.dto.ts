import { IsString, Length } from "class-validator";

export class ChangePasswordBodyDto {
  @IsString({ message: "Current password must be a string" })
  @Length(1, 128, { message: "Current password is required" })
  currentPassword: string;

  @IsString({ message: "New password must be a string" })
  @Length(8, 128, {
    message: "New password must be between 8 and 128 characters",
  })
  newPassword: string;
}
