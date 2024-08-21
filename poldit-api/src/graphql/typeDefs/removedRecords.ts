import { gql } from "apollo-server-express";

export const removedRecordsTypeDefs = gql`
  type RemovedRecord {
    _id: ID!
    removalType: String!
    content: String!
    removalDate: String!
  }
  extend type Query {
    removedRecords: [RemovedRecord!]
    removedRecord(recordId: String!): RemovedRecord
  }
  extend type Mutation {
    createRemovedRecord(
      removalType: String
      content: String
      removalDate: String
    ): RemovedRecord

    deleteRemovedRecord(recordId: String!): String
  }
`;
