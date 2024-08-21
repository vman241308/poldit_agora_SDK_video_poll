import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import LinkedInProvider from "next-auth/providers/linkedin";
import { initializeApollo } from "lib/apollo";
import GraphResolvers from "../../../lib/apollo/apiGraphStrings";
import Cookies from "js-cookie";
import { NextApiRequest, NextApiResponse } from "next";
import { signOut } from "next-auth/react";
import { NextResponse } from "next/server";
import getGeoLocation from "_components/apis/geoLocate";

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  const client = initializeApollo();
  // if (req.query.nextauth.includes("callback") && req.method === "POST") {
  //   console.log(
  //     "Handling callback request from my Identity Provider",
  //     req.body
  //   );
  // }

  return await NextAuth(req, res, {
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      }),
      FacebookProvider({
        clientId: process.env.FB_CLIENT_ID as string,
        clientSecret: process.env.FB_CLIENT_SECRET as string,
      }),
      // LinkedInProvider({
      //   clientId: process.env.FB_CLIENT_ID as string,
      //   clientSecret: process.env.FB_CLIENT_SECRET as string,
      // }),
    ],

    callbacks: {
      async signIn({ user, account, profile, email, credentials }) {
        return true;
      },
      // redirect({ url, baseUrl }) {
      //   console.log({ url, baseUrl });
      //   return url;
      // },
      async jwt({ token, account }) {
        if (account) {
          const userDetails = JSON.stringify({
            ...token,
            provider: account.provider,
            isEmailVerified: true,
          });

          // const client = initializeApollo();

          try {
            const { data } = await client.mutate({
              mutation: GraphResolvers.mutations.ALT_LOGIN,
              variables: {
                credentials: userDetails,
              },
            });

            token.accessToken = data.altLogin.accessToken;
            token.isNewUser = data.altLogin.isNewUser;
          } catch (err) {
            throw err;
          }
        }

        return token;
      },
      async session({ session, token, user }) {
        session.accessToken = token.accessToken;
        session.isNewUser = token.isNewUser;
        return session;
      },
    },
  });
}
