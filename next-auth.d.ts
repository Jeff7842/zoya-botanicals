import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username?: string | null;
      firstName?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    username?: string | null;
    firstName?: string | null;
    rememberMe?: boolean;
    dbSessionToken?: string;
    dbSessionExpiresAt?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string | null;
    firstName?: string | null;
    rememberMe?: boolean;
    dbSessionToken?: string;
    dbSessionExpiresAt?: string;
  }
}
