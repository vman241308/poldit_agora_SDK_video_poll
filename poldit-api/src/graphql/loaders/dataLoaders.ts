import InternalUsers from "../../models/internalUsersModel";
import Notification from "../../models/notificationModel";
import IinternalUsers from "../../models/interfaces/internalUser";
import INotification from "../../models/interfaces/notification";
import IPoll from "../../models/interfaces/poll";
import IUser from "../../models/interfaces/user";
import IChat from "../../models/interfaces/chat";
import ITopic from "../../models/interfaces/topic";
import IAnswer from "../../models/interfaces/answer";
import User from "../../models/UserModel";
import Poll from "../../models/PollModel";
import AreaKnowledge from "../../models/areaKnowledge";
import Moderation from "../../models/moderationModel";
import Topic from "../../models/TopicModel";
import Answer from "../../models/answerModel";
import Chat from "../../models/chatModel";
import Reply from "../../models/replyModel";
import SubTopic from "../../models/SubTopicModel";
import Followers from "../../models/followerModel";
import ISubTopic from "../../models/interfaces/subTopic";
import provilegesModel from "../../models/provilegesModel";
import PrivilegesInterface from "../../models/interfaces/privilegesInterface";
import {
  BatchUser,
  BatchPolls,
  BatchInternalUser,
  BatchTopics,
  BatchAnswers,
  BatchChats,
  BatchSubTopics,
  BatchNotifications,
  BatchReplies,
  BatchPrivileges,
  BatchModerations,
  BatchAreas,
} from "./loaders";

/////

// import Reply from "../../models/replyModel";

import IComment from "../../models/interfaces/comment";
import IReply from "../../models/interfaces/reply";
import IModeration from "../../models/interfaces/moderation";
import IFollowers from "../../models/interfaces/followers";
// import { BatchAnswers, BatchChats, BatchInternalUser, BatchNotifications, BatchPolls, BatchSubTopics, BatchTopics, BatchUser } from "./loaders";

const batchInternalUsers: BatchInternalUser = async (ids: any) => {
  const internalUsers: IinternalUsers[] = await InternalUsers.find({
    _id: { $in: ids },
  });
  const iUserMap: { [key: string]: IinternalUsers } = {};

  internalUsers.forEach((iUser) => {
    iUserMap[iUser.id] = iUser;
  });

  return ids.map((id) => iUserMap[id]);
};

const batchUsers: BatchUser = async (ids) => {
  const users: IUser[] = await User.find({ _id: { $in: ids } });
  const userMap: { [key: string]: IUser } = {};

  users.forEach((user) => {
    userMap[user.id] = user;
  });

  return ids.map((id) => userMap[id]);
};

const batchPolls: BatchPolls = async (ids) => {
  const polls = await Poll.find({ _id: { $in: ids } });
  const pollMap: { [key: string]: IPoll } = {};

  polls.forEach((poll) => {
    pollMap[poll.id] = poll;
  });

  return ids.map((id) => pollMap[id]);
};

const batchAreas: BatchAreas = async (ids) => {
  const areas = await AreaKnowledge.find({ _id: { $in: ids } });
  const areaMap: { [key: string]: IPoll } = {};

  areas.forEach((area) => {
    areaMap[area.id] = area;
  });

  return ids.map((id) => areaMap[id]);
};

const batchModerations: BatchModerations = async (ids) => {
  const moderations = await Moderation.find({ _id: { $in: ids } });
  const moderationMap: { [key: string]: IModeration } = {};

  moderations.forEach((moderation) => {
    moderationMap[moderation.id] = moderation;
  });

  return ids.map((id) => moderationMap[id]);
};

const batchAnswers: BatchAnswers = async (ids) => {
  const answers = await Answer.find({ _id: { $in: ids } });
  const answerMap: { [key: string]: IAnswer } = {};

  answers.forEach((answer) => {
    answerMap[answer.id] = answer;
  });

  return ids.map((id) => answerMap[id]);
};

const batchNotifications: BatchNotifications = async (ids) => {
  const notifications = await Notification.find({ _id: { $in: ids } });
  const notificationMap: { [key: string]: INotification } = {};

  notifications.forEach((notification) => {
    notificationMap[notification.id] = notification;
  });

  return ids.map((id) => notificationMap[id]);
};

const batchChats: BatchChats = async (ids) => {
  const chats = await Chat.find({ _id: { $in: ids } });
  const chatsMap: { [key: string]: IChat } = {};

  chats.forEach((chat) => {
    chatsMap[chat.id] = chat;
  });

  return ids.map((id) => chatsMap[id]);
};

const batchReplies: BatchReplies = async (ids) => {
  const replies = await Reply.find({ _id: { $in: ids } });
  const replyMap: { [key: string]: IReply } = {};

  replies.forEach((reply) => {
    replyMap[reply.id] = reply;
  });

  return ids.map((id) => replyMap[id]);
};

const batchTopics: BatchTopics = async (ids) => {
  const topics = await Topic.find({ _id: { $in: ids } });
  const topicMap: { [key: string]: ITopic } = {};

  topics.forEach((topic) => {
    topicMap[topic.id] = topic;
  });

  return ids.map((id) => topicMap[id]);
};

const batchsubTopics: BatchSubTopics = async (ids) => {
  const subTopics = await SubTopic.find({ _id: { $in: ids } });
  const subTopicMap: { [key: string]: ISubTopic } = {};

  subTopics.forEach((subTopic) => {
    subTopicMap[subTopic.id] = subTopic;
  });

  return ids.map((id) => subTopicMap[id]);
};

const batchPrivileges: BatchPrivileges = async (ids) => {
  const privileges: PrivilegesInterface[] = await provilegesModel.find({
    _id: { $in: ids },
  });
  const privilegeMap: { [key: string]: PrivilegesInterface } = {};

  privileges.forEach((privilege) => {
    privilegeMap[privilege.id] = privilege;
  });

  return ids.map((id) => privilegeMap[id]);
};

export default {
  batchUsers,
  batchPolls,
  batchTopics,
  batchsubTopics,
  batchAnswers,
  batchChats,
  batchNotifications,
  batchInternalUsers,
  batchReplies,
  batchPrivileges,
  batchModerations,
  batchAreas,
};
