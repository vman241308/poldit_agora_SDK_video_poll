import DataLoader from "dataloader";
import batchLoaders from "./dataLoaders";
import IinternalUsers from "../../models/interfaces/internalUser";
import IUser from "../../models/interfaces/user";
import IPoll from "../../models/interfaces/poll";
import ITopic from "../../models/interfaces/topic";
import IAnswer from "../../models/interfaces/answer";
import IChat from "../../models/interfaces/chat";
import ISubTopic from "../../models/interfaces/subTopic";
import INotification from "../../models/interfaces/notification";
import IReply from "../../models/interfaces/reply";
import PrivilegesInterface from "../../models/interfaces/privilegesInterface";
import IModeration from "../../models/interfaces/moderation";
import IFollowers from "../../models/interfaces/followers";

// const getLoaderByDataType = (dataType: string) => {
//   let loader: any;

//   const { batchInternalUsers } = batchLoaders;

//   switch (true) {
//     case dataType == "internalUser":
//       loader = new DataLoader<string, IinternalUsers>(batchInternalUsers);
//   }

//   return loader;
// };

const getLoaderByDataType = (dataType: string) => {
  let loader: any;

  const {
    batchUsers,
    batchNotifications,
    batchPolls,
    batchTopics,
    batchsubTopics,
    batchAnswers,
    batchChats,
    batchInternalUsers,
    batchReplies,
    batchPrivileges,
    batchModerations,
    batchAreas,
  } = batchLoaders;

  switch (true) {
    case dataType == "user":
      loader = new DataLoader<string, IUser>(batchUsers);
      break;
    case dataType == "violator":
      loader = new DataLoader<string, IUser>(batchUsers);
      break;
    case dataType == "reporter":
      loader = new DataLoader<string, IUser>(batchUsers);
      break;
    case dataType == "notification":
      loader = new DataLoader<string, INotification>(batchNotifications);
      break;
    case dataType == "internalUser":
      loader = new DataLoader<string, IinternalUsers>(batchInternalUsers);
      break;
    case dataType == "poll":
      loader = new DataLoader<string, IPoll>(batchPolls);
      break;
    case dataType == "parentCollectionId":
      loader = new DataLoader<string, IPoll>(batchPolls);
      break;
    case dataType == "topic":
      loader = new DataLoader<string, ITopic>(batchTopics);
      break;
    case dataType == "topics":
      loader = new DataLoader<string, ITopic>(batchTopics);
      break;
    case dataType == "subTopic":
      loader = new DataLoader<string, ISubTopic>(batchsubTopics);
      break;
    case dataType == "answer":
      loader = new DataLoader<string, IAnswer>(batchAnswers);
      break;
    case dataType == "chat":
      loader = new DataLoader<string, IChat>(batchChats);
      break;
    case dataType == "reply":
      loader = new DataLoader<string, IReply>(batchReplies);
      break;
    case dataType == "privilege":
      loader = new DataLoader<string, PrivilegesInterface>(batchPrivileges);
      break;
    case dataType == "moderation":
      loader = new DataLoader<string, IModeration>(batchModerations);
      break;
    case dataType == "areaKnowledge":
      loader = new DataLoader<string, IModeration>(batchAreas);
      break;
  }

  return loader;
};

// type dataLoaderPayload = {
//   loaderType: string;
//   loader: any;
// }[];

// let dataLoaders: (loaderTypes: string[]) => dataLoaderPayload;

const dataLoaders = (loaderTypes: string[]) => {
  return loaderTypes.map((item) => {
    return {
      loaderType: item == "user" ? "creator" : item,
      loader: getLoaderByDataType(item),
    };
  });
};

export default dataLoaders;
