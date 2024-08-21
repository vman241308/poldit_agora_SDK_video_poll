import { gql } from "apollo-server-express";

export const otherTypeDefs = gql`
  type StatesUS {
    id: String!
    name: String!
    classification: String!
    division_id: String!
    url: String!
  }

  type ContactUs {
    id: String!
    fullName: String!
    email: String!
    phoneNumber: String
    mssg: String!
  }

  type LinkMetadata {
    title: String
    favicon: String
    description: String
    image: String
    author: String
    datePublished: String
  }

  type question {
    count: Int
    question: [PollQuestion]
  }

  type answer {
    count: Int
    answer: [Answer]
  }

  extend type Topic {
    pollCount: Int
  }

  extend type SubTopic {
    pollCount: Int
  }

  type topic {
    count: Int
    topic: [Topic]
  }

  type subTopic {
    count: Int
    subTopic: [SubTopic]
  }

  type searchUser {
    count: Int
    user: [User]
  }

  type SearchResults {
    question: question
    answer: answer
    topic: topic
    subTopic: subTopic
    user: searchUser
  }

  type AreaKnowledge {
    _id: ID!
    creator: User
    creationDate: String
    isDisabled: Boolean
    areaKnowledge: String!
  }

  type AuthInfo {
    message: String
    success: Boolean
  }

  type VideoKeys {
    appId: String
    token: String
  }

  type ContentResults {
    contentId: String
    contentType: String
    content: Content
  }

  type StartRecordingResponse {
    resourceId: String
    sid: String
  }

  type StopRecordingResponse {
    fileId: String
    resourceData: String
    s3Bucket: String
    s3ObjectKey: String
  }

  type AITags {
    topic: String
    keywords: [String]
  }

  type ModerationViolation {
    violation_type: String
    risk_score: Float
    detection_type: String
    analysis_description: String
  }

  type ModerationResponse {
    response_id: String
    entity_id: String
    entity_type: String
    violations: [ModerationViolation]
    analyzed_violations: [String]
  }

  type StreamUserResponse {
    userId: String
    mediaType: String
  }

  extend type Query {
    statesUS: [StatesUS!]
    searchAll(searchVal: String, page: Int, limit: Int): SearchResults!
    areasOfKnowledge: [AreaKnowledge]
    getLinkMetaData(link: String!): LinkMetadata
    getRealTimeKey: String
    getSpecificContent(_id: String!, contentType: String): ContentResults
    getStreamKeys(channel: String!, isPublisher: Boolean!): VideoKeys
    testAi(question: String!): AITags
    liveStreamComplete(pollId: String!, userId: String!): String
    getLiveStreamUser(liveStreamId: String!, pollId: String!): StreamUserResponse
  }

  extend type Mutation {
    addAreaOfKnowledge(area: String!): AreaKnowledge
    moderateContent(content: String!, id: String!): ModerationResponse
    removeAreaOfKnowledge(areaId: String!): String
    embedTags(details: String!): String
    storeVideoUrl(details: String!): String
    contactUs(details: String!): String
    startLiveStreamRecording(
      channelId: String
      userId: String
      token: String
    ): StartRecordingResponse
    stopLiveStreamRecording(
      channelId: String
      resourceId: String
      sid: String
    ): StopRecordingResponse
    startCompositionVideo(channelName: String!, fileList: String): String
    addUidUserId(
      channelName: String!
      uid: String
      clientType: String
      userId: String
    ): String
  }
`;
