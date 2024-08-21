import Answer from "../../../models/answerModel";
import SubTopic from "../../../models/SubTopicModel";
import Topic from "../../../models/TopicModel";
import Poll from "../../../models/PollModel";
import User from "../../../models/UserModel";
import IAnswer from "../../../models/interfaces/answer";
import { moderateText } from "./moderation";
import IPoll from "../../../models/interfaces/poll";
import { Types } from "mongoose";
// import pushNotification from "./notification";
import { transformDocument, transformPoll } from ".";
import { dateToString, removeSpecialChars } from "../../../globalFunctions";
import { isActive } from "./user";
import { RawDraftContentState } from "draft-js";
import { Node } from "slate";
import dataLoaders from "../../loaders";
import { SortBy } from "../../../interfaces";
import { AxiosResponse } from "axios";
import { CreateCompletionResponse } from "openai";
import { formatAiTxt } from "../../utils/useAI";
import { answersWithRankScore } from "./answer";
import { getNumRanking_multi } from "./metrics";

export const storeAiAnswer = async (aiRes: any, pollId: string) => {
  const aiAnswer_formatted = JSON.stringify(
    formatAiTxt(aiRes.data.choices[0].text)
  );
  // const topAnswer = aiRes.data.choices[0].text?.replace("\n", "");
  // const formattedAnswer = `[{"type":"paragraph","children":[{"text":"${topAnswer}"}]}]`;
  try {
    const aiUser = await User.findOne({ appid: "PolditAI" }, { _id: 1 });

    const answer: IAnswer = new Answer({
      creator: aiUser._id,
      // answer: aiRes,
      answer: aiAnswer_formatted,
      poll: pollId,
      multichoice: [],
      answerImage: "",
      isEditable: false,
      isRemoveable: false,
    });

    const savedAnswer = await answer.save();

    await Poll.findByIdAndUpdate(
      pollId,
      { $push: { answers: savedAnswer._id } },
      { new: true, upsert: true }
    );

    return savedAnswer;
  } catch (err) {
    throw err;
  }
};

export const generateAnswersByPollType = async (
  details: any,
  pollId: string,
  userId: string,
  ctx: any
) => {
  const multichoice: { answerVal: string }[] = details.answers.map((item) => {
    return { answerVal: item };
  });

  const pollAnswer = {
    creator: userId,
    answer: `multiChoice for poll ${pollId}`,
    poll: pollId,
    multichoice,
  };

  const answer: IAnswer = new Answer(pollAnswer);

  try {
    await Poll.findByIdAndUpdate(
      pollId,
      { $push: { answers: answer._id } },
      { new: true, upsert: true }
    );

    await answer.save();
  } catch (err) {
    throw err;
  }
};

interface DupAnswer {
  _id: string;
  answer: any;
  poll: string;
  answerImage?: string;
}

interface DupQuestion {
  _id: string;
  question: any;
}

export const isDuplicateAnswer = async (answerObj: DupAnswer) => {
  const { answer, poll, _id, answerImage } = answerObj;

  const answerTxt = removeSpecialChars(
    parseSlateRichContentForText(answer)
  ).trim();

  const answerMatch = await Answer.find(
    {
      $and: [{ $text: { $search: answerTxt } }, { poll: poll }],
    },
    { answer: 1, score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(3);

  if (answerMatch.length > 0 && answerMatch[0].answer === answer) {
    return { duplicate: true, similarItems: [] };
  } else if (answerMatch.length > 0 && answerMatch[0].answer !== answer) {
    return { duplicate: false, similarItems: answerMatch };
  } else {
    return { duplicate: false, similarItems: [] };
  }

  // console.log(answerMatch[0].answer === answer)
  // const answerMatch: any = await Answer.aggregate(
  //   [
  //     {
  //       $search: {
  //         index: "answer",
  //         text: {
  //           query: "This is a test message to update with more words.",
  //           path: {
  //             wildcard: "*",
  //           },
  //         },
  //       },
  //     },
  //   ],
  // );
  // const answerTxt =  JSON.stringify(removeSpecialChars(parseSlateRichContentForText(answer)).trim());

  // const answerMatch: IAnswer[] = await Answer.find({
  //   $and: [{ $text: { $search: answerTxt } }, { poll: poll }],
  // }, {score: {$meta: "textScore"}});

  // console.log({answerTxt})

  // const answerMatch: IAnswer[] = await Answer.find({
  //   $and: [
  //     { answer: { $regex: answerTxt, $options: "i" } },
  //     { poll: poll },
  //   ],
  // });

  // if (answerMatch.length > 0) {
  //   return true;
  // }
  // return false;
};

export const isDuplicateQuestion = async (pollObj: DupQuestion) => {
  const { question, _id } = pollObj;

  const questionTxt = removeSpecialChars(
    parseSlateRichContentForText(question)
  ).trim();

  const questionMatch = await Poll.find(
    {
      $text: { $search: questionTxt },
    },
    { question: 1, score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(3);

  if (questionMatch.length > 0 && questionMatch[0].answer === question) {
    return { duplicate: true, similarItems: [] };
  } else if (questionMatch.length > 0 && questionMatch[0].answer !== question) {
    return { duplicate: false, similarItems: questionMatch };
  } else {
    return { duplicate: false, similarItems: [] };
  }

  // const questionTxt = parseSlateRichContentForText(question);

  // const questionMatch: IPoll[] = await Poll.find({
  //   question: { $regex: questionTxt.trim(), $options: "i" },
  // });

  // if (questionMatch.length > 0) {
  //   return true;
  // }
  // return false;
};

export const maxUserAnswerReached = async (
  userId: string,
  pollId: string,
  max: number
) => {
  const userAnswerForPoll_count = await Answer.find({
    $and: [
      { creator: Types.ObjectId(userId) },
      { poll: Types.ObjectId(pollId) },
    ],
  }).countDocuments();

  if (userAnswerForPoll_count >= max) {
    return { answersLeft: 0, maxReached: true };
  }
  return { answersLeft: max - userAnswerForPoll_count, maxReached: false };
};

export const isDuplicateSubTopic = async (subTopic: string, topic: string) => {
  const regExpString = new RegExp(`^${subTopic}$`, "i"); //case insenstive search for value in DB
  const subTopicMatch = await SubTopic.find({
    subTopic: { $regex: regExpString },
    topic,
  });

  if (subTopicMatch.length > 0) {
    return true;
  }
  return false;
};

export const isDuplicateTopic = async (topic: string) => {
  const regExpString = new RegExp(`^${topic}$`, "i"); //case insenstive search for value in DB
  const topicMatch = await Topic.find({
    topic: { $regex: regExpString },
  });

  if (topicMatch.length > 0) {
    return true;
  }
  return false;
};

export const getMetricsForPoll = async (
  userId: string,
  polls: IPoll[],
  totalPolls: number,
  dataLoaders: any
) => {
  const pollsWithMetricsFull = polls.map((item) => {
    return {
      ...item,
      ...transformDocument(
        item,
        dataLoaders(["user", "topic", "topics", "answer", "subTopic"])
      ),
      totalPolls,
    };
    // return {
    //   ...item,
    //   ...transformPoll(
    //     item,
    //     dataLoader(["user", "topic", "subTopic", "answer", "chat"])
    //   ),
    //   _id: item._id,
    //   totalPolls,
    // };
  });

  // console.log(pollsWithMetricsFull);

  return await Promise.all(
    pollsWithMetricsFull.map(async (poll) => {
      // const answers = poll.answer_docs.map((x) => {
      //   if (x.answer.multichoice && x.answer.multichoice.length > 0) {
      //     const multiChoiceVotesWithRank = getNumRanking_multi(x.answer);

      //     x.answer.multichoice = multiChoiceVotesWithRank;
      //   }
      //   return {
      //     ...transformDocument(x.answer, dataLoaders(["user", "poll"])),
      //     rankScore: x.rankScore,
      //   };
      // });

      const answers = await poll.answers();

      const answerCount =
        poll.pollType === "multiChoice" && answers.length > 0
          ? answers[0].multichoice.length
          : poll.answerCount;

      // const chatMessages = await poll.chatMssgs();
      const creator = await poll.creator();

      const isMyPoll = userId === creator._id.toString();
      const active = await isActive(creator._id.toString());
      // answers.sort((a, b) => b.creationDate - a.creationDate);
      // chatMessages.sort((a, b) => b.creationDate - a.creationDate);

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

      return {
        ...poll,
        // answers: answers.sort((a, b) => b.rankScore - a.rankScore),
        answerCount,
        lastActivity: poll.lastActivity
          ? dateToString(poll.lastActivity)
          : null,
        // isMultipleChoice,
        isFavorite,
        isMyPoll,
        isActive: active,
      };
    })
  );
};

export const parseRichContentForText = (val: RawDraftContentState) => {
  const textContent = val.blocks.map((item) => item.text);

  return textContent.join(". ");
};

export const parseSlateRichContentForText = (val: string) => {
  const content = JSON.parse(val);
  return content
    .filter(
      (x: any) => !["image", "video"].includes(x.type) && Node.string(x) !== ""
    )
    .map((x) => Node.string(x))
    .join("");
};

export const parseSlateRichContentForAllText = (val: string) => {
  const content = JSON.parse(val);
  return content.map((x) => Node.string(x)).join("\n");
};

export const getPlainTxtByContentType = (val: string) => {
  if (val.startsWith('[{"type":')) {
    return parseSlateRichContentForText(val);
  } else if (val.search('{"blocks":') > -1) {
    return parseRichContentForText(JSON.parse(val));
  }
  return val;
};

export const pollData_forParent = async (
  pollId: string,
  sortBy: SortBy
  // loaders: any[]
) => {
  let sorter: any = { $sort: { creationDate: -1 } };

  if (sortBy === "mostLiked") {
    sorter = { $sort: { likesCount: -1 } };
  } else if (sortBy === "mostDisliked") {
    sorter = { $sort: { dislikesCount: -1 } };
  } else if (sortBy === "numAnswers") {
    sorter = { $sort: { answerCount: -1 } };
  }

  return await Poll.aggregate([
    {
      $match: {
        isDisabled: false,
        parentPollId: Types.ObjectId(pollId),
      },
    },
    {
      $lookup: {
        from: "answers",
        localField: "answers",
        foreignField: "_id",
        as: "answers_data",
      },
    },
    { $addFields: { firstAnswer: { $arrayElemAt: ["$answers_data", 0] } } },
    {
      $addFields: {
        answerCount: {
          $switch: {
            branches: [
              {
                case: {
                  $and: [
                    {
                      $gt: [
                        {
                          $size: { $ifNull: ["$firstAnswer.multichoice", []] },
                        },
                        0,
                      ],
                    },
                  ],
                },
                then: { $size: "$firstAnswer.multichoice" },
              },
            ],
            default: { $size: "$answers" },
          },
        },
        likesCount: { $size: { $ifNull: ["$likes", []] } },
        dislikesCount: { $size: { $ifNull: ["$dislikes", []] } },
      },
    },
    { ...sorter },
    // { $sort: { creationDate: -1 } },
  ]);

  // return polls.map((x) => transformDocument(x, loaders));
};
export const paginateChildPolls = (
  polls: IPoll[],
  cursor: string,
  limit: number
) => {
  let newCursorIdx = limit;
  let newCursor = "";
  let offset = 0;
  let endOffset = 0;

  if (!cursor && polls.length > limit) {
    newCursor = polls[limit - 1]._id.toString();
  } else if (!cursor && polls.length < limit) {
    newCursor = "";
    newCursorIdx = polls.length;
  } else {
    const prevCursorIdx = polls.findIndex((x) => x._id.toString() === cursor);
    newCursorIdx = prevCursorIdx + limit;
    if (newCursorIdx > polls.length) {
      newCursor = "";
    } else {
      newCursor = polls[newCursorIdx]._id.toString();
    }
    offset = prevCursorIdx + 1;
    endOffset = 1;
  }

  const childPolls = polls.slice(offset, newCursorIdx + endOffset);

  return {
    cursor: newCursor,
    content: childPolls,
    hasMoreData: childPolls.length === limit,
  };
};

export const getFullQuestionDetails = async (content: any) => {
  try {
    const question = await Poll.aggregate([
      {
        $match: {
          isDisabled: false,
          _id: Types.ObjectId(content._id),
        },
      },
      {
        $addFields: {
          answerCount: { $size: "$answers" },
          likesCount: { $size: { $ifNull: ["$likes", []] } },
          dislikesCount: { $size: { $ifNull: ["$dislikes", []] } },
        },
      },
    ]);

    return await transformDocument(question[0], dataLoaders(["user"]));
  } catch (err) {
    throw err;
  }
};

export const getPollQuestion = async (pollId: string) => {
  try {
    const poll = await Poll.findById(pollId);

    const pollData = await transformDocument(
      poll,
      dataLoaders(["topic", "topics", "subTopic"])
    );

    return {
      ...pollData._doc,
      topic: await pollData.topic(),
      topics: await pollData.topics(),
      subTopics: await pollData.subTopics(),
    };
  } catch (err) {
    throw err;
  }
};

export const pollData_withLastActivity = async (
  offset: number,
  limit: number,
  queryType: string,
  // queryType:
  //   | "trending polls"
  //   | "active chats"
  //   | "newest polls"
  //   | "favorite polls"
  //   | "user polls"
  //   | "all polls by tag"
  //   | "polls by specific tag"
  //   | "specific poll",
  favIds?: any,
  userId?: string,
  tag?: string,
  pollId?: string
) => {
  const { addFields, matchProps, pollSorter } = getMatchProps(
    queryType,
    favIds ?? [],
    userId ?? "",
    tag ?? "",
    pollId ?? ""
  );

  return await Poll.aggregate([
    { ...matchProps },
    {
      $lookup: {
        from: "answers",
        localField: "answers",
        foreignField: "_id",
        as: "answer_docs",
      },
    },
    {
      $lookup: {
        from: "chats",
        localField: "chatMssgs",
        foreignField: "_id",
        as: "chat_docs",
      },
    },
    {
      $addFields: {
        // answer_docs: answersWithRankScore,
        chatMssgsCount: {
          $size: {
            $ifNull: ["$chatMssgs", []],
          },
        },
        answerCount: {
          $size: {
            $ifNull: ["$answer_docs", []],
          },
        },
        isMultipleChoice: {
          $eq: ["$pollType", "multiChoice"],
        },
        likeData: {
          $reduce: {
            input: "$answer_docs.likes.likedDate",
            initialValue: [],
            in: {
              $concatArrays: ["$$value", "$$this"],
            },
          },
        },
        dislikeData: {
          $reduce: {
            input: "$answer_docs.dislikes.disLikedDate",
            initialValue: [],
            in: {
              $concatArrays: ["$$value", "$$this"],
            },
          },
        },
        multiChoiceData: {
          $reduce: {
            input: "$answer_docs.multichoiceVotes.voteDate",
            initialValue: [],
            in: { $concatArrays: ["$$value", "$$this"] },
          },
        },
      },
    },
    {
      $addFields: {
        ...addFields,
        lastActivity: {
          $ifNull: [
            {
              $max: {
                $concatArrays: [
                  "$answer_docs.creationDate",
                  "$chat_docs.creationDate",
                  "$likeData",
                  "$dislikeData",
                  "$multiChoiceData",
                ],
              },
            },
            "$creationDate",
          ],
        },
        // recentActivity: {
        //   $max: ["$creationDate", { $ifNull: ["$lastActivity", ] }],
        // },
      },
    },
    { ...pollSorter },
  ])
    .skip(offset)
    .limit(limit);
};

const getMatchProps = (
  queryType: string,
  favIds?: any,
  userId?: string,
  tag?: string,
  pollId?: string
) => {
  let addFields = {};
  let pollSorter: any = { $sort: { lastActivity: -1 } };
  let matchProps: any = {
    $match: {
      $and: [
        {
          isDisabled: false,
        },
        {
          parentPollId: { $exists: false },
        },
        {
          $or: [
            {
              "answers.0": {
                $exists: true,
              },
            },
            {
              "chatMssgs.0": {
                $exists: true,
              },
            },
          ],
        },
      ],
    },
  };

  switch (true) {
    case queryType === "trending polls":
      addFields = {
        totalCount: {
          $add: [
            "$chatMssgsCount",
            "$answerCount",
            {
              $size: {
                $ifNull: ["$likeData", []],
              },
            },
            {
              $size: {
                $ifNull: ["$dislikeData", []],
              },
            },
            {
              $size: {
                $ifNull: ["$multiChoiceData", []],
              },
            },
          ],
        },
      };
      pollSorter = {
        $sort: { totalCount: -1 },
      };
      break;
    case queryType === "trending polls by tag":
      matchProps = {
        $match: {
          $and: [
            { isDisabled: false },
            {
              $or: [
                { topic: Types.ObjectId(tag) },
                { subTopics: Types.ObjectId(tag) },
              ],
            },
          ],
        },
      };
      addFields = {
        totalCount: {
          $add: [
            "$chatMssgsCount",
            "$answerCount",
            {
              $size: {
                $ifNull: ["$likeData", []],
              },
            },
            {
              $size: {
                $ifNull: ["$dislikeData", []],
              },
            },
            {
              $size: {
                $ifNull: ["$multiChoiceData", []],
              },
            },
          ],
        },
      };
      pollSorter = {
        $sort: { totalCount: -1 },
      };
      break;
    case queryType === "active chats":
      matchProps = {
        $match: {
          $and: [
            {
              isDisabled: false,
            },
            {
              "chatMssgs.0": {
                $exists: true,
              },
            },
          ],
        },
      };
      addFields = {
        latestChat: {
          $max: "$chat_docs.creationDate",
        },
      };
      pollSorter = {
        $sort: { latestChat: -1 },
      };
      break;
    case queryType === "newest polls":
      matchProps = {
        $match: {
          $and: [
            { isDisabled: false },
            {
              parentPollId: { $exists: false },
            },
            { pollType: { $ne: "videoPoll" } },
          ],
        },
      };
      pollSorter = { $sort: { creationDate: -1 } };
      break;
    case queryType === "favorite polls":
      matchProps = {
        $match: {
          $and: [
            { _id: { $in: favIds } },
            { isDisabled: false },
            {
              parentPollId: { $exists: false },
            },
          ],
        },
      };
      pollSorter = { $sort: { creationDate: -1 } };
      break;
    case queryType === "user polls":
      matchProps = {
        $match: {
          $and: [
            { creator: Types.ObjectId(userId) },
            { isDisabled: false },
            {
              parentPollId: { $exists: false },
            },
          ],
        },
      };
      pollSorter = { $sort: { creationDate: -1 } };
      break;
    case queryType === "all polls by tag":
      matchProps = {
        $match: {
          $and: [
            { isDisabled: false },
            {
              parentPollId: { $exists: false },
            },
            { pollType: { $ne: "videoPoll" } },
          ],
        },
      };
      pollSorter = { $sort: { creationDate: -1 } };
      break;

    case queryType === "polls by specific tag":
      matchProps = {
        $match: {
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
        },
      };
      pollSorter = { $sort: { creationDate: -1 } };
      break;

    case queryType === "newest polls by specific tag":
      matchProps = {
        $match: {
          $and: [
            { isDisabled: false },
            {
              parentPollId: { $exists: false },
            },
            { pollType: { $ne: "videoPoll" } },
            {
              $or: [
                { topic: Types.ObjectId(tag) },
                { subTopics: Types.ObjectId(tag) },
              ],
            },
          ],
        },
      };
      pollSorter = { $sort: { creationDate: -1 } };
      break;
    case queryType === "recent activity by specific tag":
      matchProps = {
        $match: {
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
        },
      };
      break;
    case queryType === "recent activity":
      matchProps = {
        $match: {
          $and: [
            { isDisabled: false },
            {
              parentPollId: { $exists: false },
            },
            // { pollType: { $ne: "videoPoll" } },
          ],
        },
      };
      break;
    case queryType === "specific poll":
      matchProps = { $match: { _id: Types.ObjectId(pollId) } };
      break;
  }

  return { addFields, matchProps, pollSorter };
};

export const getActivityCategory = (activityType: string, topic: string) => {
  switch (activityType) {
    case "newest":
      return topic ? "newest polls by specific tag" : "newest polls";
    case "recent":
      return topic ? "recent activity by specific tag" : "recent activity";
    default:
      return "";
  }
};
