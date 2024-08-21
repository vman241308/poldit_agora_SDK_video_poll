import { Types } from "mongoose";
import { transformAnswer } from ".";
import Answer from "../../../models/answerModel";
import dataLoaders from "../../loaders";

export const getFullAnswerDetails = async (content: any) => {
  try {
    const answerDetails = await Answer.findById(content._id);

    const finalDetails = await transformAnswer(
      answerDetails,
      dataLoaders(["user", "poll"])
    );

    if (content.multichoice) {
      return { ...finalDetails, multichoice: content.multichoice };
    } else return finalDetails;
  } catch (err) {
    throw err;
  }
};

export const getAnswersByFilter = async (
  pollId: string,
  filterType: "rank" | "mostLiked" | "mostDisliked" | "newest"
) => {
  let sortCriteria = {};

  switch (filterType) {
    case "rank":
      sortCriteria = { $sort: { rank: 1 } };
      break;
    case "mostLiked":
      sortCriteria = { $sort: { totalLikes: -1 } };
      break;
    case "mostDisliked":
      sortCriteria = { $sort: { totalDislikes: -1 } };

      break;
    default:
      sortCriteria = { $sort: { creationDate: -1 } };
      break;
  }

  try {
    return await Answer.aggregate([
      {
        $match: {
          isDisabled: false,
          poll: Types.ObjectId(pollId),
        },
      },
      {
        $addFields: {
          totalLikes: { $size: { $ifNull: ["$likes", []] } },
          totalDislikes: { $size: { $ifNull: ["$dislikes", []] } },
        },
      },
      {
        ...sortCriteria,
      },
    ]);
  } catch (err) {
    throw err;
  }
};

export const answersWithRankScore = {
  $map: {
    input: "$answer_docs",
    as: "answer",
    in: {
      answer: "$$answer",
      rankScore: {
        $switch: {
          branches: [
            {
              case: {
                $and: [
                  {
                    $ne: [
                      "$$answer.creator",
                      Types.ObjectId("63a1e2342e34a062fc2e42cf"), //PolditBot
                    ],
                  },
                  {
                    $eq: ["$$answer.rank", "Not Ranked"],
                  },
                ],
              },
              then: 0,
            },
            {
              case: {
                $and: [
                  {
                    $eq: [
                      "$$answer.creator",
                      Types.ObjectId("63a1e2342e34a062fc2e42cf"), //PolditBot
                    ],
                  },
                  {
                    $eq: ["$$answer.rank", "Not Ranked"],
                  },
                ],
              },
              then: 0.5,
            },
          ],
          default: { $toDouble: "$$answer.rank" },
        },
      },
    },
  },
};
