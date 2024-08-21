import { ResolverMap, ChatFeed } from "../../interfaces";
import { v4 as uuidv4 } from "uuid";
import Chat from "../../models/chatModel";
import Poll from "../../models/PollModel";
import Answer from "../../models/answerModel";
import User from "../../models/UserModel";
import {
  transformAnswer,
  transformChat,
  transformSubTopic,
  transformTopic,
} from "./shared";
// import pushNotification from "./shared/notification";
// import ITopic from "../../models/interfaces/topic";
// import ISubTopic from "../../models/interfaces/subTopic";
import IChat from "../../models/interfaces/chat";
import IUser from "../../models/interfaces/user";
import IPoll from "../../models/interfaces/poll";

import { Types } from "mongoose";
import UserModel from "../../models/UserModel";
import { getUserAnswers, getUserFollowers, isActive } from "./shared/user";
import { dateToString, getDiffTimes_minutes } from "../../globalFunctions";
import { withFilter } from "graphql-subscriptions";
import {
  formatChatUserData,
  getChatUsers,
  getFullChatDetails,
  publishByMssgType,
  toggleReaction,
} from "./shared/chat";
import { chat_notification } from "./shared/notification";
import {
  getPlainTxtByContentType,
  parseRichContentForText,
} from "./shared/poll";
import { pubsub } from "../..";

let chatUserData: any[] = [];

export const chatResolvers: ResolverMap = {
  Query: {
    messages: async (parent, args, { dataLoaders }) => {
      try {
        const messages = await Chat.find();
        return await Promise.all(
          messages.map((item) =>
            transformChat(item, dataLoaders(["user", "poll"]))
          )
        );
      } catch (err) {
        throw err;
      }
    },
    messageByUser: async (parent, args, { dataLoaders }) => {},
    messagesByPoll: async (parent, { pollId }, { dataLoaders }) => {
      try {
        const pollMessages = await Chat.find({ poll: pollId });

        return await Promise.all(
          pollMessages.map((item: IChat) =>
            transformChat(item, dataLoaders(["user", "poll"]))
          )
        );
      } catch (err) {
        throw err;
      }
    },
    messageFeedByPoll: async (
      parent,
      { pollId, cursor, limit },
      { dataLoaders }
    ) => {
      const noCursorOffset = !cursor ? 1 : 0;
      if (limit <= 0) {
        throw new Error("Cannot fetch records for negative or 0 limit");
      }

      try {
        const pollMessages: IChat[] = await Chat.find({
          poll: pollId,
          isDisabled: false,
        });
        const totalMssgs = pollMessages.length;

        if (pollMessages.length === 0) {
          return {
            cursor: "",
            messages: [],
            hasMoreData: false,
          };
        }

        if (!cursor) {
          cursor = pollMessages[pollMessages.length - 1]._id.toString();
        }

        const newMessageIdx = pollMessages.findIndex(
          (msg) => msg._id.toString() === cursor
        );

        const offset = newMessageIdx - limit + noCursorOffset;

        let messages: IChat[] = [];
        let hasMoreData: boolean = false;
        let newCursor: string = "";

        if (offset > 0) {
          messages = pollMessages.slice(offset, newMessageIdx + noCursorOffset);
          hasMoreData = true;
          newCursor = pollMessages[offset]._id.toString();
        } else {
          messages = pollMessages.slice(0, newMessageIdx + noCursorOffset);
        }

        const messageDetails = await Promise.all(
          messages.map(async (item: IChat) => {
            const fullChat = await transformChat(
              item,
              dataLoaders(["user", "poll"])
            );

            let msgRef: any = undefined;
            let ansRef: any = undefined;

            if (item.msgRef) {
              msgRef = await Chat.findById(item.msgRef);
              msgRef = await transformChat(
                msgRef,
                dataLoaders(["user", "poll"])
              );
            }

            if (item.ansRef) {
              ansRef = await Answer.findById(item.ansRef);

              if (!ansRef) {
                ansRef = {
                  _id: item.ansRef,
                  answer: "This answer has been removed.",
                };
              } else {
                ansRef = await transformAnswer(
                  ansRef,
                  dataLoaders(["user", "poll"])
                );
              }
            }

            return { ...fullChat, msgRef, ansRef };
          })
        );

        const finalMssgs = messageDetails.map((item) => {
          const createDate = new Date(item.creationDate);
          const activeStatus = isActive(item.creator._id);

          return { ...item, isActive: activeStatus };
        });

        const chatFeed: ChatFeed = {
          cursor: newCursor,
          messages: finalMssgs,
          hasMoreData,
          totalMssgs,
        };

        return chatFeed;
      } catch (err) {
        throw err;
      }
    },
    messageById: async (parent, { msgId }, { dataLoaders }) => {
      try {
        const chat = await Chat.findById(msgId);
        const transformedChat = await transformChat(
          chat,
          dataLoaders(["user", "poll"])
        );
        return transformedChat;
      } catch (err) {
        throw err;
      }
    },

    allPollChatUsers: async (parent, { pollId }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["admin", "externalUser", "employee"]);
      if (!user) {
        throw new Error("Log in to see the Users on this Chat!");
      }

      try {
        const chatUsers = await getChatUsers(pollId);

        return chatUsers.filter((x) => x._id.toString() !== user.userId);
      } catch (error) {
        throw error;
      }
    },

    pollChatUsers: async (parent, { pollId }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["admin", "externalUser", "employee"]);
      if (!user) {
        throw new Error("Log in to see the Users on this Chat!");
      }

      const finalChatUserData = chatUserData.map((item) => {
        return {
          ...item,
          isFollowed: item.followers.some(
            (x) => x._id.toString() === user.userId
          ),
        };
      });

      return finalChatUserData.filter((item) => item.pollId === pollId);
    },
  },
  Mutation: {
    removeChatUser: async (parent, { userId, pollId }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["admin", "externalUser", "employee"]);
      if (!user) {
        return "Log in to see the Users on this Chat!";
      }

      const chatUserIdx = chatUserData.findIndex(
        (item) => item.id.toString() === userId && item.pollId === pollId
      );

      if (chatUserIdx > -1) {
        const chatUser = chatUserData[chatUserIdx];
        chatUser.remove = true;
        chatUserData = chatUserData.filter(
          (item) => item.id.toString() !== userId
        );

        pubsub.publish("newChatUser", chatUser);

        return "User removed";
      }
      return "User already removed";
    },
    createMessage: async (parent, { details }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["admin", "externalUser", "employee"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      const detailObj = JSON.parse(details);

      const chatMssg: IChat = new Chat({
        ...detailObj,
        creator: user.userId,
      });

      try {
        const savedMssg = await chatMssg.save(detailObj.poll);
        const newMessage = await transformChat(
          savedMssg,
          dataLoaders(["user", "poll"])
        );

        //Save to Poll
        const poll: IPoll = await Poll.findById(detailObj.poll);

        if (poll.chatMssgs) {
          poll.chatMssgs.push(chatMssg._id);
        } else poll.chatMssgs = [chatMssg._id];

        await poll.save();

        //Push Notification
        const pollContent: string = getPlainTxtByContentType(poll.question);

        if (poll.chatMssgs.length > 1) {
          const lastChatMssg: IChat = await Chat.findById(
            poll.chatMssgs[poll.chatMssgs.length - 2]
          );

          const timeDiff = getDiffTimes_minutes(
            savedMssg.creationDate,
            lastChatMssg.creationDate
          );

          const chatUsers = await Chat.find(
            { poll: detailObj.poll },
            { _id: 0, creator: 1 }
          );

          const uniqueUsers = Array.from(
            new Set(chatUsers.map((x) => x.creator.toString()))
          );

          if (
            // poll.creator.toString() !== user.userId &&
            poll.chatMssgs.length > 0 &&
            user.userId &&
            timeDiff > 60
          ) {
            await chat_notification(
              newMessage.creator,
              poll.creator,
              pollContent,
              poll._id,
              newMessage._id,
              "Idle Chat",
              pubsub
            );
          }
        } else {
          await chat_notification(
            newMessage.creator,
            poll.creator,
            pollContent,
            poll._id,
            newMessage._id,
            "create Chat Mssg",
            pubsub
          );
        }

        const newChatUser = await formatChatUserData(
          newMessage.creator,
          newMessage.creationDate,
          detailObj.poll,
          user.userId
        );

        publishByMssgType(newMessage, user, pollContent, poll._id, pubsub);
        pubsub.publish("newChatUser", newChatUser);

        const onChatUserList = chatUserData.some(
          (item) =>
            item.id.toString() === newChatUser.id.toString() &&
            item.pollId === newChatUser.pollId
        );

        if (!onChatUserList) {
          chatUserData.push(newChatUser);
        }

        return newMessage;
      } catch (err) {
        throw err;
      }
    },
    handleReaction: async (parent, { reactionType, reaction, chatId }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["externalUser"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        const finalChatData = await toggleReaction(
          chatId,
          reactionType,
          reaction,
          user.userId
        );

        pubsub.publish("newMessage", {
          _id: chatId,
          msgRef: finalChatData.msgRef ?? "",
          mentionRef: finalChatData.mentionRef ?? "",
          ansRef: finalChatData.ansRef ?? "",
        });
      } catch (err) {
        throw err;
      }
    },
  },

  Subscription: {
    newMessage: {
      subscribe: withFilter(
        () => pubsub.asyncIterator("newMessage"),
        (payload, variables) => {
          payload.newMessage = getFullChatDetails(
            payload._id,
            payload.mentionRef ?? undefined,
            payload.msgRef ?? undefined,
            payload.ansRef ?? undefined
          );
          return true;
        }
      ),
    },
    newChatUser: {
      subscribe: withFilter(
        () => pubsub.asyncIterator("newChatUser"),
        (payload, variables) => {
          payload.newChatUser = payload;
          return true;
        }
      ),
    },
  },
};
