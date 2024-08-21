import { gql } from "apollo-server-express";

export const chatTypeDefs = gql`
  type ChatMessage {
    _id: ID!
    message: String!
    creator: User!
    poll: PollQuestion!
    creationDate: String
    chatImages: [String]
    likes: [ChatLike]
    dislikes: [ChatDisLike]
    hearts: [Heart]
    laughs: [Laugh]
    sadFaces: [SadFace]
    angryFaces: [AngryFace]
    isAnswer: Boolean!
    isDisabled: Boolean
    isActive: Boolean
    msgRef: ChatMessage
    ansRef: Answer
    isReported: [IsReported]
    mentionRef: User
  }

  type ChatFeed {
    cursor: String!
    messages: [ChatMessage]!
    hasMoreData: Boolean!
    totalMssgs: Int
  }

  type ChatLike {
    _id: ID!
    userId: String!
    like: Boolean!
    likeDate: String
  }

  type ChatDisLike {
    _id: ID!
    userId: String!
    dislike: Boolean!
    disLikeDate: String
  }

  type Heart {
    _id: ID!
    userId: String!
    heart: Boolean!
    heartDate: String
  }

  type Laugh {
    _id: ID!
    userId: String!
    laugh: Boolean!
    laughDate: String
  }

  type SadFace {
    _id: ID!
    userId: String!
    sadFace: Boolean!
    sadFaceDate: String
  }

  type AngryFace {
    _id: ID!
    userId: String!
    angryFace: Boolean!
    angryFaceDate: String
  }

  type ChatUser {
    id: ID!
    appid: String!
    followers: [User]
    numPolls: Int
    fullName: String
    profilePic: String
    numAnswers: Int
    lastChatMssgDate: String!
    isActive: Boolean
    isFollowed: Boolean
    remove: Boolean
    pollId: String
  }

  extend type Query {
    messages: [ChatMessage!]
    messageByUser(userId: String!): [ChatMessage]
    messagesByPoll(pollId: String!): [ChatMessage]
    messageById(msgId: String!): ChatMessage
    messageFeedByPoll(cursor: String, pollId: String!, limit: Int): ChatFeed
    pollChatUsers(pollId: String!): [ChatUser]
    allPollChatUsers(pollId: String!): [User]
  }

  extend type Mutation {
    createMessage(details: String!): ChatMessage
    removeChatUser(userId: String!, pollId: String!): String!
    handleReaction(
      reactionType: String!
      reaction: Boolean!
      chatId: String!
    ): String
  }

  extend type Subscription {
    newMessage(pollId: String!): ChatMessage
    newMessageDev(pollId: String!): ChatMessage
    newChatUser(pollId: String!): ChatUser
    newChatUserDev(pollId: String!): ChatUser
  }
`;
