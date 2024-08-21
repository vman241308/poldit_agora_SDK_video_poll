import { ReportItem, ResolverMap } from "../../../interfaces";
import Answer from "../../../models/answerModel";
import Poll from "../../../models/PollModel";
import Chat from "../../../models/chatModel";
import Moderation from "../../../models/moderationModel";
import { Model, Types } from "mongoose";
import { transformAnswer, transformChat, transformModeration } from "../shared";
import {
  getReportedAnswers,
  getReportedChatMssgs,
  getReportedPolls,
  updateAnswerRanking,
} from "../shared/internal/report";
import IModeration from "../../../models/interfaces/moderation";

export const internalFlagResolver: ResolverMap = {
  Content: {
    __resolveType: (obj) => {
      if (obj.answer) {
        return "Answer";
      } else if (obj.message) {
        return "ChatMessage";
      } else if (obj.question) {
        return "PollQuestion";
      }

      return null;
    },
  },
  Query: {
    reportedContent: async (_, __, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["admin", "moderator"]);

      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        const reportedItems = await Moderation.find();

        return reportedItems.map((item) =>
          transformModeration(
            item,
            dataLoaders([
              "reporter",
              "violator",
              "internalUser",
              "chat",
              "poll",
              "answer",
            ])
          )
        );
      } catch (err) {
        throw err;
      }
    },

    reportedContentByAnswer: async (_, __, ctx) => {},
    reportedContentByChat: async (_, __, ctx) => {},
    reportedContentByPoll: async (_, __, ctx) => {},
  },

  Mutation: {
    disableContent: async (
      parent,
      { reportId, contentType, contentId, isDisabled, historyId },
      ctx
    ) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["admin", "moderator"]);
      if (!user) {
        throw new Error("Please log in to add answers!");
      }

      let content: any;

      try {
        if (contentType === "Answer") {
          content = Answer;
        } else if (contentType === "Chat") {
          content = Chat;
        } else content = Poll;

        const updatedContent = await content.findByIdAndUpdate(
          contentId,
          {
            $set: { isDisabled: true },
          },
          { new: true }
        );

        contentType === "Answer" && updateAnswerRanking(updatedContent);

        await Moderation.updateMany(
          { flagId: Types.ObjectId(contentId) },
          {
            $set: {
              "history.$[elem].status": "Disabled",
              "history.$[elem].dateModerated": Date.now(),
              "history.$[elem].moderator": user.userId,
            },
          },
          { arrayFilters: [{ "elem.status": { $ne: "Disabled" } }] }
        );

        // if (contentType === "Answer") {
        //   const answers = await Answer.find({ poll: updatedId.poll });

        // }

        return `${contentType} disabled!`;
      } catch (err) {
        throw err;
      }
    },
    keepContent: async (
      _,
      { reportId, contentType, contentId, historyId },
      ctx
    ) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["admin", "moderator"]);
      if (!user) {
        throw new Error("Please log in to add answers!");
      }

      let content: any;

      try {
        if (contentType === "Answer") {
          content = Answer;
        } else if (contentType === "Chat") {
          content = Chat;
        } else content = Poll;

        const updatedContent = await content.findByIdAndUpdate(
          contentId,
          {
            $set: { isDisabled: false },
          },
          { new: true }
        );

        contentType === "Answer" && updateAnswerRanking(updatedContent);

        await Moderation.updateMany(
          { flagId: Types.ObjectId(contentId) },
          {
            $set: {
              "history.$[elem].status": "Approved",
              "history.$[elem].dateModerated": Date.now(),
              "history.$[elem].moderator": user.userId,
            },
          },
          { arrayFilters: [{ "elem.status": { $ne: "Approved" } }] }
        );

        return `${contentType} no longer being reported.  Moderator reviewed and approved content.`;
      } catch (err) {
        throw err;
      }
    },
  },
};
