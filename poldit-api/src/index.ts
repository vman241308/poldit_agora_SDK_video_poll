const mongoose = require("mongoose");
const express = require("express");
import { createServer } from "http";
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageDisabled,
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageLocalDefault,
} from "apollo-server-core";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import cors from "cors";
import typeDefs from "./graphql/typeDefs";
import resolvers from "./graphql/resolvers";
import { ApolloServer } from "apollo-server-express";
// import { GooglePubSub } from "@axelspringer/graphql-google-pubsub";
import pubSubOptions from "./gsCloudOptions";
import configs from "./endpoints.config";
import { checkAuth } from "./graphql/resolvers/shared";
import dataLoaders from "./graphql/loaders";
import { db_url } from "./graphql/utils/urls";
import AblyPubSub from "./lib/pubsub";
import { sendErrorEmail } from "./graphql/utils/autoEmails";
import { agoraNotificationServer } from "./agoraNotificationServer";
import bodyParser from "body-parser";
import { Request, Response } from "express-serve-static-core";

const PORT = configs.appPort;

interface MyContext {
  req: any;
  res: Response;
  connection: any;
}

export const pubsub = new AblyPubSub({
  key: configs.isDev ? configs.ablyKeyDev : configs.ablyKey,
  clientId: configs.ablyClientId,
});

const corsOptions = {
  credentials: true,
  allowedHeaders: [
    "Access-Control-Allow-Headers",
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "token",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
    "Access-Control-Allow-Credentials",
  ],
  origin: configs.isDev
    ? ["http://localhost:3005", "http://192.168.1.151:3005"]
    : [
        "https://poldit.com",
        "https://api1.poldit.com",
        "https://www.poldit.com",
      ],
};

const getDynamicContext = async ({ req, res }, msg: any, args: any) => {
  // const msgHeader = connection ? connection.context : req;
  return {
    req,
    res,
    isAuth: async (roleList: any) => {
      const tokken =
        req?.headers?.authorization ?? req?.cookies?.internalUserPolditSession;

      return await checkAuth(roleList, tokken);
    },
    dataLoaders,
  };
};

(async function () {
  const app = express();
  app.use(bodyParser.json());
  // app.use(
  //   cors({
  //     origin: configs.isDev ? "http://localhost:3005" : "https://poldit.com",
  //   })
  // );
  const httpServer = createServer(app);

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  const serverCleanup = useServer({ schema }, wsServer);

  const server = new ApolloServer({
    schema,
    csrfPrevention: true,
    cache: "bounded",
    formatError: (err) => {
      sendErrorEmail(err);
      return err;
    },
    context: (ctx, msg, args) => {
      return getDynamicContext(ctx, msg, args);
    },
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
      configs.isDev
        ? ApolloServerPluginLandingPageGraphQLPlayground()
        : ApolloServerPluginLandingPageDisabled(),
    ],
  });

  await server.start();

  server.applyMiddleware({ app, cors: corsOptions });

  app.post("/ncsNotify", agoraNotificationServer);

  try {
    await mongoose.connect(db_url(), configs.MONGO_OPTIONS);
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    process.exit(1);
  }

  httpServer.listen(PORT, () => {
    console.log(
      `🚀 Server ready at ${configs.apiURL}:${PORT}${server.graphqlPath}`
    );
    console.log(
      `🚀 Subscription endpoint ready at ${configs.wsUrl}:${PORT}${server.graphqlPath}`
    );
  });
})();
