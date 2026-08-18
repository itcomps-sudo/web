import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";

/**
 * Auth foundation for Phase 1.
 *
 * One credentials-based login, but the returned session carries `role` and
 * `householdId` so every downstream data access can be scoped correctly.
 * IMPORTANT: never trust a household/customer ID that arrives from the
 * client — always resolve it from the session on the server, as done here.
 */
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/portal/sign-in",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({ where: { email: credentials.email } });
        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          householdId: user.householdId ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.householdId = (user as any).householdId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).householdId = token.householdId;
      }
      return session;
    },
  },
};
