import { IsEmail, IsEnum, IsNotEmpty, Length } from "class-validator";
import { Notification } from "@/modules/@shared/domain/entity/validators/notification";
import { ClassValidatorFields } from "@/modules/@shared/domain/entity/validators/class-validator-fields";
import { UserRole } from "@/modules/@shared/domain/enums";
import { User } from "../user.entity";

export class UserRules {
  @Length(2, 255, {
    message: "Invalid name",
    groups: ["create", "name", "update"],
  })
  name: string;

  @IsEmail(
    {},
    {
      message: "Invalid email",
      groups: ["create", "email", "update"],
    },
  )
  email: string;

  @IsNotEmpty({
    message: "Password is required",
    groups: ["create", "password"],
  })
  password: string;

  @IsEnum(UserRole, {
    message: "Invalid role",
    groups: ["create", "role", "update"],
  })
  role: UserRole;

  constructor(data: User) {
    Object.assign(this, data.toJSON());
    this.password = data.password;
  }
}

export class UserValidator extends ClassValidatorFields {
  validate(notification: Notification, data: User, fields: string[]): boolean {
    const rules = new UserRules(data);
    const newFields = fields?.length ? fields : ["create"];
    return super.validate(notification, rules, newFields);
  }
}

export default class UserValidatorFactory {
  static create(): UserValidator {
    return new UserValidator();
  }
}
