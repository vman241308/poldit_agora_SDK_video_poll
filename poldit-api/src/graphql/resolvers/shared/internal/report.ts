import Answer from "../../../../models/answerModel";
import Poll from "../../../../models/PollModel";
import Chat from "../../../../models/chatModel";
import { ReportItem } from "../../../../interfaces";
import IAnswer from "../../../../models/interfaces/answer";
import { getNumRanking } from "../metrics";

// type ReportItem {
//     reportId: String
//     category: String
//     reporter: User
//     contentType: String
//     reportedDate: String
//     contentId: String
//     content: String
//     contentCreatedDate: String
//   }

export const getReportedAnswers = async () => {
  try {
    return await Answer.aggregate([
      { $match: { isReported: { $gt: { $size: 0 } } } },
      {
        $lookup: {
          from: "users",
          localField: "creator",
          foreignField: "_id",
          as: "creator_data",
        },
      },
      { $unwind: "$isReported" },
      {
        $lookup: {
          from: "users",
          localField: "isReported.userId",
          foreignField: "_id",
          as: "reporter_data",
        },
      },
      {
        $project: {
          _id: 0,
          reportId: "$isReported._id",
          category: "$isReported.category",
          reporter: {
            $reduce: {
              input: "$reporter_data",
              initialValue: "",
              in: {
                $concat: ["$$value", "$$this.appid"],
              },
            },
          },
          reportedDate: "$isReported.reportedDate",
          contentType: "Answer",
          content: "$answer",
          contentId: "$_id",
          contentCreator: {
            $reduce: {
              input: "$creator_data",
              initialValue: "",
              in: {
                $concat: ["$$value", "$$this.appid"],
              },
            },
          },
          contentCreatedDate: "$creationDate",
        },
      },
    ]);
  } catch (err) {
    throw err;
  }
};

export const getReportedChatMssgs = async () => {
  try {
    return await Chat.aggregate([
      { $match: { isReported: { $gt: { $size: 0 } } } },
      {
        $lookup: {
          from: "users",
          localField: "creator",
          foreignField: "_id",
          as: "creator_data",
        },
      },
      { $unwind: "$isReported" },
      {
        $lookup: {
          from: "users",
          localField: "isReported.userId",
          foreignField: "_id",
          as: "reporter_data",
        },
      },
      {
        $project: {
          _id: 0,
          reportId: "$isReported._id",
          category: "$isReported.category",
          reporter: {
            $reduce: {
              input: "$reporter_data",
              initialValue: "",
              in: {
                $concat: ["$$value", "$$this.appid"],
              },
            },
          },
          reportedDate: "$isReported.reportedDate",
          contentType: "Chat",
          content: "$message",
          contentId: "$_id",
          contentCreator: {
            $reduce: {
              input: "$creator_data",
              initialValue: "",
              in: {
                $concat: ["$$value", "$$this.appid"],
              },
            },
          },
          contentCreatedDate: "$creationDate",
        },
      },
    ]);
  } catch (err) {
    throw err;
  }
};

export const getReportedPolls = async () => {
  try {
    return await Poll.aggregate([
      { $match: { isReported: { $gt: { $size: 0 } } } },
      {
        $lookup: {
          from: "users",
          localField: "creator",
          foreignField: "_id",
          as: "creator_data",
        },
      },
      { $unwind: "$isReported" },
      {
        $lookup: {
          from: "users",
          localField: "isReported.userId",
          foreignField: "_id",
          as: "reporter_data",
        },
      },
      {
        $project: {
          _id: 0,
          reportId: "$isReported._id",
          category: "$isReported.category",
          reporter: {
            $reduce: {
              input: "$reporter_data",
              initialValue: "",
              in: {
                $concat: ["$$value", "$$this.appid"],
              },
            },
          },
          reportedDate: "$isReported.reportedDate",
          contentType: "Poll",
          content: "$question",
          contentId: "$_id",
          contentCreator: {
            $reduce: {
              input: "$creator_data",
              initialValue: "",
              in: {
                $concat: ["$$value", "$$this.appid"],
              },
            },
          },
          contentCreatedDate: "$creationDate",
        },
      },
    ]);
  } catch (err) {
    throw err;
  }
};

export const updateAnswerRanking = async (content: IAnswer) => {
  try {
    const answers: IAnswer[] = await Answer.find({
      $and: [{ poll: content.poll }, { isDisabled: false }],
    });

    const rankedAnswers = getNumRanking(answers);

    rankedAnswers.forEach(async (item) => {
      await Answer.updateOne(
        { _id: item._doc._id },
        {
          $set: { rank: String(item._doc.rank) },
        }
      );
    });
  } catch (err) {
    throw err;
  }
};
