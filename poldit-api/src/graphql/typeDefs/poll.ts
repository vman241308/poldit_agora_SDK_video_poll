import { gql } from "apollo-server-express";

export const pollTypeDefs = gql`
  enum PollType {
    videoPoll
    openEnded
    multiChoice
  }

  type PollQuestion {
    _id: ID!
    question: String
    topic: Topic
    topics: [Topic]
    subTopics: [SubTopic]
    keywords: [String]
    creator: User
    creationDate: String
    pollImages: [String]
    pollType: PollType
    parentPollId: PollQuestion
    likes: [Like]
    dislikes: [DisLike]
    answers: [Answer]
    views: Int
    status: String
    auditHistory: [PollAudit]
    chatMssgs: [ChatMessage]
    isDisabled: Boolean
    isEditable: Boolean
    lastActivity: String
    isFavorite: Boolean
    isBroadcasted: Boolean
    isMultipleChoice: Boolean
    isMyPoll: Boolean
    isActive: Boolean
    isReported: [IsReported]
    answerCount: Int
    likesCount: Int
    dislikesCount: Int
    # answerLikes: [Like]
  }

  type PollAudit {
    _id: ID!
    action: String
    actionDate: String
  }

  type IsReported {
    _id: ID!
    userId: User
    category: String!
    reportedDate: String
  }

  type Like {
    _id: ID!
    userId: String!
    like: Boolean!
    likedDate: String
  }

  type DisLike {
    _id: ID!
    userId: String!
    dislike: Boolean!
    disLikedDate: String
  }

  type Answer {
    _id: ID!
    answer: String
    poll: PollQuestion
    comments: [Comment]
    creator: User
    answerImage: String
    creationDate: String
    likes: [Like]
    dislikes: [DisLike]
    numLikes: Int
    numDisLikes: Int
    status: String
    rank: String
    rankScore: Float
    isDisabled: Boolean
    multichoice: [AnswerMultiChoice]
    multichoiceVotes: [MultiChoiceVotes]
    isEditable: Boolean
    isRemoveable: Boolean
    isReported: [IsReported]
    isRemoved: Boolean
  }

  type MultiChoiceVotes {
    _id: ID!
    userId: String!
    vote: String
    voteDate: String
  }

  type AnswerMultiChoice {
    _id: ID!
    answerVal: String
    rank: String
    votes: Int
  }

  type Notification {
    _id: ID!
    message: String!
    read: Boolean
    creationDate: String!
    collectionType: String
    parentCollectionId: PollQuestion
    collectionId: String!
    creator: User!
  }

  # type Notifications_full {
  # totalNotifications: Int
  # notifications: [Notification]
  #}

  type NotificationFeed {
    cursor: String!
    userId: String!
    notifications: [Notification]!
    hasMoreData: Boolean!
    totalUnreadNotifications: Int
  }

  type Comment {
    _id: ID!
    comment: String!
    answer: Answer!
    replies: [Reply]
    creator: User!
    commentImages: [String]
    creationDate: String!
    isDisabled: Boolean
  }

  type ChildPollFeed {
    cursor: String!
    polls: [PollQuestion]!
    hasMoreData: Boolean!
    totalPolls: Int
  }

  type Reply {
    _id: ID!
    reply: String!
    comment: Comment!
    creator: User!
    replyImages: [String]
    creationDate: String!
    isDisabled: Boolean
  }

  type UserPresence {
    appid: String
    profilePic: String
    firstname: String
    lastname: String
    isMod: Boolean
    onPanel: Boolean
  }

  type PollQuestionWithMetrics {
    answerCount: Int
    chatMssgsCount: Int
    _id: ID!
    question: String
    topic: Topic
    topics: [Topic]
    keywords: [String]
    subTopics: [SubTopic]
    creator: User
    creationDate: String
    pollImages: [String]
    pollType: PollType
    answers: [Answer]
    views: Int
    status: String
    chatMssgs: [ChatMessage]
    isDisabled: Boolean
    isEditable: Boolean
    lastActivity: String
    isFavorite: Boolean
    isMultipleChoice: Boolean
    isMyPoll: Boolean
    totalPolls: Int
    isActive: Boolean
    cloudFrontURL: String
  }

  extend type Query {
    polls: [PollQuestion]
    poll(pollId: String!): PollQuestion
    videoPollStatus(pollId: String!): String
    answersByPoll(pollId: String!, numAnswers: Int): [Answer]
    topAnswersByPoll(pollId: String!, numAnswers: Int): [Answer]
    answersForChildPoll(
      offset: Int
      limit: Int
      pollId: String
      sortBy: String
    ): [Answer]
    answersForPollBySortCriteria(pollId: String!, filter: String): [Answer]
    unreadNotificationCount: Int
    ##  pollsByUser(userId: String): [PollQuestion]
    pollsByUser(
      userId: String
      offset: Int
      limit: Int
    ): [PollQuestionWithMetrics]
    pollsByTag(tag: String, offset: Int, limit: Int): [PollQuestionWithMetrics]
    showViews(pollId: String!): Int
    trendingPolls: [PollQuestion]
    trendingPollsWithPagination(
      offset: Int
      limit: Int
      topic: String
    ): [PollQuestionWithMetrics]
    newestPolls: [PollQuestion]
    pollsWithPagination(
      offset: Int
      limit: Int
      topic: String
      activityType: String
    ): [PollQuestionWithMetrics]
    newestPollsWithPagination(
      offset: Int
      limit: Int
      topic: String
    ): [PollQuestionWithMetrics]
    activeChats: [PollQuestion]
    activeChatsWithPagination(
      offset: Int
      limit: Int
    ): [PollQuestionWithMetrics]
    childPollsForParentPoll(
      cursor: String
      limit: Int
      pollId: String
      sortBy: String
    ): ChildPollFeed
    recentActivityPollsWithPagination(
      offset: Int
      limit: Int
      topic: String
    ): [PollQuestionWithMetrics]
    getPollMembers(pollId: String!): [UserPresence]
    getFavoritePolls(offset: Int, limit: Int): [PollQuestionWithMetrics]
    pollsByTopic(topic: String!): [PollQuestion]
    pollsBySubTopic(subTopic: String!): [PollQuestion]
    notifications: [Notification]
    notificationsWithPagination(cursor: String, limit: Int): NotificationFeed
    lastActivity(pollId: String!): String
  }

  extend type Mutation {
    createPoll(details: String!): PollQuestion
    updatePoll(details: String!): String!
    publishAiAnswer(details: String!): String
    updateVideoPollAudit(pollId: String!, msg: String!): String
    createAnswer(details: String!): String!
    updateAnswer(details: String!): Answer
    reportContent(
      contentId: String!
      contentType: String!
      category: String!
      creator: String!
    ): String
    handleLikeDislike(
      feedback: String!
      feedbackVal: Boolean!
      answerId: String!
      pollId: String!
      isVideo: Boolean
    ): Answer
    addAnswerRank(answerId: String!): String
    addView(pollId: String!): Int
    updateNotification(details: String!): String
    deletePoll(pollId: String!): String
    deleteAnswer(answerId: String!): String
    toggleDisablePoll(pollId: String!): String
    toggleDisableAnswer(ansId: String!): String
    handleMultiChoice(details: String!): String
    removeImageFromPoll(details: String!): String
  }

  extend type Subscription {
    newAnswer(pollId: String!): Answer
    newChildAnswer(questionId: String!): Answer
    newNotification: Notification!
    newQuestion(parentId: String!): PollQuestion!
    updateQuestion(pollId: String!): PollQuestion!
  }
`;
