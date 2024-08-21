// import { PubSub } from "graphql-subscriptions";
import { GooglePubSub } from "@axelspringer/graphql-google-pubsub";
import IChat from "../../../models/interfaces/chat";
import IPoll from "../../../models/interfaces/poll";
import IUser from "../../../models/interfaces/user";
import {
  dateToString,
  getUniqueObjList,
  getUniqueObjIdList,
  showAbbreviatedTxt,
} from "../../../globalFunctions";
import { transformNotification } from ".";
import Notification from "../../../models/notificationModel";
import User from "../../../models/UserModel";
import { sendEmailNotification, sendErrorEmail } from "../../utils/autoEmails";
import { ObjectId, Types } from "mongoose";
import Poll from "../../../models/PollModel";
import Answer from "../../../models/answerModel";
import {
  UserFollower,
  Follower,
  Following,
  ChatUser,
} from "../../../interfaces";
import { getUserFollowing } from "./user";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import { getChatUsers } from "./chat";
import configs from "../../../endpoints.config";
import { PubSub } from "@google-cloud/pubsub";
// import { publishContent } from "./pubSubActions";
import AblyPubSub from "../../../lib/pubsub";
import { GraphQLError } from "graphql";

export const createPoll_notification = async (
  creator: IUser,
  content: string,
  pollId: string,
  // pubsub: PubSub,
  pubsub: AblyPubSub,
  followers: UserFollower[],
  mmsg: string,
  subject: string,
  forSubscribers: boolean
) => {
  const notification = {
    subject,
    content,
    message: mmsg ?? `${creator.appid} created a new poll: ${content}`,
    collectionType: "Poll",
    creationDate: moment().format(),
    collectionId: pollId,
    creator: creator._id,
    read: false,
  };

  const followerIds = followers.map((x) => x._id);

  try {
    await User.updateMany(
      { _id: { $in: followerIds } },
      { $push: { notifications: notification } }
    );

    const fullNotification = {
      ...notification,
      _id: uuidv4(),
      parentCollectionId: {
        _id: pollId,
        question: content,
      },
      creator: {
        _id: creator._id,
        appid: creator.appid,
        profilePic: creator.profilePic ?? "",
        firstname: creator.firstname,
        lastname: creator.lastname,
      },
    };

    if (!configs.isDev && followers.length > 0) {
      followers.forEach(async (x) => {
        await sendEmailNotification(notification, x.email);
      });
    }

    // publishContent(fullNotification, pubsub, "newNotification");
    !forSubscribers && pubsub.publish("newNotification", fullNotification);
  } catch (err) {
    sendErrorEmail({
      message: (err as any).message,
      path: err,
      locations: [],
      extensions: [],
    });
    return;
  }
};

export const answerPoll_notification = async (
  appUserId: string,
  contentCreatorId: string,
  content: string,
  answerId: string,
  pollId: string,
  // pubsub: PubSub,
  pubsub: AblyPubSub,
  msgType: string
) => {
  try {
    const notifier: IUser = await User.findById(appUserId, {
      _id: 1,
      appid: 1,
      profilePic: 1,
      firstname: 1,
      lastname: 1,
    });

    const contentOwner: IUser = await User.findById(contentCreatorId, {
      email: 1,
      notifications: 1,
    });

    let subject: string = "";
    let message: string = "";
    // if (msgType === "add answer") {
    //   message = `${notifier.appid} added an answer to your poll: ${content}`;
    // } else if (msgType === "select answer") {
    //   message = `${notifier.appid} selected a multiple choice answer for your poll: ${content}`;
    // } else if (msgType.search("like") > -1) {
    //   message = `${notifier.appid} ${msgType} on poll: ${content}`;
    // }

    if (msgType === "add answer") {
      subject = `${notifier.appid} added an answer to your poll!`;
      message = `Go to the poll to see ${notifier.appid}'s answer!`;
    } else if (msgType === "select answer") {
      subject = `${notifier.appid} selected a multiple choice answer for your poll!`;
      message = `Go to the poll to see how the answer selection changed the current answer rankings!`;
    } else if (msgType.search("like") > -1) {
      subject = `${notifier.appid} ${msgType}!`;
      message = `Go to the poll to see the current answer rankings!`;
    }

    const existingNotification_contentOwner = contentOwner?.notifications?.some(
      (item) => {
        item.collectionId.toString() === answerId.toString() &&
          // item.message !== message &&
          // item.message.search(msgType) > -1 &&
          item.creator.toString() === appUserId;
      }
    );

    const notification = {
      subject,
      content,
      message,
      collectionType: "Answer",
      creationDate: moment().format(),
      collectionId: answerId,
      parentCollectionId: Types.ObjectId(pollId),
      creator: notifier._id,
      read: false,
    };

    const fullNotification = {
      ...notification,
      // _id: uuidv4(),
      parentCollectionId: {
        _id: pollId,
        question: content,
      },
      creator: {
        _id: notifier._id,
        appid: notifier.appid,
        profilePic: notifier.profilePic,
        firstname: notifier.firstname,
        lastname: notifier.lastname,
      },
    };

    if (!existingNotification_contentOwner) {
      const res = await User.findOneAndUpdate(
        { _id: contentCreatorId },
        { $push: { notifications: notification } },
        { new: true }
      );

      const latestNotification = res.notifications
        .sort((a: any, b: any) => b.creationDate - a.creationDate)
        .find(
          (x) =>
            !x.read &&
            x.creator.toString() === notification.creator.toString() &&
            x.collectionId.toString() ===
              notification.collectionId.toString() &&
            x.creationDate >= new Date(notification.creationDate)
        );

      pubsub.publish("newNotification", {
        ...fullNotification,
        _id: latestNotification?._id ?? uuidv4(),
      });
      !configs.isDev &&
        (await sendEmailNotification(notification, contentOwner.email));
    }
  } catch (err) {
    sendErrorEmail({
      message: (err as any).message,
      path: err,
      locations: [],
      extensions: [],
    });
    return;
  }
};

export const chat_notification = async (
  appUser: IUser,
  contentCreatorId: string,
  content: string,
  pollId: string,
  chatId: string,
  refType: string,
  // pubsub: PubSub
  pubsub: AblyPubSub
) => {
  try {
    const contentOwner: IUser = await User.findById(contentCreatorId, {
      email: 1,
      notifications: 1,
    });

    let subject = "";
    let message = "";
    let collectionType = "";
    let chatUsers: any[] = [];

    if (refType === "create Chat Mssg") {
      subject = `${appUser.appid} started chatting on your poll!`;
      message = `${appUser.appid} started a conversation on your poll.  Join in!`;
      collectionType = "Poll";
    } else if (refType.search("Ref Chat") > -1) {
      subject = `${appUser.appid} replied to your chat message!`;
      message = `${appUser.appid} replied to one of your chat messages in this poll.  Don't leave 'em hanging!`;
      collectionType = "Poll";
    } else if (refType.search("Ref Answer") > -1) {
      collectionType = "Answer";
      subject = `${appUser.appid} referenced your answer!`;
      message = `${appUser.appid} referenced one of your answers in this poll.  See what they said!`;
    } else if (refType.search("Ref User") > -1) {
      collectionType = "User";
      subject = `${appUser.appid} tagged you in a chat message!`;
      message = `${appUser.appid} mentioned you in a discussion.  See what they said!`;
    } else if (refType === "Idle Chat") {
      subject = `${appUser.appid} restarted the conversation!`;
      message = `Join in! People are chatting again on this poll`;
      collectionType = "Chat";
      chatUsers = await getChatUsers(pollId, appUser._id);
      // chatUsers = getUniqueObjList([...chatUsers, contentOwner]);
    }

    const notification = {
      subject,
      message,
      content,
      collectionType,
      creationDate: moment().format(),
      collectionId: chatId,
      parentCollectionId: Types.ObjectId(pollId),
      creator: appUser._id,
      read: false,
    };

    const fullNotification = {
      ...notification,
      _id: uuidv4(),
      parentCollectionId: {
        _id: pollId,
        question: content,
      },
      creator: {
        _id: appUser._id,
        appid: appUser.appid,
        profilePic: appUser.profilePic,
        firstname: appUser.firstname,
        lastname: appUser.lastname,
      },
    };

    if (!configs.isDev) {
      if (chatUsers.length > 0) {
        let chatUserIds = chatUsers.map((x) => x._id);
        chatUserIds = getUniqueObjIdList([...chatUserIds, contentOwner._id]);

        await User.updateMany(
          { _id: { $in: chatUserIds } },
          { $push: { notifications: notification } }
        );

        chatUsers.forEach(async (x) => {
          await sendEmailNotification(notification, x.email);
        });
      } else {
        await User.updateOne(
          { _id: contentCreatorId },
          { $push: { notifications: notification } }
        );
        await sendEmailNotification(notification, contentOwner.email);
      }
    }

    // publishContent(fullNotification, pubsub, "newNotification");
    pubsub.publish("newNotification", fullNotification);
  } catch (err) {
    sendErrorEmail({
      message: (err as any).message,
      path: err,
      locations: [],
      extensions: [],
    });
    return;
  }
};

// export const pushNotifications_createPoll = async (followers: Following[]) => {
//   try {
//     const followerData = await getUserFollowing(followers);
//     const followerIds = followerData.map((item) => item._id);

//     return await Notification.find({
//       creator: { $in: followerIds },
//     });
//   } catch (err) {
//     throw err;
//   }
// };

// export const getAllNotifications = async (userId: string) => {
//   try {
//     const appUser = await User.findById(userId, {
//       _id: 0,
//       following: 1,
//     });

//     const createPollNotifications = await pushNotifications_createPoll(
//       appUser.following
//     );

//     return [...createPollNotifications];
//   } catch (err) {
//     throw err;
//   }
// };

// const pushNotification = async (
//   notifType: string,
//   userId: string,
//   notifObj: IPoll | IChat,
//   pubsub: GooglePubSub,
//   dataLoaders: any
// ) => {
//   const creator: IUser = await User.findById(userId);

//   const notificationMssg = getNotificationMssg(
//     creator.appid,
//     notifType,
//     notifObj
//   );

//   // const totalNotifications = await Notification.find({
//   //   contentOwner: userId,
//   // }).countDocuments();

//   const notification = new Notification({
//     message: notificationMssg,
//     user: userId,
//     notificationType: notifType,
//     notificationId: notifObj._id,
//     contentOwner: notifObj.creator.toString(),
//     read: false,
//   });

//   const savedNotification = await notification.save();
//   const newNotification = await transformNotification(
//     savedNotification,
//     dataLoaders(["user"])
//   );

//   const contentOwner: IUser = await User.findById(
//     notification.contentOwner as string
//   );

//   await sendEmailNotification(notification, contentOwner.email);

//   pubsub.publish("newNotification", newNotification);
//   // pubsub.publish("newNotification", { ...newNotification, totalNotifications });
// };

// export default pushNotification;

// const getNotificationMssg = (
//   appId: string,
//   notifType: string,
//   notifObj: IPoll | IChat
// ) => {
//   switch (true) {
//     case notifType === "poll":
//       return `${appId} added an answer to the poll: ${
//         (notifObj as IPoll).question
//       }`;
//     case notifType === "chat":
//       return `Someone started chatting on your poll`;
//     case notifType === "follower":
//       return `${appId} created a new poll: ${(notifObj as IPoll).question}`;
//   }
// };

export const getUserFirstChatMssgs = async (userId: string) => {
  return await Poll.aggregate([
    { $match: { creator: Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "chats",
        localField: "chatMssgs",
        foreignField: "_id",
        as: "chat_data",
      },
    },
    {
      $addFields: {
        pollChats: {
          $filter: {
            input: "$chat_data",
            as: "chat",
            cond: { $ne: ["$$chat.creator", Types.ObjectId(userId)] },
          },
        },
      },
    },

    { $addFields: { firstChat: { $first: "$pollChats" } } },
    {
      $lookup: {
        from: "users",
        localField: "firstChat.creator",
        foreignField: "_id",
        as: "user_data",
      },
    },
    {
      $project: {
        _id: 0,
        creationDate: "$firstChat.creationDate",
        notificationType: "Chat Message",
        pollId: "$_id",
        pollQuestion: "$question",
        appid: {
          $reduce: {
            input: "$user_data",
            initialValue: "",
            in: {
              $concat: ["$$value", "$$this.appid"],
            },
          },
        },
      },
    },
  ]);
};

export const getUserAnswerNotifications = async (userId: string) => {
  return await Poll.aggregate([
    {
      $match: {
        creator: Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "answers",
        localField: "answers",
        foreignField: "_id",
        as: "answer_data",
      },
    },
    {
      $addFields: {
        pollAnswers: {
          $filter: {
            input: "$answer_data",
            as: "answer",
            cond: { $ne: ["$$answer.creator", Types.ObjectId(userId)] },
          },
        },
      },
    },
    { $unwind: "$pollAnswers" },
    {
      $lookup: {
        from: "users",
        localField: "pollAnswers.creator",
        foreignField: "_id",
        as: "user_data",
      },
    },
    {
      $project: {
        _id: 0,
        creationDate: "$pollAnswers.creationDate",
        pollId: "$_id",
        pollQuestion: "$question",
        notificationType: "Add Answer",
        answer: "$pollAnswers.answer",
        appid: {
          $reduce: {
            input: "$user_data",
            initialValue: "",
            in: {
              $concat: ["$$value", "$$this.appid"],
            },
          },
        },
      },
    },
  ]);
};

export const getUserAnswerFeedBackNotifications = async (userId: string) => {
  const myDislikedAnswers = await Answer.aggregate([
    {
      $match: {
        $and: [
          { creator: Types.ObjectId(userId) },
          { dislikes: { $exists: true } },
          { dislikes: { $gt: { $size: 0 } } },
          {
            dislikes: {
              $elemMatch: { userId: { $ne: Types.ObjectId(userId) } },
            },
          },
        ],
      },
    },

    {
      $lookup: {
        from: "polls",
        localField: "poll",
        foreignField: "_id",
        as: "poll_data",
      },
    },

    {
      $addFields: {
        dislike_data: {
          $filter: {
            input: "$dislikes",
            as: "dislike",
            cond: { $ne: ["$$dislike.userId", userId] },
          },
        },
      },
    },
    { $unwind: "$dislike_data" },
    {
      $lookup: {
        from: "users",
        localField: "dislike_data.userId",
        foreignField: "_id",
        as: "user_data",
      },
    },
    {
      $project: {
        _id: 0,
        answer: "$answer",
        pollId: { $toString: "$poll" },
        creationDate: {
          $ifNull: ["$dislike_data.disLikedDate", "No date provided"],
        },

        notificationType: "Dislike Answer",
        appid: {
          $reduce: {
            input: "$user_data",
            initialValue: "",
            in: {
              $concat: ["$$value", "$$this.appid"],
            },
          },
        },
        pollQuestion: {
          $reduce: {
            input: "$poll_data",
            initialValue: "",
            in: {
              $concat: ["$$value", "$$this.question"],
            },
          },
        },
      },
    },

    // {
    //   $match: {
    //     creator: Types.ObjectId(userId),
    //     $or: [
    //       {
    //         $and: [
    //           { likes: { $exists: true } },
    //           { likes: { $gt: { $size: 0 } } },
    //           { likes: { $elemMatch: { userId: { $ne: userId } } } },
    //         ],
    //       },
    //       {
    //         $and: [
    //           { dislikes: { $exists: true } },
    //           { dislikes: { $gt: { $size: 0 } } },
    //           { dislikes: { $elemMatch: { userId: { $ne: userId } } } },
    //         ],
    //       },
    //       {
    //         $and: [
    //           { multichoiceVotes: { $exists: true } },
    //           { multichoiceVotes: { $gt: { $size: 0 } } },
    //           { multichoiceVotes: { $elemMatch: { userId: { $ne: userId } } } },
    //         ],
    //       },
    //     ],
    //   },
    // },
    // {
    //   $addFields: {
    //     like_data: {
    //       $filter: {
    //         input: "$likes",
    //         as: "like",
    //         cond: { $ne: ["$$like.userId", userId] },
    //       },
    //     },
    //     dislike_data: {
    //       $filter: {
    //         input: "$dislikes:",
    //         as: "dislike",
    //         cond: { $ne: ["$$dislike.userId", userId] },
    //       },
    //     },
    //     multichoice_data: {
    //       $filter: {
    //         input: "$multichoiceVotes:",
    //         as: "vote",
    //         cond: { $ne: ["$$vote.userId", userId] },
    //       },
    //     },
    //   },
    // },
    // { $unwind: "$like_data" },
  ]);

  console.log(myDislikedAnswers.length);
  console.log(myDislikedAnswers);
};
