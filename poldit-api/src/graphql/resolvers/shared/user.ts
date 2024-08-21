import User from "../../../models/UserModel";
import Poll from "../../../models/PollModel";
import Chat from "../../../models/chatModel";
import Answer from "../../../models/answerModel";
import Topic from "../../../models/TopicModel";
import AreaKnowledge from "../../../models/areaKnowledge";
import SubTopic from "../../../models/SubTopicModel";
import { ObjectId, Types } from "mongoose";
import configs from "../../../endpoints.config";
import jwt from "jsonwebtoken";
import IUser, { AreasInterest } from "../../../models/interfaces/user";
import IPoll from "../../../models/interfaces/poll";
import { getSortedListByDate } from "../../../globalFunctions";
import { sendTokenEmail } from "../../utils/autoEmails";
import { Follower, Following, ISubTopic } from "../../../interfaces";
import { parseRichContentForText } from "./poll";

const { JwtKey } = configs;

export const getUserFollowers = async (
  userId: string,
  appUserFollowing?: any[]
) => {
  const followerData = await User.find(
    { "following.appId": userId },
    {
      _id: 1,
      appid: 1,
      profilePic: 1,
      firstname: 1,
      lastname: 1,
      following: 1,
      email: 1,
    }
  );

  return await Promise.all(
    followerData.map(
      async ({
        _id,
        appid,
        profilePic,
        firstname,
        lastname,
        email,
        following,
      }) => {
        const active = await isActive(_id);

        const followsUser = appUserFollowing?.some(
          (item) => item.appId === appid
        );

        return {
          _id,
          appId: appid,
          profilePic,
          firstname,
          lastname,
          email,
          isActive: active,
          isFollowed: followsUser,
        };
      }
    )
  );
};

export const getUserDetailsForSubscription = async (content: any) => {
  try {
    const user = User.findById(content._id);
    console.log(user);
  } catch (err) {
    throw err;
  }
};

export const getSubTopicSubscribers = async (
  userId: string,
  subTopics: string[]
) => {
  const subtopicIds = subTopics.map((x) => Types.ObjectId(x));

  return await User.find(
    {
      $and: [
        { _id: { $ne: Types.ObjectId(userId) } },
        {
          areasOfInterest: { $elemMatch: { subtopicId: { $in: subtopicIds } } },
        },
      ],
      // areasOfInterest: { $elemMatch: { subtopicId: { $in: subtopicIds } } },
    },
    {
      _id: 1,
      appid: 1,
      profilePic: 1,
      firstname: 1,
      lastname: 1,
      following: 1,
      email: 1,
    }
  );
};

export const getUserAnswers = async (userId: string) => {
  const creator = new Types.ObjectId(userId);

  const openEndedAnswers = await Answer.find({ creator }).countDocuments();

  const multiChoiceAnswers = await Answer.find({
    "multichoiceVotes.userId": userId,
  }).countDocuments();

  return openEndedAnswers + multiChoiceAnswers;
};

export const getUserFollowing = async (followingList: Following[]) => {
  const followingListData: any[] = [];
  for (let i = 0; i < followingList.length; i++) {
    const user = followingList[i];

    const following_user = await User.findOne(
      { appid: user.appId },
      {
        _id: 1,
        appid: 1,
        profilePic: 1,
        firstname: 1,
        lastname: 1,
        following: 1,
      }
    );

    if (following_user) {
      const active = await isActive(following_user._id.toString());

      followingListData.push({
        _id: following_user._id,
        appId: following_user.appid,
        profilePic: following_user.profilePic ?? "",
        firstname: following_user.firstname,
        lastname: following_user.lastname,
        isActive: active,
        isFollowed: true,
      });
    }
  }

  return followingListData;
};

// export const isActive = (lastDate: any) => {
//   const dateDiff = Date.now() - lastDate;
//   const diffDays = getDiffDays(dateDiff);

//   const isActive = diffDays > 2 ? false : true;

//   return isActive;
// };

export const isActive = async (userId: string) => {
  const models = [
    { model: Poll, modelType: "poll" },
    { model: Chat, modelType: "chat" },
    { model: Answer, modelType: "answer" },
    { model: Topic, modelType: "topic" },
    { model: SubTopic, modelType: "subTopic" },
  ];

  let finalList: any[] = [];

  try {
    for (let i = 0; i < models.length; i++) {
      const e = models[i];

      const matchFields =
        e.modelType === "answer"
          ? {
              $or: [
                { creator: Types.ObjectId(userId) },
                { "likes.userId": userId },
                { "dislikes.userId": userId },
                { "multichoiceVotes.userId": userId },
              ],
            }
          : {
              creator: Types.ObjectId(userId),
            };

      const groupFields =
        e.modelType === "answer"
          ? {
              creationDate: { $max: "$creationDate" },
              latestLikedDate: { $max: "$likes.likedDate" },
              latestDislikeDate: { $max: "$dislikes.disLikedDate" },
              latestVoteDate: { $max: "$multichoiceVotes.voteDate" },
            }
          : { creationDate: { $max: "$creationDate" } };

      const resp = await e.model.aggregate([
        {
          $match: { ...matchFields },
        },
        {
          $group: { _id: e.modelType, ...groupFields },
        },
      ]);

      resp && resp.length > 0 && finalList.push(resp[0]);
    }

    if (finalList.length === 0) {
      return false;
    }

    const aggregateDateList = finalList.map((item) => {
      if (item._id === "answer") {
        let answerDates: { _id: string; creationDate: Date }[] = [];
        for (const key in item) {
          if (key.endsWith("Date")) {
            const dateObj = {
              _id: "answer",
              creationDate: new Date(item[key]),
            };
            answerDates.push(dateObj);
          }
        }
        const answerDatesSorted = getSortedListByDate(answerDates);
        return answerDatesSorted[0];
      }
      return item;
    });

    const dateList = getSortedListByDate(aggregateDateList);

    const dateOneObj: any = Date.now();
    const dateTwoObj: any =
      typeof dateList[0].creationDate === "string"
        ? new Date(dateList[0].creationDate)
        : dateList[0].creationDate;
    const milliseconds = Math.abs(dateTwoObj - dateOneObj);
    const hours = milliseconds / 36e5;

    const isActive = hours > 2 ? false : true;
    return isActive;
  } catch (err) {
    throw err;
  }
};

export const generateToken = (userId: string, email: string) => {
  const token = jwt.sign({ userId }, JwtKey, {
    expiresIn: "1h",
  });

  token &&
    sendTokenEmail(token, email)
      .then((res) => {
        console.log("verification email sent successfully", res);
      })
      .catch((err) => {
        console.log("something went wrong with verification email ...", err);
      });
};

export const getFollowerData = async (
  userId: string,
  pagePath: string
  // appUser: string
) => {
  const pollIdIdx = pagePath.lastIndexOf("/");
  const pollId = pagePath.slice(pollIdIdx + 1);
  const active = await isActive(userId);

  try {
    const user: IUser = await User.findById(userId);
    // const userOnFollowerList = await User.find({
    //   $and: [
    //     { _id: Types.ObjectId(appUser) },
    //     { following: { $elemMatch: { appId: user.appid } } },
    //   ],
    // }).countDocuments();

    // console.log({userOnFollowerList})
    const poll: IPoll = await Poll.findById(pollId);

    return {
      userId: user._id.toString(),
      appId: user.appid,
      profilePic: user.profilePic,
      firstname: user.firstname,
      lastname: user.lastname,
      pageLoc: pagePath,
      removeFlag: false,
      pollQuestion:
        poll.question.search('{"blocks":') > -1
          ? parseRichContentForText(JSON.parse(poll.question))
          : poll.question,
      isActive: active,
      // onFollowerList: userOnFollowerList > 0 ? true : false,
    };
  } catch (err) {
    throw err;
  }
};

export const isDuplicateAreaOfKnowledge = async (area: string) => {
  const regExpString = new RegExp(`^${area}$`, "i"); //case insenstive search for value in DB
  const areaMatch = await AreaKnowledge.find({
    areaKnowledge: { $regex: regExpString },
  });

  if (areaMatch.length > 0) {
    return true;
  }
  return false;
};

export const getUserAnswerActivity = async (userId: ObjectId) => {
  return await Answer.aggregate([
    {
      $match: {
        $and: [{ creator: userId }, { isDisabled: false }],
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
      $lookup: {
        from: "users",
        localField: "poll_data.creator",
        foreignField: "_id",
        as: "poll_creator_data",
      },
    },
    {
      $project: {
        _id: 0,
        creator: {
          $reduce: {
            input: "$poll_creator_data",
            initialValue: "",
            in: {
              $concat: ["$$value", "$$this.appid"],
            },
          },
        },
        activityId: "$_id",
        type: "Create Answer",
        pollId: "$poll",
        date: "$creationDate",
        answer: "$answer",
        poll_question: {
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
  ]);
};

export const getUserLikedAnswerActivity = async (userId: ObjectId) => {
  return await Answer.aggregate([
    {
      $match: {
        $and: [{ "likes.userId": userId.toString() }, { isDisabled: false }],
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
      $lookup: {
        from: "users",
        localField: "creator",
        foreignField: "_id",
        as: "user_data",
      },
    },
    {
      $addFields: {
        like_data: {
          $filter: {
            input: "$likes",
            as: "like",
            cond: { $eq: ["$$like.userId", userId.toString()] },
          },
        },
        poll_question: {
          $reduce: {
            input: "$poll_data",
            initialValue: "",
            in: {
              $concat: ["$$value", "$$this.question"],
            },
          },
        },
        creator: {
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
    { $unwind: "$like_data" },
    {
      $project: {
        _id: 0,
        type: "Like Answer",
        creator: 1,
        answer: 1,
        pollId: "$poll",
        activityId: "$like_data._id",
        date: {
          $ifNull: ["$like_data.likedDate", "No date provided"],
        },
        poll_question: 1,
      },
    },
  ]);
};

export const getUserDisLikedAnswerActivity = async (userId: ObjectId) => {
  return await Answer.aggregate([
    {
      $match: {
        $and: [{ "dislikes.userId": userId.toString() }, { isDisabled: false }],
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
      $lookup: {
        from: "users",
        localField: "creator",
        foreignField: "_id",
        as: "user_data",
      },
    },
    {
      $addFields: {
        dislike_data: {
          $filter: {
            input: "$dislikes",
            as: "dislike",
            cond: { $eq: ["$$dislike.userId", userId.toString()] },
          },
        },
        poll_question: {
          $reduce: {
            input: "$poll_data",
            initialValue: "",
            in: {
              $concat: ["$$value", "$$this.question"],
            },
          },
        },
        creator: {
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
    { $unwind: "$dislike_data" },
    {
      $project: {
        _id: 0,
        type: "Dislike Answer",
        creator: 1,
        answer: 1,
        pollId: "$poll",
        activityId: "$dislike_data._id",
        date: {
          $ifNull: ["$dislike_data.disLikedDate", "No date provided"],
        },

        poll_question: 1,
      },
    },
  ]);
};

export const getUserMultipleChoiceAnswerActivity = async (userId: ObjectId) => {
  return await Answer.aggregate([
    {
      $match: {
        $and: [{ "multichoiceVotes.userId": userId }, { isDisabled: false }],
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
      $lookup: {
        from: "users",
        localField: "creator",
        foreignField: "_id",
        as: "user_data",
      },
    },
    {
      $addFields: {
        multiChoice_vote_data: {
          $filter: {
            input: "$multichoiceVotes",
            as: "vote",
            cond: { $eq: ["$$vote.userId", userId] },
          },
        },
        multiChoice_data: "$multichoice",
        poll_question: {
          $reduce: {
            input: "$poll_data",
            initialValue: "",
            in: {
              $concat: ["$$value", "$$this.question"],
            },
          },
        },
        creator: {
          $reduce: {
            input: "$user_data",
            initialValue: "",
            in: {
              $concat: ["$$value", "$$this.appid"],
            },
          },
        },
        type: "Multiple Choice Answer Vote",
        pollId: "$poll",
      },
    },
    { $unwind: "$multiChoice_vote_data" },
    {
      $addFields: {
        multiChoice_data: {
          $filter: {
            input: "$multiChoice_data",
            as: "multi",
            cond: {
              $eq: [
                { $toString: "$$multi._id" },
                "$multiChoice_vote_data.vote",
              ],
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        activityId: "$multiChoice_vote_data._id",
        date: {
          $ifNull: ["$multiChoice_vote_data.voteDate", "No date provided"],
        },
        poll_question: 1,
        creator: 1,
        type: 1,
        pollId: 1,
        answer: {
          $reduce: {
            input: "$multiChoice_data",
            initialValue: "",
            in: {
              $concat: ["$$value", "$$this.answerVal"],
            },
          },
        },
      },
    },
  ]);
};

export const getUserChatMssgActivity = async (userId: ObjectId) => {
  return await Chat.aggregate([
    {
      $match: {
        $and: [{ creator: userId }, { isDisabled: false }],
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
      $lookup: {
        from: "users",
        localField: "poll_data.creator",
        foreignField: "_id",
        as: "poll_creator_data",
      },
    },
    {
      $project: {
        _id: 0,
        date: "$creationDate",
        creator: {
          $reduce: {
            input: "$poll_creator_data",
            initialValue: "",
            in: {
              $concat: ["$$value", "$$this.appid"],
            },
          },
        },
        activityId: "$_id",
        type: "Create Chat Message",
        pollId: "$poll",
        poll_question: {
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
  ]);
};

export const getUserTags = async (userId: ObjectId) => {
  try {
    const topics = await Topic.aggregate([
      { $match: { creator: userId } },
      {
        $project: {
          _id: 0,
          activityId: "$_id",
          type: "Create Topic",
          date: "$creationDate",
          topic: "$topic",
        },
      },
    ]);

    const subTopics = await SubTopic.aggregate([
      { $match: { creator: userId } },
      {
        $lookup: {
          from: "topics",
          localField: "topic",
          foreignField: "_id",
          as: "topic_data",
        },
      },
      {
        $project: {
          _id: 0,
          activityId: "$_id",
          type: "Create SubTopic",
          date: "$creationDate",
          subTopic: "$subTopic",
          topic: {
            $reduce: {
              input: "$topic_data",
              initialValue: "",
              in: {
                $concat: ["$$value", "$$this.topic"],
              },
            },
          },
        },
      },
    ]);

    return [...topics, ...subTopics];
  } catch (err) {
    throw err;
  }
};

export const getUniqueAppId = async (email: string) => {
  let user_appid = email.split("@")[0];

  try {
    const existingUsers = await User.find(
      { appid: { $regex: user_appid, $options: "i" } },
      { appid: 1 }
    );

    if (existingUsers.length > 0) {
      const ids = existingUsers.map((item) => item.appid);
      user_appid = getUniqueAppName(ids, user_appid, 0);
    }

    return user_appid.toLowerCase().slice(0, 14);
  } catch (err) {
    throw err;
  }
};

const getUniqueAppName = (
  appidList: string[],
  appid: string,
  idNum: number
) => {
  const exactMatch = appidList.find((item) => item === appid);

  if (exactMatch) {
    getUniqueAppName(appidList, `${appid}_${idNum}`, idNum + 1);
  }

  return appid;
};
