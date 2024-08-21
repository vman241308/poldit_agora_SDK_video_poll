import { NotificationFeed, ReportItem, ResolverMap } from "../../interfaces";
import Answer from "../../models/answerModel";
import IPoll from "../../models/interfaces/poll";
import Chat from "../../models/chatModel";
import Poll from "../../models/PollModel";
import Notification from "../../models/notificationModel";
import {
  transformAnswer,
  transformDocument,
  transformNotification,
} from "./shared";
import batchLoaders from "../loaders/dataLoaders";
import IAnswer from "../../models/interfaces/answer";
import { getNumRanking, getNumRanking_multi } from "./shared/metrics";
import { dateToString, getSortedListByDate } from "../../globalFunctions";
import { moderateText } from "./shared/moderation";
import {
  getUserFirstChatMssgs,
  getUserAnswerNotifications,
  getUserAnswerFeedBackNotifications,
  // pushNotifications_createPoll,
  // getAllNotifications,
  answerPoll_notification,
} from "./shared/notification";
import { PubSub, withFilter } from "graphql-subscriptions";
import {
  getPlainTxtByContentType,
  isDuplicateAnswer,
  maxUserAnswerReached,
  parseRichContentForText,
  parseSlateRichContentForText,
  pollData_withLastActivity,
  storeAiAnswer,
} from "./shared/poll";
import moment from "moment";
import INotification from "../../models/interfaces/notification";
import User from "../../models/UserModel";
import { getUserFollowers, getUserFollowing } from "./shared/user";
import { Types } from "mongoose";
import Moderation from "../../models/moderationModel";
import IModeration from "../../models/interfaces/moderation";
// import { publishContent } from "./shared/pubSubActions";
import { pubsub } from "../..";
import { getAnswersByFilter, getFullAnswerDetails } from "./shared/answer";
import configs from "../../endpoints.config";
import { formatAiTxt, generateAIAnswer } from "../utils/useAI";

// const { batchAnswers } = batchLoaders;

// const pubsub = new PubSub();

export const feedBackResolvers: ResolverMap = {
  Query: {
    answersByPoll: async (parent, { pollId, numAnswers }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;
      const user = await isAuth(["admin", "externalUser", "employee"]);

      try {
        const answers: IAnswer[] = await Answer.find({
          $and: [{ poll: pollId }, { isDisabled: false }],
        });

        const answerData = answers.map((answer) => {
          if (
            user.userId === answer.creator.toString() &&
            answer.likes.length + answer.dislikes.length === 0
          ) {
            answer._doc.isEditable = true;
            answer._doc.isRemoveable = true;
          } else {
            answer._doc.isEditable = false;
            answer._doc.isRemoveable = false;
          }

          if (answer.multichoice && answer.multichoice.length > 0) {
            const multiChoiceVotesWithRank = getNumRanking_multi(answer._doc);

            answer._doc.multichoice = multiChoiceVotesWithRank;
          }

          return transformAnswer(answer, dataLoaders(["user", "poll"]));
        });

        if (numAnswers) {
          return answerData.slice(0, numAnswers);
        }
        // if(user.userId === )

        return answerData;
        // return getNumRanking(answerData);
      } catch (err) {
        throw err;
      }
    },
    topAnswersByPoll: async (parent, { pollId, numAnswers }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      try {
        const answers: IAnswer[] = await Answer.aggregate([
          {
            $match: {
              $and: [{ poll: Types.ObjectId(pollId) }, { isDisabled: false }],
            },
          },
          {
            $addFields: {
              rankScore: {
                $switch: {
                  branches: [
                    {
                      case: {
                        $and: [
                          {
                            $ne: [
                              "$creator",
                              Types.ObjectId("63a1e2342e34a062fc2e42cf"), //PolditBot
                            ],
                          },
                          { $eq: ["$rank", "Not Ranked"] },
                        ],
                      },
                      then: 9999,
                    },
                    {
                      case: {
                        $and: [
                          {
                            $eq: [
                              "$creator",
                              Types.ObjectId("63a1e2342e34a062fc2e42cf"), //PolditBot
                            ],
                          },
                          { $eq: ["$rank", "Not Ranked"] },
                        ],
                      },
                      then: 0.5,
                    },
                  ],
                  default: { $toDouble: "$rank" },
                },
              },
            },
          },
          { $sort: { rankScore: 1 } },
        ]).limit(numAnswers);

        return answers.map((answer) => {
          if (answer.multichoice && answer.multichoice.length > 0) {
            const multiChoiceVotesWithRank = getNumRanking_multi(answer);

            answer.multichoice = multiChoiceVotesWithRank;
          }

          return transformDocument(answer, dataLoaders(["user", "poll"]));
        });
      } catch (err) {
        throw err;
      }
    },
    answersForChildPoll: async (
      _,
      { offset, limit, pollId, sortBy },
      { dataLoaders, isAuth }
    ) => {
      const user = await isAuth(["admin", "externalUser", "employee"]);

      try {
        const answers = await getAnswersByFilter(pollId, sortBy);

        return answers.map((answer) => {
          if (
            user.userId === answer.creator.toString() &&
            answer.likes.length + answer.dislikes.length === 0
          ) {
            answer.isEditable = true;
            answer.isRemoveable = true;
          } else {
            answer.isEditable = false;
            answer.isRemoveable = false;
          }

          if (answer.multichoice && answer.multichoice.length > 0) {
            const multiChoiceVotesWithRank = getNumRanking_multi(answer);

            answer.multichoice = multiChoiceVotesWithRank;
          }

          return transformDocument(answer, dataLoaders(["user", "poll"]));
        });
      } catch (err) {
        throw err;
      }
    },

    answersForPollBySortCriteria: async (parent, { pollId, filter }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;
      const user = await isAuth(["admin", "externalUser", "employee"]);

      try {
        const answers = await getAnswersByFilter(pollId, filter);
        return answers.map((x) =>
          transformDocument(x, dataLoaders(["user", "poll"]))
        );
      } catch (err) {
        throw err;
      }
    },

    notifications: async (parent, args, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["everyone"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        const notifications = await Notification.find({
          contentOwner: user.userId,
        });

        const sortedNotifications = notifications.sort(
          (a, b) => b.creationDate - a.creationDate
        );

        return await Promise.all(
          sortedNotifications.map((item) =>
            transformNotification(item, dataLoaders(["user"]))
          )
        );
      } catch (err) {
        throw err;
      }
    },
    unreadNotificationCount: async (parent, args, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["externalUser"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        return await Notification.find({
          $and: [{ contentOwner: user.userId }, { read: false }],
        }).countDocuments();
      } catch (err) {
        throw err;
      }
    },
    notificationsWithPagination: async (parent, { cursor, limit }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["externalUser"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      const noCursorOffset = !cursor ? 1 : 0;
      if (limit <= 0) {
        throw new Error("Cannot fetch records for negative or 0 limit");
      }

      try {
        const appUser = await User.findById(user.userId, {
          _id: 0,
          notifications: 1,
        });

        if (appUser.notifications.length === 0) {
          return {
            cursor: "",
            userId: user.userId,
            notifications: [],
            hasMoreData: false,
          };
        }

        if (!cursor) {
          cursor =
            appUser.notifications[
              appUser.notifications.length - 1
            ]._id.toString();
        }

        const newNotificationIdx = appUser.notifications.findIndex(
          (msg) => msg._id.toString() === cursor
        );

        const offset = newNotificationIdx - limit + noCursorOffset;

        let notifications: INotification[] = [];
        let hasMoreData: boolean = false;
        let newCursor: string = "";

        if (offset > 0) {
          notifications = appUser.notifications.slice(
            offset,
            newNotificationIdx + noCursorOffset
          );
          hasMoreData = true;
          newCursor = appUser.notifications[offset]._id.toString();
        } else {
          notifications = appUser.notifications.slice(
            0,
            newNotificationIdx + noCursorOffset
          );
        }

        const notifDetails = await Promise.all(
          notifications.map((item) =>
            transformDocument(
              item._doc,
              dataLoaders(["user", "parentCollectionId"])
            )
          )
        );

        const totalUnreadNotifications = appUser.notifications.filter(
          (item) => !item.read
        );

        return {
          cursor: newCursor,
          userId: user.userId,
          notifications: notifDetails,
          hasMoreData,
          totalUnreadNotifications: totalUnreadNotifications
            ? totalUnreadNotifications.length
            : 0,
        };
      } catch (err) {
        throw err;
      }
    },

    lastActivity: async (parent, { pollId }, ctx) => {
      interface activityDates {
        activityType: string;
        creationDate: Date;
      }

      try {
        const poll = await pollData_withLastActivity(
          0,
          1,
          "specific poll",
          [],
          "",
          "",
          pollId
        );

        if (poll[0].lastActivity) {
          return dateToString(poll[0].lastActivity);
        }
      } catch (err) {
        throw err;
      }
    },
  },
  Mutation: {
    createAnswer: async (parent, { details }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["externalUser"]);
      if (!user) {
        throw new Error("Please log in to add answers!");
      }

      const detailObj = JSON.parse(details);
      const answerTxt: string = parseSlateRichContentForText(detailObj.answer);

      const moderationResults = await moderateText(answerTxt);

      if (moderationResults && moderationResults.blockContent) {
        throw new Error(
          "Content contains inappropriate language.  Please update and resubmit."
        );
      }

      const { answer, ...rest } = detailObj;

      const pollAnswer = new Answer({
        answer,
        creator: user.userId,
        ...rest,
      });

      try {
        const pollItem: IPoll = await Poll.findById(detailObj.poll);

        if (!pollItem) {
          throw new Error("Poll Not found");
        }

        const { duplicate, similarItems } = await isDuplicateAnswer(detailObj);

        if (duplicate) {
          throw new Error(
            "This answer already exists.  Please provide feedback on the existing answer or create a new answer."
          );
        }

        const { answersLeft, maxReached } = await maxUserAnswerReached(
          user.userId,
          detailObj.poll,
          5
        );

        if (maxReached) {
          throw new Error(
            "The maximum number of answers for this poll has been reached!  If you want to add more answers, please delete existing answers that have not gotten any feedback."
          );
        }

        const savedAnswer = await pollAnswer.save();

        pollItem.answers.push(pollAnswer._id);
        await pollItem.save();

        // pubsub.publish("newChildAnswer", {
        //   _id: savedAnswer._id,
        //   answer: savedAnswer.answer,
        //   creationDate: savedAnswer.creationDate,
        // });
        //Push to Notification

        if (pollItem.creator.toString() !== user.userId && !detailObj.isVideo) {
          const pollContent = getPlainTxtByContentType(pollItem.question);

          await answerPoll_notification(
            user.userId,
            pollItem.creator,
            pollContent,
            savedAnswer._id,
            detailObj.poll,
            pubsub,
            "add answer"
          );
        }

        pubsub.publish("newAnswer", {
          _id: savedAnswer._id,
          answer: savedAnswer.answer,
          creationDate: savedAnswer.creationDate,
        });

        if (pollItem.parentPollId) {
          pubsub.publish("newQuestion", {
            _id: pollItem._id,
            parentId: pollItem.parentPollId,
            creator: pollItem.creator,
          });
        }

        return "Answer Created";
      } catch (err) {
        throw err;
      }
    },
    publishAiAnswer: async (parent, { details }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["externalUser"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        const detailObj = JSON.parse(details);

        const ai_answer = await storeAiAnswer(
          detailObj.answer,
          detailObj.pollId
        );

        pubsub.publish("newAnswer", {
          _id: ai_answer._id,
          // answer: ai_answer.answer,
          creationDate: ai_answer.creationDate,
        });
      } catch (err) {
        throw err;
      }
    },

    updateAnswer: async (parent, { details }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["externalUser"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      const detailObj = JSON.parse(details);
      const answerTxt: string = parseSlateRichContentForText(detailObj.answer);

      const moderationResults = await moderateText(answerTxt);

      // const updatedAnswerVal = JSON.stringify(detailObj.answer);

      if (moderationResults && moderationResults.blockContent) {
        throw new Error(
          "Content contains inappropriate language.  Please update and resubmit."
        );
      }

      try {
        const { duplicate, similarItems } = await isDuplicateAnswer(detailObj);

        if (duplicate) {
          throw new Error(
            "This answer already exists.  Please comment on the existing answer or create a new one."
          );
        }

        const updatedAnswer = await Answer.findByIdAndUpdate(
          detailObj._id,
          { answer: detailObj.answer, answerImage: detailObj.answerImage },
          { new: true, upsert: true }
        );

        pubsub.publish("newAnswer", {
          _id: updatedAnswer._id,
          answer: updatedAnswer.answer,
          creationDate: updatedAnswer.creationDate,
        });

        return transformAnswer(
          updatedAnswer,
          ctx.dataLoaders(["user", "poll"])
        );

        // return "Answer updated";
      } catch (err) {
        throw err;
      }
    },
    deleteAnswer: async (_, { answerId }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["externalUser", "admin"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        const answerToRemove = await Answer.findById(answerId);
        const answerCreator = await User.findById(answerToRemove.creator);

        await Answer.findByIdAndDelete(answerId);
        await Poll.findByIdAndUpdate(answerToRemove.poll, {
          $pull: { answers: Types.ObjectId(answerId) },
        });

        answerCreator &&
          pubsub.publish("newAnswer", {
            _id: answerToRemove._id,
            answer: answerToRemove.answer,
            isRemoved: true,
            poll: { _id: answerToRemove.poll },
            creator: { _id: answerCreator._id, appid: answerCreator.appid },
          });

        await Moderation.deleteMany({ flagId: Types.ObjectId(answerId) });

        return "Answer deleted";
      } catch (err) {
        return err;
      }
    },
    toggleDisableAnswer: async (_, { ansId }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["externalUser", "employee"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        const retrivedAns = await Answer.findById(ansId);
        if (retrivedAns) {
          await Answer.findByIdAndUpdate(ansId, {
            isDisabled: !retrivedAns.isDisabled,
          });
          return `Changed Answer to ${!retrivedAns.isDisabled}`;
        }

        return "Answer not found";
      } catch (err) {
        return err;
      }
    },
    reportContent: async (
      parent,
      { contentId, contentType, category, creator },
      ctx
    ) => {
      const { isAuth, req, res, dataLoaders } = ctx;
      const user = await isAuth(["externalUser", "employee", "admin"]);

      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        const reportedItemExists = await Moderation.findOne({
          $and: [
            { flagType: contentType },
            { flagId: Types.ObjectId(contentId) },
            { violator: Types.ObjectId(creator) },
            { violationCategory: category },
          ],
        });

        if (reportedItemExists) {
          const alreadyReported = reportedItemExists.history.some(
            (item) => item.reporter.toString() === user.userId
          );

          if (alreadyReported) {
            return `You already reported this ${contentType}.`;
          }

          await Moderation.findByIdAndUpdate(reportedItemExists._id, {
            $push: {
              history: { reporter: user.userId, status: "Pending Review" },
            },
          });

          return `This ${contentType} has been reported.`;
        }

        const newReportedItem: IModeration = new Moderation({
          flagType: contentType,
          flagId: contentId,
          violator: creator,
          violationCategory: category,
          history: [{ reporter: user.userId, status: "Pending Review" }],
        });

        await newReportedItem.save();

        return `This ${contentType} has been reported.`;
      } catch (err) {
        throw err;
      }
    },
    updateNotification: async (parent, { details }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["externalUser", "employee", "admin"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        if (details) {
          // const detailObj = JSON.parse(details);

          await User.updateOne(
            {
              $and: [
                { _id: Types.ObjectId(user.userId) },
                { "notifications._id": Types.ObjectId(details) },
                // {
                //   "notifications.creationDate": {
                //     $gte: new Date(detailObj.creationDate),
                //   },
                // },
                // {
                //   "notifications.collectionId": Types.ObjectId(
                //     detailObj.collectionId
                //   ),
                // },
                // {
                //   "notifications.creator": Types.ObjectId(
                //     detailObj.creator._id
                //   ),
                // },
              ],
            },
            {
              "notifications.$.read": true,
            }
          );

          return "Notification marked as read";
        }

        await User.updateOne(
          { _id: user.userId },
          { $set: { "notifications.$[].read": true } }
        );

        return "All notifications marked as read";
      } catch (err) {
        return;
      }

      // try {
      //   if (details) {
      //     await User.updateOne(
      //       {
      //         _id: user.userId,
      //         "notifications._id": Types.ObjectId(details),
      //       },
      //       {
      //         "notifications.$.read": true,
      //       }
      //     );

      //     // const detailObj = JSON.parse(details);
      //     // if (!detailObj) {
      //     //   await User.updateOne(
      //     //     {
      //     //       _id: user.userId,
      //     //       "notifications._id": Types.ObjectId(details),
      //     //     },
      //     //     {
      //     //       "notifications.$.read": true,
      //     //     }
      //     //   );
      //     // } else {
      //     //   await User.updateOne(
      //     //     {
      //     //       _id: user.userId,
      //     //       "notifications.creationDate": detailObj.creationDate,
      //     //       "notifications.collectionId": detailObj.collectionId,
      //     //       "notifications.creator": Types.ObjectId(detailObj.creator._id),
      //     //     },
      //     //     {
      //     //       "notifications.$.read": true,
      //     //     }
      //     //   );
      //     // }

      //     return "Notification marked as read";
      //   }

      //   await User.updateOne(
      //     { _id: user.userId },
      //     { $set: { "notifications.$[].read": true } }
      //   );

      //   return "All notifications marked as read";
      // } catch (err) {
      //   throw err;
      // }
    },

    handleMultiChoice: async (parent, { details }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["externalUser"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      const choiceObj = JSON.parse(details);

      let updatedAnswer: any = null;

      try {
        const myVote = await Answer.findOne({
          _id: choiceObj.answerId,
          "multichoiceVotes.userId": choiceObj.userId,
        });

        if (!myVote) {
          updatedAnswer = await Answer.findOneAndUpdate(
            {
              _id: choiceObj.answerId,
            },
            {
              $push: {
                multichoiceVotes: {
                  userId: choiceObj.userId,
                  vote: choiceObj.id,
                  voteDate: Date.now(),
                },
              },
            },
            { new: true }
          );
        } else {
          updatedAnswer = await Answer.findOneAndUpdate(
            {
              _id: choiceObj.answerId,
              "multichoiceVotes.userId": choiceObj.userId,
            },
            {
              $set: {
                "multichoiceVotes.$.vote": choiceObj.id,
                "multichoiceVotes.$.voteDate": Date.now(),
              },
            },
            { new: true }
          );
        }

        updatedAnswer._doc.multichoice = getNumRanking_multi(
          updatedAnswer._doc
        );

        const updatedAnswerWithDetails = await transformAnswer(
          updatedAnswer,
          dataLoaders(["user", "poll"])
        );
        pubsub.publish("newAnswer", {
          _id: updatedAnswer._id,
          answer: updatedAnswer.answer,
          creationDate: updatedAnswer.creationDate,
          multichoice: updatedAnswer._doc.multichoice,
        });
        // publishContent(updatedAnswerWithDetails, pubsub, "newAnswer");
        // pubsub.publish("newAnswer", updatedAnswerWithDetails);

        if (
          updatedAnswerWithDetails.poll.creator.toString() !== user.userId &&
          !choiceObj.isVideo
        ) {
          const pollContent = getPlainTxtByContentType(
            updatedAnswerWithDetails.poll.question
          );

          await answerPoll_notification(
            user.userId,
            updatedAnswerWithDetails.poll.creator,
            pollContent,
            updatedAnswerWithDetails._id,
            updatedAnswerWithDetails.poll._id,
            pubsub,
            "select answer"
          );
        }

        return "Answer updated";
      } catch (err) {
        throw err;
      }
    },

    handleLikeDislike: async (
      parent,
      { feedback, feedbackVal, answerId, pollId, isVideo },
      ctx
    ) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["externalUser"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      let answerWithFeedback: any = null;

      try {
        if (feedback === "like" && user.userId) {
          const existingLike = await Answer.find({
            _id: answerId,
            "likes.userId": user.userId,
          });

          if (existingLike.length > 0) {
            answerWithFeedback = await Answer.findOneAndUpdate(
              {
                _id: answerId,
              },
              {
                $pull: {
                  likes: {
                    userId: user.userId,
                    like: true,
                  },
                } as any,
              }
            );
          }

          if (existingLike.length === 0) {
            answerWithFeedback = await Answer.findOneAndUpdate(
              {
                _id: answerId,
              },
              {
                $push: {
                  likes: {
                    userId: user.userId,
                    like: true,
                    likedDate: Date.now(),
                  },
                } as any,
                $pull: {
                  dislikes: { userId: user.userId, dislike: true },
                } as any,
              }
            );
          }
        }

        if (feedback === "dislike") {
          const existingDisLike = await Answer.find({
            _id: answerId,
            "dislikes.userId": user.userId,
          });

          if (existingDisLike.length > 0) {
            answerWithFeedback = await Answer.findOneAndUpdate(
              {
                _id: answerId,
              },
              {
                $pull: {
                  dislikes: { userId: user.userId, dislike: true },
                } as any,
              }
            );
          }

          if (existingDisLike.length === 0) {
            answerWithFeedback = await Answer.findOneAndUpdate(
              {
                _id: answerId,
              },
              {
                $push: {
                  dislikes: {
                    userId: user.userId,
                    dislike: true,
                    disLikedDate: Date.now(),
                  },
                } as any,
                $pull: { likes: { userId: user.userId, like: true } } as any,
              }
            );
          }
        }

        const updatedAnswers: IAnswer[] = await Answer.find({
          $and: [{ poll: pollId }, { isDisabled: false }],
        });

        const rankedAnswers = getNumRanking(updatedAnswers);

        rankedAnswers.forEach(async (item) => {
          await Answer.updateOne(
            { _id: item._doc._id },
            {
              $set: { rank: String(item._doc.rank) },
            }
          );

          pubsub.publish("newAnswer", {
            _id: item._doc._id,
            answer: item._doc.answer,
            creationDate: item._doc.creationDate,
          });
        });

        const updatedAnswerWithDetails = await transformAnswer(
          answerWithFeedback,
          dataLoaders(["user", "poll"])
        );

        if (
          updatedAnswerWithDetails.creator._id.toString() !== user.userId &&
          !isVideo
        ) {
          const pollContent = getPlainTxtByContentType(
            updatedAnswerWithDetails.poll.question
          );
          await answerPoll_notification(
            user.userId,
            updatedAnswerWithDetails.creator._id,
            pollContent,
            updatedAnswerWithDetails._id,
            updatedAnswerWithDetails.poll._id,
            pubsub,
            `${feedback}d your poll answer`
          );
        }
      } catch (err) {
        throw err;
      }
    },
  },

  Subscription: {
    newAnswer: {
      subscribe: withFilter(
        () => pubsub.asyncIterator("newAnswer"),
        async (payload, variables) => {
          if (payload.isRemoved) {
            payload.newAnswer = payload;
            return true;
          }
          payload.newAnswer = getFullAnswerDetails(payload);
          return true;
        }
      ),
    },
    newChildAnswer: {
      subscribe: withFilter(
        () => pubsub.asyncIterator("newChildAnswer"),
        async (payload, variables) => {
          if (payload.isRemoved) {
            payload.newChildAnswer = payload;
            return true;
          }
          payload.newChildAnswer = getFullAnswerDetails(payload);
          return true;
        }
      ),
    },
    newNotification: {
      subscribe: withFilter(
        () => pubsub.asyncIterator("newNotification"),
        (payload, variables) => {
          payload.newNotification = payload;
          return true;
        }
      ),
    },
  },
};
