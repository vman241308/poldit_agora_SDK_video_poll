import { gql } from "apollo-server-express";

export const topicTypeDefs = gql`
  type Topic {
    _id: ID
    topic: String
    image: String
    description: String
    creator: User
    creationDate: String
    subTopics: [SubTopic]
    isDisabled: Boolean
    numPolls: Int
  }

  type SubTopic {
    _id: ID
    subTopic: String
    description: String
    creator: User
    creationDate: String
    topic: Topic
    numPolls: Int
  }

  type SubTopic_paginated {
    cursor: String!
    data: [SubTopic]!
    hasMoreData: Boolean!
  }

  type SubTopicPerTopic_WithCount {
    topic: Topic
    subtopics: [SubTopic!]
  }

  extend type Query {
    topics: [Topic!]
    subTopics: [SubTopic!]
    subTopicsPerTopic(topic: String!): [SubTopic!]
    topicWithCounts: [Topic!]
    subTopicsPerTopicWithCounts(topic: String!): SubTopicPerTopic_WithCount
    subTopicsPerTopic_paginated(
      topic: String!
      cursor: String
      limit: Int
    ): SubTopic_paginated
    topicForSubtopics(subTopic: String!): Topic!
    topicsWithContent(limit: Int): [Topic!]
    areasOfInterest: User
  }

  extend type Mutation {
    createTopic(topicInfo: String!): Topic
    createSubTopic(subTopicInfo: String!): SubTopic
    addAreasOfInterest(details: String!): String
  }
`;
