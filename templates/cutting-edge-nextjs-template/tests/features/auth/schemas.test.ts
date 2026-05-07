import { describe, expect, it } from "vitest";

import { forgotPasswordSchema } from "../../../features/auth/schemas/forgot-password-schema";
import { loginSchema } from "../../../features/auth/schemas/login-schema";
import { registerSchema } from "../../../features/auth/schemas/register-schema";

function expectIssueMessage(parsed: { success: boolean; error?: { issues: Array<{ message: string }> } }, message: string) {
  expect(parsed.success).toBe(false);

  if (!parsed.success && parsed.error) {
    expect(parsed.error.issues.map((issue) => issue.message)).toContain(message);
  }
}

describe("auth schemas", () => {
  describe("login schema", () => {
    it("rejects invalid email", () => {
      const parsed = loginSchema.safeParse({ email: "bad", password: "12345678" });
      expectIssueMessage(parsed, "validation.email.invalid");
    });

    it("rejects blank and whitespace-only password", () => {
      const empty = loginSchema.safeParse({
        email: "user@example.com",
        password: "",
      });
      expectIssueMessage(empty, "validation.password.required");

      const whitespace = loginSchema.safeParse({
        email: "user@example.com",
        password: "   ",
      });
      expectIssueMessage(whitespace, "validation.password.required");
    });

    it("normalizes email", () => {
      const parsed = loginSchema.safeParse({
        email: "  USER@Example.COM  ",
        password: "Password1!Test",
      });

      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.email).toBe("user@example.com");
      }
    });
  });

  describe("register schema", () => {
    it("requires minimum fullName length", () => {
      const parsed = registerSchema.safeParse({
        fullName: "A",
        username: "ada_user",
        email: "user@example.com",
        password: "ValidPassword1!",
      });
      expectIssueMessage(parsed, "validation.fullName.tooShort");
    });

    it("rejects fullName over max length", () => {
      const parsed = registerSchema.safeParse({
        fullName: "A".repeat(101),
        username: "ada_user",
        email: "user@example.com",
        password: "ValidPassword1!",
      });
      expectIssueMessage(parsed, "validation.fullName.tooLong");
    });

    it("normalizes email + trims fullName", () => {
      const parsed = registerSchema.safeParse({
        fullName: "  Ada Lovelace  ",
        username: "  Ada_User  ",
        email: "  USER@Example.COM  ",
        password: "Sup3r!SecurePass",
        confirmPassword: "Sup3r!SecurePass",
      });

      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.fullName).toBe("Ada Lovelace");
        expect(parsed.data.username).toBe("Ada_User");
        expect(parsed.data.email).toBe("user@example.com");
      }
    });

    it("validates username requirements", () => {
      const tooShort = registerSchema.safeParse({
        fullName: "Ada",
        username: "ab",
        email: "ada@example.com",
        password: "Sup3r!SecurePass",
        confirmPassword: "Sup3r!SecurePass",
      });
      expectIssueMessage(tooShort, "validation.username.tooShort");

      const tooLong = registerSchema.safeParse({
        fullName: "Ada",
        username: "a".repeat(31),
        email: "ada@example.com",
        password: "Sup3r!SecurePass",
        confirmPassword: "Sup3r!SecurePass",
      });
      expectIssueMessage(tooLong, "validation.username.tooLong");

      const invalidFormat = registerSchema.safeParse({
        fullName: "Ada",
        username: "ada-user",
        email: "ada@example.com",
        password: "Sup3r!SecurePass",
        confirmPassword: "Sup3r!SecurePass",
      });
      expectIssueMessage(invalidFormat, "validation.username.invalidFormat");
    });

    it("requires username in register payload", () => {
      const parsed = registerSchema.safeParse({
        fullName: "Ada",
        email: "ada@example.com",
        password: "Sup3r!SecurePass",
        confirmPassword: "Sup3r!SecurePass",
      });

      expect(parsed.success).toBe(false);
    });

    it("accepts valid username format", () => {
      const parsed = registerSchema.safeParse({
        fullName: "Ada",
        username: "Ada_123",
        email: "ada@example.com",
        password: "Sup3r!SecurePass",
        confirmPassword: "Sup3r!SecurePass",
      });

      expect(parsed.success).toBe(true);
    });

    it("rejects weak register passwords", () => {
      const parsed = registerSchema.safeParse({
        fullName: "Ada",
        username: "ada_user",
        email: "ada@example.com",
        password: "password123",
      });

      expectIssueMessage(parsed, "validation.password.weakPassword");
    });

    it("accepts strong register passwords", () => {
      const parsed = registerSchema.safeParse({
        fullName: "Ada Lovelace",
        username: "ada_lovelace",
        email: "ada@example.com",
        password: "Sup3r!SecurePass",
        confirmPassword: "Sup3r!SecurePass",
      });

      expect(parsed.success).toBe(true);
    });

    it("enforces password length boundaries", () => {
      const tooShort = registerSchema.safeParse({
        fullName: "Ada",
        username: "ada_user",
        email: "ada@example.com",
        password: "Aa1!aaaaaaa",
      });
      expectIssueMessage(tooShort, "validation.password.tooShort");

      expect(
        registerSchema.safeParse({
          fullName: "Ada",
          username: "ada_user",
          email: "ada@example.com",
          password: "Aa1!aaaaaaaa",
          confirmPassword: "Aa1!aaaaaaaa",
        }).success,
      ).toBe(true);

      expect(
        registerSchema.safeParse({
          fullName: "Ada",
          username: "ada_user",
          email: "ada@example.com",
          password: `Aa1!${"a".repeat(124)}`,
          confirmPassword: `Aa1!${"a".repeat(124)}`,
        }).success,
      ).toBe(true);

      const tooLong = registerSchema.safeParse({
        fullName: "Ada",
        username: "ada_user",
        email: "ada@example.com",
        password: `Aa1!${"a".repeat(125)}`,
      });
      expectIssueMessage(tooLong, "validation.password.tooLong");
    });

    it("rejects missing password composition requirements", () => {
      const missingUppercase = registerSchema.safeParse({
        fullName: "Ada",
        username: "ada_user",
        email: "ada@example.com",
        password: "lowercase1!x",
      });
      expectIssueMessage(missingUppercase, "validation.password.missingUppercase");

      const missingLowercase = registerSchema.safeParse({
        fullName: "Ada",
        username: "ada_user",
        email: "ada@example.com",
        password: "UPPERCASE1!X",
      });
      expectIssueMessage(missingLowercase, "validation.password.missingLowercase");

      const missingNumber = registerSchema.safeParse({
        fullName: "Ada",
        username: "ada_user",
        email: "ada@example.com",
        password: "NoNumberSymbol",
      });
      expectIssueMessage(missingNumber, "validation.password.missingNumber");

      const missingSymbol = registerSchema.safeParse({
        fullName: "Ada",
        username: "ada_user",
        email: "ada@example.com",
        password: "NoSymbol12345",
      });
      expectIssueMessage(missingSymbol, "validation.password.missingSymbol");
    });

    it("rejects leading or trailing password whitespace", () => {
      const leading = registerSchema.safeParse({
        fullName: "Ada",
        username: "ada_user",
        email: "ada@example.com",
        password: " Sup3r!SecurePass",
      });
      expectIssueMessage(leading, "validation.password.noWhitespace");

      const trailing = registerSchema.safeParse({
        fullName: "Ada",
        username: "ada_user",
        email: "ada@example.com",
        password: "Sup3r!SecurePass ",
      });
      expectIssueMessage(trailing, "validation.password.noWhitespace");
    });
  });

  describe("forgot password schema", () => {
    it("rejects invalid email", () => {
      const parsed = forgotPasswordSchema.safeParse({ email: "bad" });
      expectIssueMessage(parsed, "validation.email.invalid");
    });

    it("normalizes valid email", () => {
      const parsed = forgotPasswordSchema.safeParse({ email: "  USER@Example.COM  " });
      expect(parsed.success).toBe(true);

      if (parsed.success) {
        expect(parsed.data.email).toBe("user@example.com");
      }
    });
  });
});
