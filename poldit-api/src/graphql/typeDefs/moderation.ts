import { gql } from "apollo-server-express";

export const moderationTypeDefs = gql`
  type Moderation {
    _id: ID!
    flagType: String!
    flagId: String!
    violator: User!
    reporter: User!
  }

  type SubModeration {
    _id: ID!
    flagType: String!
    flagId: String!
    violator: String!
    reporter: String!
  }

  extend type Query {
    moderations: [Moderation]
    moderationsByFlagType(flagType: String!): [Moderation]
  }

  extend type Mutation {
    createModeration(details: String!): Moderation
    deleteAllModerations: String!

    # createMessage(details: String!): ChatMessage
  }

  extend type Subscription {
    newModeration: Moderation
    newModerationDev: Moderation
    # newMessage(pollId: String!): ChatMessage!
  }
`;
