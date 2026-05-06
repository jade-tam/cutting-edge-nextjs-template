import { z } from "zod";

import type { AuthProvider } from "../contracts";
import { AUTH_ERROR, AuthError } from "../errors";
import type { AuthResponse, UserProfile, UserProfileUpdateInput } from "../types";
import { serverEnv } from "../../env/server";

const sessionSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["admin", "manager", "user"]),
});

const authResponseSchema = z.object({
  sessionToken: z.string().min(1),
  session: sessionSchema,
});

async function parseAuthResponse(response: Response): Promise<AuthResponse> {
  const json = await response.json();
  const parsed = authResponseSchema.safeParse(json);

  if (!parsed.success) {
    throw new AuthError(AUTH_ERROR.AUTH_CLIENT_ERROR);
  }

  return parsed.data;
}

function throwForFailedLogin(response: Response): never {
  if (response.status === 401 || response.status === 403) {
    throw new AuthError(AUTH_ERROR.INVALID_CREDENTIALS);
  }

  if (response.status >= 500) {
    throw new AuthError(AUTH_ERROR.UPSTREAM_SERVICE_ERROR);
  }

  throw new AuthError(AUTH_ERROR.AUTH_CLIENT_ERROR);
}

function throwForFailedRegister(response: Response): never {
  if (response.status >= 500) {
    throw new AuthError(AUTH_ERROR.UPSTREAM_SERVICE_ERROR);
  }

  throw new AuthError(AUTH_ERROR.REGISTER_FAILED);
}

function throwForFailedForgotPassword(response: Response): never {
  if (response.status >= 500) {
    throw new AuthError(AUTH_ERROR.UPSTREAM_SERVICE_ERROR);
  }

  throw new AuthError(AUTH_ERROR.FORGOT_PASSWORD_FAILED);
}

function unsupportedProfileOperation(): never {
  throw new AuthError(AUTH_ERROR.AUTH_CLIENT_ERROR);
}

export function createRestAuthProvider(): AuthProvider {
  const baseUrl = serverEnv.REST_API_BASE_URL;

  return {
    kind: "rest",
    async login(input) {
      let response: Response;

      try {
        response = await fetch(`${baseUrl}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
      } catch {
        throw new AuthError(AUTH_ERROR.UPSTREAM_SERVICE_ERROR);
      }

      if (!response.ok) {
        throwForFailedLogin(response);
      }

      return parseAuthResponse(response);
    },
    async register(input) {
      let response: Response;

      try {
        response = await fetch(`${baseUrl}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
      } catch {
        throw new AuthError(AUTH_ERROR.UPSTREAM_SERVICE_ERROR);
      }

      if (!response.ok) {
        throwForFailedRegister(response);
      }

      return parseAuthResponse(response);
    },
    async forgotPassword(input) {
      let response: Response;

      try {
        response = await fetch(`${baseUrl}/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
      } catch {
        throw new AuthError(AUTH_ERROR.UPSTREAM_SERVICE_ERROR);
      }

      if (!response.ok) {
        throwForFailedForgotPassword(response);
      }

      return { ok: true } as const;
    },
    async getSession(token) {
      let response: Response;

      try {
        response = await fetch(`${baseUrl}/auth/session`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch {
        throw new AuthError(AUTH_ERROR.UPSTREAM_SERVICE_ERROR);
      }

      if (response.status === 401 || response.status === 403) {
        return null;
      }

      if (!response.ok) {
        if (response.status >= 500) {
          throw new AuthError(AUTH_ERROR.UPSTREAM_SERVICE_ERROR);
        }

        throw new AuthError(AUTH_ERROR.AUTH_CLIENT_ERROR);
      }

      const json = await response.json();
      const parsed = sessionSchema.safeParse(json);

      if (!parsed.success) {
        throw new AuthError(AUTH_ERROR.AUTH_CLIENT_ERROR);
      }

      return parsed.data;
    },
    async createUserProfile(input): Promise<AuthResponse["session"]> {
      void input;
      return unsupportedProfileOperation();
    },
    async getUserProfile(): Promise<UserProfile | null> {
      return unsupportedProfileOperation();
    },
    async updateUserProfile(
      userId: string,
      updates: UserProfileUpdateInput,
    ): Promise<UserProfile> {
      void userId;
      void updates;
      return unsupportedProfileOperation();
    },
  };
}
