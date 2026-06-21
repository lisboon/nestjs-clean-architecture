import { User } from "../../domain/user.entity";
import { EntityValidationError } from "@/modules/@shared/domain/errors/validation.error";
import { UserRole } from "@/modules/@shared/domain/enums";

const validProps = () => ({
  name: "Maria Souza",
  email: "maria.souza@backend.com.br",
  password: "$2b$12$hashedpassword",
  role: UserRole.EDITOR,
});

describe("User", () => {
  describe("create", () => {
    it("builds a valid user with defaults", () => {
      const user = User.create(validProps());
      expect(user.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(user.name).toBe("Maria Souza");
      expect(user.email).toBe("maria.souza@backend.com.br");
      expect(user.role).toBe(UserRole.EDITOR);
      expect(user.active).toBe(true);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.deletedAt).toBeUndefined();
    });

    it("normalizes email (trim + lowercase)", () => {
      const user = User.create({
        ...validProps(),
        email: "  Maria.Souza@Backend.COM.BR ",
      });
      expect(user.email).toBe("maria.souza@backend.com.br");
    });

    it("throws EntityValidationError when email is invalid", () => {
      expect(() =>
        User.create({ ...validProps(), email: "not-an-email" }),
      ).toThrow(EntityValidationError);
    });

    it("throws EntityValidationError when name is too short", () => {
      expect(() => User.create({ ...validProps(), name: "x" })).toThrow(
        EntityValidationError,
      );
    });

    it("throws EntityValidationError when password is empty", () => {
      expect(() => User.create({ ...validProps(), password: "" })).toThrow(
        EntityValidationError,
      );
    });

    it("throws EntityValidationError when role is invalid", () => {
      expect(() =>
        User.create({ ...validProps(), role: "SUPREME" as UserRole }),
      ).toThrow(EntityValidationError);
    });
  });

  describe("updateUser", () => {
    it("changes name and refreshes updatedAt", async () => {
      const user = User.create(validProps());
      const before = user.updatedAt.getTime();
      await new Promise((r) => setTimeout(r, 2));
      user.updateUser({ name: "Maria Oliveira" });
      expect(user.name).toBe("Maria Oliveira");
      expect(user.updatedAt.getTime()).toBeGreaterThan(before);
    });

    it("normalizes email on change", () => {
      const user = User.create(validProps());
      user.updateUser({ email: "  Nova@Backend.COM.BR " });
      expect(user.email).toBe("nova@backend.com.br");
    });

    it("throws EntityValidationError when email is invalid", () => {
      const user = User.create(validProps());
      expect(() => user.updateUser({ email: "bad-email" })).toThrow(
        EntityValidationError,
      );
    });
  });

  describe("changeRole", () => {
    it("replaces the role", () => {
      const user = User.create(validProps());
      user.changeRole(UserRole.ADMIN);
      expect(user.role).toBe(UserRole.ADMIN);
      expect(user.isAdmin).toBe(true);
    });
  });

  describe("changePassword", () => {
    it("replaces hashed password", () => {
      const user = User.create(validProps());
      user.changePassword("$2b$12$newhashedpassword");
      expect(user.password).toBe("$2b$12$newhashedpassword");
    });

    it("invalidates previously issued tokens", () => {
      const user = User.create(validProps());
      expect(user.tokenValidAfter).toBeUndefined();
      user.changePassword("$2b$12$newhashedpassword");
      expect(user.tokenValidAfter).toBeInstanceOf(Date);
    });
  });

  describe("invalidateTokens", () => {
    it("sets tokenValidAfter to now", () => {
      const user = User.create(validProps());
      user.invalidateTokens();
      expect(user.tokenValidAfter).toBeInstanceOf(Date);
    });
  });

  describe("delete", () => {
    it("soft deletes and deactivates", () => {
      const user = User.create(validProps());
      user.delete();
      expect(user.active).toBe(false);
      expect(user.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe("toJSON", () => {
    it("omits password field", () => {
      const user = User.create(validProps());
      const json = user.toJSON();
      expect(json).not.toHaveProperty("password");
      expect(json).toMatchObject({
        id: user.id,
        name: "Maria Souza",
        email: "maria.souza@backend.com.br",
        role: UserRole.EDITOR,
        active: true,
      });
    });
  });
});
