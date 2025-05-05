import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { env } from "@/lib/env";
import Authorized from "./actions/authorized";

export const { handlers, signIn, signOut, auth } = NextAuth({
  callbacks: {
    async jwt({ token, user }) {
      if (user) return { ...token, ...user };
      return token;
    },
    async session({ session, token }) {
      session.user = token as any;
      return session;
    },
    authorized: Authorized
  },
  providers: [
    Credentials({
      authorize: async (credentials) => {
        try {
          const response = await fetch(`${env.apiUrl}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          });

          const data = await response.json();

          console.log("Auth response:", data);

          if (response.ok && data) {
            return {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              accessToken: data.token,
            };
          }

          console.error("Auth failed:", data.message || "Unknown error");
          return null;
        } catch (error) {
          console.error("Auth error details:", error);
          return null;
        }
      },
    }),
  ],
});
