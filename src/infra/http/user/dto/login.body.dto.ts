import { IsEmail, IsString, Length } from "class-validator";

export class LoginBodyDto {
  @IsEmail({}, { message: "Invalid email address" })
  email: string;

  @IsString({ message: "Password must be a string" })
  @Length(1, 128, { message: "Password must be between 1 and 128 characters" })
  password: string;
}
