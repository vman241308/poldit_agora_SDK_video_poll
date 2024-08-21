import { gql } from "apollo-server-express";

export const privilegeTypeDef = gql`
  type Privilege {
    _id: ID!
    privilegeName: String!
    privilegeStatus: Boolean!
    isDisabled: Boolean
  }

  extend type Query {
    allPrivileges: [Privilege]!
  }

  extend type Mutation {
    deleteAllPrivileges: String!
    createNewPrivilege(privilegeName: String!): Privilege!
    deletePrivilege(_id: String!): String!
    updatePrivilege(
      privilegeId: String!
      privilegeName: String!
      privilegeStatus: Boolean!
    ): Privilege!
  }
`;
