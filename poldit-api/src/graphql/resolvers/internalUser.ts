import {
  clearAppCookieForInternalUser,
  getAppTokens,
  getAppTokensForInternalUser,
  transformInternalUser,
} from "./shared";

import configs from "../../endpoints.config";
import InternalUsers from "../../models/internalUsersModel";
import bcrypt from "bcryptjs";
// import { ResolverMap } from "_components/index";
import IinternalUsers from "../../models/interfaces/internalUser";
import batchLoaders from "../loaders/dataLoaders";
import { generateRandomPasswrod } from "../../graphql/utils/passwordGenerator";
import {
  sendInternalResetPasswordMail,
  sendResetPasswordMail,
} from "../utils/autoEmails";
import { ResolverMap } from "../../interfaces";

export const internalUsersResolver: ResolverMap = {
  Query: {
    internalUsers: async (parent, args, ctx) => {
      try {
        // privilege
        const { dataLoaders } = ctx;
        const internaluser = await InternalUsers.find()
          .select("_id email fullName accessRole jobTitle isActive")
          .populate("accessRole");

        const internalUserData = internaluser.map((user) =>
          transformInternalUser(user, dataLoaders(["privilege"]))
        );

        const dataAfterPromisifying = await Promise.all(internalUserData);

        return dataAfterPromisifying;
      } catch (error) {
        if (error instanceof Error) {
          // Here you go.

          throw new Error(error.message);
        }
      }
    },

    internalUsersWithPagination: async (
      parent,
      { offset, limit },
      { dataLoaders }
    ) => {
      try {
        // const total = InternalUsers.countDocuments({});
        const internaluser = await InternalUsers.find()
          .limit(limit)
          .skip(offset)
          .select("_id email fullName accessRole jobTitle isActive")
          .populate("accessRole");

        const internalUserData = internaluser.map((user) =>
          transformInternalUser(user, dataLoaders(["privilege"]))
        );

        const dataAfterPromisifying = await Promise.all(internalUserData);

        return dataAfterPromisifying;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
      }
    },

    getInternalUser: async (parent, { userId }, { dataLoaders }) => {
      try {
        // console.log("Getting user");
        const user = await InternalUsers.findOne({ _id: userId }).populate(
          "accessRole"
        );

        const internalUserData = await transformInternalUser(
          user,
          dataLoaders(["privilege"])
        );

        // console.log("User Found => ", user);
        return internalUserData;
      } catch (error) {
        if (error instanceof Error) {
          // Here you go.
          throw new Error(error.message);
        }
      }
    },

    internalUserLogout: async (parent, { email, password }, ctx) => {
      const { req, res } = ctx;
      if (req?.headers?.cookie) {
        clearAppCookieForInternalUser(res);
        return "User is logged out!";
      }

      return "Not logged in";
    },
  },

  Mutation: {
    internalUserLogin: async (parent, { email, password }, ctx) => {
      const iUser = await InternalUsers.findOne({ email: email }).populate({
        path: "accessRole",
        populate: [
          {
            path: "privileges",
            model: "PrivilegesSchema",
          },
        ],
      });
      if (!iUser) throw new Error("User not found");
      if (!(iUser.accessRole.role === "admin"))
        throw new Error(`Sorry Logn with valid credentials`);

      const isPasswordCorrect = await bcrypt.compare(password, iUser.password);

      if (!isPasswordCorrect) throw new Error("Password not Correct");

      const appToken = getAppTokensForInternalUser(
        iUser.id,
        iUser.accessRole?._id,
        ctx.res
      );

      const { isAuth, req, res, dataLoaders } = ctx;
      res.cookie("internalUserPolditSession", appToken, {
        secure: false,
        httpOnly: false,
      });

      return appToken;
    },

    createNewInternalUser: async (parent, { formInputs }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["admin"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        const formObj = JSON.parse(formInputs);
        let existingUser: IinternalUsers;
        existingUser = await InternalUsers.findOne({ email: formObj.email });
        if (existingUser) {
          throw new Error("User with this email already exist");
        }
        const pass = generateRandomPasswrod();

        const hashPW = await bcrypt.hash(pass, 12);
        const internaluser: IinternalUsers = new InternalUsers({
          ...formObj,
          accessRole: formObj.accessRole._id,
          password: hashPW,
        });
        const saveInternalUserResult = await internaluser.save();
        try {
          const appToken = getAppTokensForInternalUser(
            saveInternalUserResult.id,
            formObj.accessRole._id,
            ctx.res
          );
          // const appToken = getAppTokens(saveInternalUserResult.id, ctx.res);

          sendInternalResetPasswordMail(saveInternalUserResult.email, appToken);
          // sendResetPasswordMail(saveInternalUserResult.email, appToken);
        } catch (error) {
          if (error instanceof Error) {
            throw new Error("Count not send email");
          }
        }

        return {
          ...saveInternalUserResult._doc,
          _id: saveInternalUserResult.id,
        };
      } catch (error) {
        if (error instanceof Error) {
          // Here you go.

          throw new Error(error.message);
        }
      }
    },

    updateInternalUser: async (parent, { formInputs }, ctx) => {
      const formObj = JSON.parse(formInputs);
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["admin"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        const updatedUser = await InternalUsers.findByIdAndUpdate(
          { _id: formObj.id },
          {
            ...formObj,
            accessRole: formObj.accessRole._id,
          },
          { new: true, upsert: true }
        );
        return updatedUser;
      } catch (error) {
        if (error instanceof Error) {
          // Here you go.

          throw new Error(error.message);
        }
      }
    },

    deleteOneInternalUser: async (parent, { userEmail }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["admin"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        await InternalUsers.findOneAndDelete({ email: userEmail });
        return "User deleted";
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
      }
    },

    changeInternalUserPassword: async (
      parent,
      { userId, newPassword },
      ctx
    ) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      // const user = await isAuth(["admin"]);
      // if (!user) {
      //   throw new Error("UnAuthorized Access !");
      // }

      try {
        const updatedPass = await bcrypt.hash(newPassword, 12);
        const u: any = await InternalUsers.findById(userId);
        // Check existing password
        // const isPasswordCorrect = await bcrypt.compare(newPassword, u.password);
        const updatedPassword = await InternalUsers.findByIdAndUpdate(userId, {
          $set: {
            password: updatedPass,
          },
        });
        return updatedPassword;
      } catch (error) {
        if (error instanceof Error) {
          // Here you go.

          throw new Error(error.message);
        }
      }
    },

    deletAllInternalUsers: async (parent, { roleId }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["admin"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        await InternalUsers.remove({});
        return "User updated";
      } catch (error) {
        if (error instanceof Error) {
          // Here you go.

          throw new Error(error.message);
        }
      }
    },

    updateDisableUsersToActive: async (parent, { userId }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["admin"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        const u = await InternalUsers.findOneAndUpdate(
          { _id: userId },
          {
            $set: {
              isActive: "true",
            },
          }
        );
        return u._id;
      } catch (error) {
        if (error instanceof Error) {
          // Here you go.

          throw new Error(error.message);
        }
      }
    },

    updateActiveUsersToDisable: async (parent, { userId }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["admin"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        const u = await InternalUsers.findOneAndUpdate(
          { _id: userId },
          {
            $set: {
              isActive: "false",
            },
          }
        );
        return u._id;
      } catch (error) {
        if (error instanceof Error) {
          // Here you go.

          throw new Error(error.message);
        }
      }
    },
  },
};
