import User from "../../models/UserModel";
import { Activity } from "../../interfaces/index";
import {
  getAppTokens,
  clearAppCookie,
  transformUser,
  transformPoll,
  isTokkenValid,
} from "./shared";
import bcrypt from "bcryptjs";
import IUser from "../../models/interfaces/user";
import IPoll from "../../models/interfaces/poll";
import Poll from "../../models/PollModel";
import Followers from "../../models/followerModel";
import batchLoaders from "../loaders/dataLoaders";
import IAnswer from "../../models/interfaces/answer";
import { ResolverMap, PollHistory } from "../../interfaces";
import { dateToString } from "../../globalFunctions";
import { updatePollAnswers, updatePollChatMessages } from "./poll";
import { Types } from "mongoose";
import jwt from "jsonwebtoken";
import {
  generateToken,
  getFollowerData,
  getUserAnswerActivity,
  getUserLikedAnswerActivity,
  getUserDisLikedAnswerActivity,
  getUserFollowers,
  getUserFollowing,
  isActive,
  getUserMultipleChoiceAnswerActivity,
  getUserChatMssgActivity,
  getUserTags,
  getUniqueAppId,
  getUserDetailsForSubscription,
} from "./shared/user";
import { withFilter } from "graphql-subscriptions";
import {
  sendChangePWEmail,
  sendResetPasswordMail,
  sendWelcomeEmail,
} from "../utils/autoEmails";
import { moderateText } from "./shared/moderation";
import { maxUserAnswerReached, parseRichContentForText } from "./shared/poll";
import { storeGeoLocMetaData } from "../utils/geolocation";
// import { publishContent } from "./shared/pubSubActions";
import { pubsub } from "../..";

const { batchPolls, batchAnswers } = batchLoaders;

let followerList: any[] = [];

export const userResolvers: ResolverMap = {
  Query: {
    users: async (parent, args, ctx) => {
      try {
        const users = await User.find();
        const userData = users.map((user) =>
          transformUser(user, ctx?.dataLoaders(["poll"]))
        );

        return userData;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
      }
    },

    getAllActivityOfUserWithPagination: async (
      parent,
      { appId, offset, limit },
      ctx
    ) => {
      const { req, res, dataLoaders, isAuth } = ctx;
      const user = await isAuth(["admin", "employee", "externalUser"]);

      if (!user) {
        throw new Error("Sorry Login again to access this route!");
      }

      try {
        const currentUser = await User.findOne({ appid: appId });
        const createdAnswers = await getUserAnswerActivity(currentUser._id);
        const likedAnswers = await getUserLikedAnswerActivity(currentUser._id);
        const dislikedAnswers = await getUserDisLikedAnswerActivity(
          currentUser._id
        );
        const multichoiceAnswers = await getUserMultipleChoiceAnswerActivity(
          currentUser._id
        );

        const chatMessages = await getUserChatMssgActivity(currentUser._id);
        const tags = await getUserTags(currentUser._id);

        const totalActivity: Activity[] = [
          ...createdAnswers,
          ...likedAnswers,
          ...dislikedAnswers,
          ...multichoiceAnswers,
          ...chatMessages,
          ...tags,
        ];

        //Filtering out activity where date field wasnt available(due to originally not having dates for all fields)
        const activityWithDates = totalActivity
          .filter((item) => item.date !== "No date provided")
          .sort(
            (a: any, b: any) =>
              (new Date(b.date) as any) - (new Date(a.date) as any)
          );

        const paginatedActivity = activityWithDates
          .slice(offset, offset + 10)
          .map((item) => {
            return { ...item, date: dateToString(item.date as any) };
          });

        return {
          userActivity: paginatedActivity,
          totalPolls: activityWithDates.length,
        };
      } catch (err) {
        throw err;
      }
    },

    externalUsersWithPagination: async (
      parent,
      { offset, limit },
      { dataLoaders }
    ) => {
      try {
        // const total = await User.countDocuments({});
        const externaluser = await User.find().limit(limit).skip(offset);
        const userData = externaluser.map((user) =>
          transformUser(user, dataLoaders(["poll"]))
        );
        return userData;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
      }
    },
    logout: async (parent, args, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      if (req?.headers?.cookie) {
        clearAppCookie(res);

        return "User is logged out!";
      }
      return "Not logged in";
    },

    getUserData: async (parent, { userId }, ctx) => {
      const { req, res, dataLoaders } = ctx;
      try {
        if (userId) {
          const user = await User.findOne({ _id: userId }).populate("poll");
          if (user) {
            const userData = transformUser(user, dataLoaders(["poll"]));
            const appToken = getAppTokens(userData._id, res);
            return { appToken, user: userData };
          }
        }
      } catch (err) {
        throw err;
      }
    },

    getUserBasicProfile: async (parent, args, ctx) => {
      const { req, res, dataLoaders, isAuth } = ctx;

      const user = await isAuth(["externalUser"]);

      if (!user) {
        throw new Error("Please log in to see profile content!");
      }

      try {
        const stsMe: any = await User.findById(user.userId);

        return User.findById(user.userId);
      } catch (err) {
        throw err;
      }
    },

    getUserProfileData: async (parent, { appid }, ctx) => {
      const { req, res, dataLoaders, isAuth } = ctx;

      const user = await isAuth(["admin", "employee", "externalUser"]);

      if (!user) {
        throw new Error("Please log in to see profile content!");
      }

      try {
        const currentUser = await User.findOne({ appid });

        let populatedUser = transformUser(currentUser, dataLoaders(["poll"]));
        if (user.userId === currentUser._id.toString()) {
          populatedUser.isMe = true;
        } else populatedUser.isMe = false;

        populatedUser.followers = await getUserFollowers(
          appid,
          populatedUser.following
        ); //By default these guys follow me

        populatedUser.isActive = await isActive(currentUser._id);

        populatedUser.following = await getUserFollowing(
          //These guys may not follow
          populatedUser.following
        );

        return populatedUser;
      } catch (err) {
        throw err;
      }
    },

    getUserDataByEmail: async (parent, { email }, ctx) => {
      const { req, res, dataLoaders } = ctx;
      try {
        if (email) {
          const user = await User.findOne({ email: email });

          if (user) {
            const appToken = getAppTokens(user._id, res);
            sendResetPasswordMail(user.email, appToken);

            return { isAvailable: true };
          } else {
            return { isAvailable: false };
          }
        }
      } catch (err) {
        throw err;
      }
    },

    isFollowed: async (parent, { appid }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["externalUser"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        const followers = await getUserFollowers(appid, user.following);

        return followers.some((item) => item._id.toString() === user.userId);
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
      }
    },

    getUserDataForPoll: async (parent, { pollId }, ctx) => {
      const { isAuth } = ctx;

      const user = await isAuth(["externalUser"]);
      if (!user) {
        throw new Error("Sorry Login again to access this route!");
      }

      try {
        const retrievedUser = await User.findById(user.userId);
        const { answersLeft, maxReached } = await maxUserAnswerReached(
          user.userId,
          pollId,
          5
        );

        return { ...retrievedUser._doc, pollAnswersLeft: answersLeft };
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
      }
    },

    getAppUserData: async (parent, { userId }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["admin", "externalUser"]);

      if (!user) {
        throw new Error(
          "User not found. Please try logging in again or registering if you are a first time user."
        );
      }

      try {
        const retrievedUser = await User.findById(userId);
        if (retrievedUser) {
          const userData = transformUser(retrievedUser, dataLoaders(["poll"]));
          userData.isAppUser = user.userId === String(retrievedUser._id);
          return userData;
        }
      } catch (err) {
        throw err;
      }
      // if (!user) {
      //   throw new Error("UnAuthorized Access !");
      // }

      // const retrievedUser = await User.findById(userId);
      // // console.log("GOT USER => ", retrievedUser);
      // if (retrievedUser) {
      //   const userData = transformUser(retrievedUser, dataLoaders(["poll"]));
      //   userData.isAppUser = user.userId === String(retrievedUser._id);
      //   return userData;
      // }
    },

    getUser: async (parent, { userId }, ctx) => {
      try {
        const { isAuth, req, res, dataLoaders } = ctx;

        const user = await isAuth(["admin", "externalUser"]);
        if (!user) {
          throw new Error("UnAuthorized Access !");
        }

        const retrievedUser: IUser = await User.findById(userId).populate({
          path: "pollHistory",
          populate: [
            {
              path: "answers",
              model: "Answer",
            },
          ],
        });
        return retrievedUser;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
      }
    },

    getFollows: async (parent, args, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["externalUser"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        const followerData: any[] = await User.aggregate([
          {
            $match: {
              _id: Types.ObjectId(user.userId),
            },
          },
          {
            $project: {
              _id: 0,
              following: 1,
            },
          },
          { $unwind: "$following" },
          { $replaceRoot: { newRoot: "$following" } },
          {
            $lookup: {
              from: "users",
              localField: "appId",
              foreignField: "appid",
              as: "follower_data",
            },
          },
          {
            $project: {
              _id: 0,
              follower_data: 1,
            },
          },
          { $unwind: "$follower_data" },
          { $replaceRoot: { newRoot: "$follower_data" } },
          { $project: { appid: 1, profilePic: 1, firstname: 1, lastname: 1 } },
        ]);

        return await Promise.all(
          followerData.map(async (item) => {
            const active = await isActive(item._id as string);
            return { ...item, appId: item.appid, isActive: active };
          })
        );
      } catch (err) {
        throw err;
      }
    },
    isNewUser: async (parent, { email }, ctx) => {
      try {
        const user: IUser = await User.findOne({ email }, { newUser: 1 });
        return user.newUser ?? false;
      } catch (err) {
        throw err;
      }
    },

    getFollowActivity: async (parent, args, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;
      const user = await isAuth(["externalUser"]);
      if (!user) {
        throw new Error("Log in to see the users you are following!");
      }

      // try {
      //   const appUser = await User.findById(user.userId);

      //   await pubsub.connectToChannel("appUsers", {
      //     userId: appUser._id,
      //     appid: appUser.appid,
      //     profilePic: appUser.profilePic,
      //     firstname: appUser.firstname,
      //     lastname: appUser.lastname,
      //   });
      // } catch (err) {
      //   throw err;
      // }

      try {
        return await Followers.find({
          userId: { $ne: user.userId },
        });
      } catch (err) {
        throw err;
      }
    },

    showFavorites: async (parent, { userId }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["externalUser"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        const user: IUser = await User.findById(userId);

        if (user && user.favorites && user.favorites.length === 0) {
          throw new Error(
            "No Favorites Found.  Click on the heart icon on any poll to add your favorite polls and answers."
          );
        }

        if (user && user.favorites.length > 0) {
          let pollIdList: string[] = [];
          let answersList: string[] = [];
          user.favorites.forEach((item) => {
            if (item.favoriteType === "Poll") {
              pollIdList.push(item.favoriteId);
            } else if (item.favoriteType === "Answer") {
              answersList.push(item.favoriteId);
            }
          });

          const pollDetails: IPoll[] = await batchPolls(pollIdList);
          const pollFinalDetails: PollHistory[] = pollDetails.map((item) =>
            transformPoll(
              item,
              dataLoaders(["user", "topic", "subTopic", "answer", "chat"])
            )
          );
          const answerDetails: IAnswer[] = await batchAnswers(answersList);

          return {
            favoritePolls: pollFinalDetails,
            favoriteAnswers: answerDetails,
          };
        }
      } catch (err) {
        throw err;
      }
    },

    isFavorite: async (parent, { favType, favId }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["externalUser"]);
      if (!user) {
        return;
        // throw new Error(`UnAuthorized Access ${user}`);
      }

      try {
        const retrievedUser: IUser = await User.findById(user.userId);

        if (
          retrievedUser &&
          retrievedUser.favorites &&
          retrievedUser.favorites.length > 0
        ) {
          return retrievedUser.favorites.some(
            (item) =>
              item.favoriteType === favType && String(item.favoriteId) === favId
          );
        }
      } catch (err) {
        throw err;
      }
    },
    myAreasOfKnowledge: async (_, { appid }, { dataLoaders, isAuth }) => {
      const user = await isAuth(["admin", "employee", "externalUser"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        return await User.aggregate([
          {
            $match: {
              appid,
            },
          },

          {
            $project: {
              _id: 0,
              areasOfKnowledge: {
                $filter: {
                  input: "$areasOfKnowledge",
                  as: "area",
                  cond: { $eq: ["$$area.isActive", true] },
                },
              },
            },
          },
          { $unwind: "$areasOfKnowledge" },
          { $replaceRoot: { newRoot: "$areasOfKnowledge" } },
          {
            $addFields: {
              totalUpVotes: {
                $size: { $ifNull: ["$upVotes", []] },
              },
              totalDownVotes: {
                $size: { $ifNull: ["$downVotes", []] },
              },
            },
          },
          {
            $lookup: {
              from: "areaknowledges",
              localField: "areaKnowledgeId",
              foreignField: "_id",
              as: "areaknowledge_data",
            },
          },
          { $unwind: "$areaknowledge_data" },
          { $sort: { "areaknowledge_data.areaKnowledge": 1 } },
        ]);
      } catch (err) {
        throw err;
      }
    },
    // getUserMetrics: async (parent, { userId }, ctx) => {},
  },

  Mutation: {
    createNewUser: async (parent, { formInputs }, ctx) => {
      const formObj = JSON.parse(formInputs);
      let existingUser: IUser;

      try {
        const inputVals = Object.values(formObj);
        const moderationResults = await moderateText(inputVals.join(" "));

        if (moderationResults && moderationResults.blockContent) {
          throw new Error(
            "Content contains inappropriate language.  Please update and resubmit."
          );
        }

        existingUser = await User.findOne({ email: formObj.email });
        if (existingUser && !existingUser.isEmailVerified) {
          generateToken(existingUser._id, existingUser.email);

          throw new Error(
            `Email exists but was never verified! Please follow the instructions in the new verification email to use the site.`
          );
        }

        if (existingUser) {
          throw new Error("Email already exists! Please log in.");
        }

        const hashedPW = await bcrypt.hash(formObj.password, 12);

        let user: IUser = new User({
          ...formObj,
          password: hashedPW,
          newUser: true,
        });

        const userSaveResult = await user.save();
        generateToken(userSaveResult._id, userSaveResult.email);

        return {
          ...userSaveResult._doc,
          id: userSaveResult.id,
          password: null,
          registerDate: dateToString(userSaveResult._doc.registerDate),
        };
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
      }
    },

    removeNewUserFlag: async (_, __, { isAuth }) => {
      const user = await isAuth(["externalUser"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        await User.findByIdAndUpdate(user.userId, { newUser: false });
      } catch (err) {
        throw err;
      }
    },

    verifyUserEmail: async (parent, { token }, ctx) => {
      const secretKey = process?.env?.JWT_KEY;

      if (!token || !secretKey) {
        throw new Error("Something went very wrong!  Please try again later.");
      }

      const { userId } = jwt.verify(token, secretKey) as any;

      if (!userId) {
        throw new Error(
          "Check the url or try generating verification email again."
        );
      }

      const user: IUser = await User.findById(userId);

      if (!user) {
        throw new Error(
          "Sorry, this link is invalid. Try again or generate a verification email again."
        );
      }

      if (user.isEmailVerified) {
        throw new Error(
          "Email already verified. You can login with your credentials."
        );
      }

      await User.findByIdAndUpdate(userId, {
        isEmailVerified: true,
      });
      sendWelcomeEmail(user.email, user.firstname, user.appid)
        .then((res) => {
          console.log("welcome email sent successfully", res);
        })
        .catch((err) => {
          console.log("something went wrong with welcome email ...", err);
        });

      return `Email Verified for ${user.email}.  You can now log in to Poldit.com!  A welcome email has been sent to get you familiar with the site.`;
    },

    storeUserLoc: async (parent, { userLoc }, { isAuth }) => {
      const user = await isAuth(["externalUser"]);
      if (!user) {
        return;
      }

      try {
        return await storeGeoLocMetaData(userLoc, user.userId);
      } catch (err) {
        console.log(err);
      }
    },
    altLogin: async (parent, { credentials }, ctx) => {
      const loginDetails = JSON.parse(credentials);
      let appUserId = "";

      try {
        const user: IUser = await User.findOne(
          { email: loginDetails.email },
          { isEmailVerified: 1, password: 1, profilePic: 1 }
        );

        if (!user && !loginDetails.provider) {
          throw new Error(
            "User does not exist. Please register or try another alternative method of logging in."
          );
        }

        if (!user && loginDetails.provider) {
          const nameList = loginDetails.name.split(" ");
          const newUser = new User({
            firstname: nameList[0],
            lastname: nameList[nameList.length - 1],
            email: loginDetails.email,
            profilePic: loginDetails.picture,
            loginMethod: loginDetails.provider,
            appid: await getUniqueAppId(loginDetails.email),
            isEmailVerified: true,
            newUser: true,
          });

          await newUser.save();
          appUserId = newUser._id;

          sendWelcomeEmail(newUser.email, newUser.firstname, newUser.appid)
            .then((res) => {
              console.log("welcome email sent successfully", res);
            })
            .catch((err) => {
              console.log("something went wrong with welcome email ...", err);
            });
        } else {
          appUserId = user._id;
        }

        if (user && !user.profilePic) {
          user.profilePic = loginDetails.picture;
          await user.save();
        }

        const appToken = getAppTokens(appUserId, ctx.res);
        ctx.res.cookie("polditSession", appToken, {
          secure: false,
          httpOnly: false,
        });

        return {
          accessToken: appToken,
          isNewUser: !user && loginDetails.provider,
        };
      } catch (err) {
        throw err;
      }
    },

    changePassword: async (parent, { oldPw, newPw }, { isAuth }) => {
      const user = await isAuth(["admin", "employee", "externalUser"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        const appUser: IUser = await User.findById(user.userId, {
          email: 1,
          password: 1,
          loginMethod: 1,
          isEmailVerified: 1,
        });

        if (!appUser.loginMethod && appUser.isEmailVerified) {
          const pwMatch = await bcrypt.compare(
            oldPw,
            appUser.password as string
          );

          if (!pwMatch) {
            throw new Error(
              "Existing password provided is incorrect.  Please try again."
            );
          }

          const hashedPW = await bcrypt.hash(newPw, 12);

          await User.findByIdAndUpdate(appUser._id, { password: hashedPW });

          sendChangePWEmail(appUser.email, appUser.firstname, appUser.appid)
            .then((res) => {
              console.log("Password Change email sent successfully", res);
            })
            .catch((err) => {
              console.log(
                "something went wrong with Password Change email ...",
                err
              );
            });

          return "Password updated";
        }
      } catch (err) {
        throw err;
      }
    },

    login: async (parent, { credentials }, ctx) => {
      const { email, password } = JSON.parse(credentials);

      try {
        const user: IUser = await User.findOne(
          { email },
          { isEmailVerified: 1, password: 1, loginMethod: 1 }
        );

        if (!user) {
          throw new Error("User does not exist. Please register");
        }
        if (!user.isEmailVerified) {
          // throw new Error("Kindly Verify Your Email First To Login !");
          throw new Error(
            "Please verify your email since you are logging in for the first time."
          );
        }

        if (user.password) {
          const pwMatch = await bcrypt.compare(password, user.password);

          if (!pwMatch) {
            throw new Error("Password is incorrect");
          }
          const appToken = getAppTokens(user.id, ctx.res);

          ctx.res.cookie("polditSession", appToken, {
            secure: false,
            httpOnly: false,
          });

          return appToken;
        }

        if (!user.password && user.loginMethod) {
          throw new Error(
            `Please use an alternative method to log in.  You registered with ${user.loginMethod}.`
          );
        }
      } catch (err) {
        throw err;
      }
    },

    updateUser: async (parent, { formInputs }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["externalUser"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      const moderationResults = await moderateText(formInputs);

      if (moderationResults && moderationResults.blockContent) {
        throw new Error(
          "Content contains inappropriate language.  Please update and resubmit."
        );
      }

      const formObj = JSON.parse(formInputs);

      try {
        await User.findByIdAndUpdate(
          user.userId,
          { ...formObj },
          { new: true, upsert: true }
        );

        return "User updated";
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
      }
    },
    setMyActiveAreas: async (parent, { areas }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["externalUser"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        const userData = await User.findById(user.userId);

        let selectedAreas = userData.areasOfKnowledge;

        if (userData.areasOfKnowledge) {
          areas.forEach((x) => {
            const matchIdx = selectedAreas.findIndex(
              (area) => area.areaKnowledgeId.toString() === x
            );

            if (matchIdx > -1) {
              selectedAreas[matchIdx].isActive = true;
            } else {
              selectedAreas.push({
                upVotes: [],
                downVotes: [],
                areaKnowledgeId: x,
                isActive: true,
              });
            }
          });

          selectedAreas = selectedAreas.map((x) => {
            if (!areas.includes(x.areaKnowledgeId.toString())) {
              return { ...x._doc, isActive: false };
            }
            return x;
          });

          userData.areasOfKnowledge = selectedAreas;
          await userData.save();
        }

        return "Areas selected!";
      } catch (err) {
        throw err;
      }
    },

    updateUserPassword: async (parent, { token, password }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      try {
        const { hasValidToken, decodedToken } = isTokkenValid(token);

        if (!hasValidToken) {
          throw new Error(
            "Token has expired.  Please go through the forgot password process again in the login page."
          );
        }

        const hashedPW = await bcrypt.hash(password, 12);

        await User.findByIdAndUpdate(
          decodedToken.id,
          { password: hashedPW },
          { new: true, upsert: true }
        );

        return "Password Updated!";
      } catch (err) {
        throw new Error(
          "Token is no longer valid.  Please go through the forgot password process again in the login page."
        );
      }
    },

    refreshUserToken: async (parent, { email }, ctx) => {
      try {
        const user: IUser = await User.findOne({ email });

        if (!user) {
          throw new Error("User does not exist.  Please register.");
        }

        if (user.isEmailVerified) {
          throw new Error("Your email is already verified.  Please log in.");
        }

        generateToken(user._id, email);

        return "Email verification link sent. Please check your email and click on the new link.";
      } catch (err) {
        throw err;
      }
    },

    verifyEveryOneWithEmail: async (parent, args, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      // const user = await isAuth(["externalUser"]);
      // if (!user) {
      //   throw new Error("UnAuthorized Access !");
      // }

      try {
        await User.updateMany({}, { isEmailVerified: true });

        return "User updated";
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
      }
    },

    deleteUser: async (parent, { userId }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["admin", "externalUser"]);
      // if (!user) {
      //   throw new Error("UnAuthorized Access !");
      // }

      try {
        await User.findById(userId).then(async (res) => {
          // console.log(res);
          let followingIds: any = [];
          if (res.following.length > 0) {
            res.following.map((follow: any) => followingIds.push(follow._id));
            await deleteFollowings(followingIds);
          }

          if (res.pollHistory.length > 0) {
            await deletePolls(res.pollHistory);
          }
        });

        await User.updateOne(
          { _id: userId },
          {
            $set: {
              isDisabled: true,
            },
          }
        );
        // await User.findByIdAndDelete(userId);
        // await User.findById(userId).populate("pollHistory").then((res) => console.log(res));

        return "User deleted";
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
      }
    },

    toggleDisableUser: async (parent, { userId }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["admin", "moderator"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        const user = await User.findById(userId);

        if (user) {
          await User.findByIdAndUpdate(userId, {
            isDisabled: !user.isDisabled,
          });
          return `Is Disabled Updated to ${!user.isDisabled}`;
        }

        throw new Error("User not found");
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
      }
    },
    addToFollowerList: async (parent, { userId, pagePath, pollId }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["externalUser"]);
      if (!user) {
        return "Only logged in users can be added as followers";
      }

      try {
        const followers = await Followers.find({
          userId: user.userId,
        });

        if (followers.length === 0) {
          const newFollowerData = await getFollowerData(user.userId, pagePath);
          const newFollower = new Followers(newFollowerData);
          const savedFollower = await newFollower.save();

          // publishContent(savedFollower._doc, pubsub, "newFollower");
          pubsub.publish("newFollower", savedFollower._doc);
          // pubsub.publish("newFollower", {
          //   _id: savedFollower._doc._id,
          //   appid: savedFollower._doc.appid,
          // });
          return "User Added";
        }
        return "User already on list";
      } catch (err) {
        throw err;
      }
    },
    removeFromFollowerList: async (parent, { userId }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["externalUser"]);
      if (!user) {
        return "Only logged in users can be removed as followers";
      }

      try {
        const followerToRemove = await Followers.findOne({
          userId: user.userId,
        });

        if (followerToRemove) {
          await Followers.findByIdAndDelete(followerToRemove._id);
          pubsub.publish("newFollower", {
            ...followerToRemove._doc,
            removeFlag: true,
          });
          return "User removed";
        }

        // publishContent(
        //   { ...followerToRemove._doc, removeFlag: true },
        //   pubsub,
        //   "newFollower"
        // );
      } catch (err) {
        throw err;
      }
    },

    handleFollow: async (parent, { details }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["externalUser"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      let detailObj: any = JSON.parse(details);

      if (detailObj.isFollowed) {
        await User.updateOne(
          {
            _id: user.userId,
          },
          {
            $pull: {
              following: {
                appId: detailObj.appId,
                profilePic: detailObj.profilePic,
              },
            },
          }
        );

        return `${detailObj.appId} no longer followed`;
      }

      await User.updateOne(
        {
          _id: user.userId,
          "following.appId": { $ne: detailObj.appId },
        },
        {
          $push: {
            following: {
              appId: detailObj.appId,
              profilePic: detailObj.profilePic,
            },
          },
        }
      );

      return `${detailObj.appId} is now being followed`;
    },

    handleFavorite: async (
      parent,
      { isFav, favoriteType, favoriteId },
      ctx
    ) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["externalUser"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      // const tokken =
      //   ctx?.req?.headers?.authorization ?? ctx?.req?.cookies?.polditSession;

      let userFav: any = {};

      try {
        if (isFav) {
          const existingFav = await User.find({
            _id: user.userId,
            favorites: {
              $elemMatch: { favoriteType, favoriteId },
            },
          });

          if (existingFav.length === 0) {
            userFav = await User.updateOne(
              {
                _id: user.userId,
                // "favorites.favoriteType": favoriteType,
              },
              {
                $addToSet: {
                  favorites: { favoriteId, favoriteType },
                },
              }
            );

            return "Favorite Added";
          }

          return "Favorite already exists";
        }

        userFav = await User.updateOne(
          {
            _id: user.userId,
            favorites: {
              $elemMatch: { favoriteType, favoriteId },
            },
          },
          {
            $pull: {
              favorites: { favoriteId, favoriteType },
            },
          }
        );

        return "Favorite removed";
      } catch (err) {
        throw err;
      }
    },
  },
  Subscription: {
    newFollower: {
      subscribe: withFilter(
        () => pubsub.asyncIterator("newFollower"),
        (payload, variables) => {
          // payload.newFollower = getUserDetailsForSubscription(payload);
          payload.newFollower = payload;
          return true;
        }
      ),
      // subscribe: withFilter(
      //   (parent, args, { pubsub }, info) =>
      //     pubsub.asyncIterator(["newFollower"]),
      //   (payload, args) => {
      //     const data = JSON.parse(payload?.data.toString());
      //     payload.newFollower = data;
      //     return true;
      //   }
      // ),
    },
  },
};

const deletePolls = async (polls: string[]) => {
  Promise.all(
    polls.map(async (id: string) => {
      // await Poll.findByIdAndDelete(pollId);
      await Poll.findById(id).then(async (res) => {
        res.answers.length > 0 && (await updatePollAnswers(res.answers));
        res.chatMssgs.length > 0 &&
          (await updatePollChatMessages(res.chatMssgs));
      });
      await Poll.updateOne(
        { _id: id },
        {
          $set: {
            isDisabled: true,
          },
        }
      );
    })
  );
};

const deleteFollowings = async (followings: string[]) => {
  Promise.all(
    followings.map(async (id: string) => {
      const user: IUser = await User.findById(id);
      const itemToBeRemoved = user.following?.filter(
        (item) => item.appId === id
      );
      const updatedFollows = user.following?.filter(
        (item) => item.appId !== id
      );
      user.following = updatedFollows;
      await user.save();
    })
  );
};
