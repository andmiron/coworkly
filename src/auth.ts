import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "./lib/prisma";
import bcrypt from "bcryptjs";
import { z, ZodError } from "zod";
import { CredentialsSignin } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: string;
      createdAt: Date;
    };
  }

  interface User {
    id: string;
    username: string;
    role: string;
    createdAt: Date;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: string;
    createdAt: Date;
  }
}

const loginSchema = z.object({
  username: z
    .string({ required_error: "Username is required" })
    .min(1, "Username is required")
    .max(30, "Username must be less than 30 characters"),
  password: z
    .string({ required_error: "Password is required" })
    .min(4, "Password is minimum 4 characters long")
    .max(30, "Password must be less than 30 characters"),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: true,
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          const { username, password } = await loginSchema.parseAsync(
            credentials
          );

          const user = await prisma.user.findUnique({
            where: { username },
          });
          if (!user) throw new Error("Invalid credentials");

          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) throw new CredentialsSignin("Invalid credentials");

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password: _, ...userWithoutPassword } = user;
          console.log(
            `authorized user: ${JSON.stringify(userWithoutPassword)}`
          );
          return userWithoutPassword;
        } catch (error) {
          if (error instanceof ZodError) {
            throw new Error("Invalid credentials");
          }
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.createdAt = user.createdAt;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        console.log(session.user.id);
        session.user.username = token.username;
        session.user.role = token.role;
        session.user.createdAt = token.createdAt;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/logout",
  },
});
