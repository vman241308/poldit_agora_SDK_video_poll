import { gql } from "apollo-server-express";

// const { gql } = require("apollo-server-micro");

export const userTypeDefs = gql`
  type User {
    _id: ID!
    firstname: String
    lastname: String
    appid: String!
    email: String!
    status: String
    password: String
    address1: String
    address2: String
    city: String
    state: String
    zipcode: String
    birthday: String
    profilePic: String
    useragreementagreed: Boolean
    areasOfInterest: [AreasInterest]
    bio: String
    registerDate: String
    isAppUser: Boolean
    pollHistory: [PollQuestion]
    favorites: [Favorite]
    following: [Following]
    followers: [Following]
    isDisabled: Boolean
    isEmailVerified: Boolean
    isMe: Boolean
    isActive: Boolean
    appToken: String!
    isAvailable: Boolean
    areasOfKnowledge: [UserAreasOfKnowledge]
    pollAnswersLeft: Int
    newUser: Boolean
  }

  type AreasInterest {
    _id: ID!
    topic: String
    topicId: String
    subtopic: String
    subtopicId: String
  }

  type Favorites {
    favoritePolls: [PollQuestion]
    favoriteAnswers: [Answer]
  }

  type UserAreasOfKnowledge {
    _id: ID!
    areaKnowledgeId: String
    isActive: Boolean
    upVotes: [AreaVote]
    downVotes: [AreaVote]
    totalUpVotes: Int
    totalDownVotes: Int
    areaknowledge_data: AreaKnowledge
  }

  type AreaVote {
    userId: String
  }

  type Favorite {
    _id: ID!
    favoriteId: String!
    favoriteType: String!
  }

  type Following {
    _id: ID!
    userId: String
    appId: String
    profilePic: String
    firstname: String
    lastname: String
    pageLoc: String
    isActive: Boolean
    removeFlag: Boolean
    pollQuestion: String
    isFollowed: Boolean
  }

  type AuthData {
    appToken: String!
    user: User!
  }

  type ActivityData {
    userActivity: [Activity]
    totalPolls: Int
  }

  type Activity {
    date: String
    activityId: String
    poll_question: String
    answer: String
    type: String
    pollId: String
    creator: String
    topic: String
    subTopic: String
  }

  type AltLogin {
    accessToken: String!
    isNewUser: Boolean
  }

  extend type Query {
    users: [User]!
    getUser(userId: String!): User
    isFollowed(appid: String!): Boolean
    isNewUser(email: String): Boolean
    getUserProfileData(appid: String): User
    getUserData(userId: String!): AuthData
    getUserDataByEmail(email: String!): User
    getUserDataForPoll(pollId: String!): User!
    showFavorites(userId: String!): Favorites!
    getAppUserData(userId: String): User!
    getUserBasicProfile: User!
    isFavorite(favType: String!, favId: String!): Boolean
    getFollows: [Following]
    logout: String
    myAreasOfKnowledge(appid: String): [UserAreasOfKnowledge]
    externalUsersWithPagination: [User]!
    getAllActivityOfUserWithPagination(
      appId: String
      offset: Int
      limit: Int
    ): ActivityData
    getActivityOfUserByPagination: [Activity]
    getFollowActivity: [Following]
  }

  extend type Mutation {
    login(credentials: String!): String!
    altLogin(credentials: String!): AltLogin!
    changePassword(oldPw: String!, newPw: String!): String!
    removeNewUserFlag: String
    storeUserLoc(userLoc: String): String
    refreshUserToken(email: String!): String!
    createNewUser(formInputs: String!): User!
    verifyUserEmail(token: String!): String
    updateUser(formInputs: String!): String!
    setMyActiveAreas(areas: [String]): String!
    # addFollow(userId: String!): Following!
    deleteUser(userId: String): String!
    # removeFollow(userId: String!): Following!
    handleFollow(details: String!): String!
    addToFollowerList(
      userId: String!
      pagePath: String!
      pollId: String!
    ): String!
    updateUserPassword(token: String!, password: String!): String!
    removeFromFollowerList(userId: String!): String
    handleFavorite(
      isFav: Boolean!
      favoriteType: String!
      favoriteId: String!
    ): String!
    verifyEveryOneWithEmail: String
    # addFavorite(favoriteType: String!, favoriteId: String!): Favorite!
    # removeFavorite(favoriteType: String!, favoriteId: String!): Favorite!
    toggleDisableUser(userId: String!): String
  }

  extend type Subscription {
    newFollower: Following!
  }
`;
