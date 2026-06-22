import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Email",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;
      const user = await prisma.user.findUnique({
        where: { email: credentials.email.toLowerCase().trim() }
      });
      if (!user?.passwordHash) return null;
      const ok = await bcrypt.compare(credentials.password, user.passwordHash);
      if (!ok) return null;
      return { id: user.id, email: user.email, name: user.name, image: user.image ?? undefined };
    }
  })
];

// Google login is enabled automatically when env keys are present.
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ user, account }) {
      // Ensure a User row exists for Google sign-ins
      if (account?.provider === "google" && user.email) {
        await prisma.user.upsert({
          where: { email: user.email.toLowerCase() },
          update: { name: user.name ?? user.email, image: user.image },
          create: { email: user.email.toLowerCase(), name: user.name ?? user.email, image: user.image }
        });
      }
      return true;
    },
    async jwt({ token }) {
      if (token.email) {
        const user = await prisma.user.findUnique({ where: { email: token.email.toLowerCase() } });
        if (user) {
          token.uid = user.id;
          token.isPlatformAdmin = user.isPlatformAdmin;
          token.name = user.name;
          token.picture = user.image ?? null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.uid as string) ?? "";
        session.user.isPlatformAdmin = Boolean(token.isPlatformAdmin);
      }
      return session;
    }
  }
};
