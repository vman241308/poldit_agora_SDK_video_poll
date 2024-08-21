import { ResolverMap } from "../../interfaces";
import Chat from "../../models/chatModel";
import Moderation from "../../models/moderationModel";
import IChat from "../../models/interfaces/chat";
import IPoll from "../../models/interfaces/poll";
import IUser from "../../models/interfaces/user";
import Poll from "../../models/PollModel";
import Answer from "../../models/answerModel";
import User from "../../models/UserModel";
import { transformDocument, transformPoll } from "./shared";
import loaders from "../loaders/dataLoaders";
import IAnswer from "../../models/interfaces/answer";
import { Types } from "mongoose";
import { moderateText } from "./shared/moderation";
import {
  generateAnswersByPollType,
  getActivityCategory,
  getFullQuestionDetails,
  getMetricsForPoll,
  getPollQuestion,
  isDuplicateQuestion,
  paginateChildPolls,
  parseRichContentForText,
  parseSlateRichContentForText,
  pollData_forParent,
  pollData_withLastActivity,
  storeAiAnswer,
} from "./shared/poll";
import { createPoll_notification } from "./shared/notification";
import {
  getSubTopicSubscribers,
  getUserFollowers,
  isActive,
} from "./shared/user";
import { dateToString } from "../../globalFunctions";
import jwt from "jsonwebtoken";
import { pubsub } from "../..";
import { withFilter } from "graphql-subscriptions";
import Ably from "ably";
import configs from "../../endpoints.config";
import { generateAIAnswer, generateAiTags } from "../utils/useAI";
import TopicModel from "../../models/TopicModel";
//

const { batchPolls } = loaders;

// Get All Of My Favorite Polls Query will be created here
//------------------------------------------------------
//------------------------------------------------------

// Activity  Query will be created here
//------------------------------------------------------
//------------------------------------------------------

export const pollResolvers: ResolverMap = {
  Query: {
    polls: async (_, __, { dataLoaders, isAuth }, ctx) => {
      try {
        const polls = await Poll.find();
        const pollsData = polls.map((poll) =>
          transformPoll(
            poll,
            dataLoaders(["user", "topic", "subTopic", "answer", "chat"])
          )
        );

        return pollsData;
      } catch (err) {
        throw err;
      }
    },
    poll: async (_, { pollId }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;
      const user = await isAuth(["admin", "externalUser", "employee"]);

      try {
        let pollFound: IPoll = await Poll.findById(pollId);

        let fullPoll = transformPoll(
          pollFound,
          dataLoaders(["user", "topic", "topics", "subTopic", "answer", "chat"])
        );

        fullPoll["isMyPoll"] = false;

        fullPoll["isActive"] = await isActive(pollFound.creator.toString());

        if (user.userId === pollFound.creator.toString())
          fullPoll["isMyPoll"] = true;

        if (
          user.userId === pollFound.creator.toString() &&
          pollFound.answers.length === 0
        ) {
          fullPoll["isEditable"] = true;
        } else fullPoll["isEditable"] = false;

        return fullPoll;
      } catch (err) {
        throw err;
      }
    },

    videoPollStatus: async (_, { pollId }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;
      const user = await isAuth(["externalUser", "admin"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }
      try {
        const pollData: IPoll = await Poll.findById(pollId, {
          _id: 0,
          auditHistory: 1,
        });

        if (pollData) {
          const actions = pollData.auditHistory.map((x) => x.action);
          let pollStatus = "";
          if (actions.length > 0 && actions.includes("Poll Ended")) {
            return "Poll Ended";
          }
          if (actions.length > 0 && actions.includes("Poll Started")) {
            return "Poll Started";
          }
        }
      } catch (err) {
        throw err;
      }
    },

    showViews: async (_, { pollId }, ctx) => {
      try {
        const poll: IPoll = await Poll.findById(pollId);
        return poll.views;
      } catch (err) {
        throw err;
      }
    },

    pollsByUser: async (_, { userId, offset, limit }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;
      const user = await isAuth(["externalUser", "admin"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }
      // console.log("user id is ->", userId);

      const trueUserId = userId ? userId : user.userId;

      try {
        const totalPolls = await Poll.find({
          creator: trueUserId,
        }).countDocuments();

        const polls = await pollData_withLastActivity(
          offset,
          limit,
          "user polls",
          [],
          trueUserId
        );

        return getMetricsForPoll(trueUserId, polls, totalPolls, dataLoaders);
      } catch (err) {
        throw err;
      }
    },

    pollsByTopic: async (_, { topic }, { dataLoaders }) => {
      try {
        let polls: IPoll[];

        if (topic !== "All_1") {
          polls = await Poll.find({ topic });
        } else {
          polls = await Poll.find();
        }

        return polls.map((poll) =>
          transformPoll(
            poll,
            dataLoaders(["user", "topic", "subTopic", "answer", "chat"])
          )
        );
      } catch (err) {
        throw err;
      }
    },

    pollsBySubTopic: async (_, { subTopic }, { dataLoaders }) => {
      try {
        let polls: IPoll[];

        if (subTopic !== "All_1") {
          polls = await Poll.find({
            subTopics: Types.ObjectId(subTopic),
          });
        } else {
          polls = await Poll.find();
        }

        return polls.map((poll) =>
          transformPoll(
            poll,
            dataLoaders(["user", "topic", "subTopic", "answer", "chat"])
          )
        );
      } catch (err) {
        throw err;
      }
    },

    pollsByTag: async (_, { tag, offset, limit }, { dataLoaders, isAuth }) => {
      const curUserData = await isAuth(["everyone"]);
      const { userId } = curUserData;

      try {
        let polls: IPoll[];
        let totalPolls: number;

        totalPolls = await Poll.find({
          $and: [
            { isDisabled: false },
            {
              parentPollId: { $exists: false },
            },
            // { pollType: { $ne: "videoPoll" } },
            {
              $or: [
                { topic: Types.ObjectId(tag) },
                { subTopics: Types.ObjectId(tag) },
              ],
            },
          ],
          // $or: [
          //   { topic: Types.ObjectId(tag) },
          //   { subTopics: Types.ObjectId(tag) },
          // ],
        }).countDocuments();



        polls = await pollData_withLastActivity(
          offset,
          limit,
          "polls by specific tag",
          [],
          "",
          tag
        );

        // if (tag && (tag as string).includes("All")) {
        //   totalPolls = await Poll.countDocuments();

        //   polls = await pollData_withLastActivity(
        //     offset,
        //     limit,
        //     "all polls by tag"
        //   );
        // } else {
        //   totalPolls = await Poll.find({
        //     $or: [
        //       { topic: Types.ObjectId(tag) },
        //       { subTopics: Types.ObjectId(tag) },
        //     ],
        //   }).countDocuments();
        //   polls = await pollData_withLastActivity(
        //     offset,
        //     limit,
        //     "polls by specific tag",
        //     [],
        //     "",
        //     tag
        //   );
        // }
        return getMetricsForPoll(userId, polls, totalPolls, dataLoaders);
      } catch (err) {
        throw err;
      }
    },
    trendingPolls: async (_, args, { dataLoaders, isAuth }) => {
      try {
        const answers: IAnswer[] = await Answer.find();
        const curUserData = await isAuth(["everyone"]);
        const { userId } = curUserData;

        const answersWithTrendCount: { pollId: string; trendCount: number }[] =
          [];

        for (let i = 0; i < answers.length; i++) {
          const answer = answers[i];
          const likesCount = answer.likes ? answer.likes.length : 0;
          const dislikeCount = answer.dislikes ? answer.dislikes.length : 0;

          const total = likesCount + dislikeCount;

          // console.log("Total number of likes and dislikes = " + total);

          const answerMatchIdx = answersWithTrendCount.findIndex(
            (item) => String(item.pollId) === String(answer.poll)
          );

          if (answerMatchIdx === -1) {
            answersWithTrendCount.push({
              pollId: answer.poll,
              trendCount: likesCount + dislikeCount,
            });
          } else {
            const { pollId, trendCount } =
              answersWithTrendCount[answerMatchIdx];
            answersWithTrendCount[answerMatchIdx] = {
              pollId,
              trendCount: trendCount + likesCount + dislikeCount,
            };
          }
        }

        const polls = await Poll.find();

        const pollsWithTrendCounts = polls.map((item, index) => {
          const matchIdx = answersWithTrendCount.findIndex((answer) =>
            String(answer.pollId === String(item._id))
          );

          const totalAnswerCount = item.answers ? item.answers.length : 0;

          const totalTrendCount =
            totalAnswerCount + answersWithTrendCount[matchIdx].trendCount;
          // console.log("Total trend === "+totalTrendCount , index);
          return { item, totalTrendCount };
        });

        const dataSorted = pollsWithTrendCounts.sort(
          (a, b) => b.totalTrendCount - a.totalTrendCount
        );

        const UpdatedData = [] as any;
        dataSorted.map((item) => {
          item["NewCount"] =
            item.item.answers.length +
            item.totalTrendCount +
            item.item.chatMssgs.length;
          UpdatedData.push(item);
        });

        const finalSortedArray = UpdatedData.sort(
          (a, b) => b.NewCount - a.NewCount
        );

        // console.log(dataSorted[0].item.answers.length + dataSorted[0].item.views + dataSorted[0].item.chatMssgs.length);

        const preFinal = dataSorted.map((item) => {
          return transformPoll(
            item.item,
            dataLoaders(["user", "topic", "subTopic", "answer", "chat"])
          );
        });

        const data = await Promise.all(
          preFinal.map(async (poll) => {
            const answers = await poll.answers();
            const chatMessages = await poll.chatMssgs();

            answers.sort((a, b) => b.creationDate - a.creationDate);
            chatMessages.sort((a, b) => b.creationDate - a.creationDate);

            const lastActivity =
              answers[0]?.creationDate > chatMessages[0]?.creationDate
                ? answers[0]?.creationDate
                : chatMessages[0]?.creationDate;

            const isMultipleChoice =
              poll?.pollType === "multiChoice" ? true : false;

            let isFavorite = false;

            if (userId) {
              const user = await User.findById(userId);
              isFavorite = user?.favorites?.some((fav) => {
                return (
                  fav.favoriteType === "Poll" &&
                  fav?.favoriteId?.toString() === poll?._id?.toString()
                );
              });
            }

            return { ...poll, lastActivity, isMultipleChoice, isFavorite };
          })
        );

        return data;
      } catch (err) {
        throw err;
      }
    },

    pollsWithPagination: async (
      _,
      { offset, limit, topic, activityType },
      { dataLoaders, isAuth }
    ) => {
      const curUserData = await isAuth(["everyone"]);
      const { userId } = curUserData;

      const activityCategory = getActivityCategory(activityType, topic);

      try {
        //order by likes , dislike , answercount
        // const totalPolls = await Poll.find({
        //   isDisabled: false,
        // }).countDocuments();

        let allPolls: any[] = [];
        let totalPolls = 0;

        if (topic) {
          totalPolls = await Poll.find({
            isDisabled: false,
            parentPollId: { $exists: false },
            topic: Types.ObjectId(topic),
          }).countDocuments();
          allPolls = await pollData_withLastActivity(
            offset,
            limit,
            activityCategory,
            undefined,
            undefined,
            topic
          );
        } else {
          totalPolls = await Poll.find({ isDisabled: false }).countDocuments();
          allPolls = await pollData_withLastActivity(
            offset,
            limit,
            activityCategory
          );
        }

        return getMetricsForPoll(userId, allPolls, totalPolls, dataLoaders);
      } catch (err) {
        throw err;
      }
    },

    recentActivityPollsWithPagination: async (
      _,
      { offset, limit, topic },
      { dataLoaders, isAuth }
    ) => {
      const curUserData = await isAuth(["everyone"]);
      const { userId } = curUserData;

      try {
        //order by likes , dislike , answercount
        // const totalPolls = await Poll.find({
        //   isDisabled: false,
        // }).countDocuments();

        let allPolls: any[] = [];
        let totalPolls = 0;

        if (topic) {
          totalPolls = await Poll.find({
            isDisabled: false,
            parentPollId: { $exists: false },
            topic: Types.ObjectId(topic),
          }).countDocuments();
          allPolls = await pollData_withLastActivity(
            offset,
            limit,
            "recent activity by specific tag",
            undefined,
            undefined,
            topic
          );
        } else {
          totalPolls = await Poll.find({ isDisabled: false }).countDocuments();
          allPolls = await pollData_withLastActivity(
            offset,
            limit,
            "recent activity"
          );
        }

        return getMetricsForPoll(userId, allPolls, totalPolls, dataLoaders);
      } catch (err) {
        throw err;
      }
    },

    trendingPollsWithPagination: async (
      _,
      { offset, limit, topic },
      { dataLoaders, isAuth }
    ) => {
      const curUserData = await isAuth(["everyone"]);
      const { userId } = curUserData;

      try {
        //order by likes , dislike , answercount
        // const totalPolls = await Poll.find({
        //   isDisabled: false,
        // }).countDocuments();

        let allPolls: any[] = [];
        let totalPolls = 0;

        if (topic) {
          totalPolls = await Poll.find({
            isDisabled: false,
            topic: Types.ObjectId(topic),
          }).countDocuments();
          allPolls = await pollData_withLastActivity(
            offset,
            limit,
            "trending polls by tag",
            undefined,
            undefined,
            topic
          );
        } else {
          totalPolls = await Poll.find({ isDisabled: false }).countDocuments();
          allPolls = await pollData_withLastActivity(
            offset,
            limit,
            "trending polls"
          );
        }

        // const allPolls = await pollData_withLastActivity(
        //   offset,
        //   limit,
        //   "trending polls"
        // );

        return getMetricsForPoll(userId, allPolls, totalPolls, dataLoaders);
      } catch (err) {
        throw err;
      }
    },
    activeChats: async (_, args, { dataLoaders, isAuth }) => {
      try {
        const chats: IChat[] = await Chat.find();
        const curUserData = await isAuth(["everyone"]);
        const { userId } = curUserData;

        const chatsInTimeOrder = chats.sort(
          (a: any, b: any) => b.creationDate - a.creationDate
        );

        const pollIds = chatsInTimeOrder.map((item) => String(item.poll));
        const uniquePolls = pollIds.filter(
          (val, idx) => pollIds.indexOf(val) === idx
        );

        const activeChatPolls = await batchPolls(uniquePolls);

        const activeChatPollsSorted = activeChatPolls.sort(
          (a, b) => b.chatMssgs.length - a.chatMssgs.length
        );

        const preFinal: any = activeChatPollsSorted.map((item) =>
          transformPoll(
            item,
            dataLoaders(["user", "topic", "subTopic", "answer", "chat"])
          )
        );

        const data = await Promise.all(
          preFinal.map(async (poll) => {
            const answers = await poll.answers();
            const chatMessages = await poll.chatMssgs();

            answers.sort((a, b) => b.creationDate - a.creationDate);
            chatMessages.sort((a, b) => b.creationDate - a.creationDate);

            const lastActivity =
              answers[0]?.creationDate > chatMessages[0]?.creationDate
                ? answers[0]?.creationDate
                : chatMessages[0]?.creationDate;

            const isMultipleChoice =
              poll?.pollType === "multiChoice" ? true : false;

            let isFavorite = false;

            if (userId) {
              const user = await User.findById(userId);
              isFavorite = user?.favorites?.some((fav) => {
                return (
                  fav.favoriteType === "Poll" &&
                  fav?.favoriteId?.toString() === poll?._id?.toString()
                );
              });
            }

            return { ...poll, lastActivity, isMultipleChoice, isFavorite };
          })
        );

        return data;
      } catch (err) {
        throw err;
      }
    },

    activeChatsWithPagination: async (
      _,
      { offset, limit },
      { dataLoaders, isAuth }
    ) => {
      const curUserData = await isAuth(["everyone"]);
      const { userId } = curUserData;

      try {
        const totalPolls = await Poll.find({
          isDisabled: false,
        }).countDocuments();

        const allPolls = await pollData_withLastActivity(
          offset,
          limit,
          "active chats"
        );

        return getMetricsForPoll(userId, allPolls, totalPolls, dataLoaders);
      } catch (err) {
        throw err;
      }
    },

    getFavoritePolls: async (_, { offset, limit }, { dataLoaders, isAuth }) => {
      const user = await isAuth(["admin", "employee", "externalUser"]);

      if (!user) {
        throw new Error("Please log in to see profile content!");
      }

      try {
        const dbUser = await User.findById(user.userId);
        const totalPolls = dbUser.favorites.length;

        const favIds = dbUser.favorites.map((item) =>
          Types.ObjectId(item.favoriteId)
        );

        const favPolls = await pollData_withLastActivity(
          offset,
          limit,
          "favorite polls",
          favIds
        );

        return getMetricsForPoll(
          user.userId,
          favPolls,
          totalPolls,
          dataLoaders
        );
      } catch (err) {
        throw err;
      }
    },

    newestPolls: async (_, args, { dataLoaders, isAuth }) => {
      try {
        const polls: IPoll[] = await Poll.find();
        const curUserData = await isAuth(["everyone"]);
        const { userId } = curUserData;

        const sortedPollData = polls.sort(
          (a: any, b: any) => b.creationDate - a.creationDate
        );

        const preFinal = sortedPollData.map((poll) =>
          transformPoll(
            poll,
            dataLoaders(["user", "topic", "subTopic", "answer", "chat"])
          )
        );

        const data = await Promise.all(
          preFinal.map(async (poll) => {
            const answers = await poll.answers();
            const chatMessages = await poll.chatMssgs();

            answers.sort((a, b) => b.creationDate - a.creationDate);
            chatMessages.sort((a, b) => b.creationDate - a.creationDate);

            const lastActivity =
              answers[0]?.creationDate > chatMessages[0]?.creationDate
                ? answers[0]?.creationDate
                : chatMessages[0]?.creationDate;

            const isMultipleChoice =
              poll?.pollType === "multiChoice" ? true : false;

            let isFavorite = false;

            if (userId) {
              const user = await User.findById(userId);
              isFavorite = user?.favorites?.some((fav) => {
                return (
                  fav.favoriteType === "Poll" &&
                  fav?.favoriteId?.toString() === poll?._id?.toString()
                );
              });
            }

            return { ...poll, lastActivity, isMultipleChoice, isFavorite };
          })
        );

        return data;
      } catch (err) {
        throw err;
      }
    },

    childPollsForParentPoll: async (
      _,
      { cursor, limit, pollId, sortBy },
      { dataLoaders, isAuth }
    ) => {
      const curUserData = await isAuth(["everyone"]);
      const { userId } = curUserData;

      if (limit <= 0) {
        throw new Error("Cannot fetch records for negative or 0 limit");
      }

      try {
        const childPolls = await pollData_forParent(pollId, sortBy);
        const totalChildPolls = childPolls.length;

        if (totalChildPolls === 0) {
          return {
            cursor: "",
            polls: [],
            hasMoreData: false,
          };
        }

        const data = paginateChildPolls(childPolls, cursor, limit);

        return {
          cursor: data.cursor,
          polls: data.content.map((x) => {
            return {
              ...transformDocument(x, dataLoaders(["user"])),
              isBroadcasted: false,
            };
          }),
          hasMoreData: data.hasMoreData,
          totalPolls: totalChildPolls,
        };
      } catch (err) {
        throw err;
      }

      // const curUserData = await isAuth(["everyone"]);
      // const { userId } = curUserData;

      // try {
      //   return await pollData_forParent(pollId, sortBy, dataLoaders(["user"]));
      // } catch (err) {
      //   throw err;
      // }
    },
    getPollMembers: async (_, { pollId }, { dataLoaders, isAuth }) => {
      try {
        pubsub.getRoomMembers(pollId);
      } catch (err) {
        throw err;
      }
    },

    newestPollsWithPagination: async (
      _,
      { offset, limit, topic },
      { dataLoaders, isAuth }
    ) => {
      const curUserData = await isAuth(["everyone"]);
      const { userId } = curUserData;

      try {
        // const totalPolls = await Poll.find({
        //   isDisabled: false,
        // }).countDocuments();

        let polls: any[] = [];
        let totalPolls = 0;

        if (topic) {
          totalPolls = await Poll.find({
            isDisabled: false,
            topic: Types.ObjectId(topic),
          }).countDocuments();
          polls = await pollData_withLastActivity(
            offset,
            limit,
            "newest polls by specific tag",
            undefined,
            undefined,
            topic
          );
        } else {
          totalPolls = await Poll.find({ isDisabled: false }).countDocuments();
          polls = await pollData_withLastActivity(
            offset,
            limit,
            "newest polls"
          );
        }

        // const polls = await pollData_withLastActivity(
        //   offset,
        //   limit,
        //   "newest polls"
        // );

        return getMetricsForPoll(userId, polls, totalPolls, dataLoaders);
      } catch (err) {
        throw err;
      }
    },
  },

  Mutation: {
    createPoll: async (_, { details }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["admin", "employee", "externalUser"]);
      if (!user) {
        throw new Error("Please log in or Register to create a poll.");
      }

      const detailObj = JSON.parse(details);
      const pollTxt: string = parseSlateRichContentForText(detailObj.question);
      const pollTxtSubject: string =
        pollTxt.length > 90 ? pollTxt.substring(0, 90) + "..." : pollTxt;
      // const pollTxt = parseRichContentForText(detailObj.question);
      const moderationResults = await moderateText(pollTxt);

      if (
        moderationResults &&
        moderationResults.terms &&
        moderationResults.blockContent
      ) {
        throw new Error(
          "Content contains inappropriate language.  Please update and resubmit."
        );
      }

      const { answers, question, ...rest } = detailObj;

      // const updatedQuestion = JSON.stringify(question);

      const poll = new Poll({
        question,
        // question: updatedQuestion,
        creator: user.userId,
        ...rest,
      });
      

      let existingPoll;

      try {
        existingPoll = await Poll.findOne({ question });
        // existingPoll = await Poll.findOne({ question: updatedQuestion });
        if (existingPoll) {
          throw new Error(
            "Question already exists.  Please create a different question."
          );
        }

        const savedPoll = await poll.save();

        // const topics = (await TopicModel.distinct("topic")).join(",");
        // const aiPollTopicSubTopics = await generateAiTags(
        //   user.userId,
        //   topics,
        //   pollTxt
        // );

        // console.log(aiPollTopicSubTopics?.data?.choices[0]);

        if (
          detailObj.pollType === "openEnded" &&
          !detailObj.isVideo
           &&
          !configs.isDev
        ) {
          const aiGeneratedAnswer = await generateAIAnswer(pollTxt);
          aiGeneratedAnswer &&
            aiGeneratedAnswer.data &&
            (await storeAiAnswer(aiGeneratedAnswer as any, savedPoll._id));
        }

        if (!["openEnded", "videoPoll"].includes(detailObj.pollType)) {
          // if (detailObj.pollType !== "openEnded" && user.userId) {
          generateAnswersByPollType(detailObj, poll._id, user.userId, ctx);
        }
        // const createdPoll = transformPoll(
        //   savedPoll,
        //   dataLoaders(["user", "topic", "subTopic", "answer", "chat"])
        // );

        const creator = await User.findById(user.userId);
        if (!creator) {
          throw new Error("User not found");
        }

        // if (creator.areasOfInterest) {
        //   const subtopic_subscribers = await getSubTopicSubscribers(creator.areasOfInterest)
        // }

        if (creator.pollHistory) {
          creator.pollHistory.push(poll._id);
        } else creator.pollHistory = [poll._id];

        // Disabled Notifications for Dev Environment
        if (!detailObj.isVideo) {
          const followers = await getUserFollowers(creator.appid);
          if (followers.length > 0 && user.userId) {
            createPoll_notification(
              creator,
              pollTxt,
              savedPoll._id,
              pubsub,
              followers,
              `A new poll was created by ${creator.appid}, who you are following.  Flex your knowledge 💪!\n
              Chat with others or provide answers for ${creator.appid}.`,
              pollTxtSubject,
              false
            );
          }

          const subtopicSubscribers = await getSubTopicSubscribers(
            user.userId,
            savedPoll.subTopics
          );

          if (subtopicSubscribers.length > 0) {
            createPoll_notification(
              creator,
              pollTxt,
              savedPoll._id,
              pubsub,
              subtopicSubscribers,
              `A new poll was created that you may be interested in!  Flex your knowledge 💪!\nChat with others or provide answers for ${creator.appid}.`,
              // `${creator.appid} created a new poll for a subtopic you are interested in: ${pollTxt}`,
              pollTxtSubject,
              true
            );
          }
        } else {
          pubsub.publish("newQuestion", {
            _id: savedPoll._id,
            parentId: savedPoll.parentPollId,
            creator: savedPoll.creator,
          });
        }

        await creator.save();

        return savedPoll;
      } catch (err) {
        throw err;
      }
    },

    addView: async (_, { pollId }, ctx) => {
      try {
        const poll: IPoll = await Poll.findById(pollId);

        poll.views += 1;

        await poll.save();
        return poll.views;
      } catch (err) {
        throw err;
      }
    },

    deletePoll: async (_, { pollId }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["admin", "externalUser"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        // await Poll.findByIdAndDelete(pollId);
        await Poll.findById(pollId).then(async (res) => {
          res.answers.length > 0 && (await updatePollAnswers(res.answers));
          res.chatMssgs.length > 0 &&
            (await updatePollChatMessages(res.chatMssgs));
        });
        // await Poll.findById(pollId)
        //   .populate("chatMssgs answers")
        //   .then((res) => console.log(res));
        await Poll.findByIdAndDelete(pollId);

        await Moderation.deleteMany({ flagId: Types.ObjectId(pollId) });

        return "poll deleted";
      } catch (err) {
        return err;
      }
    },
    removeImageFromPoll: async (_, { details }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["admin", "externalUser"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }
      const detailsObj = JSON.parse(details);

      try {
        await Poll.updateOne(
          {
            _id: detailsObj._id,
          },
          {
            $pull: { pollImages: detailsObj.pollImage },
          }
        );

        return "Image Removed";
      } catch (err) {
        throw err;
      }
    },
    updateVideoPollAudit: async (_, { pollId, msg }, ctx) => {
      const { isAuth } = ctx;
      const user = await isAuth(["admin", "externalUser"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        await Poll.updateOne(
          { _id: pollId },
          {
            $push: {
              auditHistory: {
                action: msg,
              },
            },
          }
        );
        return "Video Poll Audit updated";
      } catch (err) {
        throw err;
      }
    },

    updatePoll: async (_, { details }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["admin", "externalUser"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      const detailObj = JSON.parse(details);
      const pollTxt: string = parseSlateRichContentForText(detailObj.question);
      // const pollTxt = parseRichContentForText(detailObj.question);
      const moderationResults = await moderateText(pollTxt);

      if (moderationResults && moderationResults.blockContent) {
        throw new Error(
          "Content contains inappropriate language.  Please update and resubmit."
        );
      }

      // const updatedQuestion = JSON.stringify(detailObj.question);

      try {
        // const questionExists = await isDuplicateQuestion(detailObj);

        // if (questionExists) {
        //   throw new Error(
        //     "This question already exists.  Please either edit your content to create a different question or respond to the question that already exists."
        //   );
        // }

        // if (detailObj.pollImages && detailObj.pollImages.length > 0) {
        //   await Poll.findByIdAndUpdate(
        //     detailObj._id,
        //     { question: detailObj.question, pollImages: detailObj.pollImages },
        //     { new: true, upsert: true }
        //   );

        //   return "Poll Updated with Images";
        // }

        await Poll.findByIdAndUpdate(
          detailObj._id,
          { question: detailObj.question, pollImages: detailObj.pollImages },
          { new: true, upsert: true }
        );

        return "Poll Updated";
      } catch (err) {
        throw err;
      }
    },

    toggleDisablePoll: async (_, { pollId }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["admin"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        const retrivedPoll = await Poll.findById(pollId);
        if (retrivedPoll) {
          await Poll.findByIdAndUpdate(pollId, {
            isDisabled: !retrivedPoll.isDisabled,
          });
          return `Changed poll isDiable to ${!retrivedPoll.isDisabled}`;
        }
        return "Poll not found";
      } catch (err) {
        return err;
      }
    },
  },
  Subscription: {
    newQuestion: {
      subscribe: withFilter(
        () => pubsub.asyncIterator("newQuestion"),
        (payload, variables) => {
          payload.newQuestion = getFullQuestionDetails(payload);
          return true;
          // if (payload.isRemoved) {
          //   payload.newAnswer = payload;
          //   return true;
          // }
          // payload.newAnswer = getFullAnswerDetails(payload);
          // return true;
        }
      ),
    },
    updateQuestion: {
      subscribe: withFilter(
        () => pubsub.asyncIterator("updateQuestion"),
        (payload, variables) => {
          payload.updateQuestion = getPollQuestion(payload._id);
          return true;
          // if (payload.isRemoved) {
          //   payload.newAnswer = payload;
          //   return true;
          // }
          // payload.newAnswer = getFullAnswerDetails(payload);
          // return true;
        }
      ),
    },
  },
};

export const updatePollChatMessages = async (ids: string[]) => {
  Promise.all(
    ids.map(async (id: string) => {
      // console.log(id);
      // await Chat.findByIdAndDelete(id);
      await Chat.updateOne(
        { _id: id },
        {
          $set: {
            isDisabled: false,
          },
        }
      );
    })
  );
};

export const updatePollAnswers = async (ids: string[]) => {
  Promise.all(
    ids.map(async (id: string) => {
      // console.log(id);
      // await Answer.findByIdAndDelete(id);
      await Answer.updateOne(
        { _id: id },
        {
          $set: {
            isDisabled: false,
          },
        }
      );
    })
  );
};
