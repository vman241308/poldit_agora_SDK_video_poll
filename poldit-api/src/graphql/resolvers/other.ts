import { ResolverMap } from "../../interfaces";
import {
  transformPoll,
  transformAnswer,
  transformTopic,
  transformSubTopic,
  transformNotification,
  transformArea,
  transformUser,
  transformDocument,
  getLoader,
} from "./shared";
import Poll from "../../models/PollModel";
import ChatMssg from "../../models/chatModel";
import User from "../../models/UserModel";
import Answer from "../../models/answerModel";
import AreaKnowledge from "../../models/areaKnowledge";
import Topic from "../../models/TopicModel";
import SubTopic from "../../models/SubTopicModel";
import configs from "../../endpoints.config";
import axios from "axios";
import IareaKnowledge from "../../models/interfaces/areaKnowledge";
import IUser from "../../models/interfaces/user";
import { convertWordsToUpper } from "../../globalFunctions";
import { moderateText } from "./shared/moderation";
import ContactUs from "../../models/contactUsModel";
import { sendContactUsEmail } from "../utils/autoEmails";
import loaders from "../loaders/dataLoaders";
import * as cheerio from "cheerio";
import { getMetaTags } from "../utils/meta";
import { isDuplicateAreaOfKnowledge } from "./shared/user";
import { Types } from "mongoose";
import {
  RtcTokenBuilder,
  RtmTokenBuilder,
  RtcRole,
  RtmRole,
} from "agora-access-token";
import {
  getAgoraResource,
  startCloudRecording,
  stopCloudRecording,
} from "../utils/livestream";
import TopicModel from "../../models/TopicModel";
import { generateAiTags } from "../utils/useAI";
import { pubsub } from "../..";
import { createPoll_notification } from "./shared/notification";
import { parseSlateRichContentForText } from "./shared/poll";
import IPoll from "../../models/interfaces/poll";
import IComposition, { IUidStatus } from "../../models/interfaces/composition";

const encodedCredential = `Basic ${Buffer.from(
  configs.agoraCustomerCredential
).toString("base64")}`;

const { batchUsers } = loaders;

export const otherResolvers: ResolverMap = {
  Query: {
    statesUS: async (parent, args, ctx) => {
      const response = await axios.get(
        `https://v3.openstates.org/jurisdictions?classification=state&apikey=${configs.StatesAPIKey}`
      );
      if (response.data.results) {
        return response.data.results;
      }
    },
    getSpecificContent: async (parent, { _id, contentType }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;
      const user = await isAuth(["admin", "employee", "externalUser"]);

      if (!user) {
        throw new Error("Please log in to see profile content!");
      }

      let ModelDoc;
      let loaders: string[] = [];
      if (contentType === "chat") {
        ModelDoc = ChatMssg;
        loaders = ["user", "poll"];
      } else if (contentType === "answer") {
        ModelDoc = Answer;
        loaders = ["user", "poll"];
      } else {
        ModelDoc = Poll;
        loaders = ["user", "answer"];
      }

      try {
        const data = await ModelDoc.findById(_id);

        const finalData = await transformDocument(data, dataLoaders(loaders));

        return {
          contentId: _id,
          contentType,
          content: {
            ...finalData._doc,
            creator: await finalData.creator(),
            answers: await finalData.answers(),
          },
        };
      } catch (err) {
        throw err;
      }
    },

    searchAll: async (parent, args, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const { searchVal = null, page = 1, limit = 20 } = args;

      // let searchQuery = {};

      const models = [
        {
          searchParam: "question",
          model: Poll,
          transform: transformPoll,
          loaders: ["user", "topic", "subTopic", "answer", "chat"],
        },
        {
          searchParam: "answer",
          model: Answer,
          transform: transformAnswer,
          loaders: ["user", "poll"],
        },
        {
          searchParam: "topic",
          model: Topic,
          transform: transformTopic,
          loaders: ["user", "subTopic"],
        },
        {
          searchParam: "subTopic",
          model: SubTopic,
          transform: transformSubTopic,
          loaders: ["user", "topic", "poll"],
        },
        {
          searchParam: "user",
          model: User,
          transform: transformUser,
          loaders: ["poll"],
        },
      ];

      try {
        const searchResults: { [key: string]: any } = {};

        for (let i = 0; i < models.length; i++) {
          const { searchParam, model, transform, loaders } = models[i];

          const finalSearchParam =
            searchParam === "user" ? "appid" : searchParam;

          const searchQuery = {
            $and: [
              { [finalSearchParam]: { $regex: searchVal, $options: "i" } },
              { isDisabled: false },
            ],
          };

          const resp = await model
            .find(searchQuery)
            .limit(limit)
            .skip((page - 1) * limit);

          const count = await model.countDocuments(searchQuery);

          const respData = await Promise.all(
            resp.map(async (item) => {
              if (
                finalSearchParam === "topic" ||
                finalSearchParam === "subTopic"
              ) {
                const trueSearchParam =
                  finalSearchParam === "subTopic"
                    ? `${finalSearchParam}s`
                    : finalSearchParam;

                const pollCount = await Poll.where({
                  [trueSearchParam]: { $in: [item._id] },
                }).countDocuments();

                item._doc.pollCount = pollCount;
              }

              return transform(item, dataLoaders(loaders));
            })
          );

          searchResults[searchParam] = {
            [searchParam]: respData,
            count,
          };
        }

        const updatedAnswers = await Promise.all(
          searchResults.answer.answer.map(async (item) => {
            // const poll = await item.poll();
            return {
              ...item,
              poll: transformPoll(
                item.poll,
                dataLoaders(["user", "topic", "subTopic", "answer", "chat"])
              ),
            };
          })
        );

        searchResults["answer"]["answer"] = updatedAnswers;

        return searchResults;
      } catch (err) {
        throw err;
      }
    },
    areasOfKnowledge: async (_, __, { dataLoaders, isAuth }) => {
      const curUserData = await isAuth(["everyone"]);
      const { userId } = curUserData;

      try {
        const knowledgeAreas: IareaKnowledge[] = await AreaKnowledge.find(
          {}
        ).sort({ areaKnowledge: 1 });
        return knowledgeAreas.map((item) =>
          transformArea(item, dataLoaders(["user"]))
        );
      } catch (err) {
        throw err;
      }
    },
    getLinkMetaData: async (_, { link }, { isAuth }) => {
      try {
        const resp: any = await axios.get(link);
        const $ = cheerio.load(resp.data);

        return {
          title: $("title").text(),
          favicon: $('link[rel="shortcut icon"]').attr("href"),
          description: getMetaTags(resp.data as string, "description"),
          image: getMetaTags(resp.data as string, "image"),
          datePublished: $("time:first").attr("datetime"),
        };
      } catch (err) {
        throw err;
      }
    },
    getRealTimeKey: async (_, __, { isAuth }) => {
      const user = await isAuth(["externalUser"]);

      if (!user) {
        throw new Error("UnAuthorized Access !");
      }
      return configs.ablyKey;
    },
    getStreamKeys: async (_, { channel, isPublisher }, { isAuth }) => {
      const user = await isAuth(["externalUser"]);

      if (!user) {
        throw new Error("UnAuthorized Access !");
      }
      const { agoraAppCert, agoraAppId } = configs;
      const role = isPublisher ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
      const expirationTimeInSeconds = 60 * 60 * 5;
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

      const token = RtcTokenBuilder.buildTokenWithUid(
        agoraAppId,
        agoraAppCert,
        channel,
        0,
        role,
        privilegeExpiredTs
      );

      return {
        token,
        appId: agoraAppId,
      };
    },
    testAi: async (_, { question }, { isAuth }) => {
      try {
        const topics = (await TopicModel.distinct("topic")).join(",");
        return await generateAiTags("", topics, question);
      } catch (err) {
        throw err;
      }
    },
    liveStreamComplete: async (_, { pollId, userId }, { isAuth }) => {
      try {
        const creator = await User.findById(userId);
        if (!creator) {
          throw new Error("User not found");
        }
        const poll = await Poll.findById(pollId);
        const pollTxt: string = parseSlateRichContentForText(poll.question);
        const pollTxtSubject: string =
          pollTxt.length > 90 ? pollTxt.substring(0, 90) + "..." : pollTxt;

        createPoll_notification(
          creator,
          pollTxt,
          pollId,
          pubsub,
          [],
          `${creator.appid} finished livestreaming.  The full livestream video will be available shortly.`,
          pollTxtSubject,
          false
        );

        return "Livestream complete";
      } catch (err) {
        throw err;
      }
    },
    getLiveStreamUser: async (_, { liveStreamId, pollId }, { isAuth }) => {
      const user = await isAuth(["externalUser"]);

      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        const resp = await Poll.aggregate([
          { $match: { _id: Types.ObjectId(pollId) } },
          { $unwind: "$userActions" },
          { $unwind: "$userActions.uidStatus" },
          { $match: { "userActions.uidStatus.uid": liveStreamId } },
          {
            $project: {
              userId: "$userActions.userId",
              _id: 0,
              mediaType: "$userActions.uidStatus.type",
            },
          },
        ]);

        if (resp) {
          return resp[0];
        }
      } catch (err) {
        throw err;
      }
    },
  },
  Mutation: {
    addAreaOfKnowledge: async (_, { area }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;
      const user = await isAuth(["admin", "employee", "externalUser"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      const moderationResults = await moderateText(area);

      if (moderationResults && moderationResults.blockContent) {
        throw new Error(
          "Content contains inappropriate language.  Please update and resubmit."
        );
      }

      try {
        const alreadyExists = await isDuplicateAreaOfKnowledge(area);

        if (alreadyExists) {
          throw new Error(
            "Area already exists.  Please create a different subtopic."
          );
        }

        const newArea = new AreaKnowledge({
          areaKnowledge: convertWordsToUpper(area),
          creator: user.userId,
        });

        const savedArea = await newArea.save();

        await User.findOneAndUpdate(
          { _id: user.userId },
          {
            $push: {
              areasOfKnowledge: [
                { upVotes: [], downVotes: [], areaKnowledgeId: savedArea._id },
              ],
            },
          }
        );

        return transformArea(savedArea, dataLoaders(["user"]));
      } catch (err) {
        throw err;
      }
    },
    removeAreaOfKnowledge: async (_, { areaId }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["admin", "externalUser"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        await AreaKnowledge.findByIdAndDelete(areaId);
        return "area deleted";
      } catch (err) {
        throw err;
      }
    },
    contactUs: async (_, { details }, ctx) => {
      const detailObj = JSON.parse(details);
      const moderationResults = await moderateText(detailObj.mssg);

      if (moderationResults && moderationResults.blockContent) {
        throw new Error(
          "Content contains inappropriate language.  Please update and resubmit."
        );
      }

      const contactMssg = new ContactUs({ ...detailObj });

      try {
        await contactMssg.save();
        sendContactUsEmail(detailObj)
          .then((res) => {
            console.log("Contact Us email sent successfully", res);
          })
          .catch((err) => {
            console.log("something went wrong with Contact Us email ...", err);
          });

        return "Message Submitted";
      } catch (err) {
        throw err;
      }
    },
    startLiveStreamRecording: async (_, { channelId, userId, token }, ctx) => {
      const storageConfig = {
        ...configs.storageOptions,
        fileNamePrefix: ["videoPolls", userId, channelId],
      };

      try {
        const resource = await getAgoraResource(channelId);

        if (resource) {
          return await startCloudRecording(resource, userId, channelId, token);
        }
      } catch (err) {
        console.log((err as any).response.data);
      }
    },
    stopLiveStreamRecording: async (_, { channelId, resourceId, sid }, ctx) => {
      try {
        return await stopCloudRecording(channelId, resourceId, sid);
      } catch (err) {
        console.log("stop recording error", (err as any).response.data);
        throw err;
      }
    },
    embedTags: async (_, { details }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;
      const user = await isAuth(["admin", "externalUser"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      const detailObj = JSON.parse(details);
      const topic_ids = detailObj.topic_ids.map((id) => Types.ObjectId(id));

      // const topic_id = Types.ObjectId(topic);
      // const subtopic_ids = subtopics.map((x: string) => Types.ObjectId(x));

      try {
        const poll = await Poll.findById(detailObj.pollid);

        if (!poll) {
          throw new Error("Poll not found!");
        }

        poll.topics = topic_ids;
        poll.keywords = detailObj.subtopics;
        await poll.save();

        pubsub.publish("updateQuestion", {
          _id: poll._id,
        });
      } catch (err) {
        throw err;
      }
    },

    startCompositionVideo: async (_, { channelName, fileList }, ctx) => {
      const poll: IPoll = await Poll.findById(channelName);
      const users = poll?.userActions;

      const compositionParameter: any = [];
      const jsonFileList = JSON.parse(fileList);

      try {
        await Promise.all(
          users.map(async (user: any) => {
            const userInfo = await User.findById(user.userId);

            const tempParameter: IComposition = {
              uid: "",
              webcamVideoURL: [],
              screenVideoURL: [],
              webcamAudioURL: [],
              screenAudioURL: [],
              audioChanges: [],
              videoChanges: [],
              avatarURL: userInfo.profilePic,
              userName: userInfo.appid,
              role: poll.creator == user.userId ? "Host" : "Panel",
              firstName: userInfo.firstname,
              lastName: userInfo.lastname,
            };

            await Promise.all(
              await jsonFileList.map((ListOne: any) => {
                user.uidStatus.map(async (userOneUidStatus: any) => {
                  if (ListOne.uid === userOneUidStatus.uid) {
                    tempParameter.uid = userOneUidStatus.uid;

                    poll.audioChanges.forEach((audioOne) => {
                      if (audioOne.streamUid == userOneUidStatus.uid) {
                        tempParameter.audioChanges.push(audioOne);
                      }
                    });

                    poll.videoChanges.forEach((videoOne) => {
                      if (videoOne.streamUid == userOneUidStatus.uid) {
                        tempParameter.videoChanges.push(videoOne);
                      }
                    });

                    const wholeURL = configs.S3BucketUrl + ListOne.fileName;
                    if (ListOne.trackType === "video") {
                      if (userOneUidStatus.type === "video") {
                        tempParameter.webcamVideoURL.push(wholeURL);
                      } else {
                        tempParameter.screenVideoURL.push(wholeURL);
                      }
                    } else {
                      if (userOneUidStatus.type === "video") {
                        tempParameter.webcamAudioURL.push(wholeURL);
                      } else {
                        tempParameter.screenAudioURL.push(wholeURL);
                      }
                    }
                  }
                });
              })
            );
            compositionParameter.push(tempParameter);
          })
        );

        compositionParameter.push({
          creatorUserId: poll.creator,
          pollId: channelName,
          recordingStartTime: poll.recordingTime[0],
          recordingEndTime: poll.recordingTime[poll.recordingTime.length - 1],
        });

        await axios.post(configs.CompositionServerUrl, compositionParameter, {
          headers: {
            "Content-Type": "application/json;charset=utf-8",
            // Authorization: encodedCredential,
          },
        });

        // const cloundFrontURL = await axios.post(
        //   configs.CompositionServerUrl,
        //   compositionParameter,
        //   {
        //     headers: {
        //       "Content-Type": "application/json;charset=utf-8",
        //       Authorization: encodedCredential,
        //     },
        //   }
        // );

        return "Success";

        // await Poll.updateOne(
        //   {
        //     _id: channelName,
        //   },
        //   {
        //     $set: {
        //       cloundFrontURL: cloundFrontURL,
        //     },
        //   }
        // );

        // return "Success";
      } catch (err) {
        throw err;
      }
    },
    storeVideoUrl: async (_, { details }, ctx) => {
      const detailObj = JSON.parse(details);
      console.log(detailObj);
      try {
        await Poll.updateOne(
          { _id: detailObj.pollId },
          {
            $set: {
              cloudFrontURL: detailObj.url,
            },
          }
        );

        return "LiveStream composite video complete";
      } catch (err) {
        throw err;
      }

      // try {
      // } catch (err) {
      //   throw err;
      // }
    },
    moderateContent: async (_, { content, id }, ctx) => {
      try {
        const { data } = await axios.post(
          "https://apis.activefence.com/v3/content/text",
          {
            text: content,
            content_id: id,
            // callback_url: `https://api1.poldit.com`,
          },
          {
            headers: {
              "af-api-key": configs.activeFenceKey as string,
            },
          }
        );

        console.log(data);
      } catch (err) {}
    },

    addUidUserId: async (_, { channelName, uid, clientType, userId }, ctx) => {
      const uidStatus: IUidStatus = {
        uid: uid,
        type: clientType,
      };

      // let existingCounter = 0;

      try {
        const poll: IPoll = await Poll.findById(channelName);

        if (poll) {
          let userActionFound = false;
          poll.userActions = poll.userActions.map((action) => {
            if (action.userId === userId) {
              userActionFound = true;
              const existingIdx = action.uidStatus.findIndex(
                (status) => status.type === clientType
              );

              if (existingIdx !== -1) {
                action.uidStatus[existingIdx] = uidStatus;
              } else {
                action.uidStatus.push(uidStatus);
              }
            }

            return action;
          });

          if (!userActionFound) {
            poll.userActions.push({ userId, uidStatus: [uidStatus] });
          }

          await Poll.updateOne(
            { _id: channelName },
            { $set: { userActions: poll.userActions } }
          );
          return "Success adding uid & userId";
        }
      } catch (err) {
        throw err;
      }

      // poll.userActions.map(async (userAction) => {
      //   if (userAction.userId === userId) {
      //     existingCounter = 1;
      //     userAction.uidStatus.push(uidStatus);
      //     await poll.save();
      //   }
      // });

      // if (existingCounter !== 1) {
      //   try {
      //     await Poll.updateOne(
      //       { _id: channelName },
      //       {
      //         $push: {
      //           userActions: {
      //             uidStatus: uidStatus,
      //             userId: userId,
      //           },
      //         },
      //       }
      //     );
      //   } catch (err) {
      //     throw err;
      //   }
      // }
    },
  },

  // Subscription: {
  //   newNotification: {
  //     subscribe: (parent, args, { pubsub }) => {
  //       pubsub.asyncIterator("newNotification");
  //     },
  //   },
  // },
};
