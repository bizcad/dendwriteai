import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      tenantId: string;
      email: string;
      name: string;
    };
  }
  interface User {
    id: string;
    email: string;
    name: string;
    tenantId: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          // Accept any email/password for now
          // Real auth verification happens when Convex is connected
          return {
            id: "temp-user-id",
            email: credentials.email,
            name: credentials.email.split('@')[0],
            tenantId: "default-tenant",
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.tenantId = user.tenantId;
        token.id = user.id;
      }
      return token;
    },
    
    async session({ session, token }: any) {
      if (session.user) {
        session.user.tenantId = token.tenantId;
        session.user.id = token.id;
      }
      return session;
    },
  },
  
  pages: {
    signIn: "/auth/signin",
  },
  
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      },
    },
  },
};

const handler = NextAuth(authOptions);

export const handlers = { GET: handler, POST: handler };
export const auth = handler;
export { signIn, signOut } from "next-auth/react";
