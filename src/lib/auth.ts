import type { NextAuthOptions } from "next-auth";
import { encode } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";

const SESSION_MAX_AGE = 24 * 60 * 60;

function sessionStartedAt(token: { sessionStarted?: number; iat?: number }) {
  if (typeof token.sessionStarted === "number") return token.sessionStarted;
  if (typeof token.iat === "number") return token.iat;
  return Math.floor(Date.now() / 1000);
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE, updateAge: SESSION_MAX_AGE },
  jwt: {
    maxAge: SESSION_MAX_AGE,
    async encode(params) {
      const started = sessionStartedAt(params.token ?? {});
      const remaining = SESSION_MAX_AGE - (Math.floor(Date.now() / 1000) - started);
      return encode({ ...params, maxAge: Math.max(remaining, 0) });
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          include: { orgMembers: { include: { org: true }, take: 1 } },
        });
        if (!user?.passwordHash) return null;
        const ok = await compare(credentials.password, user.passwordHash);
        if (!ok) return null;
        const membership = user.orgMembers[0];
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          orgId: membership?.orgId,
          orgName: membership?.org.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as { id: string; orgId?: string; orgName?: string };
        token.userId = u.id;
        token.orgId = u.orgId;
        token.orgName = u.orgName;
        token.sessionStarted = Math.floor(Date.now() / 1000);
      }
      const started = sessionStartedAt(token);
      token.sessionStarted = started;
      if (Math.floor(Date.now() / 1000) - started >= SESSION_MAX_AGE) {
        throw new Error("Session expired");
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.orgId = token.orgId as string | undefined;
        session.user.orgName = token.orgName as string | undefined;
      }
      return session;
    },
  },
};
