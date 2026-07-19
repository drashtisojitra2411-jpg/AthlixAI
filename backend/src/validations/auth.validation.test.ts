import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { loginSchema, registerSchema } from "./auth.validation";

describe("registerSchema", () => {
  const valid = {
    fullName: "Jordan Lee",
    email: "jordan@example.com",
    password: "password123",
  };

  it("accepts a valid registration payload", () => {
    const result = registerSchema.safeParse(valid);
    assert.equal(result.success, true);
  });

  it("trims and lowercases the email", () => {
    const result = registerSchema.safeParse({ ...valid, email: "  Jordan@Example.COM  " });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.email, "jordan@example.com");
    }
  });

  it("rejects a full name shorter than 2 characters", () => {
    assert.equal(registerSchema.safeParse({ ...valid, fullName: "J" }).success, false);
  });

  it("rejects a malformed email", () => {
    assert.equal(registerSchema.safeParse({ ...valid, email: "not-an-email" }).success, false);
  });

  it("rejects a password shorter than 8 characters", () => {
    assert.equal(registerSchema.safeParse({ ...valid, password: "short1" }).success, false);
  });

  it("rejects an avatar that is not a valid URL", () => {
    assert.equal(registerSchema.safeParse({ ...valid, avatar: "not-a-url" }).success, false);
  });

  it("accepts a self-selected Organizer or Visitor role", () => {
    assert.equal(registerSchema.safeParse({ ...valid, role: "Organizer" }).success, true);
    assert.equal(registerSchema.safeParse({ ...valid, role: "Visitor" }).success, true);
  });

  // Security boundary: self-registration must never be able to mint an Admin
  // account. If this regresses, any signed-up user could grant themselves
  // full platform access.
  it("rejects a self-selected Admin role", () => {
    const result = registerSchema.safeParse({ ...valid, role: "Admin" });
    assert.equal(result.success, false);
  });

  it("rejects an unknown role string", () => {
    assert.equal(registerSchema.safeParse({ ...valid, role: "SuperUser" }).success, false);
  });

  it("allows role to be omitted, deferring to the model's own default", () => {
    const result = registerSchema.safeParse(valid);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal("role" in result.data, false);
    }
  });
});

describe("loginSchema", () => {
  it("accepts a valid email and non-empty password", () => {
    assert.equal(loginSchema.safeParse({ email: "user@example.com", password: "anything" }).success, true);
  });

  it("trims and lowercases the email", () => {
    const result = loginSchema.safeParse({ email: "  User@Example.COM  ", password: "x" });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.email, "user@example.com");
    }
  });

  it("rejects a malformed email", () => {
    assert.equal(loginSchema.safeParse({ email: "not-an-email", password: "x" }).success, false);
  });

  it("rejects an empty password", () => {
    assert.equal(loginSchema.safeParse({ email: "user@example.com", password: "" }).success, false);
  });
});
