import NextAuth, { CredentialsSignin } from "next-auth";
import type { NextAuthConfig, User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import { getIpAddress, getUserAgent } from "@/lib/auth-utilis";
import {
  AUTH_SESSION_MAX_AGE_SECONDS,
  createUserSession,
  revokeUserSession,
  touchUserSession,
} from "@/lib/auth/session-store";
import { verifyLoginOtp } from "@/lib/auth/login-otp";
import { resolveOAuthUser } from "@/lib/auth/oauth-users";

class ZoyaCredentialsError extends CredentialsSignin {
  code = "zoya_credentials";
}

class ActiveSessionCredentialsError extends CredentialsSignin {
  code = "active_session";
}

type ZoyaAuthUser = User & {
  username?: string | null;
  firstName?: string | null;
  rememberMe?: boolean;
  dbSessionToken?: string;
  dbSessionExpiresAt?: string;
};

function credentialString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function credentialBoolean(value: unknown) {
  return value === true || value === "true" || value === "on" || value === "1";
}

function assignZoyaUser(target: User, source: ZoyaAuthUser) {
  const user = target as ZoyaAuthUser;

  user.id = source.id;
  user.email = source.email;
  user.name = source.name;
  user.username = source.username ?? null;
  user.firstName = source.firstName ?? null;
  user.rememberMe = Boolean(source.rememberMe);

  if (source.dbSessionToken) {
    user.dbSessionToken = source.dbSessionToken;
  }

  if (source.dbSessionExpiresAt) {
    user.dbSessionExpiresAt = source.dbSessionExpiresAt;
  }
}

function createAuthConfig(request?: Request): NextAuthConfig {
  const ipAddress = request ? getIpAddress(request) : null;
  const userAgent = request ? getUserAgent(request) : null;
  const googleClientId = process.env.AUTH_GOOGLE_ID?.trim();
  const googleClientSecret = process.env.AUTH_GOOGLE_SECRET?.trim();
  const facebookClientId = process.env.AUTH_FACEBOOK_ID?.trim();
  const facebookClientSecret = process.env.AUTH_FACEBOOK_SECRET?.trim();
  const providers: NonNullable<NextAuthConfig["providers"]> = [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" },
        rememberMe: { label: "Remember me", type: "checkbox" },
      },
      async authorize(credentials, authorizeRequest) {
        const email = credentialString(credentials.email).toLowerCase();
        const otp = credentialString(credentials.otp);
        const rememberMe = credentialBoolean(credentials.rememberMe);

        if (!email || !otp || otp.length !== 6) {
          throw new ZoyaCredentialsError();
        }

        const result = await verifyLoginOtp({
          email,
          otp,
          rememberMe,
          ip: getIpAddress(authorizeRequest) ?? "unknown",
          userAgent: getUserAgent(authorizeRequest) ?? "unknown",
        });

        if (!result.ok) {
          if (result.status === 409) {
            throw new ActiveSessionCredentialsError();
          }

          throw new ZoyaCredentialsError();
        }

        return result.user;
      },
    }),
  ];

  if (googleClientId && googleClientSecret) {
    providers.push(
      Google({
        clientId: googleClientId,
        clientSecret: googleClientSecret,
      }),
    );
  }

  if (facebookClientId && facebookClientSecret) {
    providers.push(
      Facebook({
        clientId: facebookClientId,
        clientSecret: facebookClientSecret,
      }),
    );
  }

  return {
    pages: {
      signIn: "/auth/login",
      error: "/auth/login",
    },
    providers,
    session: {
      strategy: "jwt",
      maxAge: AUTH_SESSION_MAX_AGE_SECONDS,
      updateAge: 60,
    },
    jwt: {
      maxAge: AUTH_SESSION_MAX_AGE_SECONDS,
    },
    callbacks: {
      async signIn({ user, account }) {
        try {
          if (!account) return false;

          let appUser = user as ZoyaAuthUser;

          if (account.provider === "google" || account.provider === "facebook") {
            if (!user.email) {
              return "/auth/login?error=OAuthEmail";
            }

            appUser = await resolveOAuthUser({
              email: user.email,
              name: user.name,
              provider: account.provider,
              ipAddress,
            });

            assignZoyaUser(user, appUser);
          }

          if (!appUser.id) return false;

          const session = await createUserSession({
            userId: appUser.id,
            ipAddress,
            userAgent,
            turnstileVerified: false,
            turnstileVerifiedAt: null,
          });

          if (!session.ok) {
            if (session.reason === "active_session") {
              return "/auth/login?error=ActiveSession";
            }

            return false;
          }

          assignZoyaUser(user, {
            ...appUser,
            dbSessionToken: session.sessionToken,
            dbSessionExpiresAt: session.expiresAt,
          });

          return true;
        } catch (error) {
          console.error("auth signIn callback error", error);
          return false;
        }
      },
      async jwt({ token, user }) {
        if (user) {
          const zoyaUser = user as ZoyaAuthUser;

          token.id = zoyaUser.id;
          token.username = zoyaUser.username;
          token.firstName = zoyaUser.firstName;
          token.rememberMe = zoyaUser.rememberMe;
          token.dbSessionToken = zoyaUser.dbSessionToken;
          token.dbSessionExpiresAt = zoyaUser.dbSessionExpiresAt;

          return token;
        }

        if (!token.dbSessionToken) {
          return null;
        }

        const touchedSession = await touchUserSession({
          sessionToken: String(token.dbSessionToken),
          ipAddress,
          userAgent,
        });

        if (!touchedSession.ok) {
          return null;
        }

        token.dbSessionExpiresAt = touchedSession.expiresAt;

        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.id = token.id as string;
          session.user.username = (token.username as string | null) ?? null;
          session.user.firstName = (token.firstName as string | null) ?? null;
        }

        if (token.dbSessionExpiresAt) {
          session.expires = String(token.dbSessionExpiresAt) as typeof session.expires;
        }

        return session;
      },
    },
    events: {
      async signOut(message) {
        if ("token" in message) {
          await revokeUserSession(message.token?.dbSessionToken as string);
        }
      },
    },
    secret:
      process.env.AUTH_SECRET ??
      process.env.NEXTAUTH_SECRET ??
      (process.env.NODE_ENV === "development"
        ? "zoya-botanicals-development-auth-secret"
        : undefined),
    trustHost: true,
  };
}

const authResult = NextAuth((request) => createAuthConfig(request));

export const handlers = authResult.handlers;
export const auth = authResult.auth;
export const signIn = authResult.signIn;
export const signOut = authResult.signOut;
