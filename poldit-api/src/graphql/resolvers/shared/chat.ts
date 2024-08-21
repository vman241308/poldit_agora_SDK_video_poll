import { dateToString } from "../../../globalFunctions";
import Chat from "../../../models/chatModel";
import User from "../../../models/UserModel";
import Answer from "../../../models/answerModel";
import { getUserAnswers, getUserFollowers, isActive } from "./user";
import { ObjectId, Types } from "mongoose";
import { transformAnswer, transformChat, transformDocument } from ".";
import dataLoaders from "../../loaders";
import IChat from "../../../models/interfaces/chat";
import { chat_notification } from "./notification";
import AblyPubSub from "../../../lib/pubsub";

export const getFullChatDetails = async (
  chatId: string,
  userRef?: string,
  msgRef?: string,
  ansRef?: string
) => {
  try {
    const chatDetails = await Chat.findById(chatId);
    let finalChatDetails = await transformDocument(
      chatDetails._doc ?? chatDetails,
      dataLoaders(["user", "poll"])
    );
    // let finalChatDetails = await transformChat(
    //   chatDetails,
    //   dataLoaders(["user", "poll"])
    // );

    if (userRef) {
      const user = await User.findOne({ appid: userRef });
      // const user = await User.findById(userRef);
      finalChatDetails = { ...finalChatDetails, mentionRef: user };
    }

    if (msgRef) {
      const msg = await Chat.findById(msgRef);

      const msgRefFull = await transformChat(
        msg,
        dataLoaders(["user", "poll"])
      );

      finalChatDetails = { ...finalChatDetails, msgRef: msgRefFull };
    }

    if (ansRef) {
      const answer = await Answer.findById(ansRef);

      const answerRefFull = await transformAnswer(
        answer,
        dataLoaders(["user", "poll"])
      );

      finalChatDetails = { ...finalChatDetails, ansRef: answerRefFull };
    }

    return finalChatDetails;
  } catch (err) {
    throw err;
  }
};

export const publishByMssgType = async (
  mssg: any,
  user: any,
  pollContent: string,
  pollId: string,
  pubsub: AblyPubSub
) => {
  try {
    switch (true) {
      case mssg.msgRef != undefined:
        const msgRefObj = await Chat.findById(mssg.msgRef);

        msgRefObj.creator.toString() !== user.userId &&
          (await chat_notification(
            mssg.creator,
            msgRefObj.creator,
            pollContent,
            pollId,
            mssg._id,
            "Ref Chat in Chat Mssg",
            pubsub
          ));

        pubsub.publish("newMessage", {
          _id: mssg._id,
          message: mssg.message,
          creationDate: mssg.creationDate,
          msgRef: msgRefObj._id,
        });
        break;

      case mssg.ansRef != undefined:
        const ansRefObj = await Answer.findById(mssg.ansRef);

        const answerRefCreator = await User.findById(ansRefObj.creator, {
          _id: 1,
        });

        ansRefObj.creator.toString() !== user.userId &&
          (await chat_notification(
            mssg.creator,
            answerRefCreator._id.toString(),
            pollContent,
            pollId,
            mssg._id,
            "Ref Answer in Chat Mssg",
            pubsub
          ));

        pubsub.publish("newMessage", {
          _id: mssg._id,
          message: mssg.message,
          creationDate: mssg.creationDate,
          ansRef: ansRefObj._id,
        });

        break;

      case mssg.mentionRef !== "":
        const userRef: any = await User.findOne({
          appid: mssg.mentionRef,
        });

        await chat_notification(
          mssg.creator,
          userRef._id,
          pollContent,
          pollId,
          mssg._id,
          "Ref User in Chat Mssg",
          pubsub
        );

        pubsub.publish("newMessage", {
          _id: mssg._id,
          message: mssg.message,
          creationDate: mssg.creationDate,
          mentionRef: userRef._id,
        });
        break;

      default:
        pubsub.publish("newMessage", {
          _id: mssg._id,
          message: mssg.message,
          creationDate: mssg.creationDate,
        });

        break;
    }
  } catch (err) {
    throw err;
  }
};

export const formatChatUserData = async (
  creator: any,
  msgDate: any,
  pollId: string,
  userId: string
) => {
  const {
    _id: id,
    profilePic,
    appid,
    pollHistory,
    firstname,
    lastname,
  } = creator;
  const fullName = `${firstname} ${lastname}`;

  try {
    const followers = await getUserFollowers(appid);
    const numAnswers = await getUserAnswers(id);
    const active = await isActive(id);

    return {
      id,
      appid,
      numPolls: pollHistory ? pollHistory.length : 0,
      profilePic,
      numAnswers,
      fullName,
      followers,
      lastChatMssgDate: dateToString(msgDate),
      isActive: active,
      isFollowed: false,
      pollId,
    };
  } catch (err) {
    throw err;
  }
};

export const getChatUsers = async (pollId: string, creatorId?: ObjectId) => {
  let matchProps: any;

  if (creatorId) {
    matchProps = {
      $and: [{ poll: Types.ObjectId(pollId) }, { creator: { $ne: creatorId } }],
    };
  } else {
    matchProps = {
      poll: Types.ObjectId(pollId),
    };
  }

  return await Chat.aggregate([
    {
      $match: matchProps,
    },
    {
      $lookup: {
        from: "users",
        localField: "creator",
        foreignField: "_id",
        as: "chat_creator_data",
      },
    },
    { $unwind: "$chat_creator_data" },
    {
      $group: {
        _id: {
          _id: "$chat_creator_data._id",
          appid: "$chat_creator_data.appid",
          firstname: "$chat_creator_data.firstname",
          lastname: "$chat_creator_data.lastname",
          profilePic: "$chat_creator_data.profilePic",
          email: "$chat_creator_data.email",
        },
      },
    },
    { $replaceRoot: { newRoot: "$_id" } },
  ]);

  // return chatUsers.filter((x) => x._id.toString() !== userId);
};

export const toggleReaction = async (
  chatId: string,
  reactionType: string,
  reaction: boolean,
  userId: string
) => {
  const pullObj = {};

  ["like", "dislike", "heart", "laugh", "sadFace", "angryFace"]
    .filter((x) => x !== `${reactionType}`)
    .forEach((y) => {
      pullObj[`${y}s`] = { userId, [`${y}`]: true };
    });

  try {
    const existingReaction = await Chat.find({
      _id: chatId,
      [`${reactionType}s.userId`]: userId,
    });

    if (existingReaction.length > 0) {
      return await Chat.findByIdAndUpdate(chatId, {
        $pull: {
          [`${reactionType}s`]: {
            userId,
            [`${reactionType}`]: true,
          },
        },
      });
    }

    return await Chat.findByIdAndUpdate(chatId, {
      $push: {
        [`${reactionType}s`]: {
          userId,
          [`${reactionType}`]: true,
          [`${reactionType}Date`]: Date.now(),
        },
      },
      $pull: pullObj,
    });
  } catch (err) {
    throw err;
  }
};
