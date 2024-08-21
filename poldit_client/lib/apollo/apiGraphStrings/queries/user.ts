import { gql } from "@apollo/client";

const userQueries = {
  GET_USER: gql`
    query GetUserData($userId: String!) {
      getUserData(userId: $userId) {
        appToken
        user {
          _id
          appid
          email
          profilePic
          pollHistory {
            _id
            creationDate
          }
          following {
            _id
            appId
          }
          favorites {
            _id
            favoriteId
            favoriteType
          }
        }
      }
    }
  `,
  IS_FOLLOWED: gql`
    query isFollowed($appid: String) {
      isFollowed(appid: $appid)
    }
  `,
  IS_NEW_USER: gql`
    query IsNewUser($email: String) {
      isNewUser(email: $email)
    }
  `,
  GET_USER_BASIC_PROFILE: gql`
    query GetUserBasicProfile {
      getUserBasicProfile {
        _id
        appid
        firstname
        lastname
        email
        bio
        profilePic
        registerDate
        birthday
      }
    }
  `,

  GET_USER_PROFILE_DATA: gql`
    query GetUserProfileData($appid: String) {
      getUserProfileData(appid: $appid) {
        _id
        isMe
        appid
        firstname
        lastname
        email
        address1
        address2
        city
        state
        zipcode
        bio
        isActive
        birthday
        isAppUser
        profilePic
        areasOfInterest {
          _id
          topic
          topicId
          subtopic
          subtopicId
        }
        following {
          _id
          appId
          profilePic
          firstname
          lastname
          isActive
          isFollowed
        }
        registerDate
        pollHistory {
          _id
          creationDate
        }
        favorites {
          _id
          favoriteId
          favoriteType
        }
        followers {
          _id
          appId
          profilePic
          firstname
          lastname
          isActive
          isFollowed
        }
      }
    }
  `,
  GET_APP_USER_FOLLOWERS: gql`
    query GetFollows {
      getFollows {
        _id
        appId
        profilePic
        firstname
        lastname
        pageLoc
        isActive
        remove
      }
    }
  `,
  GET_USER_FOR_POLL: gql`
    query GetUserDataForPoll($pollId: String!) {
      getUserDataForPoll(pollId: $pollId) {
        _id
        appid
        profilePic
        firstname
        lastname
        pollAnswersLeft
        following {
          _id
          appId
          profilePic
        }
      }
    }
  `,
  GET_BASIC_USER_DATA: gql`
    query GetBasicUserData {
      getBasicUserData {
        _id
        firstname
        lastname
        appid
        profilePic
      }
    }
  `,
  MY_AREAS_OF_KNOWLEDGE: gql`
    query MyAreasOfKnowledge($appid: String) {
      myAreasOfKnowledge(appid: $appid) {
        _id
        areaKnowledgeId
        areaknowledge_data {
          _id
          areaKnowledge
        }
        upVotes {
          userId
        }
        downVotes {
          userId
        }
        totalUpVotes
        totalDownVotes
      }
    }
  `,
  GET_APPUSER: gql`
    query GetAppUserData($userId: String) {
      getAppUserData(userId: $userId) {
        _id
        appid
        firstname
        lastname
        email
        address1
        address2
        city
        state
        zipcode
        newUser
        bio
        isAppUser
        profilePic
        following {
          _id
          appId
          profilePic
        }
        registerDate
        pollHistory {
          _id
          creationDate
        }
        favorites {
          _id
          favoriteId
          favoriteType
        }
      }
    }
  `,
  GET_FAVORITES: gql`
    query ShowFavorites($userId: String!) {
      showFavorites(userId: $userId) {
        favoritePolls {
          _id
          question
          topic {
            topic
          }
          subTopics {
            _id
            subTopic
          }
          creationDate
          creator {
            _id
            appid
            profilePic
          }
          answers {
            _id
          }
          chatMssgs {
            _id
          }
        }
        favoriteAnswers {
          _id
          answer
        }
      }
    }
  `,
  GET_ALL_USERS: gql`
    query Users {
      users {
        _id
        appid
      }
    }
  `,
  // GET_FOLLOW_ACTIVITY: gql`
  //   query GetFollowActivity {
  //     getFollowActivity {
  //       _id
  //       user {
  //         appid
  //         profilePic
  //         firstname
  //         lastname
  //       }
  //       pageLoc
  //       isActive
  //       remove
  //       pollQuestion {
  //         question
  //       }
  //     }
  //   }
  // `,
  GET_FOLLOW_ACTIVITY: gql`
    query GetFollowActivity {
      getFollowActivity {
        _id
        userId
        appId
        profilePic
        firstname
        lastname
        pageLoc
        isActive
        removeFlag
        pollQuestion
      }
    }
  `,
  //   GET_FOLLOWER_ONLY_ACTIVITY: gql`
  //   query GetFollowerOnlyActivity {
  //     getFollowerOnlyActivity {
  //       _id
  //       appId
  //       profilePic
  //       firstname
  //       lastname
  //       pageLoc
  //       isActive
  //       remove
  //       pollQuestion

  //     }
  //   }
  // `,
  GET_USER_BY_EMAIL: gql`
    query GetUserDataByEmail($email: String!) {
      getUserDataByEmail(email: $email) {
        isAvailable
      }
    }
  `,

  GET_USER_UNREAD_NOTIFICATIONS: gql`
    query UnreadNotificationCount {
      unreadNotificationCount
    }
  `,
  GET_ALL_ACTIVITY_OF_USER_WITH_PAGINATION: gql`
    query GetActivityOfUserWithPagination(
      $appId: String!
      $offset: Int
      $limit: Int
    ) {
      getAllActivityOfUserWithPagination(
        appId: $appId
        offset: $offset
        limit: $limit
      ) {
        totalPolls
        userActivity {
          date
          activityId
          poll_question
          type
          pollId
          answer
          creator
          topic
          subTopic
        }
      }
    }
  `,
  // GET_ALL_ACTIVITY_OF_USER_WITH_PAGINATION: gql`
  //   query GetActivityOfUserWithPagination(
  //     $appId: String!
  //     $offset: Int
  //     $limit: Int
  //   ) {
  //     getAllActivityOfUserWithPagination(
  //       appId: $appId
  //       offset: $offset
  //       limit: $limit
  //     ) {
  //       description
  //       date
  //       activityId
  //       type
  //       pollId
  //       totalPolls
  //     }
  //   }
  // `,

  LOG_OUT: gql`
    query LogOut {
      logout
    }
  `,
};

export default userQueries;
