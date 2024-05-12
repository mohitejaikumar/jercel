import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { SignInSchema } from "../../../../zod/form";
import prisma from "../../../../prisma";
import axios from "axios";
import { use } from "react";

export const authOptions = {
  // all the providers
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      type: "credentials",

      credentials: {
        Email: { label: "email", type: "text", placeholder: "jsmith" },
        Password: { label: "password", type: "password" },
      },
      // @ts-ignore
      async authorize(credentials, req) {
        if (credentials === undefined) {
          return null;
        }

        const userEmail = credentials.Email;
        const userPassword = credentials.Password;
        const parseInput = SignInSchema.safeParse({
          Email: userEmail,
          Password: userPassword,
        });
        if (!parseInput.success) {
          return null;
        }

        console.log("hi from nextauth");

        try {
          const { data } = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/signin`,
            {
              email: userEmail,
              password: userPassword,
            }
          );

          return {
            id: data.user.id,
            email: data.user.email,
            token: data.token,
          };
        } catch (err) {
          console.error(err);
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXT_AUTH_SECRET,
  strategy: "jwt",
  callbacks: {
    jwt: async ({ user, token, account }: any) => {
      if (account) {
        token.provider = account.provider;
      }

      if (token.provider == "credentials") {
        token.password = true;
        if (user) {
          token.plan = user.plan;
        }
      }
      if (user) {
        token.jwtToken = user.token;
      }
      return token;
    },
    session: ({ session, token, user }: any) => {
      if (session.user) {
        session.user.jwtToken = token.jwtToken;
        session.provider = token.provider;
        session.user.password = token.password;
        session.user.plan = token.plan;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },
};

export default NextAuth(authOptions);
