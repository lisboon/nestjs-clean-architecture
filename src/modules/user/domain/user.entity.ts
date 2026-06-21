import BaseEntity from "@/modules/@shared/domain/entity/base.entity";
import { EntityValidationError } from "@/modules/@shared/domain/errors/validation.error";
import { normalizeEmail } from "@/modules/@shared/domain/utils/email";
import { UserRole } from "@/modules/@shared/domain/enums";
import UserValidatorFactory from "./validators/user.validator";

export interface UserProps {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatarUrl?: string;
  tokenValidAfter?: Date;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class User extends BaseEntity {
  private _name: string;
  private _email: string;
  private _password: string;
  private _role: UserRole;
  private _avatarUrl?: string;
  private _tokenValidAfter?: Date;

  constructor(props: UserProps) {
    super(
      props.id,
      props.createdAt,
      props.updatedAt,
      props.active,
      props.deletedAt,
    );
    this._name = props.name;
    this._email = normalizeEmail(props.email);
    this._password = props.password;
    this._role = props.role;
    this._avatarUrl = props.avatarUrl;
    this._tokenValidAfter = props.tokenValidAfter;
  }

  get name(): string {
    return this._name;
  }

  get email(): string {
    return this._email;
  }

  get password(): string {
    return this._password;
  }

  get role(): UserRole {
    return this._role;
  }

  get avatarUrl(): string | undefined {
    return this._avatarUrl;
  }

  get tokenValidAfter(): Date | undefined {
    return this._tokenValidAfter;
  }

  get isAdmin(): boolean {
    return this._role === UserRole.ADMIN;
  }

  changeName(name: string): void {
    this._name = name;
  }

  changeEmail(email: string): void {
    this._email = normalizeEmail(email);
  }

  changeRole(role: UserRole): void {
    this._role = role;
    this.update();
  }

  changePassword(hashedPassword: string): void {
    this._password = hashedPassword;
    this.invalidateTokens();
    this.update();
  }

  invalidateTokens(): void {
    this._tokenValidAfter = new Date();
    this.update();
  }

  updateUser(
    props: Partial<Pick<UserProps, "name" | "email" | "avatarUrl">>,
  ): void {
    if (props.name !== undefined) this.changeName(props.name);
    if (props.email !== undefined) this.changeEmail(props.email);
    if (props.avatarUrl !== undefined) this._avatarUrl = props.avatarUrl;

    this.update();
    this.validate(["update"]);

    if (this.notification.hasErrors()) {
      throw new EntityValidationError(this.notification.toJSON());
    }
  }

  validate(fields?: string[]): void {
    const validator = UserValidatorFactory.create();
    validator.validate(this._notification, this, fields ?? ["create"]);
  }

  static create(props: UserProps): User {
    const user = new User(props);
    user.validate();

    if (user.notification.hasErrors()) {
      throw new EntityValidationError(user.notification.toJSON());
    }

    return user;
  }

  toJSON() {
    return {
      id: this._id,
      name: this._name,
      email: this._email,
      role: this._role,
      avatarUrl: this._avatarUrl,
      active: this._active,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      deletedAt: this._deletedAt,
    };
  }
}
