import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuthRoutes, useUser } from "../src/client/index.js";
import * as sessionFacade from "../src/session/session.facade.js";
import { handleAuthMe } from "../src/session/session.facade.js";
import {
  backupCodeSchema,
  totpSetupSchema,
  totpVerifySchema,
  verifyEmailInput,
} from "../src/validation/index.js";

describe("@veap/auth/client", () => {
  it("provides user and session to children via useUser()", () => {
    const mockSession = {
      id: "sess_123",
      userId: "usr_123",
      expiresAt: new Date(),
    };
    const mockUser = {
      id: "usr_123",
      email: "jane@veap.pl",
      name: "Jane Doe",
      roles: ["admin"],
      permissions: ["write"],
      createdAt: new Date(),
      updatedAt: null,
      emailVerifiedAt: null,
      image: null,
      password: null,
      recovery_code: null,
    };

    function UserDisplay() {
      const { user, session, prefix } = useUser();
      return React.createElement(
        "div",
        null,
        React.createElement("span", { id: "user-email" }, user?.email),
        React.createElement("span", { id: "session-id" }, session?.id),
        React.createElement("span", { id: "prefix" }, prefix),
      );
    }

    const html = renderToStaticMarkup(
      React.createElement(
        AuthProvider,
        {
          initialSession: { session: mockSession, user: mockUser },
          prefix: "/custom-prefix",
        },
        React.createElement(UserDisplay),
      ),
    );

    expect(html).toContain("jane@veap.pl");
    expect(html).toContain("sess_123");
    expect(html).toContain("/custom-prefix");
  });

  it("throws error when useUser() is called outside of AuthProvider", () => {
    function OrphanComponent() {
      useUser();
      return React.createElement("div", null, "Orphan");
    }

    expect(() =>
      renderToStaticMarkup(React.createElement(OrphanComponent)),
    ).toThrow("useUser must be used within AuthProvider");
  });

  it("provides default routes via useAuthRoutes() outside and inside provider", () => {
    function RoutesDisplay() {
      const routes = useAuthRoutes();
      return React.createElement("span", { id: "signin-route" }, routes.signIn);
    }

    const htmlOutside = renderToStaticMarkup(
      React.createElement(RoutesDisplay),
    );
    expect(htmlOutside).toContain("/signin");

    const htmlInside = renderToStaticMarkup(
      React.createElement(
        AuthProvider,
        { routes: { signIn: "/login" } as any },
        React.createElement(RoutesDisplay),
      ),
    );
    expect(htmlInside).toContain("/login");
  });
});

describe("Validation Schemas & Helpers", () => {
  it("verifyEmailInput validates format and length", () => {
    expect(verifyEmailInput("valid@example.com")).toBe(true);
    expect(verifyEmailInput("invalid-email")).toBe(false);
    expect(verifyEmailInput("")).toBe(false);
    expect(verifyEmailInput("a".repeat(260) + "@example.com")).toBe(false);
  });

  it("totpSetupSchema and totpVerifySchema validate 6-digit codes", () => {
    expect(totpSetupSchema.safeParse({ code: "123456" }).success).toBe(true);
    expect(totpSetupSchema.safeParse({ code: "12345" }).success).toBe(false);
    expect(totpSetupSchema.safeParse({ code: "1234567" }).success).toBe(false);
    expect(totpSetupSchema.safeParse({ code: "abcdef" }).success).toBe(false);

    expect(totpVerifySchema.safeParse({ code: "654321" }).success).toBe(true);
    expect(totpVerifySchema.safeParse({ code: "not-a-code" }).success).toBe(
      false,
    );
  });

  it("backupCodeSchema validates 8-12 character length", () => {
    expect(backupCodeSchema.safeParse({ code: "12345678" }).success).toBe(true);
    expect(backupCodeSchema.safeParse({ code: "123456789012" }).success).toBe(
      true,
    );
    expect(backupCodeSchema.safeParse({ code: "short" }).success).toBe(false);
    expect(
      backupCodeSchema.safeParse({ code: "toolongcode12345" }).success,
    ).toBe(false);
  });
});

import { bindAuthContext } from "../src/common/context.js";

describe("handleAuthMe Route Handler Helper", () => {
  it("returns 200 with session when session is active", async () => {
    bindAuthContext({
      user: {} as any,
      session: {
        getCurrentSession: vi.fn(async () => ({
          session: { id: "s1", userId: "u1", expiresAt: new Date() } as any,
          user: { id: "u1", email: "test@veap.pl" } as any,
        })),
      } as any,
      rbac: {} as any,
      passwordReset: {} as any,
      emailVerification: {} as any,
      auth: {} as any,
    });

    const response = await handleAuthMe();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.session.id).toBe("s1");
    expect(data.user.email).toBe("test@veap.pl");
  });

  it("returns 401 when no session is active", async () => {
    bindAuthContext({
      user: {} as any,
      session: {
        getCurrentSession: vi.fn(async () => ({
          session: null,
          user: null,
        })),
      } as any,
      rbac: {} as any,
      passwordReset: {} as any,
      emailVerification: {} as any,
      auth: {} as any,
    });

    const response = await handleAuthMe();
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.session).toBeNull();
    expect(data.user).toBeNull();
  });
});
