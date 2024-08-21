import { ResolverMap } from "../../interfaces";
import Moderation from "../../models/moderationModel";
import { transformModeration, transformPoll } from "./shared";
import loaders from "../loaders/dataLoaders";
import { withFilter } from "graphql-subscriptions";
import IModeration from "../../models/interfaces/moderation";
// import { publishContent } from "./shared/pubSubActions";
import { pubsub } from "../..";
//

// const { batchPolls } = loaders;

export const moderationResolvers: ResolverMap = {
  Query: {
    moderations: async (_, __, { dataLoaders, isAuth }, ctx) => {
      try {
        const allModerations = await Moderation.find().exec();

        const transformedModerations = allModerations.map((moderation) =>
          transformModeration(moderation, dataLoaders(["violator", "reporter"]))
        );

        return transformedModerations;
      } catch (err) {
        throw err;
      }
    },
    moderationsByFlagType: async (
      _,
      { flagType },
      { dataLoaders, isAuth },
      ctx
    ) => {
      try {
        const allModerations = await Moderation.find({
          flagType: { $eq: flagType },
        }).exec();

        const transformedModerations = allModerations.map((moderation) =>
          transformModeration(moderation, dataLoaders(["violator", "reporter"]))
        );

        return transformedModerations;
      } catch (err) {
        throw err;
      }
    },
  },

  Mutation: {
    createModeration: async (_, { details }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["admin", "employee", "externalUser"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      const detailObj = JSON.parse(details);
      const { flagType, flagId, violatorId } = detailObj;

      const newModeration = new Moderation({
        flagType,
        flagId,
        violator: violatorId,
        reporter: user.userId,
      });

      try {
        const savedModeration = await newModeration.save();

        const transformedModeration = transformModeration(
          savedModeration as IModeration,
          dataLoaders(["violator", "reporter"])
        );

        transformedModeration.violator = await transformedModeration.violator();
        transformedModeration.reporter = await transformedModeration.reporter();

        // publishContent(transformModeration, pubsub, "newModeration")
        // ctx.pubsub.publish("newModeration", transformedModeration);
        pubsub.publish("newModeration", transformedModeration);

        return transformedModeration;
      } catch (err) {
        throw err;
      }
    },
    deleteAllModerations: async (_, args, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["admin", "employee", "externalUser"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        const deletedModerations = await Moderation.deleteMany();

        return `Deleted ${deletedModerations.deletedCount ?? 0} Moderations !`;
      } catch (err) {
        throw err;
      }
    },
  },
  Subscription: {
    newModeration: {
      subscribe: withFilter(
        () => pubsub.asyncIterator("newModeration"),
        (payload, variables) => {
          payload.newModeration = payload
          return true;
        }
      ),
      // subscribe: withFilter(
      //   (parent, args, { pubsub }, info) => {
      //     return pubsub.asyncIterator(["newModeration"]);
      //   },
      //   (payload, args) => {
      //     const data = JSON.parse(payload?.data.toString());

      //     payload.newModeration = data;

      //     return true;
      //   }
      // ),
    },
  },
};

// export const updatePollChatMessages = async (ids: string[]) => {
//   Promise.all(
//     ids.map(async (id: string) => {
//       // console.log(id);
//       // await Chat.findByIdAndDelete(id);
//       await Chat.updateOne(
//         { _id: id },
//         {
//           $set: {
//             isDisabled: false,
//           },
//         }
//       );
//     })
//   );
// };

// export const updatePollAnswers = async (ids: string[]) => {
//   Promise.all(
//     ids.map(async (id: string) => {
//       // console.log(id);
//       // await Answer.findByIdAndDelete(id);
//       await Answer.updateOne(
//         { _id: id },
//         {
//           $set: {
//             isDisabled: false,
//           },
//         }
//       );
//     })
//   );
// };
