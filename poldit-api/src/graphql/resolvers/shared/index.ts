import jwt from "jsonwebtoken";
import { dateToString } from "../../../globalFunctions";
import configs from "../../../endpoints.config";
import { CookieOptions } from "../../../interfaces";
import { Response } from "express-serve-static-core";
import INotification from "../../../models/interfaces/notification";
import IinternalUsers from "../../../models/interfaces/internalUser";
import IUser from "../../../models/interfaces/user";
import IPoll from "../../../models/interfaces/poll";
import Role from "../../../models/roleModel";
import ITopic from "../../../models/interfaces/topic";
import ISubTopic from "../../../models/interfaces/subTopic";
import IAnswer from "../../../models/interfaces/answer";
import IChat from "../../../models/interfaces/chat";
import IModeration from "../../../models/interfaces/moderation";
import IareaKnowledge from "../../../models/interfaces/areaKnowledge";
import IFollowers from "../../../models/interfaces/followers";

const { JwtKey, RefreshTokenExpires, JwtExpires, RefreshKey } = configs;

const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * parseInt(RefreshTokenExpires);

const REFRESH_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  // domain: process.env.BASE_URL.split("//")[1].split(":")[0],
  // domain: "http://localhost:3000/",
  HttpOnly: false,
  // httpOnly: false,
  // secure: true,
  path: "/",
  maxAge: REFRESH_TOKEN_MAX_AGE,
  // sameSite: "none",
  // secure: !!process.env.BASE_URL.includes("https"),
};

export const getLoader = (dataLoaderList: any[]) => {
  const loaderObj: { [key: string]: any } = {};

  dataLoaderList.forEach((loader) => {
    loaderObj[loader.loaderType] = loader.loader;
  });

  return loaderObj;
};

export const transformNotification = async (
  notification: INotification,
  loaders: any[]
) => {
  const { creator } = getLoader(loaders);

  return {
    ...notification._doc,
    _id: notification._doc._id,
    creationDate: dateToString(notification._doc.creationDate),
    creator: await (() => creator.load(notification._doc.creator))(),
  };
};

const generateAccessToken = (id: string) => {
  const roleName = "externalUser";
  return jwt.sign({ id, roleName }, JwtKey, { expiresIn: `${JwtExpires}d` });
};

const generateRefreshToken = (id: string) => {
  const tokenExpiry = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE);
  const roleName = "externalUser";
  const refreshToken = jwt.sign({ id, roleName }, RefreshKey, {
    expiresIn: `${RefreshTokenExpires}d`,
  });

  return {
    refreshToken,
    expiry: tokenExpiry,
    options: REFRESH_TOKEN_COOKIE_OPTIONS,
  };
};

const generateAccessTokenForInternalUser = (id: string, roleId: string) => {
  return jwt.sign({ id, roleId }, JwtKey, { expiresIn: `${JwtExpires}d` });
};

const generateRefreshTokenForInternalUser = (id: string, roleId: string) => {
  const tokenExpiry = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE);

  const refreshToken = jwt.sign({ id, roleId }, RefreshKey, {
    expiresIn: `${RefreshTokenExpires}d`,
  });

  return {
    refreshToken,
    expiry: tokenExpiry,
    options: REFRESH_TOKEN_COOKIE_OPTIONS,
  };
};

export const getAppTokens = (id: string, res: Response) => {
  const accessToken = generateAccessToken(id);
  const appCookie = generateRefreshToken(id);
  const { refreshToken, options } = appCookie;

  res.cookie("polditSession", refreshToken, options); //Store refresh token cookie on browser

  return accessToken;
};

export const getAppTokensForInternalUser = (
  id: string,
  roleId: string,
  res: Response
) => {
  const accessToken = generateAccessTokenForInternalUser(id, roleId);
  const appCookie = generateRefreshTokenForInternalUser(id, roleId);
  const { refreshToken, options } = appCookie;

  res.cookie("internalUserPolditSession", refreshToken, options); //Store refresh token cookie on browser

  return accessToken;
};

export const clearAppCookieForInternalUser = (res: Response) => {
  //Clear current cookie from browser
  res.cookie("internalUserPolditSession", "", {
    ...REFRESH_TOKEN_COOKIE_OPTIONS,
    maxAge: -1,
  });
};

export const transformUser = (user: IUser, loaders: any[]) => {
  const { password, ...rest } = user._doc;

  const { poll } = getLoader(loaders);

  return {
    ...rest,
    registerDate: dateToString(rest.registerDate),
    pollHistory: () => poll.loadMany(rest.pollHistory),
  };
};

export const transformInternalUser = async (
  // internaluser: IinternalUsers,
  internaluser: any,
  loaders: any[]
) => {
  // console.log("Internal user is", internaluser);

  const { password, accessRole, ...rest } = internaluser._doc;

  const { privilege } = getLoader(loaders);

  const privelegesToLoad = accessRole.privileges;

  const finalPrivileges = await privilege.loadMany(privelegesToLoad);

  // console.log("Access Role is", {
  //   ...accessRole._doc,
  //   privileges: finalPrivileges,
  // });

  // console.log("Final Obj is", {
  //   ...rest,
  //   accessRole: {
  //     privileges: finalPrivileges,
  //   },
  // });

  return {
    ...rest,
    accessRole: {
      ...accessRole._doc,
      privileges: finalPrivileges,
    },
  };
};

export const transformRole = async (role: any, loaders: any[]) => {
  const { privileges, ...rest } = role._doc;
  const { privilege } = getLoader(loaders);

  const finalPrivileges = await privilege.loadMany(privileges);

  return { ...rest, privileges: finalPrivileges };
};

export const transformChat = async (chat: IChat, loaders: any[]) => {
  const { creator, poll } = getLoader(loaders);

  return {
    ...chat._doc,
    creationDate: dateToString(chat.creationDate),
    creator: await (() => creator.load(chat.creator))(),
    poll: await (() => poll.load(chat.poll))(),
  };
};

// export const transformPoll = async (poll: IPoll, loaders: any[]) => {
//   const { creator, topic, subTopic, answer, chat } = getLoader(loaders);

//   return {
//     ...poll._doc,
//     _id: poll.id,
//     creationDate: dateToString(poll.creationDate),
//     creator: await (() => creator.load(poll.creator))(),
//     topic: await (() => topic.load(poll.topic))(),
//     subTopics: await (() => subTopic.loadMany(poll.subTopics))(),
//     answers: await (() => answer.loadMany(poll.answers))(),
//     chatMssgs: await (() => chat.loadMany(poll.chatMssgs))(),
//   };
// };

const getTrueLoaderKey = (keyVal: string) => {
  switch (keyVal) {
    case "answer":
      return "answers";
    case "chat":
      return "chatMssgs";
    case "subTopic":
      return "subTopics";
    default:
      return keyVal;
  }
};

export const transformDocument = (modelDoc: any, loaders: any[]) => {
  const loaderObj = getLoader(loaders);
  const objKeysList = Object.keys(loaderObj);

  const final_doc = {
    ...modelDoc,
    creationDate: dateToString(modelDoc.creationDate),
  };

  objKeysList.forEach((key) => {
    const trueKey = getTrueLoaderKey(key);

    if (Array.isArray(modelDoc[trueKey])) {
      final_doc[trueKey] = () =>
        loaderObj[key].loadMany(modelDoc[trueKey] ?? []);
    } else {
      final_doc[trueKey] = () =>
        loaderObj[trueKey].load(modelDoc[trueKey] ?? []);
    }
  });

  return final_doc;
};

export const transformPoll = (poll: IPoll, loaders: any[]) => {
  const { creator, topic, subTopic, answer, chat } = getLoader(loaders);

  return {
    ...poll._doc,
    _id: poll.id,
    creationDate: dateToString(poll.creationDate),
    creator: () => creator.load(poll.creator ?? []),
    topic: () => topic.load(poll.topic ?? []),
    topics: () => topic.loadMany(poll.topics ?? []),
    subTopics: () => subTopic.loadMany(poll.subTopics ?? []),
    answers: answer ? () => answer.loadMany(poll.answers ?? []) : poll.answers,
    chatMssgs: () => chat.loadMany(poll.chatMssgs ?? []),
  };
};

export const transformArea = (area: IareaKnowledge, loaders: any[]) => {
  const { creator } = getLoader(loaders);

  return {
    ...area._doc,
    _id: area.id,
    creationDate: dateToString(area.creationDate),
    creator: () => creator.load(area.creator ?? []),
  };
};

export const transformModeration = (
  moderation: IModeration,
  loaders: any[]
) => {
  const { reporter, violator, internalUser, chat, poll, answer } =
    getLoader(loaders);

  let content;
  if (moderation.flagType === "Answer") {
    content = answer;
  } else if (moderation.flagType === "chat") {
    content = chat;
  } else content = poll;

  const history = moderation._doc.history.map((item) => {
    return {
      ...item._doc,
      reporter: reporter.load(item.reporter),
      moderator: item.moderator ? internalUser.load(item.moderator) : "",
    };
  });

  const transformedModeration = {
    ...moderation._doc,
    _id: moderation.id,
    content: () => content.load(moderation.flagId),
    violator: () => violator.load(moderation.violator),
    history,
  };

  return transformedModeration;
};

export const clearAppCookie = (res: Response) => {
  //Clear current cookie from browser
  res.cookie("polditSession", {
    ...REFRESH_TOKEN_COOKIE_OPTIONS,
    maxAge: -1,
  });
};

export const decodeJWToken = async (tokenVal: string) => {
  try {
    const payload = jwt.verify(tokenVal, JwtKey);
    return payload;
  } catch (err) {
    throw err;
  }

  // return payload
};

// export const checkAuthFor: any = async (roleList: any[], tokken) => {
//   let authData: any = {};
//   // console.log(tokken);
//   const {
//     hasValidToken,
//     decodedToken,
//   }: { hasValidToken: Boolean; decodedToken: any } = isTokkenValid(tokken);

//   if (!hasValidToken) {
//     throw new Error("Session Expired ! Login Again to Access this endpoint");
//   }
//   const roleName = decodedToken?.roleName;
//   authData.userId = decodedToken?.id;

//   if (roleName && roleName !== "") {
//     authData.roleName = roleName;
//     if (!roleList.includes(roleName)) {
//       throw new Error("Sorry you dont have access to this endpoint");
//     }
//   } else {
//     const currentRole = await Role.findById(decodedToken.roleId);
//     authData.roleName = currentRole?.role;
//     if (!roleList.includes(currentRole?.role)) {
//       throw new Error("Sorry you dont have access to this endpoint");
//     }
//   }

//   return authData;
// };

export const checkAuth: any = async (roleList: any[], tokken) => {
  let authData: any = {};
  const {
    hasValidToken,
    decodedToken,
  }: { hasValidToken: Boolean; decodedToken: any } = isTokkenValid(tokken);

  if (!hasValidToken) {
    return false;
  }
  const roleName = decodedToken?.roleName;
  authData.userId = decodedToken?.id;

  if (roleName && roleName !== "") {
    authData.roleName = roleName;
    if (roleList.includes("everyone")) {
      return authData;
    }
    if (!roleList.includes(roleName)) {
      return false;
    }
  } else {
    const currentRole = await Role.findById(decodedToken.roleId);
    authData.roleName = currentRole?.role;
    if (roleList.includes("everyone")) {
      return authData;
    }
    if (!roleList.includes(currentRole?.role)) {
      return false;
    }
  }

  return authData;
};

// export const checkAuthForExternalUser: any = async (
//   roleList: any[],
//   tokken: string
// ) => {
//   let authData: any = {};

//   const {
//     hasValidToken,
//     decodedToken,
//   }: { hasValidToken: Boolean; decodedToken: any } = isTokkenValid(tokken);

//   if (!hasValidToken) {
//     throw new Error("Session Expired ! Login Again to Access this endpoint");
//   }
//   const roleName = decodedToken?.roleName;
//   authData.userId = decodedToken?.id;

//   if (roleName && roleName !== "") {
//     authData.roleName = roleName;
//     if (!roleList.includes(roleName)) {
//       throw new Error("Sorry you dont have access to this endpoint");
//     }
//   } else {
//     const currentRole = await Role.findById(decodedToken.roleId);
//     authData.roleName = currentRole?.role;
//     if (!roleList.includes(currentRole?.role)) {
//       throw new Error("Sorry you dont have access to this endpoint");
//     }
//   }

//   return authData;
// };

export const isTokkenValid: any = (tokken: string) => {
  if (!tokken) {
    return false;
  }
  tokken = tokken.replace("Bearer ", "");
  let hasValidToken;
  let decodedToken;
  // console.log("UPDATED TOKEN => ", tokken);
  try {
    //////////////////////////////////////////////////////////////////////-----------------------------
    decodedToken = jwt.verify(tokken, JwtKey);
    hasValidToken = true;
  } catch (err) {
    hasValidToken = false;
  }
  // console.log(tokken);
  // console.log(decodedToken);

  // console.log("DecoDED TOKEN is => ", decodedToken);
  return { hasValidToken, decodedToken };
};

export const transformSubTopic = (subTopic: ISubTopic, loaders: any[]) => {
  const { creator, topic } = getLoader(loaders);
  // const { creator, topic, poll } = getLoader(loaders);

  return {
    ...subTopic._doc,
    _id: subTopic.id,
    creationDate: dateToString(subTopic.creationDate),
    creator: () => creator.load(subTopic.creator),
    topic: () => topic.load(subTopic.topic),
    // polls: () => poll.loadMany(subTopic.polls),
  };
};

export const transformTopic = (topic: ITopic, loaders: any[]) => {
  const { creator, subTopic } = getLoader(loaders);

  return {
    ...topic._doc,
    _id: topic.id,
    creationDate: dateToString(topic.creationDate),
    creator: () => creator.load(topic.creator),
    subTopics: () => subTopic.loadMany(topic.subTopics),
  };
};

export const transformAnswer = async (answer: IAnswer, loaders: any[]) => {
  const { creator, poll, comment } = getLoader(loaders);

  return {
    ...answer._doc,
    _id: answer._doc._id,
    numLikes: answer._doc.likes?.length ?? 0,
    numDisLikes: answer._doc.dislikes?.length ?? 0,
    creationDate: dateToString(answer._doc.creationDate),
    creator: await (() => creator.load(answer._doc.creator))(),
    poll: await (() => poll.load(answer._doc.poll))(),
    // comments: () => comment.loadMany(answer.comments),
  };
};

// export const isInternalUserAuth = (tokken) => {
//   const tokkenContent = isTokkenValid(tokken);

//   if (tokkenContent) {
//     const { hasValidToken, decodedToken } = tokkenContent;
//     if (!hasValidToken) {
//       throw new Error("Sorry Session Expired , Login Again to continue !");
//     }
//     return decodedToken.id;
//   }
//   throw new Error("Sorry Session Expired , Login Again to continue !");
// };
