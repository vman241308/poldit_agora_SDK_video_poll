import { ResolverMap } from "../../interfaces";
import Topic from "../../models/TopicModel";
import User from "../../models/UserModel";
import SubTopic from "../../models/SubTopicModel";
import { transformSubTopic, transformTopic } from "./shared";
import ITopic from "../../models/interfaces/topic";
import ISubTopic from "../../models/interfaces/subTopic";
import batchLoaders from "../loaders/dataLoaders";
import {
  getAlphabeticalList,
  getAlphabeticalList_reverse,
} from "../../globalFunctions";
import { moderateText } from "./shared/moderation";
import { isDuplicateSubTopic, isDuplicateTopic } from "./shared/poll";
import { Types } from "mongoose";
import Poll from "../../models/PollModel";
import { paginateData_cursor } from "./shared/pagination";

export const topicResolvers: ResolverMap = {
  Query: {
    topicWithCounts: async (parent, args, { dataLoaders }) => {
      try {
        return await Topic.aggregate([
          {
            $lookup: {
              from: "polls",
              let: { topic_id: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $or: [
                        { $eq: ["$topic", "$$topic_id"] },
                        { $in: ["$$topic_id", { $ifNull: ["$topics", []] }] },
                      ],
                    },
                    isDisabled: false,
                    parentPollId: { $exists: false }
                  },
                },
              ],
              as: "topic_polls",
            },
          },
          {
            $project: {
              topic: 1,
              numPolls: { $size: "$topic_polls" },
            },
          },
          {
            $sort: {
              topic: 1,
            },
          },
        ]);
      } catch (err) {
        throw err;
      }
    },
    topics: async (parent, args, { dataLoaders }) => {
      try {
        const topics = await Topic.find();

        const topicsWithData = await Promise.all(
          topics.map((topic) => {
            const transformed = transformTopic(
              topic,
              dataLoaders(["user", "subTopic"])
            );

            const numPolls = Poll.find({
              topic: topic._id,
              isDisabled: false,
            }).countDocuments();

            return { ...transformed, numPolls };
          })
        );

        return getAlphabeticalList(topicsWithData, "topic");
      } catch (err) {
        throw err;
      }
    },
    topicsWithContent: async (parent, { limit }, { dataLoaders }) => {
      try {
        return await Poll.aggregate([
          {
            $project: {
              topic: {
                $ifNull: ["$topic", "$topics"],
              },
            },
          },
          {
            $unwind: "$topic",
          },
          {
            $group: {
              _id: "$topic",
              numPolls: {
                $sum: 1,
              },
            },
          },
          {
            $match: {
              numPolls: {
                $gte: 5,
              },
            },
          },
          {
            $sort: {
              numPolls: -1,
            },
          },
          {
            $lookup: {
              from: "topics",
              localField: "_id",
              foreignField: "_id",
              as: "topic_data",
            },
          },
          {
            $unwind: "$topic_data",
          },
          {
            $project: {
              _id: 1,
              topic: "$topic_data.topic",
              image: "$topic_data.image",
              numPolls: 1,
            },
          },
        ]).limit(limit);
        // return await Poll.aggregate([
        //   {
        //     $group: {
        //       _id: "$topic",
        //       numPolls: {
        //         $count: {},
        //       },
        //     },
        //   },
        //   {
        //     $match: {
        //       $and: [
        //         {
        //           numPolls: {
        //             $gte: 5,
        //           },
        //         },
        //         {

        //         }
        //       ],
        //     },
        //   },
        //   {
        //     $sort: {
        //       numPolls: -1,
        //     },
        //   },
        //   {
        //     $lookup: {
        //       from: "topics",
        //       localField: "_id",
        //       foreignField: "_id",
        //       as: "topic_data",
        //     },
        //   },
        //   {
        //     $addFields: {
        //       topic: {
        //         $reduce: {
        //           input: "$topic_data",
        //           initialValue: "",
        //           in: {
        //             $concat: ["$$value", "$$this.topic"],
        //           },
        //         },
        //       },
        //       image: {
        //         $reduce: {
        //           input: "$topic_data",
        //           initialValue: "",
        //           in: {
        //             $concat: ["$$value", "$$this.image"],
        //           },
        //         },
        //       },
        //     },
        //   },
        //   {
        //     $project: {
        //       _id: 1,
        //       topic: 1,
        //       image: 1,
        //       numPolls: 1,
        //     },
        //   },
        // ]).limit(limit);
      } catch (err) {
        throw err;
      }
    },
    subTopics: async (parent, args, { dataLoaders }) => {
      try {
        const subTopics = await SubTopic.find();
        const subTopicsWithData = subTopics.map((subTopic) => {
          const numPolls = Poll.find({
            subTopics: subTopic._id,
            isDisabled: false,
          }).countDocuments();

          return {
            ...transformSubTopic(subTopic, dataLoaders(["user", "topic"])),
            numPolls,
          };
        });

        return getAlphabeticalList(subTopicsWithData, "subTopic");
      } catch (err) {
        throw err;
      }
    },
    subTopicsPerTopicWithCounts: async (parent, { topic }, { dataLoaders }) => {
      try {
        const polls = await Poll.find(
          {$and: [{parentPollId: { $exists: false }}, {isDisabled: false}, {$or: [{ topic }, { topics: topic }]}]},
          // parentPollId: { $exists: false }
          // { $or: [{ topic }, { topics: topic }] },
          { _id: 1, keywords: 1, subTopics: 1 }
        );

        const allSubtopics = polls.flatMap((poll) => poll.subTopics || []);
        // const allKeywords = polls.flatMap((poll) => poll.keywords || []);

        // const allSubTopicLabels = allSubtopics.map((subTopic) =>
        //   subTopic._id.toString()
        // );
        const subtopicNames = await SubTopic.find({
          _id: { $in: allSubtopics },
        });

        const subtopicNameMap = subtopicNames.reduce((map, subtopic) => {
          map[subtopic._id.toString()] = subtopic.subTopic;
          return map;
        }, {});

        // Count polls for each subtopic
        const subtopicCounts: { [subtopic: string]: number } =
          allSubtopics.reduce((counts, subtopic) => {
            const subtopicId = subtopic.toString();
            counts[subtopicId] = (counts[subtopicId] || 0) + 1;
            return counts;
          }, {});

        const subtopicWithCounts = subtopicNames
          .map((subtopic) => {
            const subtopicId = subtopic._id.toString();
            return {
              _id: subtopic._id,
              subTopic: subtopicNameMap[subtopicId],
              numPolls: subtopicCounts[subtopicId] || 0,
            };
          })
          .sort((a, b) => a.subTopic.localeCompare(b.subTopic));

        const topic_data = await Topic.findById(topic, { _id: 1, topic: 1 });

        return { topic: topic_data, subtopics: subtopicWithCounts };
      } catch (err) {
        throw err;
      }
    },
    subTopicsPerTopic: async (parent, { topic }, { dataLoaders }) => {
      const { batchsubTopics } = batchLoaders;

      try {
        const selectedTopic = await Topic.findOne({ topic });

        if (!selectedTopic) {
          const subTopics = await SubTopic.find();
          const subTopicData = subTopics.map((subTopic) =>
            transformSubTopic(subTopic, dataLoaders(["user", "topic", "poll"]))
          );

          return getAlphabeticalList(subTopicData, "subTopic");
        }

        const subTopicList = await batchsubTopics(selectedTopic.subTopics);

        const subTopicListData = subTopicList.map((subTopic) =>
          transformSubTopic(subTopic, dataLoaders(["user", "topic", "poll"]))
        );

        return getAlphabeticalList(subTopicListData, "subTopic");
      } catch (err) {
        throw err;
      }
    },

    subTopicsPerTopic_paginated: async (
      parent,
      { topic, cursor, limit },
      { dataLoaders }
    ) => {
      const { batchsubTopics } = batchLoaders;

      const noCursorOffset = !cursor ? 1 : 0;
      if (limit <= 0) {
        throw new Error("Cannot fetch records for negative or 0 limit");
      }

      try {
        const selectedTopic: ITopic = await Topic.findOne({ topic });

        if (!selectedTopic) {
          throw new Error("Please provide a topic to get subtopics");
        }

        if (selectedTopic.subTopics.length === 0) {
          return {
            cursor: "",
            data: [],
            hasMoreData: false,
          };
        }

        const subTopics = await SubTopic.find({
          topic: selectedTopic._id,
        }).sort({ subTopic: 1 });

        if (subTopics.length <= limit) {
          return {
            cursor: "",
            data: subTopics,
            hasMoreData: false,
          };
        }

        return paginateData_cursor(
          cursor,
          // noCursorOffset,
          limit,
          subTopics
          // getAlphabeticalList_reverse(subTopics, "subTopic")
        );
      } catch (err) {
        throw err;
      }

      // try {
      //   const selectedTopic = await Topic.findOne({ topic });

      //   if (!selectedTopic) {
      //     const subTopics = await SubTopic.find();

      //     const paginated_data = paginateData_cursor(
      //       cursor,
      //       noCursorOffset,
      //       limit,
      //       getAlphabeticalList(subTopics, "subTopic")
      //     );

      //     const subTopicData = paginated_data.data.map((subTopic) =>
      //       transformSubTopic(subTopic, dataLoaders(["user", "topic", "poll"]))
      //     );

      //     return {
      //       cursor: paginated_data.cursor,
      //       data: paginated_data.data,
      //       hasMoreData: paginated_data.hasMoreData,
      //     };
      //   }

      //   const subTopicList = await batchsubTopics(selectedTopic.subTopics);
      //   console.log(subTopicList)

      //   const subTopicListData = subTopicList.map((subTopic) =>
      //     transformSubTopic(subTopic, dataLoaders(["user", "topic", "poll"]))
      //   );

      //   return getAlphabeticalList(subTopicListData, "subTopic");
      // } catch (err) {
      //   throw err;
      // }
    },
  },
  Mutation: {
    createTopic: async (parent, { topicInfo }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["admin", "employee", "externalUser"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      const moderationResults = await moderateText(topicInfo);

      if (moderationResults && moderationResults.blockContent) {
        throw new Error(
          "Content contains inappropriate language.  Please update and resubmit."
        );
      }

      const topicObj = JSON.parse(topicInfo);

      const newTopic: ITopic = new Topic({
        ...topicObj,
        subTopics: [],
        creator: user.userId,
      });

      try {
        // existingTopic = await Topic.findOne({ topic: topicObj.topic });
        const existingTopic = await isDuplicateTopic(topicObj.topic);
        if (existingTopic) {
          throw new Error(
            "Topic already exists.  Please create a different topic."
          );
        }

        const savedTopic = await newTopic.save();
        const createdTopic = transformTopic(
          savedTopic,
          ctx.dataLoaders(["user", "subTopic"])
        );

        return { ...createdTopic, numPolls: 0 };
      } catch (err) {
        throw err;
      }
    },

    createSubTopic: async (parent, { subTopicInfo }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["admin", "employee", "externalUser"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      const moderationResults = await moderateText(subTopicInfo);

      if (moderationResults && moderationResults.blockContent) {
        throw new Error(
          "Content contains inappropriate language.  Please update and resubmit."
        );
      }

      const subTopicObj = JSON.parse(subTopicInfo);

      const newSubTopic: ISubTopic = new SubTopic({
        ...subTopicObj,
        creator: user.userId,
        polls: [],
      });

      try {
        const alreadyExists = await isDuplicateSubTopic(
          subTopicObj.subTopic,
          subTopicObj.topic
        );

        if (alreadyExists) {
          throw new Error(
            "SubTopic already exists.  Please create a different subtopic."
          );
        }

        const testMe = await Topic.updateOne(
          {
            _id: subTopicObj.topic,
          },
          { $push: { subTopics: new Types.ObjectId(newSubTopic._id) } }
        );

        const savedSubTopic = await newSubTopic.save();

        const createdSubTopic = transformSubTopic(
          savedSubTopic,
          ctx.dataLoaders(["user", "topic", "poll"])
        );

        return { ...createdSubTopic, numPolls: 0 };
      } catch (err) {
        throw err;
      }
    },

    addAreasOfInterest: async (parent, { details }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;
      const user = await isAuth(["admin", "employee", "externalUser"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      const detailIds = JSON.parse(details).map((x: any) => {
        return { topicId: Types.ObjectId(x.topicId) };
      });
      // const detailIds = JSON.parse(details).map((x) => {
      //   return {
      //     topicId: Types.ObjectId(x.topicId),
      //     topic: x.topic,
      //     subtopic: x.subtopic,
      //     subtopicId: Types.ObjectId(x.subtopicId),
      //   };
      // });

      try {
        await User.updateOne(
          { _id: Types.ObjectId(user.userId) },
          {
            $set: { topicsOfInterest: detailIds },
            // $set: { areasOfInterest: detailIds },
          }
        );

        return "Areas of Interest Updated!";
      } catch (err) {
        throw err;
      }
    },
  },
};
