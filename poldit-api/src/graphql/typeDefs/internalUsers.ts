import { gql } from "apollo-server-express";

export const internalUserTypeDefs = gql`
  type InternalUser {
    _id: ID
    fullName: String
    email: String
    accessRole: Role
    isActive: Boolean
    password: String
    jobTitle: String
    isDisabled: Boolean
  }

  type Role {
    _id: ID!
    role: String!
    description: String
    status: String!
    privileges: [Privilege]
    isDisabled: Boolean
  }

  extend type Query {
    internalUsers: [InternalUser]!
    internalUsersWithPagination(offset: Int, limit: Int): [InternalUser!]
    getInternalUser(userId: String!): InternalUser!
    allRoles: [Role]!
    getARole(roleName: String!): Role!
    internalUserLogout: String!
  }

  extend type Mutation {
    internalUserLogin(email: String!, password: String!): String!
    activateRole(roleName: String!): Role!
    disableRole(roleName: String!): Role!
    createNewRole(
      role: String!
      description: String!
      status: String!
      privileges: [String]
    ): Role!
    deleteARole(roleId: String!): String!
    deleteAllRoles: String!
    updateRolePrivilages(roleName: String!, privileges: [String]): Role!
    createNewInternalUser(formInputs: String!): InternalUser!
    deleteOneInternalUser(userEmail: String!): String!
    deletAllInternalUsers: String!
    changeInternalUserPassword(
      userId: String!
      newPassword: String!
    ): InternalUser!
    updateInternalUser(formInputs: String!): InternalUser!
    updateActiveUsersToDisable(userId: String!): InternalUser!
    updateDisableUsersToActive(userId: String!): InternalUser!
  }
`;
