import RolesSchema from "../../models/roleModel";
import { ResolverMap } from "../../interfaces";
import roleInterface from "../../models/interfaces/roleInterface";
import { transformRole } from "./shared";

export const rolesResolver: ResolverMap = {
  Query: {
    allRoles: async (parent, args, { dataLoaders }) => {
      try {
        const roles = await RolesSchema.find();

        const transformedRole = roles.map((role) => {
          return transformRole(role, dataLoaders(["privilege"]));
        });

        const roleDataAfterPromisifying = await Promise.all(transformedRole);

        return roleDataAfterPromisifying;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
      }
    },

    getARole: async (parent, { roleName }, { dataLoaders }) => {
      try {
        const role = await RolesSchema.findOne({ role: roleName });
        const transformedRole = await transformRole(
          role,
          dataLoaders(["privilege"])
        );
        return transformedRole;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
      }
    },
  },

  Mutation: {
    deleteAllRoles: async (parent, { status }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["admin"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        await RolesSchema.remove({});
        return "delete all data";
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
      }
    },

    deleteARole: async (parent, { roleId }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["admin"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        await RolesSchema.findByIdAndDelete(roleId);
        return "Role Deleted";
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
      }
    },

    activateRole: async (parent, { roleName }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["admin"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        const role = await RolesSchema.findOneAndUpdate(
          { role: roleName },
          {
            $set: {
              status: "Active",
            },
          }
        );
        return role;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
      }
    },

    disableRole: async (parent, { roleName }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["admin"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        const role = await RolesSchema.findOneAndUpdate(
          { role: roleName },
          {
            $set: {
              status: "Inactive",
            },
          }
        );
        return role;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
      }
    },

    createNewRole: async (
      parent,
      { role, description, status, privileges },
      ctx
    ) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["admin"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        let existingRole;
        existingRole = await RolesSchema.findOne({
          role: role,
        });
        if (existingRole) {
          throw new Error("Role with this name already exist");
        }
        let lowerCase = role.toLowerCase();
        const newRole: roleInterface = new RolesSchema({
          role: lowerCase,
          description: description,
          status: status,
          privileges: privileges,
        });
        const roleCreated = await newRole
          .save()
          .then((r) => r.populate("privileges").execPopulate());
        return roleCreated;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
      }
    },

    updateRolePrivilages: async (parent, { roleName, privileges }, ctx) => {
      const { isAuth, req, res, dataLoaders } = ctx;

      const user = await isAuth(["admin"]);
      if (!user) {
        throw new Error("UnAuthorized Access !");
      }

      try {
        const updatedRole = await RolesSchema.findOneAndUpdate(
          { role: roleName },
          {
            $set: {
              privileges: privileges,
            },
          }
        ).populate("privileges");
        return updatedRole;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
      }
    },
  },
};
