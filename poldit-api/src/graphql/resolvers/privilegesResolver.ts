import PrivilegesSchema from "../../models/provilegesModel";
import { ResolverMap } from "../../interfaces";
import PrivilegesInterface from "../../models/interfaces/privilegesInterface";
import RolesSchema from "../../models/roleModel";
import checkInterUserCookie from "../utils/checkInterUserCookie";

export const privilegesResolver: ResolverMap = {
  Query: {
    allPrivileges: async (parent, args, ctx) => {
      try {
        const privileges = await PrivilegesSchema.find();
        return privileges;
      } catch (error) {
        throw new Error((error as Error).message);
      }
    },
  },

  Mutation: {
    deleteAllPrivileges: async (parent, args, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["admin"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        await PrivilegesSchema.remove({});
        return "delete all data";
      } catch (error) {
        throw new Error((error as Error).message);
      }
    },

    createNewPrivilege: async (parent, { privilegeName }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["admin"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        let existingPrivilege;
        existingPrivilege = await PrivilegesSchema.findOne({
          privilegeName: privilegeName,
        });
        if (existingPrivilege) {
          throw new Error("Privilege with this name already exist");
        }
        const newPrivilege: PrivilegesInterface = new PrivilegesSchema({
          privilegeName: privilegeName,
          privilegeStatus: true,
        });
        const privilegeCreated = await newPrivilege.save();
        return privilegeCreated;
      } catch (error) {
        throw new Error((error as Error).message);
      }
    },

    updatePrivilege: async (
      parent,
      { privilegeId, privilegeName, privilegeStatus },
      ctx
    ) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["admin"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        const updatedPrivilege = await PrivilegesSchema.findOneAndUpdate(
          { _id: privilegeId },
          {
            $set: {
              privilegeName: privilegeName,
              privilegeStatus: privilegeStatus,
            },
          }
        );
        return updatedPrivilege;
      } catch (error) {
        throw new Error((error as Error).message);
      }
    },
    deletePrivilege: async (parent, { _id }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["admin"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        await PrivilegesSchema.findOneAndDelete({
          _id: _id,
        });
        return "Privilege deleted";
      } catch (error) {
        throw new Error((error as Error).message);
      }
    },
  },
};
