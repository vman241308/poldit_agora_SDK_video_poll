import { gql } from "apollo-server-express";

export const reportTypeDefs = gql`
  union Content = ChatMessage | PollQuestion | Answer

  type ReportItem {
    _id: ID!
    flagType: String
    flagId: ID!
    violator: User
    violationCategory: String
    content: Content
    history: [ModerationHistory]
  }

  type ModerationHistory {
    _id: ID!
    dateReported: String
    reporter: User
    dateModerated: String
    moderator: InternalUser
    status: String
    notes: String
  }

  extend type Query {
    reportedContent: [ReportItem]
    reportedContentByAnswer: [ReportItem]
    reportedContentByChat: [ReportItem]
    reportedContentByPoll: [ReportItem]
  }

  extend type Mutation {
    disableContent(
      reportId: String!
      contentType: String!
      contentId: String!
      isDisabled: Boolean!
      historyId: String!
    ): String
    keepContent(
      reportId: String!
      contentType: String!
      contentId: String!
      historyId: String!
    ): String
  }
`;
